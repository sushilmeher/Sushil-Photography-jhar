import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Phone,
  Layers,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { PhotoEditingOrderItem } from '../types';

interface PhotoEditingTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const PhotoEditingTrackingModal: React.FC<PhotoEditingTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
}) => {
  const [searchOrderId, setSearchOrderId] = useState(initialOrderId);
  const [searchPhone, setSearchPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<PhotoEditingOrderItem | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim() && !searchPhone.trim()) {
      setErrorMessage('Please enter your Order ID or Phone Number');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setOrder(null);

    try {
      const res = await api.trackPhotoEditingOrder({
        orderId: searchOrderId.trim(),
        phone: searchPhone.trim(),
      });
      setOrder(res);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'No photo editing order found. Please verify your details.');
    }
  };

  const getStepStatus = (stepName: string, currentStatus: string) => {
    const sequence = ['Payment Pending', 'Order Received', 'Editing', 'Review', 'Completed', 'Delivered'];
    const currentIndex = sequence.indexOf(currentStatus);
    const stepIndex = sequence.indexOf(stepName);

    if (currentIndex >= stepIndex) return 'completed';
    if (currentIndex === stepIndex - 1) return 'active';
    return 'upcoming';
  };

  return (
    <div
      id="photo-editing-tracking-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#121217] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181822] border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-cinzel">
                Track Photo Editing Order
              </h2>
              <p className="text-xs text-zinc-400">
                Live Status & Final Photo Downloads • Sushil Photography Jhar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 bg-[#0e0e13] border-b border-zinc-800">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Order ID (e.g. SP-EDIT-104921)
                </label>
                <input
                  type="text"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  placeholder="SP-EDIT-XXXXXX"
                  className="w-full px-3.5 py-2.5 bg-[#14141b] border border-zinc-700 rounded-xl text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Registered Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 bg-[#14141b] border border-zinc-700 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-zinc-500">
                Tip: You can search by Order ID or Registered Mobile number.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#c59e2b] text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Track Order</span>
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Results Container */}
        {order ? (
          <div className="p-6 space-y-6">
            {/* Header info card */}
            <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-[#d4af37]">{order.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      order.orderStatus === 'Completed' || order.orderStatus === 'Delivered'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                        : order.orderStatus === 'Editing'
                        ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Customer: <strong className="text-white">{order.customerName}</strong> • Service:{' '}
                  <span className="text-[#d4af37]">{order.serviceTitle}</span> ({order.quantity} {order.unit}s)
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Payment Status</span>
                <span
                  className={`text-xs font-bold ${
                    order.paymentStatus === 'Paid'
                      ? 'text-emerald-400'
                      : order.paymentStatus === 'Payment Verification Pending'
                      ? 'text-amber-400'
                      : 'text-zinc-400'
                  }`}
                >
                  {order.paymentStatus} (₹{order.totalAmount.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Workflow Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Order Progress Timeline
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'Order Received', label: '1. Received', desc: 'Files received' },
                  { key: 'Editing', label: '2. In Editing', desc: 'Photoshop retouch' },
                  { key: 'Review', label: '3. QA Review', desc: 'Master approval' },
                  { key: 'Delivered', label: '4. Delivered', desc: 'Ready for download' },
                ].map((step) => {
                  const status = getStepStatus(step.key, order.orderStatus);
                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                        status === 'completed'
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                          : status === 'active'
                          ? 'bg-[#d4af37]/15 border-[#d4af37]/50 text-[#d4af37] animate-pulse'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>{step.label}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Download Section (if completed or final files uploaded) */}
            {(order.orderStatus === 'Completed' ||
              order.orderStatus === 'Delivered' ||
              (order.finalFiles && order.finalFiles.length > 0)) && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-emerald-950/40 border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Your Final High-Resolution Photos Are Ready!</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Our master editor has finished your photos. Click below to download your master high-resolution edited files.
                </p>

                <div className="space-y-2 pt-2">
                  {order.finalFiles && order.finalFiles.length > 0 ? (
                    order.finalFiles.map((file, idx) => (
                      <div
                        key={file.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-medium text-white block">{file.name}</span>
                            <span className="text-[10px] text-zinc-400">{file.sizeFormatted}</span>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          download={file.name}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))
                  ) : (
                    <a
                      href="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=90"
                      target="_blank"
                      rel="noreferrer"
                      download={`Sushil_Photography_${order.id}_Final_Edited.zip`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download All Edited Master Files (.ZIP)</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Status History Logs */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Activity Log
                </h4>
                <div className="space-y-2 bg-[#0c0c10] p-3.5 rounded-xl border border-zinc-800/80 text-xs max-h-40 overflow-y-auto">
                  {order.statusHistory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-white">{item.status}</span> •{' '}
                        <span className="text-[10px] text-zinc-500">{item.timestamp}</span>
                        <p className="text-zinc-400 text-[11px] mt-0.5">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500 space-y-2">
            <Search className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-xs text-zinc-400">
              Enter your Order ID or phone number to view real-time editing status and download final files.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
