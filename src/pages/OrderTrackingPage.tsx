import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  CreditCard,
  FileText,
  Truck,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { OrderItem } from '../types';
import { api } from '../services/api';

interface OrderTrackingPageProps {
  onOpenPayment: (orderId: string, amount: number) => void;
  onOpenInvoice: (orderId: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  onOpenPayment,
  onOpenInvoice,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<OrderItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 6 Defined Lifecycle Steps
  const stages = [
    { label: 'Booking Placed', key: 'Order Placed' },
    { label: 'Photo Selection', key: 'Photo Selection' },
    { label: 'Master Editing', key: 'Editing' },
    { label: 'Album Designing', key: 'Album Designing' },
    { label: 'Printing Lab', key: 'Printing' },
    { label: 'Delivered', key: 'Delivered' },
  ];

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const order = await api.getOrderByIdOrPhone(searchInput.trim());
      setLoading(false);
      if (order) {
        setSearchedOrder(order);
      } else {
        setErrorMsg(`No active order found matching "${searchInput}". Please verify your Order ID (e.g. SPJ-ORD-1001) or phone number.`);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Error retrieving order details.');
    }
  };

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'Order Placed':
        return 0;
      case 'Photo Selection':
        return 1;
      case 'Editing':
        return 2;
      case 'Album Designing':
        return 3;
      case 'Printing':
        return 4;
      case 'Delivered':
      case 'Completed':
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div id="track-order-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Clock className="w-3.5 h-3.5" />
            <span>Live Production Status</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Order & Album Tracking System
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Check the real-time workflow status of your wedding photo culling, retouching, 12x36
            album binding, and final courier delivery.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleTrack} className="space-y-4">
            <label className="block text-xs font-semibold text-zinc-300">
              Enter Order ID (e.g. SPJ-ORD-1001) or 10-Digit Mobile Number
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. SPJ-ORD-1001 or 7608814804"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Locating...' : 'Track Order'}
              </button>
            </div>

            {/* Quick Demo Hint */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 pt-1">
              <span>Try test demo orders:</span>
              <button
                type="button"
                onClick={() => setSearchInput('SPJ-ORD-1001')}
                className="text-[#d4af37] hover:underline font-mono"
              >
                SPJ-ORD-1001
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setSearchInput('SPJ-ORD-1002')}
                className="text-[#d4af37] hover:underline font-mono"
              >
                SPJ-ORD-1002
              </button>
            </div>
          </form>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ORDER DETAILS & PROGRESS DISPLAY (Mandated by Prompt 16) */}
        {searchedOrder && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            {/* Top metadata */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#272732] gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37]">
                  Order Tracking Record
                </span>
                <h3 className="font-cinzel text-2xl font-bold text-white">
                  {searchedOrder.id}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Client: <strong className="text-white">{searchedOrder.customerName}</strong> (+91 {searchedOrder.customerPhone})
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    searchedOrder.paymentStatus === 'Paid Full'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  Payment: {searchedOrder.paymentStatus}
                </span>
                <p className="text-[11px] text-zinc-400">
                  Est. Delivery:{' '}
                  <strong className="text-white">{searchedOrder.estimatedDelivery}</strong>
                </p>
              </div>
            </div>

            {/* VISUAL 6-STEP PROGRESS BAR (Item 16 requirement) */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Production Timeline & Progress ({searchedOrder.progressPercent}%)
              </h4>

              <div className="relative">
                {/* Horizontal Progress Bar Line */}
                <div className="h-2 bg-[#181820] rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-amber-300 transition-all duration-500"
                    style={{ width: `${searchedOrder.progressPercent}%` }}
                  />
                </div>

                {/* Milestones row */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  {stages.map((stg, idx) => {
                    const currentStep = getStageIndex(searchedOrder.status);
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={idx} className="space-y-1.5 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? 'bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/30'
                              : 'bg-[#181820] border border-[#272732] text-zinc-600'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-black" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] font-semibold leading-tight ${
                            isCurrent
                              ? 'text-[#d4af37]'
                              : isDone
                              ? 'text-zinc-200'
                              : 'text-zinc-500'
                          }`}
                        >
                          {stg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Financials Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#181820] p-4 rounded-2xl border border-[#272732] text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px]">Total Investment</span>
                <span className="font-mono text-base font-bold text-white">
                  ₹{searchedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Advance Paid</span>
                <span className="font-mono text-base font-bold text-emerald-400">
                  ₹{searchedOrder.advancePaid.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Remaining Balance</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  ₹{searchedOrder.balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Delivered Files Download Section */}
            {searchedOrder.files && searchedOrder.files.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Delivered Files & High-Res Previews
                </h4>
                <div className="space-y-2">
                  {searchedOrder.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl bg-[#181820] border border-[#272732] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center font-bold">
                          RAW
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-white truncate">{file.name}</p>
                          <span className="text-[10px] text-zinc-500">{file.size} • {file.category}</span>
                        </div>
                      </div>

                      <a
                        href={file.url}
                        download={file.name}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-black font-bold text-xs hover:bg-[#e5c158] flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Pay Balance & View Invoice */}
            <div className="pt-4 border-t border-[#272732] flex flex-wrap gap-4 justify-between items-center">
              <button
                onClick={() => onOpenInvoice(searchedOrder.id)}
                className="px-4 py-2.5 rounded-xl bg-[#181820] hover:bg-[#272732] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-[#272732] transition-colors"
              >
                <FileText className="w-4 h-4 text-[#d4af37]" />
                <span>View Official Tax Invoice</span>
              </button>

              {searchedOrder.balanceAmount > 0 && (
                <button
                  onClick={() => onOpenPayment(searchedOrder.id, searchedOrder.balanceAmount)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-black" />
                  <span>Pay Remaining Balance (₹{searchedOrder.balanceAmount.toLocaleString()})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
