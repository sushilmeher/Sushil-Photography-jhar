import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  Wallet,
  ShieldCheck,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Upload,
  FileText,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  Download,
  Mail,
  Receipt,
  User,
} from 'lucide-react';
import { Booking, Order, PaymentSettings, PaymentRecord } from '../types';
import { api } from '../services/api';
import { OFFICIAL_PAYMENT_DETAILS } from '../data/paymentDetails';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  booking: Booking | null;
  order?: Order | null;
  onClose: () => void;
  onOpenInvoice?: (orderId: string) => void;
  onNavigateToDashboard?: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  booking,
  order,
  onClose,
  onOpenInvoice,
  onNavigateToDashboard,
}) => {
  // Payment settings from Admin
  const [settings, setSettings] = useState<PaymentSettings>(OFFICIAL_PAYMENT_DETAILS);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  // Payment method selection
  const [selectedMethod, setSelectedMethod] = useState<
    'UPI' | 'QR Code' | 'Card' | 'Net Banking' | 'Wallets' | 'Bank Transfer'
  >('UPI');

  // Payment amounts
  const [payAmount, setPayAmount] = useState<number>(5000);
  const [paymentType, setPaymentType] = useState<'Booking Advance' | 'Full Payment'>('Booking Advance');

  // Form states for payment methods
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Paytm Wallet');

  // Bank Transfer states
  const [bankUtr, setBankUtr] = useState('');
  const [bankDate, setBankDate] = useState(new Date().toISOString().split('T')[0]);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);

  // Processing & Success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    paymentId: string;
    transactionId: string;
    amount: number;
    date: string;
    status: 'PAID' | 'Partially Paid' | 'Pending Verification';
    receiptNumber?: string;
  } | null>(null);

  // Copied alert
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api
        .getPaymentSettings()
        .then((data) => {
          if (data) setSettings(data);
          setLoadingSettings(false);
        })
        .catch(() => {
          setLoadingSettings(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (booking) {
      // Calculate suggested advance amount
      const parsedBudget = booking.budget
        ? parseInt(booking.budget.replace(/\D/g, ''), 10)
        : 15000;
      const total = order?.totalAmount || order?.amount || (isNaN(parsedBudget) ? 15000 : parsedBudget);
      const suggestedAdvance = Math.min(Math.max(3000, Math.round(total * 0.3)), total);
      setPayAmount(suggestedAdvance);
      setCardName(booking.customerName || '');
    }
  }, [booking, order]);

  if (!isOpen || !booking) return null;

  // Derive display values
  const bookingId = booking.id || booking.bookingId || 'SPJ-BK-1001';
  const orderId = order?.id || booking.assignedOrderNumber || `SPJ-ORD-${bookingId.replace(/\D/g, '')}`;
  const customerName = booking.customerName || 'Valued Client';
  const packageName = booking.packageChosen || booking.eventType || 'Wedding Photography Package';
  const eventDate = booking.weddingDate || booking.eventDate || 'Date Reserved';
  const venue = booking.venue ? `${booking.venue}, ${booking.city}` : booking.city || 'Sohela / Bargarh';
  
  const parsedBudget = booking.budget ? parseInt(booking.budget.replace(/\D/g, ''), 10) : 15000;
  const totalAmount = order?.totalAmount || order?.amount || (isNaN(parsedBudget) || parsedBudget === 0 ? 15000 : parsedBudget);
  const advanceRequired = Math.min(Math.max(3000, Math.round(totalAmount * 0.3)), totalAmount);
  
  const amountPaid = paymentResult?.status === 'PAID'
    ? (order?.advancePaid || 0) + (paymentResult?.amount || 0)
    : order?.advancePaid || 0;
    
  const remainingAmount = Math.max(0, totalAmount - amountPaid);
  
  const currentPaymentStatus = paymentResult
    ? paymentResult.status
    : amountPaid >= totalAmount
    ? 'PAID'
    : amountPaid > 0
    ? 'Partially Paid'
    : 'Pending';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gateway payment verification (UPI, Card, Net Banking, Wallets, QR)
  const handleGatewayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Execute verified payment through backend
      const result = await api.verifyPayment({
        orderId,
        bookingId,
        amount: payAmount,
        type: paymentType,
        paymentMethod: selectedMethod,
        customerName: booking.customerName,
        customerPhone: booking.phone,
        customerEmail: booking.email || 'sushilmeher947@gmail.com',
        service: packageName,
      });

      // Verification confirmation from server
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentResult({
          success: true,
          paymentId: result.paymentId,
          transactionId: result.transactionId,
          amount: payAmount,
          date: result.date || new Date().toLocaleString(),
          status: payAmount >= remainingAmount ? 'PAID' : 'Partially Paid',
          receiptNumber: result.receiptNumber,
        });
      }, 1000);
    } catch (err: any) {
      setIsProcessing(false);
      alert('Payment processing error: ' + (err.message || 'Please check your connection and retry.'));
    }
  };

  // Bank Transfer verification submission
  const handleBankTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankUtr.trim()) {
      alert('Please enter your 12-digit UTR or Transaction ID from your banking app.');
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await api.submitBankTransfer({
        orderId,
        bookingId,
        customerName: booking.customerName,
        customerPhone: booking.phone,
        customerEmail: booking.email || '',
        service: packageName,
        amount: payAmount,
        transactionId: bankUtr.trim(),
        paymentDate: bankDate,
        screenshotUrl: screenshotPreview || undefined,
        notes: `Bank Transfer submitted for ${packageName} booking (${bookingId}).`,
      });

      setIsProcessing(false);
      setPaymentResult({
        success: true,
        paymentId: res.payment?.id || `PAY-BANK-${Date.now().toString().slice(-6)}`,
        transactionId: bankUtr.trim(),
        amount: payAmount,
        date: bankDate,
        status: 'Pending Verification',
        receiptNumber: res.payment?.receiptNumber || `REC-BANK-${Date.now().toString().slice(-4)}`,
      });
    } catch (err: any) {
      setIsProcessing(false);
      alert('Submission error: ' + (err.message || 'Please try again.'));
    }
  };

  // UPI deep link query
  const upiIdToUse = settings.upiId || '7608814804@hdfc';
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiIdToUse)}&pn=${encodeURIComponent(
    settings.businessName || 'Sushil Photography'
  )}&am=${payAmount}&cu=INR&tn=${encodeURIComponent(`Booking ${bookingId}`)}`;

  // Dynamic QR Code URL
  const dynamicQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    upiDeepLink
  )}&bgcolor=181820&color=d4af37`;

  return (
    <div
      id="booking-confirmation-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#121216] border-2 border-[#d4af37]/60 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#181822] via-[#20202c] to-[#121216] px-6 py-4 border-b border-[#272732] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-inner">
              <CheckCircle2 className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#181820] text-[#d4af37] text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Reservation Confirmed</span>
              </div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
                Booking Confirmed
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#181820] hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* ==================================================== */}
          {/* 1. BOOKING SUMMARY CARD */}
          {/* ==================================================== */}
          <div className="bg-[#181820] border border-[#272732] rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#272732]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Booking ID:</span>
                <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#121216] px-2.5 py-1 rounded-lg border border-[#d4af37]/30">
                  {bookingId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Payment Status:</span>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                    currentPaymentStatus === 'PAID'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                      : currentPaymentStatus === 'Partially Paid'
                      ? 'bg-blue-950/60 border-blue-500/50 text-blue-400'
                      : currentPaymentStatus === 'Pending Verification'
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 animate-pulse'
                      : 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                  }`}
                >
                  {currentPaymentStatus}
                </span>
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-400 font-medium">Customer Name:</span>
                <p className="font-semibold text-white text-sm">{customerName}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-400 font-medium">Service / Package:</span>
                <p className="font-semibold text-[#f5e7b2] truncate">{packageName}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#d4af37]" /> Event Date:
                </span>
                <p className="font-semibold text-white">{eventDate}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#d4af37]" /> Event Venue:
                </span>
                <p className="font-semibold text-zinc-300 truncate">{venue}</p>
              </div>
            </div>

            {/* Financials Breakdown Table */}
            <div className="bg-[#121216] rounded-xl p-3.5 border border-[#272732] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Total Package
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#d4af37] block">
                  Advance Required
                </span>
                <span className="font-mono text-sm font-bold text-[#d4af37]">
                  ₹{advanceRequired.toLocaleString()}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Amount Paid
                </span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  ₹{amountPaid.toLocaleString()}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Remaining Amount
                </span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  ₹{remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 2. PAYMENT RESULT VIEW (If verified or submitted) */}
          {/* ==================================================== */}
          {paymentResult ? (
            <div className="bg-[#181820] border-2 border-emerald-500/50 rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xl ${
                  paymentResult.status === 'Pending Verification'
                    ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                    : 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                }`}
              >
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="font-cinzel text-xl font-extrabold text-white">
                  {paymentResult.status === 'Pending Verification'
                    ? '✓ Transfer Submitted for Verification'
                    : '✓ PAYMENT SUCCESSFUL'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  {paymentResult.status === 'Pending Verification'
                    ? `Your UTR reference has been submitted. Studio Admin Sushil Meher will verify and confirm your slot.`
                    : `Payment of ₹${paymentResult.amount.toLocaleString()} has been verified and securely recorded.`}
                </p>
              </div>

              {/* Receipt / Transaction Details Grid */}
              <div className="bg-[#121216] border border-[#272732] rounded-xl p-4 text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Booking ID:</span>
                  <span className="text-[#d4af37] font-bold">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment ID:</span>
                  <span className="text-white">{paymentResult.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction ID / UTR:</span>
                  <span className="text-zinc-300">{paymentResult.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount Paid:</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{paymentResult.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment Date:</span>
                  <span className="text-zinc-300">{paymentResult.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment Status:</span>
                  <span
                    className={`font-bold ${
                      paymentResult.status === 'PAID'
                        ? 'text-emerald-400'
                        : paymentResult.status === 'Pending Verification'
                        ? 'text-purple-300'
                        : 'text-blue-400'
                    }`}
                  >
                    {paymentResult.status}
                  </span>
                </div>
              </div>

              {/* Email dispatch notice */}
              <div className="p-3 bg-[#121216] border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                <Mail className="w-4 h-4 text-[#d4af37]" />
                <span>Confirmation dispatched to: <strong>sushilmeher947@gmail.com</strong></span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {onOpenInvoice && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenInvoice(orderId);
                    }}
                    className="w-full py-3 rounded-xl bg-[#272732] hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#d4af37]" />
                    <span>View & Print Official Invoice</span>
                  </button>
                )}

                {onNavigateToDashboard ? (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToDashboard();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-lg hover:brightness-110 flex items-center justify-center gap-1.5"
                  >
                    <User className="w-4 h-4 text-black" />
                    <span>Go to My Bookings</span>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-lg hover:brightness-110"
                  >
                    Done & Close
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* 3. PAYMENT SECTION (When payment is pending) */
            /* ==================================================== */
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#272732]">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#d4af37]" />
                    <span>Complete Your Payment</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Pay booking advance online via UPI, Cards, Net Banking, or direct HDFC Bank transfer.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#181820] border border-[#272732] px-3 py-1 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[10px] font-bold text-zinc-300">256-bit SSL</span>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="bg-[#181820] border border-[#272732] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-300">Select Payment Amount:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPayAmount(advanceRequired);
                        setPaymentType('Booking Advance');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        payAmount === advanceRequired
                          ? 'bg-[#d4af37] text-black border-[#d4af37]'
                          : 'bg-[#121216] border-[#272732] text-zinc-400 hover:text-white'
                      }`}
                    >
                      Advance (₹{advanceRequired.toLocaleString()})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPayAmount(remainingAmount || totalAmount);
                        setPaymentType('Full Payment');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        payAmount === (remainingAmount || totalAmount)
                          ? 'bg-[#d4af37] text-black border-[#d4af37]'
                          : 'bg-[#121216] border-[#272732] text-zinc-400 hover:text-white'
                      }`}
                    >
                      Full Amount (₹{(remainingAmount || totalAmount).toLocaleString()})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#d4af37]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={100}
                      max={totalAmount}
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full bg-[#121216] border border-[#272732] rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                    INR Currency
                  </span>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Select Payment Option:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                  {[
                    { id: 'UPI', label: 'UPI', icon: Smartphone },
                    { id: 'QR Code', label: 'QR Code', icon: QrCode },
                    { id: 'Card', label: 'Card', icon: CreditCard },
                    { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
                    { id: 'Wallets', label: 'Wallets', icon: Wallet },
                    { id: 'Bank Transfer', label: 'Bank Transfer', icon: Building2 },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = selectedMethod === tab.id;
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setSelectedMethod(tab.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          active
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-white font-bold shadow-md shadow-[#d4af37]/10'
                            : 'bg-[#181820] border-[#272732] text-zinc-400 hover:text-white hover:bg-[#20202c]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-[#d4af37]' : 'text-zinc-400'}`} />
                        <span className="text-[11px] truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ==================================================== */}
              {/* TAB 1: AUTOMATIC UPI CHECKOUT */}
              {/* ==================================================== */}
              {selectedMethod === 'UPI' && (
                <form onSubmit={handleGatewayPayment} className="space-y-4 bg-[#181820] p-5 rounded-2xl border border-[#272732]">
                  <div className="bg-[#121216] border border-[#272732] rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                        Admin Configured UPI ID
                      </span>
                      <span className="font-mono text-sm font-bold text-[#d4af37]">
                        {upiIdToUse}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(upiIdToUse, 'upiId')}
                      className="px-3 py-1.5 rounded-lg bg-[#272732] hover:bg-zinc-700 text-xs text-white font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'upiId' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Copy UPI ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 1-Click Fast UPI App Selectors */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-zinc-400 block font-medium">
                      Fast 1-Click Instant UPI Checkout:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'gpay', label: 'Google Pay', color: 'text-blue-400' },
                        { id: 'phonepe', label: 'PhonePe', color: 'text-purple-400' },
                        { id: 'paytm', label: 'Paytm UPI', color: 'text-cyan-400' },
                        { id: 'bhim', label: 'BHIM UPI', color: 'text-emerald-400' },
                      ].map((app) => (
                        <button
                          type="button"
                          key={app.id}
                          onClick={() => setSelectedUpiApp(app.id as any)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                            selectedUpiApp === app.id
                              ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                              : 'bg-[#121216] border-[#272732] text-zinc-400'
                          }`}
                        >
                          <span className={app.color}>{app.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Clicking &ldquo;PAY NOW&rdquo; executes instant UPI verification. You do not need to retype the studio UPI ID manually.
                  </p>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Verifying with UPI Gateway...</span>
                    ) : (
                      <>
                        <span>PAY NOW ₹{payAmount.toLocaleString()}</span>
                        <ArrowRight className="w-4 h-4 text-black" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ==================================================== */}
              {/* TAB 2: LIVE DYNAMIC QR CODE */}
              {/* ==================================================== */}
              {selectedMethod === 'QR Code' && (
                <div className="bg-[#181820] p-6 rounded-2xl border border-[#272732] text-center space-y-4">
                  <div className="inline-block p-4 bg-[#121216] border-2 border-[#d4af37] rounded-2xl shadow-xl">
                    <img
                      src={dynamicQrCodeUrl}
                      alt="UPI Payment QR Code"
                      className="w-44 h-44 mx-auto rounded-xl object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">
                      Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                    </p>
                    <p className="text-[11px] font-mono text-[#d4af37]">
                      UPI ID: {upiIdToUse} • Amount: ₹{payAmount.toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGatewayPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? 'Verifying Gateway...' : `I have Scanned & Paid ₹${payAmount.toLocaleString()}`}
                  </button>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 3: CREDIT / DEBIT CARD */}
              {/* ==================================================== */}
              {selectedMethod === 'Card' && (
                <form onSubmit={handleGatewayPayment} className="space-y-3 bg-[#181820] p-5 rounded-2xl border border-[#272732]">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4532 •••• •••• 8921"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-[#121216] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Expiry (MM/YY) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-[#121216] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#d4af37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        CVV / CVC *
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-[#121216] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SUSHIL MEHER"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-[#121216] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Verifying Card...' : `PAY NOW ₹${payAmount.toLocaleString()}`}
                  </button>
                </form>
              )}

              {/* ==================================================== */}
              {/* TAB 4: NET BANKING */}
              {/* ==================================================== */}
              {selectedMethod === 'Net Banking' && (
                <form onSubmit={handleGatewayPayment} className="space-y-4 bg-[#181820] p-5 rounded-2xl border border-[#272732]">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-2">
                      Choose Your Bank:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        'HDFC Bank',
                        'State Bank of India (SBI)',
                        'ICICI Bank',
                        'Axis Bank',
                        'Kotak Mahindra Bank',
                        'Punjab National Bank',
                      ].map((bank) => (
                        <button
                          type="button"
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            selectedBank === bank
                              ? 'bg-[#d4af37]/20 border-[#d4af37] text-white font-bold'
                              : 'bg-[#121216] border-[#272732] text-zinc-400'
                          }`}
                        >
                          <span className="truncate block">{bank}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? 'Connecting Net Banking...' : `PAY NOW VIA ${selectedBank.toUpperCase()}`}
                  </button>
                </form>
              )}

              {/* ==================================================== */}
              {/* TAB 5: WALLETS */}
              {/* ==================================================== */}
              {selectedMethod === 'Wallets' && (
                <form onSubmit={handleGatewayPayment} className="space-y-4 bg-[#181820] p-5 rounded-2xl border border-[#272732]">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-2">
                      Select Digital Wallet:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay', 'MobiKwik'].map((w) => (
                        <button
                          type="button"
                          key={w}
                          onClick={() => setSelectedWallet(w)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            selectedWallet === w
                              ? 'bg-[#d4af37]/20 border-[#d4af37] text-white font-bold'
                              : 'bg-[#121216] border-[#272732] text-zinc-400'
                          }`}
                        >
                          <span className="truncate block">{w}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {isProcessing ? 'Connecting Wallet...' : `PAY NOW VIA ${selectedWallet.toUpperCase()}`}
                  </button>
                </form>
              )}

              {/* ==================================================== */}
              {/* TAB 6: DIRECT BANK TRANSFER (HDFC BANK) */}
              {/* ==================================================== */}
              {selectedMethod === 'Bank Transfer' && (
                <form onSubmit={handleBankTransferSubmit} className="space-y-4 bg-[#181820] p-5 rounded-2xl border border-[#272732]">
                  {/* Admin Configured Bank Details */}
                  <div className="bg-[#121216] border border-[#272732] rounded-xl p-4 space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between items-center pb-2 border-b border-[#272732]">
                      <span className="font-sans font-bold text-white flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#d4af37]" />
                        Official Studio Bank Account
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            `${settings.bankInstructions.bankName}\nAccount: ${settings.bankInstructions.accountNumber}\nIFSC: ${settings.bankInstructions.ifscCode}\nHolder: ${settings.bankInstructions.accountHolder}`,
                            'allBank'
                          )
                        }
                        className="text-[10px] text-[#d4af37] hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'allBank' ? 'Copied' : 'Copy Details'}
                      </button>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500">Bank Name:</span>
                      <span className="text-white font-bold">{settings.bankInstructions.bankName || 'HDFC BANK LTD.'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Account Holder:</span>
                      <span className="text-white font-bold">{settings.bankInstructions.accountHolder || 'SUSHIL MEHER'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Account Number:</span>
                      <span className="text-[#d4af37] font-bold tracking-wider">
                        {settings.bankInstructions.accountNumber || '50100802080920'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">IFSC Code:</span>
                      <span className="text-white font-bold">{settings.bankInstructions.ifscCode || 'HDFC0001817'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Branch Name:</span>
                      <span className="text-zinc-300">{settings.bankInstructions.branch || 'BARGARH'}</span>
                    </div>
                  </div>

                  {/* Submission Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Enter Transaction ID / UTR Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="12-digit UTR from NetBanking / IMPS / NEFT"
                        value={bankUtr}
                        onChange={(e) => setBankUtr(e.target.value)}
                        className="w-full bg-[#121216] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                        Upload Payment Screenshot (Optional)
                      </label>
                      <div className="border border-dashed border-[#272732] hover:border-[#d4af37]/50 rounded-xl p-3 bg-[#121216] text-center cursor-pointer transition-colors relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {screenshotName ? (
                          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="truncate max-w-xs">{screenshotName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                            <Upload className="w-4 h-4 text-[#d4af37]" />
                            <span>Click or Drag & Drop Payment Receipt Screenshot</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bank Verification Note */}
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>
                        Bank-transfer payments remain <strong>&ldquo;Pending Verification&rdquo;</strong> until verified by studio admin Sushil Meher against the UTR.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? 'Submitting UTR Proof...' : 'Submit Bank Transfer Proof'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
