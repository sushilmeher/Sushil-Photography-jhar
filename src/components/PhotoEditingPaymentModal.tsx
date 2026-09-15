import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  QrCode,
  Smartphone,
  CreditCard,
  Building2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentSettings, PhotoEditingUploadFile } from '../types';

interface PhotoEditingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    serviceId: string;
    serviceTitle: string;
    unitPrice: number;
    unit: string;
    quantity: number;
    subtotal: number;
    totalAmount: number;
    customerName: string;
    customerPhone: string;
    customerWhatsapp?: string;
    customerEmail?: string;
    eventType?: string;
    requiredDeliveryDate?: string;
    specialInstructions?: string;
    files: PhotoEditingUploadFile[];
    customOrderId?: string;
  };
  onOrderSuccess: (order: any, payment: any) => void;
}

export const PhotoEditingPaymentModal: React.FC<PhotoEditingPaymentModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onOrderSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'qr' | 'gateway' | 'bank'>('upi');
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);

  // Form states for manual / bank transfer
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [bankUtr, setBankUtr] = useState('');
  const [bankProofFile, setBankProofFile] = useState<string | null>(null);
  const [bankProofFileName, setBankProofFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Card / gateway mock inputs
  const [cardHolder, setCardHolder] = useState(orderData.customerName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setProcessing(false);
      api
        .getPaymentSettings()
        .then((s) => {
          setSettings(s);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const upiId = settings?.upiId || 'sushilmeher@okhdfcbank';
  const qrCodeUrl =
    settings?.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `upi://pay?pa=${upiId}&pn=Sushil%20Photography&am=${orderData.totalAmount}&cu=INR&tn=PhotoEditing_${orderData.serviceTitle.replace(/\s+/g, '')}`
    )}`;

  const bankInfo = settings?.bankInstructions || {
    bankName: 'HDFC Bank Ltd',
    accountHolder: 'Sushil Meher',
    accountNumber: '50200084729104',
    ifscCode: 'HDFC0001824',
    branch: 'Sohela / Bargarh Branch',
  };

  const copyToClipboard = (text: string, type: 'upi' | 'account' | 'ifsc') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedIfsc(true);
      setTimeout(() => setCopiedIfsc(false), 2000);
    }
  };

  const handleProofFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('File size exceeds 25 MB limit.');
        return;
      }
      setBankProofFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setBankProofFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Process Online UPI Instant Verification
  const handleUpiPaymentSubmit = async () => {
    if (!upiRefNumber.trim() || upiRefNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI Reference / UTR Number from your UPI App.');
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      // Step 1: Server-side payment verification
      const verifyRes = await api.verifyPhotoEditingPayment({
        orderId: orderData.customOrderId || `SP-EDIT-${Date.now().toString().slice(-6)}`,
        amount: orderData.totalAmount,
        paymentMethod: 'UPI',
        upiRefNumber: upiRefNumber.trim(),
      });

      // Step 2: Submit final order with verified payment
      const orderRes = await api.submitPhotoEditingOrder({
        ...orderData,
        originalFiles: orderData.files,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        transactionId: verifyRes.transactionId,
      });

      setProcessing(false);
      onOrderSuccess(orderRes.order, orderRes.payment);
    } catch (err: any) {
      setProcessing(false);
      setErrorMessage(err.message || 'Payment verification failed. Please try again.');
    }
  };

  // 2. Process QR Code Payment
  const handleQrPaymentSubmit = async () => {
    if (!upiRefNumber.trim() || upiRefNumber.trim().length < 6) {
      setErrorMessage('Please enter the 12-digit UTR / UPI Reference Number from your payment receipt.');
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      const verifyRes = await api.verifyPhotoEditingPayment({
        orderId: orderData.customOrderId || `SP-EDIT-${Date.now().toString().slice(-6)}`,
        amount: orderData.totalAmount,
        paymentMethod: 'UPI QR',
        upiRefNumber: upiRefNumber.trim(),
      });

      const orderRes = await api.submitPhotoEditingOrder({
        ...orderData,
        originalFiles: orderData.files,
        paymentMethod: 'UPI QR',
        paymentStatus: 'Paid',
        transactionId: verifyRes.transactionId,
      });

      setProcessing(false);
      onOrderSuccess(orderRes.order, orderRes.payment);
    } catch (err: any) {
      setProcessing(false);
      setErrorMessage(err.message || 'QR Payment verification failed. Please try again.');
    }
  };

  // 3. Process Card / Gateway Payment
  const handleGatewayPaymentSubmit = async () => {
    setProcessing(true);
    setErrorMessage('');

    try {
      // Server-side intent simulation & gateway execution
      const verifyRes = await api.verifyPhotoEditingPayment({
        orderId: orderData.customOrderId || `SP-EDIT-${Date.now().toString().slice(-6)}`,
        amount: orderData.totalAmount,
        paymentMethod: 'Online Gateway (Cards / NetBanking)',
        gatewayResponse: { cardLast4: cardNumber.slice(-4) || '8821' },
      });

      const orderRes = await api.submitPhotoEditingOrder({
        ...orderData,
        originalFiles: orderData.files,
        paymentMethod: 'Online Gateway',
        paymentStatus: 'Paid',
        transactionId: verifyRes.transactionId,
      });

      setProcessing(false);
      onOrderSuccess(orderRes.order, orderRes.payment);
    } catch (err: any) {
      setProcessing(false);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    }
  };

  // 4. Process Bank Transfer
  const handleBankTransferSubmit = async () => {
    if (!bankUtr.trim()) {
      setErrorMessage('Please enter the Bank Transfer UTR / Transaction Reference Number.');
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      const orderRes = await api.submitPhotoEditingOrder({
        ...orderData,
        originalFiles: orderData.files,
        paymentMethod: 'Bank Transfer (HDFC)',
        paymentStatus: 'Payment Verification Pending',
        transactionId: bankUtr.trim(),
        paymentProofUrl: bankProofFile || '',
      });

      setProcessing(false);
      onOrderSuccess(orderRes.order, orderRes.payment);
    } catch (err: any) {
      setProcessing(false);
      setErrorMessage(err.message || 'Bank transfer submission failed. Please try again.');
    }
  };

  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    settings?.businessName || 'Sushil Photography'
  )}&am=${orderData.totalAmount}&cu=INR&tn=${encodeURIComponent(
    `Order for ${orderData.serviceTitle}`
  )}`;

  return (
    <div
      id="photo-editing-payment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-[#121217] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181822] border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-cinzel">
                Complete Your Payment
              </h2>
              <p className="text-xs text-zinc-400">
                100% Encrypted & Secure Studio Checkout • Sushil Photography Jhar
              </p>
            </div>
          </div>
          <button
            id="close-payment-modal-btn"
            onClick={onClose}
            disabled={processing}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Ribbon */}
        <div className="bg-[#0e0e13] px-6 py-4 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-xs font-semibold text-[#d4af37]">
                {orderData.serviceTitle}
              </span>
              <span className="text-xs text-zinc-400">
                ({orderData.quantity} {orderData.unit}s @ ₹{orderData.unitPrice}/{orderData.unit})
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Customer: <span className="text-zinc-200 font-medium">{orderData.customerName}</span> • {orderData.customerPhone}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400 uppercase tracking-wider block">Total Payable</span>
            <span className="text-2xl font-bold text-[#d4af37]">₹{orderData.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Options Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-[#14141b] border-b border-zinc-800">
          <button
            id="pay-tab-upi"
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
              paymentMethod === 'upi'
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37] shadow-lg shadow-[#d4af37]/5'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span>UPI Apps</span>
          </button>

          <button
            id="pay-tab-qr"
            type="button"
            onClick={() => setPaymentMethod('qr')}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
              paymentMethod === 'qr'
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37] shadow-lg shadow-[#d4af37]/5'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>Scan QR Code</span>
          </button>

          <button
            id="pay-tab-gateway"
            type="button"
            onClick={() => setPaymentMethod('gateway')}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
              paymentMethod === 'gateway'
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37] shadow-lg shadow-[#d4af37]/5'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Card / NetBanking</span>
          </button>

          <button
            id="pay-tab-bank"
            type="button"
            onClick={() => setPaymentMethod('bank')}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
              paymentMethod === 'bank'
                ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37] shadow-lg shadow-[#d4af37]/5'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Bank Transfer</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 space-y-6">
          {/* 1. UPI TAB */}
          {paymentMethod === 'upi' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-zinc-400 block">Studio Admin UPI ID</span>
                    <span className="font-mono text-base font-bold text-white tracking-wide select-all">
                      {upiId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="copy-upi-btn"
                      type="button"
                      onClick={() => copyToClipboard(upiId, 'upi')}
                      className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors border border-zinc-700"
                    >
                      {copiedUpi ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy UPI ID</span>
                        </>
                      )}
                    </button>
                    <a
                      id="open-upi-app-btn"
                      href={upiIntentUrl}
                      className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#c59e2b] text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Pay Using UPI App</span>
                    </a>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 leading-relaxed">
                  <p className="font-medium text-zinc-300 mb-1">How to pay:</p>
                  1. Click <strong className="text-white">"Pay Using UPI App"</strong> or open GPay / PhonePe / Paytm / BHIM.<br />
                  2. Send exact amount of <strong className="text-[#d4af37]">₹{orderData.totalAmount.toLocaleString()}</strong> to <span className="font-mono text-zinc-200">{upiId}</span>.<br />
                  3. Enter the 12-digit UPI Reference No / UTR below and click <strong>Verify & Complete Order</strong>.
                </div>
              </div>

              {/* Reference number input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Enter 12-digit UPI Reference Number / UTR <span className="text-red-400">*</span>
                </label>
                <input
                  id="upi-ref-input"
                  type="text"
                  value={upiRefNumber}
                  onChange={(e) => setUpiRefNumber(e.target.value)}
                  placeholder="e.g. 508192847192"
                  className="w-full px-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37] text-sm"
                />
              </div>

              <button
                id="submit-upi-pay-btn"
                type="button"
                onClick={handleUpiPaymentSubmit}
                disabled={processing}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-zinc-950 font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying UPI Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Verify & Complete Order (₹{orderData.totalAmount.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 2. QR CODE TAB */}
          {paymentMethod === 'qr' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-[#181822] border border-zinc-800">
                <div className="p-3 bg-white rounded-xl shadow-xl border border-zinc-200 shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="Sushil Photography UPI QR Code"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <span className="px-2.5 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-xs font-semibold text-[#d4af37] inline-block">
                    Official Dynamic UPI QR
                  </span>
                  <h3 className="text-base font-bold text-white font-cinzel">
                    Scan with Any UPI App
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Open Google Pay, PhonePe, Paytm, or BHIM and scan this QR code to pay{' '}
                    <strong className="text-[#d4af37]">₹{orderData.totalAmount.toLocaleString()}</strong> directly to Sushil Photography.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                    <button
                      id="copy-upi-qr-btn"
                      type="button"
                      onClick={() => copyToClipboard(upiId, 'upi')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors border border-zinc-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedUpi ? 'Copied!' : upiId}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* UTR Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Enter 12-Digit Transaction / UTR Number After Scanning <span className="text-red-400">*</span>
                </label>
                <input
                  id="qr-utr-input"
                  type="text"
                  value={upiRefNumber}
                  onChange={(e) => setUpiRefNumber(e.target.value)}
                  placeholder="e.g. 509918239012"
                  className="w-full px-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37] text-sm"
                />
              </div>

              <button
                id="submit-qr-pay-btn"
                type="button"
                onClick={handleQrPaymentSubmit}
                disabled={processing}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-zinc-950 font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm & Complete Order (₹{orderData.totalAmount.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 3. GATEWAY / CARD TAB */}
          {paymentMethod === 'gateway' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                    <span>256-Bit SSL Encrypted Payment Gateway</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">Instant Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-zinc-400 font-medium">Cardholder Name</label>
                    <input
                      id="card-name-input"
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs text-zinc-400 font-medium">Card Number</label>
                    <input
                      id="card-number-input"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 •••• •••• ••••"
                      maxLength={19}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-medium">Expiry Date (MM/YY)</label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      maxLength={5}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-medium">CVV / CVC</label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>

              <button
                id="submit-gateway-pay-btn"
                type="button"
                onClick={handleGatewayPaymentSubmit}
                disabled={processing}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-zinc-950 font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{orderData.totalAmount.toLocaleString()} Securely</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 4. BANK TRANSFER TAB */}
          {paymentMethod === 'bank' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-[#d4af37]">Official Studio Bank Account</span>
                  <span className="text-xs text-zinc-400">{bankInfo.bankName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Account Holder</span>
                    <span className="font-semibold text-white">{bankInfo.accountHolder}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Branch</span>
                    <span className="font-semibold text-white">{bankInfo.branch}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block">Account Number</span>
                      <span className="font-mono font-bold text-white select-all">{bankInfo.accountNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankInfo.accountNumber, 'account')}
                      className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                    >
                      {copiedAccount ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block">IFSC Code</span>
                      <span className="font-mono font-bold text-white select-all">{bankInfo.ifscCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankInfo.ifscCode, 'ifsc')}
                      className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                    >
                      {copiedIfsc ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* UTR & Screenshot upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Bank UTR / Transaction Reference <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="bank-utr-input"
                    type="text"
                    value={bankUtr}
                    onChange={(e) => setBankUtr(e.target.value)}
                    placeholder="e.g. HDFC000182490219"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Upload Payment Proof / Screenshot
                  </label>
                  <label className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-900 border border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-[#d4af37] cursor-pointer text-xs transition-colors">
                    <Upload className="w-4 h-4 text-[#d4af37]" />
                    <span className="truncate">{bankProofFileName || 'Choose receipt screenshot...'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleProofFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300/90 leading-relaxed">
                💡 Bank transfers are marked as <strong>"Payment Verification Pending"</strong>. Our studio admin will verify the deposit in the studio account and immediately assign your order to the master editor.
              </div>

              <button
                id="submit-bank-pay-btn"
                type="button"
                onClick={handleBankTransferSubmit}
                disabled={processing}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-zinc-950 font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Order with Proof...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Submit Order with Bank Transfer</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="px-6 py-3 bg-[#0c0c10] border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sushil Photography Official Portal • Jhar, Sohela, Bargarh</span>
          </div>
          <span>Support: +91 98610 23456</span>
        </div>
      </div>
    </div>
  );
};
