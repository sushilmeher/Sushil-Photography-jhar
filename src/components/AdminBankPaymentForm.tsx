import React, { useState, useEffect } from 'react';
import {
  Building2,
  QrCode,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Download,
  FileText,
  Printer,
  Upload,
} from 'lucide-react';
import { PaymentSettings } from '../types';
import { OFFICIAL_PAYMENT_DETAILS } from '../data/paymentDetails';
import { api } from '../services/api';
import { MediaUploadPlaceholder } from './MediaUploadPlaceholder';
import { useSiteMedia } from '../hooks/useSiteMedia';

interface AdminBankPaymentFormProps {
  onPreviewPayment?: () => void;
}

export const AdminBankPaymentForm: React.FC<AdminBankPaymentFormProps> = ({
  onPreviewPayment,
}) => {
  const { config: siteMedia, updateConfig } = useSiteMedia();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Form State
  const [form, setForm] = useState<PaymentSettings>(OFFICIAL_PAYMENT_DETAILS);
  const [confirmAccNumber, setConfirmAccNumber] = useState(OFFICIAL_PAYMENT_DETAILS.bankInstructions.accountNumber);
  const [accNumberMismatch, setAccNumberMismatch] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getPaymentSettings();
      if (data) {
        const merged: PaymentSettings = {
          ...OFFICIAL_PAYMENT_DETAILS,
          ...data,
          bankInstructions: {
            ...OFFICIAL_PAYMENT_DETAILS.bankInstructions,
            ...(data.bankInstructions || {}),
          },
        };
        setForm(merged);
        setConfirmAccNumber(merged.bankInstructions.accountNumber || '');
      }
    } catch (err) {
      console.warn('Using default payment constants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (val: string) => {
    setForm((prev) => ({
      ...prev,
      bankInstructions: {
        ...prev.bankInstructions,
        accountNumber: val,
      },
    }));
    if (confirmAccNumber && val !== confirmAccNumber) {
      setAccNumberMismatch(true);
    } else {
      setAccNumberMismatch(false);
    }
  };

  const handleConfirmAccountChange = (val: string) => {
    setConfirmAccNumber(val);
    if (val && form.bankInstructions.accountNumber !== val) {
      setAccNumberMismatch(true);
    } else {
      setAccNumberMismatch(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.bankInstructions.accountNumber !== confirmAccNumber) {
      setErrorMsg('Account Number and Confirm Account Number do not match.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload: PaymentSettings = {
        ...form,
        bankInstructions: {
          ...form.bankInstructions,
          confirmAccountNumber: confirmAccNumber,
        },
        updatedAt: new Date().toISOString(),
      };

      const result = await api.updatePaymentSettings(payload);
      setForm(result.settings || payload);
      setSuccessMsg('Bank & Payment Details successfully saved and updated!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save payment settings to server.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export Bookings CSV
  const handleExportBookingsCSV = async () => {
    try {
      const bookings = await api.getBookings();
      const headers = ['Booking ID', 'Customer Name', 'Phone', 'Email', 'Service', 'Event Date', 'Location', 'Status', 'Total Amount', 'Advance Paid'];
      const rows = bookings.map((b: any) => [
        b.id,
        `"${b.customerName || b.name || ''}"`,
        `"${b.phone || b.customerPhone || ''}"`,
        `"${b.email || b.customerEmail || ''}"`,
        `"${Array.isArray(b.requiredServices) ? b.requiredServices.join(', ') : (b.service || b.eventType || '')}"`,
        `"${b.weddingDate || b.eventDate || b.date || ''}"`,
        `"${b.venue || b.city || b.location || ''}"`,
        b.status || 'Confirmed',
        b.budget || b.totalAmount || b.amount || 0,
        b.advanceAmount || b.advancePaid || 0,
      ]);


      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Sushil_Photography_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Could not export bookings summary.');
    }
  };

  // Export Payments CSV
  const handleExportPaymentsCSV = async () => {
    try {
      const payments = await api.getPayments();
      const headers = ['Payment ID', 'Order ID', 'Customer Name', 'Phone', 'Service', 'Amount (INR)', 'Payment Method', 'Status', 'Transaction UTR', 'Date'];
      const rows = payments.map((p) => [
        p.id,
        p.orderId || '',
        `"${p.customerName || ''}"`,
        `"${p.customerPhone || ''}"`,
        `"${p.service || ''}"`,
        p.amount || 0,
        p.paymentMethod || 'UPI',
        p.status || 'Payment Successful',
        `"${p.transactionId || ''}"`,
        `"${p.date || ''}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Sushil_Photography_Payments_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Could not export payments summary.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Admin Payment Settings</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            Bank & Payment Details Form
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure official HDFC Bank account, UPI IDs, payment QR code, and payment gateway credentials.
          </p>
        </div>

        {/* Quick Export Accounting Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="btn-export-bookings-csv"
            onClick={handleExportBookingsCSV}
            className="px-3.5 py-2 rounded-xl bg-[#1c1c28] hover:bg-[#252535] border border-[#2e2e42] text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Export Bookings (CSV)</span>
          </button>

          <button
            type="button"
            id="btn-export-payments-csv"
            onClick={handleExportPaymentsCSV}
            className="px-3.5 py-2 rounded-xl bg-[#1c1c28] hover:bg-[#252535] border border-[#2e2e42] text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Payments (CSV)</span>
          </button>

          {onPreviewPayment && (
            <button
              type="button"
              onClick={onPreviewPayment}
              className="px-3.5 py-2 rounded-xl bg-[#22222f] hover:bg-[#2e2e3f] border border-[#38384d] text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
            >
              Preview Payment Page →
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* ================================================== */}
        {/* 1. BANK DETAILS */}
        {/* ================================================== */}
        <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#272732] pb-4">
            <Building2 className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
              Bank Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Bank Name */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={form.bankInstructions.bankName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInstructions: { ...form.bankInstructions, bankName: e.target.value },
                  })
                }
                placeholder="HDFC BANK LTD."
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={form.bankInstructions.accountHolder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInstructions: { ...form.bankInstructions, accountHolder: e.target.value },
                  })
                }
                placeholder="SUSHIL MEHER"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                required
                value={form.bankInstructions.accountNumber}
                onChange={(e) => handleAccountChange(e.target.value)}
                placeholder="50100802080920"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Confirm Account Number
              </label>
              <input
                type="text"
                required
                value={confirmAccNumber}
                onChange={(e) => handleConfirmAccountChange(e.target.value)}
                placeholder="Re-enter Account Number"
                className={`w-full bg-[#181820] border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold outline-none ${
                  accNumberMismatch ? 'border-red-500 text-red-300' : 'border-[#272732] focus:border-[#d4af37]'
                }`}
              />
              {accNumberMismatch && (
                <span className="text-[10px] text-red-400 mt-1 block">
                  Account numbers do not match.
                </span>
              )}
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                IFSC Code
              </label>
              <input
                type="text"
                required
                value={form.bankInstructions.ifscCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInstructions: { ...form.bankInstructions, ifscCode: e.target.value.toUpperCase() },
                  })
                }
                placeholder="HDFC0001817"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono font-bold focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Branch Name */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                required
                value={form.bankInstructions.branch}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInstructions: { ...form.bankInstructions, branch: e.target.value },
                  })
                }
                placeholder="BARGARH"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Branch Address */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Branch Address
              </label>
              <input
                type="text"
                value={form.bankInstructions.branchAddress || 'HDFC BANK LTD. NEAR GURUDWAEA,NH-6'}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInstructions: { ...form.bankInstructions, branchAddress: e.target.value },
                  })
                }
                placeholder="HDFC BANK LTD. NEAR GURUDWAEA,NH-6"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <select
                value={form.bankInstructions.accountType || 'SAVINGS'}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInstructions: { ...form.bankInstructions, accountType: e.target.value as any },
                  })
                }
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              >
                <option value="SAVINGS">SAVINGS</option>
                <option value="CURRENT">CURRENT</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. UPI DETAILS */}
        {/* ================================================== */}
        <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#272732] pb-4">
            <QrCode className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
              UPI Details & QR Code
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  required
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  placeholder="7608814804@hdfc"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Payment Mobile Contact
                </label>
                <input
                  type="tel"
                  value={form.paymentPhone}
                  onChange={(e) => setForm({ ...form, paymentPhone: e.target.value })}
                  placeholder="7608814804"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>
            </div>

            {/* Upload Actual QR Code */}
            <div className="p-4 rounded-2xl bg-[#0e0e13] border border-[#272732] space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Official Payment QR Code
              </span>
              <MediaUploadPlaceholder
                label="Upload Actual Payment QR Code"
                subText="Upload image for Sushil Meher UPI QR"
                currentUrl={form.qrCodeUrl || siteMedia.paymentQrCode}
                category="Payment QR"
                slotKey="paymentQrCode"
                usedIn="Payment Gateway & Bank Transfer"
                aspectRatio="square"
                onUploadSuccess={(url) => {
                  setForm((prev) => ({ ...prev, qrCodeUrl: url }));
                  updateConfig({ paymentQrCode: url });
                }}
                onRemoveSuccess={() => {
                  setForm((prev) => ({ ...prev, qrCodeUrl: '' }));
                  updateConfig({ paymentQrCode: '' });
                }}
              />
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. PAYMENT GATEWAY (Razorpay / Secure Online) */}
        {/* ================================================== */}
        <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#272732] pb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                Payment Gateway Configuration
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Lock className="w-3 h-3" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Gateway Provider Name
              </label>
              <select
                value={form.paymentGateway}
                onChange={(e) => setForm({ ...form, paymentGateway: e.target.value })}
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              >
                <option value="Razorpay">Razorpay (Cards, Net Banking, UPI)</option>
                <option value="Cashfree">Cashfree Payments</option>
                <option value="Paytm">Paytm Merchant Gateway</option>
                <option value="Stripe">Stripe Payments India</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Gateway Key ID (Public API Key)
              </label>
              <input
                type="text"
                value={form.razorpayKeyId}
                onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                placeholder="rzp_live_... or rzp_test_..."
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Gateway Secret Key (Server-Side Only)
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={form.gatewaySecret || ''}
                  onChange={(e) => setForm({ ...form, gatewaySecret: e.target.value })}
                  placeholder="Stored securely on backend server"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Never shared with client browsers; proxied through secure server APIs.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Webhook Secret (Optional)
              </label>
              <input
                type="password"
                value={form.webhookSecret || ''}
                onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
                placeholder="Webhook signature secret"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons: [SAVE PAYMENT DETAILS] [UPDATE DETAILS] */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            id="btn-save-payment-details"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-bold text-xs sm:text-sm tracking-wide shadow-xl shadow-[#d4af37]/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Updating Payment Details...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-black" />
                <span>Save & Update Payment Details</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
