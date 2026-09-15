import React, { useState } from 'react';
import {
  Building2,
  Copy,
  Check,
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Upload,
  Calendar,
  DollarSign,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { PaymentSettings, BankPaymentSubmission } from '../types';
import { OFFICIAL_PAYMENT_DETAILS } from '../data/paymentDetails';
import { api } from '../services/api';

interface SushilBankTransferSectionProps {
  settings?: PaymentSettings | null;
  initialOrderId?: string;
  initialAmount?: number;
  initialService?: string;
  onPaymentSuccess?: (submission: BankPaymentSubmission) => void;
}

export const SushilBankTransferSection: React.FC<SushilBankTransferSectionProps> = ({
  settings = OFFICIAL_PAYMENT_DETAILS,
  initialOrderId = '',
  initialAmount = 5000,
  initialService = 'Wedding Booking',
  onPaymentSuccess,
}) => {
  const activeSettings = settings || OFFICIAL_PAYMENT_DETAILS;
  const bank = activeSettings.bankInstructions || OFFICIAL_PAYMENT_DETAILS.bankInstructions;

  // Copy state trackers
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State
  const [orderId, setOrderId] = useState(initialOrderId);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [service, setService] = useState(initialService);
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState<number>(initialAmount);
  const [notes, setNotes] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<BankPaymentSubmission | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePayViaUpi = () => {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(activeSettings.upiId || '7608814804@hdfc')}&pn=${encodeURIComponent(activeSettings.ownerName || 'Sushil Meher')}&am=${amountPaid || 5000}&cu=INR&tn=${encodeURIComponent(`Booking payment for ${service || 'Sushil Photography'}`)}`;
    window.location.href = upiUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setErrorMsg('Please enter your 12-digit Transaction/Reference ID (UTR).');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter Customer Name and Contact Number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const submission: BankPaymentSubmission = {
        orderId: orderId.trim() || `SPJ-ORD-${Date.now().toString().slice(-4)}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        service,
        amount: Number(amountPaid),
        transactionId: transactionId.trim(),
        paymentDate,
        notes: notes.trim() || 'Bank Transfer Deposit',
        screenshotUrl: screenshotUrl || undefined,
        status: 'Pending Verification',
        submittedAt: new Date().toISOString(),
      };

      const result = await api.submitBankPayment(submission);
      setSubmittedData(result.submission || submission);
      if (onPaymentSuccess) {
        onPaymentSuccess(result.submission || submission);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit bank transfer verification. Please try again or WhatsApp us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="bank-transfer-section" className="space-y-8">
      {/* 2-Column Layout: Bank & UPI Info on Left, Customer Submission Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Bank Credentials & Action Buttons */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Top Accent Light */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-70" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#8c6411]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-lg shadow-[#d4af37]/10">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/20">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Official Bank Transfer</span>
                  </div>
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white mt-1">
                    HDFC Bank & Direct Transfer
                  </h3>
                </div>
              </div>

              <div className="hidden sm:block text-right font-mono text-xs text-zinc-400">
                <span className="text-zinc-500 text-[10px] block">TYPE</span>
                <span className="text-emerald-400 font-semibold">{bank.accountType || 'SAVINGS'}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Transfer advance booking or package payment directly via IMPS, NEFT, RTGS, or Net Banking using our verified bank account credentials.
            </p>

            {/* Structured Bank Details Card */}
            <div className="bg-[#181822] border border-[#272732] rounded-2xl p-5 space-y-3.5 text-xs font-mono">
              {/* Bank Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272732]/80 pb-2.5 gap-1">
                <span className="text-zinc-400 font-sans text-xs uppercase tracking-wider font-semibold">Bank Name:</span>
                <span className="text-white font-bold text-sm tracking-wide">
                  {bank.bankName || 'HDFC BANK LTD.'}
                </span>
              </div>

              {/* Account Holder */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272732]/80 pb-2.5 gap-1">
                <span className="text-zinc-400 font-sans text-xs uppercase tracking-wider font-semibold">Account Holder Name:</span>
                <span className="text-white font-bold text-sm tracking-wide uppercase">
                  {bank.accountHolder || 'SUSHIL MEHER'}
                </span>
              </div>

              {/* Account Number with Copy */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272732]/80 pb-2.5 gap-2 bg-[#121219] p-3 rounded-xl border border-[#d4af37]/30">
                <div>
                  <span className="text-zinc-400 font-sans text-xs uppercase tracking-wider font-semibold block">Account Number:</span>
                  <span className="text-[#d4af37] font-bold text-base sm:text-lg tracking-wider font-mono">
                    {bank.accountNumber || '50100802080920'}
                  </span>
                </div>
                <button
                  type="button"
                  id="btn-copy-account-number"
                  onClick={() => copyToClipboard(bank.accountNumber || '50100802080920', 'accountNumber')}
                  className="px-3 py-1.5 rounded-lg bg-[#272736] hover:bg-[#353549] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors self-start sm:self-center shrink-0"
                >
                  {copiedField === 'accountNumber' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Copy Account Number</span>
                    </>
                  )}
                </button>
              </div>

              {/* IFSC Code with Copy */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272732]/80 pb-2.5 gap-2 bg-[#121219] p-3 rounded-xl border border-[#272732]">
                <div>
                  <span className="text-zinc-400 font-sans text-xs uppercase tracking-wider font-semibold block">IFSC Code:</span>
                  <span className="text-white font-bold text-sm sm:text-base tracking-widest font-mono">
                    {bank.ifscCode || 'HDFC0001817'}
                  </span>
                </div>
                <button
                  type="button"
                  id="btn-copy-ifsc-code"
                  onClick={() => copyToClipboard(bank.ifscCode || 'HDFC0001817', 'ifscCode')}
                  className="px-3 py-1.5 rounded-lg bg-[#272736] hover:bg-[#353549] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors self-start sm:self-center shrink-0"
                >
                  {copiedField === 'ifscCode' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Copy IFSC Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Branch Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272732]/80 pb-2.5 gap-1">
                <span className="text-zinc-400 font-sans text-xs uppercase tracking-wider font-semibold">Branch Name:</span>
                <span className="text-zinc-200 font-bold">
                  {bank.branch || 'BARGARH'}
                </span>
              </div>

              {/* Branch Address */}
              <div className="flex flex-col justify-between border-b border-[#272732]/80 pb-2.5 gap-1">
                <span className="text-zinc-400 font-sans text-xs uppercase tracking-wider font-semibold">Branch Address:</span>
                <span className="text-zinc-300 text-[11px] font-sans">
                  {bank.branchAddress || 'HDFC BANK LTD. NEAR GURUDWAEA,NH-6, BARGARH, ODISHA'}
                </span>
              </div>

              {/* Account Type */}
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-sans text-xs uppercase tracking-wider font-semibold">Account Type:</span>
                <span className="text-emerald-400 font-bold tracking-wider uppercase">
                  {bank.accountType || 'SAVINGS'}
                </span>
              </div>
            </div>

            {/* UPI ID Card with Copy & Pay */}
            <div className="bg-gradient-to-r from-[#181822] to-[#1e1e2d] border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-zinc-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#d4af37]" />
                  <span>Direct UPI ID</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
                  Instant Credit
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#0d0d12] p-3 rounded-xl border border-[#272732]">
                <code className="text-[#d4af37] font-bold text-sm sm:text-base font-mono truncate">
                  {activeSettings.upiId || '7608814804@hdfc'}
                </code>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="btn-copy-upi-id"
                    onClick={() => copyToClipboard(activeSettings.upiId || '7608814804@hdfc', 'upiId')}
                    className="px-3 py-1.5 rounded-lg bg-[#272736] hover:bg-[#353549] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedField === 'upiId' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Copy UPI ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: [Copy Account Number] [Copy IFSC Code] [Copy UPI ID] [Pay via UPI] [Scan QR Code] */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                id="action-copy-acc"
                onClick={() => copyToClipboard(bank.accountNumber || '50100802080920', 'accountNumber')}
                className="p-2.5 rounded-xl bg-[#1c1c27] hover:bg-[#252533] border border-[#2e2e3e] text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="truncate">Copy Account</span>
              </button>

              <button
                type="button"
                id="action-copy-ifsc"
                onClick={() => copyToClipboard(bank.ifscCode || 'HDFC0001817', 'ifscCode')}
                className="p-2.5 rounded-xl bg-[#1c1c27] hover:bg-[#252533] border border-[#2e2e3e] text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="truncate">Copy IFSC</span>
              </button>

              <button
                type="button"
                id="action-copy-upi"
                onClick={() => copyToClipboard(activeSettings.upiId || '7608814804@hdfc', 'upiId')}
                className="p-2.5 rounded-xl bg-[#1c1c27] hover:bg-[#252533] border border-[#2e2e3e] text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="truncate">Copy UPI ID</span>
              </button>

              <button
                type="button"
                id="action-pay-via-upi"
                onClick={handlePayViaUpi}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-900/20"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="truncate">Pay via UPI</span>
              </button>

              <button
                type="button"
                id="action-scan-qr"
                onClick={() => setShowQrModal(true)}
                className="col-span-2 sm:col-span-2 p-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#d4af37]/20"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan / View QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Customer Bank Transfer Submission Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mb-2">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Verification & e-Receipt</span>
              </div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                Submit Bank Transfer Details
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your transaction reference number after sending payment to link to your booking.
              </p>
            </div>

            {submittedData ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-cinzel text-base font-bold text-white">
                    Transfer Submission Received!
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Your payment verification request has been queued. Our studio admin desk will verify and issue your official voucher.
                  </p>
                </div>

                <div className="bg-[#121219] p-4 rounded-xl border border-emerald-500/20 text-left text-xs font-mono space-y-2 text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Transaction ID:</span>
                    <span className="text-emerald-400 font-bold">{submittedData.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Amount Paid:</span>
                    <span className="text-[#d4af37] font-bold">₹{submittedData.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status:</span>
                    <span className="text-amber-400 font-bold">{submittedData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Payer:</span>
                    <span className="text-white">{submittedData.customerName}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedData(null)}
                  className="px-4 py-2 rounded-xl bg-[#272736] hover:bg-[#343448] text-xs font-semibold text-zinc-200"
                >
                  Submit Another Transaction
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Transaction / Reference ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Transaction / Reference ID (UTR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    id="input-transaction-id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 408920193821 or HDFC-TRX-98212"
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Found in your bank receipt or SMS after fund transfer.
                  </span>
                </div>

                {/* Amount Paid & Payment Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Amount Paid (INR ₹) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-zinc-400">₹</span>
                      <input
                        type="number"
                        required
                        min="100"
                        id="input-amount-paid"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white font-mono font-bold focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Payment Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      id="input-payment-date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Customer Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      id="input-customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Payer full name"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      id="input-customer-phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>

                {/* Order ID & Service */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Order / Booking ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. SPJ-ORD-1001"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Studio Service
                    </label>
                    <input
                      type="text"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      placeholder="e.g. Wedding Photography"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>

                {/* Screenshot URL or Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Transfer Screenshot or Bank Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Paid via HDFC Netbanking from Sohela"
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="btn-submit-bank-transfer"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-[#d4af37]/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting for Verification...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>Submit Bank Transfer for Verification</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 text-center shadow-2xl relative">
            <div className="space-y-1">
              <h4 className="font-cinzel text-lg font-bold text-white">
                SUSHIL MEHER
              </h4>
              <p className="text-xs text-zinc-400">
                Sushil Photography Jhar • HDFC UPI
              </p>
            </div>

            {/* QR Card Graphic */}
            <div className="p-5 bg-white rounded-2xl shadow-2xl inline-block mx-auto border-4 border-[#d4af37]/40">
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white flex flex-col items-center justify-center text-black">
                {/* Visual SVG QR Code with Sushil Meher Details */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Outer Frame */}
                  <rect x="10" y="10" width="60" height="60" fill="none" stroke="#000" strokeWidth="12" />
                  <rect x="25" y="25" width="30" height="30" fill="#000" />
                  
                  <rect x="130" y="10" width="60" height="60" fill="none" stroke="#000" strokeWidth="12" />
                  <rect x="145" y="25" width="30" height="30" fill="#000" />

                  <rect x="10" y="130" width="60" height="60" fill="none" stroke="#000" strokeWidth="12" />
                  <rect x="25" y="145" width="30" height="30" fill="#000" />

                  {/* QR Pattern Blocks */}
                  <rect x="85" y="15" width="12" height="35" fill="#000" />
                  <rect x="105" y="25" width="12" height="20" fill="#000" />
                  <rect x="85" y="65" width="30" height="12" fill="#000" />
                  <rect x="15" y="85" width="35" height="12" fill="#000" />
                  <rect x="65" y="85" width="15" height="15" fill="#000" />
                  <rect x="95" y="95" width="15" height="15" fill="#000" />
                  <rect x="135" y="85" width="50" height="12" fill="#000" />
                  <rect x="15" y="105" width="20" height="12" fill="#000" />
                  <rect x="50" y="105" width="30" height="12" fill="#000" />
                  <rect x="145" y="115" width="40" height="12" fill="#000" />
                  <rect x="85" y="135" width="25" height="25" fill="#000" />
                  <rect x="135" y="145" width="20" height="40" fill="#000" />
                  <rect x="165" y="165" width="20" height="20" fill="#000" />

                  {/* Center Camera Icon Badge */}
                  <circle cx="100" cy="100" r="18" fill="#d4af37" />
                  <circle cx="100" cy="100" r="7" fill="#000" />
                </svg>
              </div>
            </div>

            <div className="bg-[#181822] p-3 rounded-xl border border-[#272732] space-y-1">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">UPI ID:</span>
              <code className="text-[#d4af37] font-bold text-sm font-mono block">
                7608814804@hdfc
              </code>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePayViaUpi}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-xs text-white"
              >
                Pay via UPI App
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#272735] hover:bg-[#343446] font-semibold text-xs text-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
