import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Plus,
  Edit3,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  Phone,
  ArrowUpDown,
  Upload,
  Image as ImageIcon,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import {
  PaymentRecord,
  PaymentSettings,
  PaymentReceiptData,
  PAYMENT_SERVICES_LIST,
  PaymentServiceType,
} from '../types';
import { PaymentReceiptModal } from './PaymentReceiptModal';

export const AdminPaymentManagement: React.FC = () => {
  const [subTab, setSubTab] = useState<'payments' | 'settings' | 'manual'>('payments');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

  // Status updating state
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Payment Successful');

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Settings form state
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsForm, setSettingsForm] = useState<PaymentSettings>({
    businessName: 'Sushil Photography Jhar',
    ownerName: 'Sushil Meher',
    paymentPhone: '7608814804',
    secondaryPhone: '7735045136',
    upiId: '[ADD ACTUAL UPI ID HERE]',
    qrCodeUrl: '',
    paymentGateway: 'Razorpay',
    gatewayTestMode: true,
    razorpayKeyId: 'rzp_test_placeholder',
    bankInstructions: {
      bankName: 'State Bank of India (SBI)',
      accountHolder: 'Sushil Meher',
      accountNumber: '[ADD ACTUAL ACCOUNT NUMBER HERE]',
      ifscCode: '[ADD ACTUAL IFSC CODE HERE]',
      branch: 'Sohela Branch, Bargarh, Odisha',
    },
    paymentTerms: '',
    refundPolicy: '',
  });

  // Manual payment entry form
  const [manualForm, setManualForm] = useState({
    orderId: '',
    customerName: '',
    customerPhone: '',
    service: 'Wedding Photography',
    amount: 5000,
    paymentMethod: 'Cash / Offline',
    type: 'Advance Payment',
    status: 'Payment Successful',
    notes: 'Studio counter offline deposit',
  });
  const [recordingManual, setRecordingManual] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [paymentsData, settingsData] = await Promise.all([
        api.getPayments(),
        api.getPaymentSettings(),
      ]);
      setPayments(paymentsData || []);
      if (settingsData) {
        setSettings(settingsData);
        setSettingsForm(settingsData);
      }
    } catch (err) {
      console.error('Failed to load payments or settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFilter = async () => {
    setLoading(true);
    try {
      const filtered = await api.getPayments({
        search: searchQuery,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        method: methodFilter !== 'All' ? methodFilter : undefined,
        service: serviceFilter !== 'All' ? serviceFilter : undefined,
      });
      setPayments(filtered || []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, status: string) => {
    try {
      await api.updatePaymentStatus(paymentId, status);
      setUpdatingPaymentId(null);
      await loadAll();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await api.updatePaymentSettings(settingsForm);
      setSettings(res.settings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSettingsForm((prev) => ({ ...prev, qrCodeUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecordingManual(true);
    setManualSuccess(false);

    try {
      await api.recordManualPayment(manualForm);
      setManualSuccess(true);
      setManualForm({
        orderId: '',
        customerName: '',
        customerPhone: '',
        service: 'Wedding Photography',
        amount: 5000,
        paymentMethod: 'Cash / Offline',
        type: 'Advance Payment',
        status: 'Payment Successful',
        notes: '',
      });
      await loadAll();
      setTimeout(() => {
        setManualSuccess(false);
        setSubTab('payments');
      }, 1500);
    } catch (err: any) {
      alert('Error recording payment: ' + err.message);
    } finally {
      setRecordingManual(false);
    }
  };

  const handleOpenReceipt = async (paymentId: string) => {
    try {
      const receipt = await api.getPaymentReceipt(paymentId);
      setSelectedReceipt(receipt);
      setShowReceiptModal(true);
    } catch (err: any) {
      alert('Could not fetch receipt: ' + err.message);
    }
  };

  // Metrics calculation
  const totalRevenue = payments
    .filter((p) => p.status !== 'Payment Refunded' && p.status !== 'Payment Failed')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const upiCount = payments.filter((p) => p.paymentMethod?.toLowerCase().includes('upi')).length;
  const pendingCount = payments.filter(
    (p) => p.status === 'Payment Pending' || p.status === 'Partially Paid'
  ).length;

  return (
    <div id="admin-payment-management" className="space-y-6">
      {/* Top Banner & Quick Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121218] border border-[#272732] rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-cinzel text-xl font-bold text-white tracking-wide">
              Payment Management & Financial Center
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
              Admin Control
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage transactions, update UPI IDs, QR codes, Bank instructions, and payment policies for Sushil Photography Jhar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-tab-payments"
            onClick={() => setSubTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'payments'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                : 'bg-[#181822] text-zinc-300 hover:text-white border border-[#272732]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>All Transactions ({payments.length})</span>
          </button>

          <button
            id="admin-tab-settings"
            onClick={() => setSubTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'settings'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                : 'bg-[#181822] text-zinc-300 hover:text-white border border-[#272732]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI & Bank Settings</span>
          </button>

          <button
            id="admin-tab-manual"
            onClick={() => setSubTab('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              subTab === 'manual'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                : 'bg-[#181822] text-zinc-300 hover:text-white border border-[#272732]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Offline Payment</span>
          </button>
        </div>
      </div>

      {/* Financial Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121218] border border-[#272732] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
              Total Realized Collections
            </span>
            <span className="font-cinzel text-lg font-bold text-white font-mono">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="bg-[#121218] border border-[#272732] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
              UPI Transactions
            </span>
            <span className="font-cinzel text-lg font-bold text-white font-mono">
              {upiCount} Payments
            </span>
          </div>
        </div>

        <div className="bg-[#121218] border border-[#272732] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
              Active / Partial Balances
            </span>
            <span className="font-cinzel text-lg font-bold text-white font-mono">
              {pendingCount} Orders
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1. ALL PAYMENTS VIEW (Search, Filter, Actions) */}
      {/* ==================================================== */}
      {subTab === 'payments' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-[#121218] border border-[#272732] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by Customer Name, Order ID, Payment ID, or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchFilter()}
                className="w-full pl-9 pr-4 py-2 bg-[#181822] border border-[#272732] rounded-xl text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none w-full md:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Payment Successful">Payment Successful</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Payment Processing">Payment Processing</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Payment Refunded">Payment Refunded</option>
              <option value="Payment Failed">Payment Failed</option>
            </select>

            {/* Filter by Method */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none w-full md:w-auto"
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Wallets">Wallets</option>
              <option value="Cash / Offline">Cash / Offline</option>
            </select>

            {/* Filter by Service */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none w-full md:w-auto"
            >
              <option value="All">All Services</option>
              {PAYMENT_SERVICES_LIST.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearchFilter}
              className="px-4 py-2 rounded-xl bg-[#252535] hover:bg-[#303042] text-xs font-semibold text-white border border-[#39394d] transition-colors shrink-0"
            >
              Filter
            </button>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setMethodFilter('All');
                setServiceFilter('All');
                loadAll();
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-[#121218] border border-[#272732] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181822] text-zinc-400 border-b border-[#272732] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Payment / Order ID</th>
                    <th className="py-3.5 px-4 font-semibold">Customer & Contact</th>
                    <th className="py-3.5 px-4 font-semibold">Service & Type</th>
                    <th className="py-3.5 px-4 font-semibold">Method & Txn</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272732]">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-zinc-500">
                        {loading ? 'Loading payment records...' : 'No payment records match your filters.'}
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => {
                      const isUpdating = updatingPaymentId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-[#181822]/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-[#d4af37] text-xs">
                              {p.id}
                            </div>
                            <div className="font-mono text-[11px] text-zinc-400">
                              Ord: {p.orderId || '—'}
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5">{p.date}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{p.customerName}</div>
                            {p.customerPhone && (
                              <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-zinc-500" />
                                <span>{p.customerPhone}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium text-zinc-200">{p.service || 'Photography'}</div>
                            <div className="text-[10px] text-zinc-500">{p.type || 'Payment'}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#222230] text-zinc-300 border border-[#333345]">
                              {p.paymentMethod || 'UPI'}
                            </span>
                            <div
                              className="font-mono text-[10px] text-zinc-400 truncate max-w-[140px] mt-0.5"
                              title={p.transactionId}
                            >
                              {p.transactionId || '—'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="font-mono font-bold text-white text-sm">
                              ₹{Number(p.amount).toLocaleString('en-IN')}
                            </div>
                            {p.remainingAmount !== undefined && p.remainingAmount > 0 && (
                              <div className="text-[10px] text-amber-400 font-mono">
                                Due: ₹{p.remainingAmount.toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {isUpdating ? (
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={newStatus}
                                  onChange={(e) => setNewStatus(e.target.value)}
                                  className="bg-[#1f1f2c] border border-[#d4af37] text-white rounded text-[11px] px-2 py-1 outline-none"
                                >
                                  <option value="Payment Successful">Payment Successful</option>
                                  <option value="Partially Paid">Partially Paid</option>
                                  <option value="Fully Paid">Fully Paid</option>
                                  <option value="Payment Processing">Payment Processing</option>
                                  <option value="Payment Pending">Payment Pending</option>
                                  <option value="Payment Refunded">Payment Refunded</option>
                                  <option value="Payment Failed">Payment Failed</option>
                                </select>
                                <button
                                  onClick={() => handleUpdateStatus(p.id, newStatus)}
                                  className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400"
                                  title="Save Status"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setUpdatingPaymentId(null)}
                                  className="p-1 rounded bg-zinc-700 text-zinc-300 hover:text-white"
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                    p.status === 'Payment Successful' || p.status === 'Fully Paid'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : p.status === 'Partially Paid'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                      : p.status === 'Payment Refunded'
                                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                  }`}
                                >
                                  {p.status}
                                </span>
                                <button
                                  onClick={() => {
                                    setUpdatingPaymentId(p.id);
                                    setNewStatus(p.status);
                                  }}
                                  className="text-zinc-500 hover:text-[#d4af37] transition-colors"
                                  title="Change Status"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenReceipt(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#20202e] hover:bg-[#2c2c3e] text-zinc-200 hover:text-white border border-[#2f2f42] text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                              title="Generate / Print Official Receipt"
                            >
                              <FileText className="w-3 h-3 text-[#d4af37]" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. PAYMENT SETTINGS VIEW (UPI, QR, Bank, Terms, Policies) */}
      {/* ==================================================== */}
      {subTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* UPI & QR Code Management Box */}
            <div className="bg-[#121218] border border-[#272732] rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-white">
                    UPI & QR Code Configuration
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Allows Sushil Meher to change the active UPI ID and payment QR code.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  UPI ID (Displayed to Customers)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.upiId}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, upiId: e.target.value }))
                  }
                  placeholder="e.g. sushilphotography@sbi or [ADD ACTUAL UPI ID HERE]"
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-[#d4af37] font-mono font-bold focus:border-[#d4af37] outline-none"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Current value: {settingsForm.upiId}
                </span>
              </div>

              {/* QR Code Upload / Preview */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  Official Payment QR Code Image
                </label>
                <div className="border-2 border-dashed border-[#272732] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 bg-[#161620]">
                  {settingsForm.qrCodeUrl ? (
                    <img
                      src={settingsForm.qrCodeUrl}
                      alt="Payment QR"
                      className="w-24 h-24 rounded-lg object-contain bg-white p-1 border border-zinc-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-[#1e1e2c] border border-dashed border-[#333348] flex flex-col items-center justify-center text-zinc-500 text-center p-2">
                      <QrCode className="w-8 h-8 text-zinc-400" />
                      <span className="text-[8px] font-mono">[NO QR UPLOADED]</span>
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-zinc-300">
                      Upload your shop’s actual PhonePe/GPay/Paytm merchant QR code image:
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252535] hover:bg-[#303042] text-xs font-semibold text-white border border-[#3a3a50] transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Choose QR File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                    </label>
                    {settingsForm.qrCodeUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsForm((prev) => ({ ...prev, qrCodeUrl: '' }))
                        }
                        className="text-[11px] text-red-400 hover:underline block"
                      >
                        Remove QR Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details Management Box */}
            <div className="bg-[#121218] border border-[#272732] rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-white">
                    Bank Account Details (NEFT/RTGS)
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Displayed on invoices and direct bank payment instructions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankInstructions.bankName}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        bankInstructions: { ...prev.bankInstructions, bankName: e.target.value },
                      }))
                    }
                    className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankInstructions.accountHolder}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        bankInstructions: {
                          ...prev.bankInstructions,
                          accountHolder: e.target.value,
                        },
                      }))
                    }
                    className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankInstructions.accountNumber}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        bankInstructions: {
                          ...prev.bankInstructions,
                          accountNumber: e.target.value,
                        },
                      }))
                    }
                    placeholder="[ADD ACTUAL ACCOUNT NUMBER HERE]"
                    className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-[#d4af37] font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankInstructions.ifscCode}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        bankInstructions: { ...prev.bankInstructions, ifscCode: e.target.value },
                      }))
                    }
                    placeholder="[ADD ACTUAL IFSC CODE HERE]"
                    className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-[#d4af37] font-mono focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                    Branch Name & City
                  </label>
                  <input
                    type="text"
                    value={settingsForm.bankInstructions.branch}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        bankInstructions: { ...prev.bankInstructions, branch: e.target.value },
                      }))
                    }
                    className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business & Contacts Box */}
          <div className="bg-[#121218] border border-[#272732] rounded-3xl p-6 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-white">
              Studio & Payment Contacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={settingsForm.businessName}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, businessName: e.target.value }))
                  }
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={settingsForm.ownerName}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, ownerName: e.target.value }))
                  }
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                  Payment Contact (Prompt: 7608814804)
                </label>
                <input
                  type="text"
                  value={settingsForm.paymentPhone}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, paymentPhone: e.target.value }))
                  }
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                  Secondary Contact (Prompt: 7735045136)
                </label>
                <input
                  type="text"
                  value={settingsForm.secondaryPhone}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, secondaryPhone: e.target.value }))
                  }
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-white focus:border-[#d4af37] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Terms & Refund Policy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#121218] border border-[#272732] rounded-3xl p-6 space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider font-cinzel">
                Payment Terms (Displayed to Customers)
              </label>
              <textarea
                rows={4}
                value={settingsForm.paymentTerms}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, paymentTerms: e.target.value }))
                }
                className="w-full bg-[#181822] border border-[#272732] rounded-xl p-3 text-xs text-zinc-200 leading-relaxed focus:border-[#d4af37] outline-none"
              />
            </div>

            <div className="bg-[#121218] border border-[#272732] rounded-3xl p-6 space-y-2">
              <label className="block text-xs font-bold text-white uppercase tracking-wider font-cinzel">
                Refund Policy (Displayed to Customers)
              </label>
              <textarea
                rows={4}
                value={settingsForm.refundPolicy}
                onChange={(e) =>
                  setSettingsForm((prev) => ({ ...prev, refundPolicy: e.target.value }))
                }
                className="w-full bg-[#181822] border border-[#272732] rounded-xl p-3 text-xs text-zinc-200 leading-relaxed focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>

          {/* Submit settings */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {settingsSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Payment settings successfully saved and applied to website.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs tracking-wide shadow-lg shadow-[#d4af37]/20 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Payment Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* 3. RECORD MANUAL / OFFLINE PAYMENT VIEW */}
      {/* ==================================================== */}
      {subTab === 'manual' && (
        <div className="max-w-2xl mx-auto bg-[#121218] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-cinzel text-lg font-bold text-white">
              Record Studio Counter / Cash / Direct Payment
            </h3>
            <p className="text-xs text-zinc-400">
              When a client pays in cash or gives a direct bank transfer at the studio in Jhar/Sohela, log it here to issue a receipt and update order dues.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Customer Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.customerName}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, customerName: e.target.value }))
                  }
                  placeholder="Enter client name"
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  value={manualForm.customerPhone}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, customerPhone: e.target.value }))
                  }
                  placeholder="Client mobile number"
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Link to Order ID (Optional)
                </label>
                <input
                  type="text"
                  value={manualForm.orderId}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, orderId: e.target.value }))
                  }
                  placeholder="e.g. SPJ-ORD-1001"
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Amount Received (INR ₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  value={manualForm.amount}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, amount: Number(e.target.value) }))
                  }
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:border-[#d4af37] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Service
                </label>
                <select
                  value={manualForm.service}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, service: e.target.value }))
                  }
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
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
                  Payment Method
                </label>
                <select
                  value={manualForm.paymentMethod}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
                  }
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                >
                  <option value="Cash / Offline">Cash / Offline</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={manualForm.status}
                  onChange={(e) =>
                    setManualForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                >
                  <option value="Payment Successful">Payment Successful</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Fully Paid">Fully Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Studio Notes / Receipt Memo
              </label>
              <input
                type="text"
                value={manualForm.notes}
                onChange={(e) =>
                  setManualForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="e.g. Cash received at studio counter by Sushil Meher"
                className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            {manualSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Manual payment recorded successfully and receipt issued!</span>
              </p>
            )}

            <button
              type="submit"
              disabled={recordingManual}
              className="w-full py-3 rounded-2xl bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs tracking-wide shadow-lg shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2"
            >
              {recordingManual ? 'Recording...' : 'Record Payment & Generate Voucher'}
            </button>
          </form>
        </div>
      )}

      {/* Official Receipt Modal */}
      <PaymentReceiptModal
        isOpen={showReceiptModal}
        receiptData={selectedReceipt}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
};
