import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  Wallet,
  Smartphone,
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  Search,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import {
  PAYMENT_SERVICES_LIST,
  PaymentServiceType,
  PaymentSettings,
  PaymentReceiptData,
  Order,
} from '../types';
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';
import { useSiteMedia } from '../hooks/useSiteMedia';
import { MediaUploadPlaceholder } from '../components/MediaUploadPlaceholder';
import { SushilBankTransferSection } from '../components/SushilBankTransferSection';

interface PaymentDetailsPageProps {
  initialOrderId?: string;
  initialAmount?: number;
  initialService?: string;
  onNavigate?: (tab: string) => void;
}

export const PaymentDetailsPage: React.FC<PaymentDetailsPageProps> = ({
  initialOrderId = '',
  initialAmount,
  initialService,
  onNavigate,
}) => {
  // Site Media config
  const { config: siteMedia } = useSiteMedia();

  // Settings & state
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const activeQrCode = siteMedia.paymentQrCode || settings?.qrCodeUrl || '';

  // Active view tab
  const [activeTab, setActiveTab] = useState<'gateway' | 'upi' | 'bank' | 'lookup'>('gateway');

  // Form inputs
  const [orderId, setOrderId] = useState(initialOrderId);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedService, setSelectedService] = useState<PaymentServiceType>(
    (initialService as PaymentServiceType) || 'Wedding Booking'
  );
  const [amountType, setAmountType] = useState<
    'Booking Amount' | 'Advance Payment' | 'Remaining Payment' | 'Full Payment' | 'Custom Amount'
  >('Advance Payment');
  const [amount, setAmount] = useState<number>(initialAmount || 5000);
  const [paymentMethod, setPaymentMethod] = useState<
    'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallets'
  >('UPI');
  const [notes, setNotes] = useState('');

  // UPI verification fields
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card details (never saved or logged)
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Net banking & Wallets
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Order lookup for remaining dues
  const [lookupQuery, setLookupQuery] = useState(initialOrderId || '');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);

  // Processing & result state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Receipt Modal
  const [receiptModalData, setReceiptModalData] = useState<PaymentReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Load payment settings on mount
  useEffect(() => {
    loadSettings();
    if (initialOrderId) {
      handleLookupOrder(initialOrderId);
    }
  }, []);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await api.getPaymentSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load payment settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleLookupOrder = async (queryToSearch?: string) => {
    const q = queryToSearch || lookupQuery;
    if (!q.trim()) return;

    setIsLookingUp(true);
    setLookupError('');

    try {
      const order = await api.getOrderByIdOrPhone(q);
      if (order) {
        setMatchedOrder(order);
        setOrderId(order.id);
        setCustomerName(order.customerName);
        setCustomerPhone(order.phone || order.customerPhone || '');
        setCustomerEmail(order.email || '');
        if (order.serviceType && PAYMENT_SERVICES_LIST.includes(order.serviceType as any)) {
          setSelectedService(order.serviceType as PaymentServiceType);
        }

        // Suggest remaining balance if any
        if (order.remainingAmount && order.remainingAmount > 0) {
          setAmount(order.remainingAmount);
          setAmountType('Remaining Payment');
        } else if (order.totalAmount) {
          setAmount(order.totalAmount);
          setAmountType('Full Payment');
        }
      } else {
        setLookupError('No existing order found. You can proceed with a new booking payment.');
      }
    } catch {
      setLookupError('Could not verify order. You can continue with custom payment details.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleCopyUpi = () => {
    const upi = settings?.upiId || '[ADD ACTUAL UPI ID HERE]';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleAmountTypeChange = (type: typeof amountType) => {
    setAmountType(type);
    if (type === 'Booking Amount') {
      setAmount(5000);
    } else if (type === 'Advance Payment') {
      if (matchedOrder && matchedOrder.totalAmount) {
        setAmount(Math.round(matchedOrder.totalAmount * 0.4));
      } else {
        setAmount(10000);
      }
    } else if (type === 'Remaining Payment' && matchedOrder) {
      setAmount(matchedOrder.remainingAmount || matchedOrder.balanceAmount || 5000);
    } else if (type === 'Full Payment' && matchedOrder) {
      setAmount(matchedOrder.totalAmount || matchedOrder.amount || 25000);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter Customer Name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (amount <= 0) {
      setErrorMessage('Payment amount must be greater than ₹0.');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        orderId: orderId.trim() || undefined,
        amount,
        type: amountType,
        service: selectedService,
        paymentMethod,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        upiRefNumber: paymentMethod === 'UPI' ? upiRefNumber.trim() : undefined,
        notes: notes.trim() || undefined,
      };

      const res = await api.verifyPayment(payload);

      setIsProcessing(false);
      setPaymentSuccess(res);
      if (res.receipt) {
        setReceiptModalData(res.receipt);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div id="payment-details-page" className="min-h-screen bg-[#09090b] text-zinc-200 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Top Header Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#14141c] via-[#101017] to-[#0d0d12] border border-[#272732] p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Payment Portal</span>
              </div>

              <h1 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white">
                Payment Details
              </h1>
              <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
                Pay online securely for wedding bookings, cinematographic films, album designs, photo
                editing, and custom orders with automated receipt generation.
              </p>

              {/* Exact Business Credentials from Prompt */}
              <div className="pt-2 flex flex-wrap gap-y-2 gap-x-6 text-xs text-zinc-300">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Business Name</span>
                  <span className="font-bold text-white">
                    {settings?.businessName || 'Sushil Photography Jhar'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Owner / Lead</span>
                  <span className="font-bold text-white">
                    {settings?.ownerName || 'Sushil Meher'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Payment Contact</span>
                  <a href={`tel:${settings?.paymentPhone || '7608814804'}`} className="font-bold text-[#d4af37] hover:underline">
                    +91 {settings?.paymentPhone || '7608814804'}
                  </a>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Secondary Contact</span>
                  <a href={`tel:${settings?.secondaryPhone || '7735045136'}`} className="font-bold text-zinc-300 hover:underline">
                    +91 {settings?.secondaryPhone || '7735045136'}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="bg-[#181824] border border-[#2c2c3b] rounded-2xl p-4 md:w-64 shrink-0 space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                <Lock className="w-3.5 h-3.5" />
                <span>256-Bit Encrypted Handshake</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Card numbers, CVVs, net banking passwords, and UPI PINs are never stored or logged on our servers.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Gateway: Razorpay & Instant UPI</span>
              </div>
            </div>
          </div>

          {/* Navigation sub-tabs */}
          <div className="mt-8 pt-6 border-t border-[#272732] flex flex-wrap items-center gap-2">
            {[
              { id: 'gateway', label: '1. Online Payment', icon: CreditCard },
              { id: 'upi', label: '2. Pay via UPI', icon: QrCode },
              { id: 'bank', label: 'Bank Transfer / NEFT', icon: Building2 },
              { id: 'lookup', label: 'Lookup / Verify Receipt', icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setPaymentSuccess(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    active
                      ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                      : 'bg-[#181822] text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-[#272732]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================================== */}
        {/* PAYMENT SUCCESS VIEW */}
        {/* ==================================================== */}
        {paymentSuccess && (
          <div className="rounded-3xl bg-[#0f1713] border-2 border-emerald-500/40 p-8 sm:p-10 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                Payment Successful!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
                Your payment has been successfully verified and credited to Sushil Photography Jhar. An official receipt has been issued.
              </p>
            </div>

            {/* Payment Summary Box */}
            <div className="max-w-xl mx-auto bg-[#141d18] border border-emerald-500/30 rounded-2xl p-5 text-left text-xs font-mono space-y-2.5">
              <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-zinc-400">Payment Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{paymentSuccess.status || 'Payment Successful'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment ID:</span>
                <span className="text-[#d4af37] font-bold">{paymentSuccess.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Order ID:</span>
                <span className="text-white font-semibold">{paymentSuccess.order?.id || orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Customer Name:</span>
                <span className="text-zinc-200">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Service:</span>
                <span className="text-zinc-200">{selectedService}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Amount Paid:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  ₹{Number(paymentSuccess.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Payment Date:</span>
                <span className="text-zinc-300">{paymentSuccess.date}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-500/20 pt-2">
                <span className="text-zinc-400">Transaction Ref:</span>
                <span className="text-zinc-300">{paymentSuccess.transactionId}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="view-download-receipt-btn"
                onClick={() => setShowReceiptModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-bold text-xs sm:text-sm hover:brightness-110 flex items-center gap-2 shadow-lg shadow-[#d4af37]/20"
              >
                <Download className="w-4 h-4" />
                <span>View & Download Official Receipt</span>
              </button>

              <button
                onClick={() => {
                  setPaymentSuccess(null);
                  setAmount(5000);
                  setUpiRefNumber('');
                }}
                className="px-5 py-3 rounded-xl bg-[#1d1d28] border border-[#2c2c3c] hover:bg-[#252535] text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Make Another Payment
              </button>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('track-order')}
                  className="px-5 py-3 rounded-xl bg-[#1d1d28] border border-[#2c2c3c] hover:bg-[#252535] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Track Updated Order</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 1: ONLINE PAYMENT (Comprehensive Form) */}
        {/* ==================================================== */}
        {activeTab === 'gateway' && !paymentSuccess && (
          <form onSubmit={handleSubmitPayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Payment Details Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order ID & Lookup Box */}
              <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                      <span>1. Order & Customer Information</span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Link to an existing studio booking or create a new payment order.
                    </p>
                  </div>
                </div>

                {/* Quick Lookup Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Have an Order ID or Phone? (e.g. SPJ-ORD-1001)"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#181820] border border-[#272732] text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLookupOrder()}
                    disabled={isLookingUp}
                    className="px-4 py-2.5 rounded-xl bg-[#22222d] hover:bg-[#2c2c3b] text-xs font-semibold text-zinc-200 hover:text-white border border-[#333342] transition-colors shrink-0"
                  >
                    {isLookingUp ? 'Searching...' : 'Find Order'}
                  </button>
                </div>

                {lookupError && (
                  <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{lookupError}</span>
                  </p>
                )}

                {matchedOrder && (
                  <div className="p-3.5 rounded-xl bg-[#191924] border border-[#d4af37]/30 text-xs flex flex-wrap items-center justify-between gap-2 text-zinc-300">
                    <div>
                      <span className="text-emerald-400 font-bold">✓ Order Verified: </span>
                      <span className="font-mono text-white font-bold">{matchedOrder.id}</span> • {matchedOrder.customerName}
                    </div>
                    <div className="font-mono text-right">
                      <span className="text-zinc-500 text-[11px]">Remaining: </span>
                      <strong className="text-[#d4af37]">₹{(matchedOrder.remainingAmount || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                )}

                {/* Customer Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Order ID (Optional for New Payments)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. SPJ-ORD-1001 or leave blank for new"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Customer Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Mobile Contact Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Email Address (For e-Receipt)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@gmail.com"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Service Selection (11 services requested) */}
              <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 space-y-4">
                <div>
                  <h2 className="font-cinzel text-base font-bold text-white">
                    2. Select Studio Service
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Choose what service you are making this payment for.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {PAYMENT_SERVICES_LIST.map((svc) => {
                    const isSelected = selectedService === svc;
                    return (
                      <button
                        type="button"
                        key={svc}
                        onClick={() => setSelectedService(svc)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-[#d4af37]/15 border-[#d4af37] text-white font-semibold'
                            : 'bg-[#181820] border-[#272732] text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                        }`}
                      >
                        <span className="block truncate">{svc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Payment Amount Selection */}
              <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 space-y-4">
                <div>
                  <h2 className="font-cinzel text-base font-bold text-white">
                    3. Payment Amount
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Choose an amount category or enter a custom amount.
                  </p>
                </div>

                {/* Amount Category Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    'Booking Amount',
                    'Advance Payment',
                    'Remaining Payment',
                    'Full Payment',
                    'Custom Amount',
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleAmountTypeChange(cat as any)}
                      className={`py-2 px-2 rounded-xl border text-center text-[11px] transition-all ${
                        amountType === cat
                          ? 'bg-[#d4af37] text-black font-bold border-[#d4af37]'
                          : 'bg-[#181820] border-[#272732] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Amount to Pay (INR ₹)
                  </label>
                  <div className="relative max-w-sm">
                    <span className="absolute left-4 top-3 text-lg font-bold text-zinc-400">₹</span>
                    <input
                      type="number"
                      min="100"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl pl-9 pr-4 py-3 text-lg font-bold text-white font-mono focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>

                {/* Quick amount presets */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-zinc-500 text-[11px]">Presets:</span>
                  {[2500, 5000, 10000, 15000, 20000, 30000, 50000].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors ${
                        amount === val
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5e7b2]'
                          : 'border-[#272732] bg-[#181820] text-zinc-400 hover:text-white'
                      }`}
                    >
                      ₹{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Payment Method Selection (UPI, Credit Card, Debit Card, Net Banking, Wallets) */}
              <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 space-y-5">
                <div>
                  <h2 className="font-cinzel text-base font-bold text-white">
                    4. Select Payment Option
                  </h2>
                  <p className="text-xs text-zinc-400">
                    All Indian payment options powered by secure Razorpay and UPI.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
                    { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
                    { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
                    { id: 'Wallets', label: 'Wallets', icon: Wallet },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = paymentMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        id={`method-${m.id.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                          active
                            ? 'bg-[#d4af37] text-black font-bold border-[#d4af37] shadow-lg shadow-[#d4af37]/20'
                            : 'bg-[#181820] border-[#272732] text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Method Specific Interactive Inputs */}
                {paymentMethod === 'UPI' && (
                  <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Pay via Any UPI App</span>
                      <span className="text-emerald-400 text-[11px] font-medium">Instant Verification</span>
                    </div>
                    <p className="text-zinc-400 text-[11px]">
                      You can pay via Google Pay, PhonePe, Paytm, BHIM, Cred or Any UPI app using UPI ID:
                    </p>
                    <div className="flex items-center gap-2 bg-[#0d0d11] p-3 rounded-xl border border-[#272732]">
                      <code className="text-[#d4af37] font-bold font-mono text-xs sm:text-sm flex-1 truncate">
                        {settings?.upiId || '[ADD ACTUAL UPI ID HERE]'}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2.5 py-1 rounded bg-[#272735] hover:bg-[#343444] text-[11px] text-zinc-200 flex items-center gap-1 shrink-0"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Optional UTR / UPI Ref Number (if already paid via app):
                      </label>
                      <input
                        type="text"
                        value={upiRefNumber}
                        onChange={(e) => setUpiRefNumber(e.target.value)}
                        placeholder="e.g. 408928392019"
                        className="w-full bg-[#121218] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>
                )}

                {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                  <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-3 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="font-semibold text-white">Enter {paymentMethod} Details</span>
                      <span className="text-[10px] text-zinc-500">256-Bit SSL Protected</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full bg-[#121218] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="•••• •••• •••• ••••"
                          className="w-full bg-[#121218] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-[#121218] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                            CVV Code
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full bg-[#121218] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Net Banking' && (
                  <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-3 text-xs">
                    <label className="block font-semibold text-white">Select Your Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full bg-[#121218] border border-[#272732] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    >
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="Odisha Gramya Bank">Odisha Gramya Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'Wallets' && (
                  <div className="p-4 rounded-2xl bg-[#181822] border border-[#272732] space-y-3 text-xs">
                    <label className="block font-semibold text-white">Select Digital Wallet</label>
                    <select
                      value={selectedWallet}
                      onChange={(e) => setSelectedWallet(e.target.value)}
                      className="w-full bg-[#121218] border border-[#272732] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    >
                      <option value="Paytm">Paytm Wallet</option>
                      <option value="PhonePe">PhonePe Wallet</option>
                      <option value="Amazon Pay">Amazon Pay</option>
                      <option value="Mobikwik">Mobikwik</option>
                      <option value="Freecharge">Freecharge</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Pay Now Button */}
            <div className="space-y-6">
              {/* Order Summary Card */}
              <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 space-y-5 sticky top-28">
                <h3 className="font-cinzel text-base font-bold text-white border-b border-[#272732] pb-3">
                  Payment Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Order ID:</span>
                    <span className="text-white font-mono font-semibold">{orderId || 'NEW-ORDER'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400">Customer Name:</span>
                    <span className="text-zinc-200 font-semibold truncate max-w-[150px]">
                      {customerName || '—'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400">Service:</span>
                    <span className="text-zinc-200 font-semibold text-right">{selectedService}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400">Payment Purpose:</span>
                    <span className="text-amber-300 font-medium">{amountType}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400">Payment Method:</span>
                    <span className="text-zinc-200">{paymentMethod}</span>
                  </div>

                  <div className="border-t border-[#272732] pt-3 flex justify-between items-baseline">
                    <span className="font-semibold text-white text-sm">Total Payable:</span>
                    <span className="font-cinzel text-xl font-bold text-[#d4af37] font-mono">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="pay-now-btn"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-bold text-sm tracking-wide shadow-xl shadow-[#d4af37]/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Processing Secure Handshake...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-black" />
                      <span>Pay Now ₹{amount.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>

                {/* Trust badges */}
                <div className="pt-2 text-center text-[10px] text-zinc-500 space-y-1">
                  <div className="flex items-center justify-center gap-1 text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Razorpay Verified Merchant • Sushil Photography Jhar</span>
                  </div>
                  <p>Tax invoice generated automatically upon payment receipt.</p>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* TAB 2: DEDICATED "PAY VIA UPI" SECTION */}
        {/* ==================================================== */}
        {activeTab === 'upi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Dedicated UPI & QR Display */}
            <div className="lg:col-span-6 bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-wider">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan & Pay via UPI</span>
                </div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                  Dedicated UPI Payment
                </h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Scan the official studio QR code or copy the UPI ID directly into Google Pay, PhonePe, Paytm, or BHIM.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-[#0d0d12] shadow-2xl border-2 border-[#d4af37]/40 space-y-3">
                <MediaUploadPlaceholder
                  label="Upload UPI Payment QR Code"
                  subText="Click or Drag & Drop"
                  supportedFormatsText="PNG, JPG, WEBP, SVG • Max 10MB"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  currentUrl={activeQrCode}
                  category="Payment QR"
                  slotKey="paymentQrCode"
                  usedIn="Pay via UPI section"
                  aspectRatio="square"
                  maxSizeMB={10}
                  onUploadSuccess={(url) => {
                    if (settings) {
                      setSettings({ ...settings, qrCodeUrl: url });
                    }
                  }}
                  onRemoveSuccess={() => {
                    if (settings) {
                      setSettings({ ...settings, qrCodeUrl: '' });
                    }
                  }}
                />
                <div className="text-center font-cinzel text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  {settings?.businessName || 'Sushil Photography Jhar'}
                </div>
              </div>

              {/* UPI ID Display Box */}
              <div className="bg-[#181822] border border-[#272732] rounded-2xl p-4 text-left space-y-2">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  Studio UPI ID
                </span>
                <div className="flex items-center justify-between gap-2 bg-[#09090b] p-3 rounded-xl border border-[#272732]">
                  <code className="text-[#d4af37] font-bold text-sm font-mono truncate">
                    {settings?.upiId || '[ADD ACTUAL UPI ID HERE]'}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3 py-1.5 rounded-lg bg-[#22222d] hover:bg-[#2c2c3b] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* Contact Help */}
              <div className="text-xs text-zinc-400 flex items-center justify-center gap-2">
                <span>Questions regarding payment?</span>
                <a
                  href={`tel:${settings?.paymentPhone || '7608814804'}`}
                  className="text-[#d4af37] font-semibold hover:underline"
                >
                  Call +91 {settings?.paymentPhone || '7608814804'}
                </a>
              </div>
            </div>

            {/* Right: Instant UPI Payment Submission & UTR Confirmation */}
            <div className="lg:col-span-6 bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-white">
                  Confirm Your UPI Payment
                </h3>
                <p className="text-xs text-zinc-400">
                  After sending funds via UPI, submit your transaction ref / UTR to generate your official downloadable receipt.
                </p>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Customer Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter payer full name"
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Order ID (if known)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. SPJ-ORD-1001"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Service
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value as any)}
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    >
                      {PAYMENT_SERVICES_LIST.map((svc) => (
                        <option key={svc} value={svc}>
                          {svc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Amount Paid (INR ₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    UPI Transaction UTR / Ref Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={upiRefNumber}
                    onChange={(e) => setUpiRefNumber(e.target.value)}
                    placeholder="12-digit UTR from your UPI app (e.g. 409823901923)"
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Remarks / Event Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Advance for Sohela wedding reception"
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#d4af37]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Verifying UPI Receipt...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>Verify & Download UPI Receipt</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: BANK PAYMENT INSTRUCTIONS & SUBMISSION */}
        {/* ==================================================== */}
        {activeTab === 'bank' && (
          <div className="space-y-8">
            <SushilBankTransferSection
              settings={settings}
              initialOrderId={orderId}
              initialAmount={amount}
              initialService={selectedService}
              onPaymentSuccess={(submission) => {
                // If linked to an order, reflect success state
                setPaymentSuccess({
                  paymentId: (submission as any).id || 'PAY-BANK-SUBMISSION',
                  transactionId: submission.transactionId,
                  amount: submission.amount,
                  date: submission.paymentDate,
                  status: 'Pending Verification',
                });
              }}
            />

            {/* Payment Terms & Refund Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d4af37]" />
                  <span>Studio Payment Terms</span>
                </h3>
                <div className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed bg-[#181822] p-4 rounded-2xl border border-[#272732]">
                  {settings?.paymentTerms ||
                    '• 30% to 50% advance booking deposit is required to lock wedding dates.\n• Remaining balance is due upon album delivery or final video sign-off.\n• GST invoices are provided for all digital payments.'}
                </div>
              </div>

              <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Studio Refund Policy</span>
                </h3>
                <div className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed bg-[#181822] p-4 rounded-2xl border border-[#272732]">
                  {settings?.refundPolicy ||
                    '• Advance deposits can be transferred to an alternate available date with 15 days notice.\n• Cancellations made within 7 days of event are non-refundable.\n• Equipment emergencies carry a 100% full money-back guarantee.'}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ==================================================== */}
        {/* TAB 4: RECEIPT LOOKUP & RE-DOWNLOAD */}
        {/* ==================================================== */}
        {activeTab === 'lookup' && (
          <div className="max-w-2xl mx-auto bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="font-cinzel text-xl font-bold text-white">
                Download Existing Receipt
              </h2>
              <p className="text-xs text-zinc-400">
                Enter your Payment ID, Order ID, or Transaction Ref to download your official voucher.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="e.g. PAY-SPJ-9011 or SPJ-ORD-1001"
                className="flex-1 bg-[#181820] border border-[#272732] rounded-xl px-4 py-3 text-xs text-white focus:border-[#d4af37] outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!lookupQuery.trim()) return;
                  setIsLookingUp(true);
                  setLookupError('');
                  try {
                    const data = await api.getPaymentReceipt(lookupQuery.trim());
                    setReceiptModalData(data);
                    setShowReceiptModal(true);
                  } catch (err: any) {
                    setLookupError('Receipt not found. Please verify the ID or contact studio desk.');
                  } finally {
                    setIsLookingUp(false);
                  }
                }}
                disabled={isLookingUp}
                className="px-5 py-3 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs transition-colors shrink-0"
              >
                {isLookingUp ? 'Searching...' : 'Get Receipt'}
              </button>
            </div>

            {lookupError && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Studio Contact Bar */}
        <div className="rounded-2xl bg-[#101015] border border-[#272732] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#d4af37]" />
            <span>Sushil Photography Jhar • Jhar, Sohela, Bargarh District, Odisha - 768033</span>
          </div>

          <div className="flex items-center space-x-4">
            <a href={`tel:${settings?.paymentPhone || '7608814804'}`} className="hover:text-white flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>+91 {settings?.paymentPhone || '7608814804'}</span>
            </a>
            <span>•</span>
            <a href={`tel:${settings?.secondaryPhone || '7735045136'}`} className="hover:text-white">
              +91 {settings?.secondaryPhone || '7735045136'}
            </a>
          </div>
        </div>
      </div>

      {/* Official Receipt Modal */}
      <PaymentReceiptModal
        isOpen={showReceiptModal}
        receiptData={receiptModalData}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
};
