import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Calendar,
  Clock,
  Download,
  Upload,
  CreditCard,
  FileText,
  Heart,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  LogOut,
  Send,
  Film,
  ShieldCheck,
  HardDrive,
  MapPin,
  Receipt,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { OrderItem, BookingItem, PaymentRecord, Booking } from '../types';
import { api } from '../services/api';
import { PrivateWeddingGallery } from '../components/PrivateWeddingGallery';
import { CustomerChunkedUploader } from '../components/CustomerChunkedUploader';
import { AlbumPhotoSelectionManager } from '../components/AlbumPhotoSelectionManager';
import { BookingConfirmationModal } from '../components/BookingConfirmationModal';

interface CustomerDashboardPageProps {
  onLogout: () => void;
  onOpenInvoice: (orderId: string) => void;
  onOpenPayment: (orderId: string, amount: number) => void;
  onNavigate: (tab: string) => void;
  onOpenBookingConfirmation?: (booking: Booking, order?: OrderItem) => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  onLogout,
  onOpenInvoice,
  onOpenPayment,
  onNavigate,
  onOpenBookingConfirmation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'bookings' | 'orders' | 'vault' | 'upload' | 'selection' | 'downloads' | 'payments'
  >('bookings');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected booking for popup details
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<BookingItem | null>(null);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [allOrders, allBookings, allPayments] = await Promise.all([
        api.getOrders(),
        api.getBookings(),
        api.getPayments().catch(() => []),
      ]);
      setOrders(allOrders);
      setBookings(allBookings);
      setPayments(allPayments);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  return (
    <div id="customer-dashboard" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Customer Header */}
        <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f5e7b2] text-black font-cinzel font-bold text-xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-black" />
            </div>
            <div>
              <span className="text-[10px] text-[#d4af37] uppercase font-bold tracking-wider">
                Client Portal
              </span>
              <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                Welcome, Valued Patron
              </h1>
              <p className="text-xs text-zinc-400">
                Track wedding bookings, complete advance payments, access photos, and download official invoices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('upload-photos')}
              className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#e5c158]"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Photos
            </button>
            <button
              id="customer-logout-btn"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-[#181820] border border-[#272732] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#272732] pb-3">
          {[
            { id: 'bookings', label: 'My Bookings & Date Reservations', icon: Calendar },
            { id: 'orders', label: 'My Orders & Progress', icon: Package },
            { id: 'vault', label: 'Private Wedding Vault (Videos & Photos)', icon: Film },
            { id: 'upload', label: 'Resumable Media Uploader', icon: Upload },
            { id: 'selection', label: 'Album Photo Selection (12x36 Photobook)', icon: Heart },
            { id: 'downloads', label: 'Downloads & Final Files', icon: Download },
            { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20'
                    : 'text-zinc-400 hover:text-white hover:bg-[#181820]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================================================== */}
        {/* 0. MY BOOKINGS TAB */}
        {/* ==================================================== */}
        {activeSubTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#d4af37]" />
                  <span>My Bookings & Reservations</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Review booking status, payment history, invoices, and complete pending balance payments.
                </p>
              </div>

              <button
                onClick={() => onNavigate('booking')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Booking</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {bookings.length === 0 ? (
                <div className="p-8 text-center bg-[#121216] border border-[#272732] rounded-3xl space-y-3">
                  <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-400">No booking reservations found.</p>
                  <button
                    onClick={() => onNavigate('booking')}
                    className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs inline-block"
                  >
                    Reserve a Wedding Date
                  </button>
                </div>
              ) : (
                bookings.map((bk) => {
                  const linkedOrder = orders.find(
                    (o) => o.bookingId === bk.id || o.id === bk.assignedOrderNumber
                  );
                  const parsedBudget = bk.budget ? parseInt(bk.budget.replace(/\D/g, ''), 10) : 15000;
                  const total = linkedOrder?.totalAmount || linkedOrder?.amount || (isNaN(parsedBudget) || parsedBudget === 0 ? 15000 : parsedBudget);
                  const paid = linkedOrder?.advancePaid || 0;
                  const remaining = linkedOrder?.balanceAmount !== undefined ? linkedOrder.balanceAmount : Math.max(0, total - paid);
                  
                  const paymentStatus = remaining === 0 && paid > 0
                    ? 'Paid'
                    : paid > 0
                    ? 'Partially Paid'
                    : 'Pending';

                  const bookingPayments = payments.filter(
                    (p) => p.orderId === linkedOrder?.id || p.orderId === bk.id || (p.customerPhone && p.customerPhone === bk.phone)
                  );

                  return (
                    <div
                      key={bk.id}
                      className="p-6 rounded-3xl bg-[#121216] border-2 border-[#272732] hover:border-[#d4af37]/40 transition-all space-y-5 shadow-xl"
                    >
                      {/* Top Bar: Booking ID & Status */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#272732] gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#d4af37] bg-[#181820] px-2.5 py-1 rounded-lg border border-[#d4af37]/30">
                              {bk.id}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#181820] text-zinc-300 border border-zinc-700">
                              {bk.packageChosen || bk.eventType || 'Wedding Photography'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white mt-1.5 flex items-center gap-2">
                            <span>Client: {bk.customerName}</span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-zinc-400">Phone: {bk.phone}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold border ${
                              bk.status?.toLowerCase() === 'confirmed'
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                : 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                            }`}
                          >
                            Booking Status: {bk.status || 'Pending'}
                          </span>

                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold border ${
                              paymentStatus === 'Paid'
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                                : paymentStatus === 'Partially Paid'
                                ? 'bg-blue-950/60 border-blue-500/50 text-blue-400'
                                : 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                            }`}
                          >
                            Payment: {paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Event Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#181820] p-4 rounded-2xl border border-[#272732]">
                        <div className="space-y-0.5">
                          <span className="text-zinc-500 text-[11px] block flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> Event Date:
                          </span>
                          <span className="font-semibold text-white">
                            {bk.weddingDate || bk.eventDate || 'Date Reserved'}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-zinc-500 text-[11px] block flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#d4af37]" /> Venue & City:
                          </span>
                          <span className="font-semibold text-zinc-300 truncate block">
                            {bk.venue ? `${bk.venue}, ${bk.city}` : bk.city || 'Bargarh, Odisha'}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-zinc-500 text-[11px] block flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#d4af37]" /> Reserved On:
                          </span>
                          <span className="font-semibold text-zinc-300">
                            {bk.createdAt ? new Date(bk.createdAt).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Financials & Balance Summary */}
                      <div className="bg-[#121216] border border-[#272732] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="grid grid-cols-3 gap-6 text-xs">
                          <div>
                            <span className="text-zinc-500 text-[10px] uppercase font-bold block">
                              Total Amount
                            </span>
                            <span className="font-mono text-sm font-bold text-white">
                              ₹{total.toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <span className="text-zinc-500 text-[10px] uppercase font-bold block">
                              Paid Amount
                            </span>
                            <span className="font-mono text-sm font-bold text-emerald-400">
                              ₹{paid.toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <span className="text-zinc-500 text-[10px] uppercase font-bold block">
                              Remaining Amount
                            </span>
                            <span className="font-mono text-sm font-bold text-amber-400">
                              ₹{remaining.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          {/* Invoice CTA */}
                          <button
                            onClick={() => onOpenInvoice(linkedOrder?.id || bk.id)}
                            className="px-3.5 py-2 rounded-xl bg-[#181820] hover:bg-zinc-800 border border-[#272732] text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-[#d4af37]" />
                            <span>Invoice</span>
                          </button>

                          {/* Booking Details / Pay Now CTA */}
                          {remaining > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedBookingForDetails(bk);
                              }}
                              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center gap-1.5"
                            >
                              <CreditCard className="w-4 h-4 text-black" />
                              <span>PAY NOW (₹{remaining.toLocaleString()})</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedBookingForDetails(bk)}
                              className="px-4 py-2 rounded-xl bg-[#181820] hover:bg-zinc-800 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>View Booking Details</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Payment History List if any */}
                      {bookingPayments.length > 0 && (
                        <div className="space-y-2 pt-1 border-t border-[#272732]/60">
                          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Payment History:
                          </span>
                          <div className="space-y-1.5">
                            {bookingPayments.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between text-xs bg-[#181820] px-3 py-2 rounded-xl border border-[#272732]"
                              >
                                <div className="flex items-center gap-2">
                                  <Receipt className="w-3.5 h-3.5 text-[#d4af37]" />
                                  <span className="font-mono text-zinc-300 font-bold">{p.id}</span>
                                  <span className="text-zinc-500">•</span>
                                  <span className="text-zinc-400">{p.paymentMethod}</span>
                                  {p.transactionId && (
                                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                                      (Ref: {p.transactionId})
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-emerald-400">
                                    +₹{p.amount.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">{p.date}</span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      p.status === 'Pending Verification'
                                        ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                                        : 'bg-emerald-950/60 text-emerald-400'
                                    }`}
                                  >
                                    {p.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 1. PRIVATE WEDDING VAULT TAB */}
        {activeSubTab === 'vault' && (
          <PrivateWeddingGallery initialOrderId={orders[0]?.id || 'SPJ-ORD-1001'} />
        )}

        {/* RESUMABLE CHUNKED UPLOADER TAB */}
        {activeSubTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-[#121216] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-2">
              <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-[#d4af37]" />
                <span>Upload Wedding Photos & Videos to 5 TB Storage</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Direct resumable chunked pipeline supporting 4K wedding films, highlights, uncompressed RAW photos and high-resolution JPEGs.
              </p>
            </div>
            <CustomerChunkedUploader
              orderId={orders[0]?.id || 'SPJ-ORD-1001'}
              bookingId={bookings[0]?.id || 'SPJ-BK-1001'}
              customerId="CUST-1001"
              customerName="Priya & Rajesh Sharma"
            />
          </div>
        )}

        {/* 2. ORDERS TAB */}
        {activeSubTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-6 rounded-3xl bg-[#121216] border border-[#272732] space-y-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#272732] gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-white">{ord.id}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#181820] text-[#d4af37] border border-[#d4af37]/30">
                          {ord.serviceType}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{ord.packageName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                        Stage: {ord.status}
                      </span>
                      <button
                        onClick={() => onOpenInvoice(ord.id)}
                        className="p-2 rounded-xl bg-[#181820] border border-[#272732] text-zinc-300 hover:text-white text-xs flex items-center gap-1"
                        title="Download Tax Invoice"
                      >
                        <FileText className="w-4 h-4 text-[#d4af37]" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Production Progress:</span>
                      <span className="font-mono text-[#d4af37] font-bold">
                        {ord.progressPercent}% Completed
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#181820] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#d4af37] to-amber-300"
                        style={{ width: `${ord.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Financials & Payment CTA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Total</span>
                        <span className="font-mono font-bold text-white">
                          ₹{ord.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Paid Advance</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ₹{ord.advancePaid.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Remaining Due</span>
                        <span className="font-mono font-bold text-amber-400">
                          ₹{ord.balanceAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {ord.balanceAmount > 0 ? (
                      <button
                        onClick={() => onOpenPayment(ord.id, ord.balanceAmount)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4 text-black" />
                        <span>Pay Balance Online (₹{ord.balanceAmount.toLocaleString()})</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Full Payment Cleared
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. PHOTO SELECTION FOR ALBUM */}
        {activeSubTab === 'selection' && (
          <AlbumPhotoSelectionManager
            orderId={orders[0]?.id || 'SPJ-ORD-1001'}
            weddingId="WED-2025-01"
            customerName={orders[0]?.customerName || 'Priya & Rajesh Sharma'}
          />
        )}

        {/* 4. DOWNLOADS TAB */}
        {activeSubTab === 'downloads' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-white">
                Delivered High-Resolution Files & Album PDF
              </h2>
              <p className="text-xs text-zinc-400">
                Directly download your print-ready files, digital negatives, and album proofing
                PDFs.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Wedding Master Album 12x36 Complete Layout.pdf',
                  size: '48.2 MB',
                  type: 'Album Proof PDF',
                  url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=90',
                },
                {
                  title: 'Sushil_Photography_Color_Graded_Portraits.zip',
                  size: '420 MB',
                  type: 'RAW & JPEG',
                  url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=90',
                },
                {
                  title: 'Cinematic Teaser Trailer 4K (60fps).mp4',
                  size: '1.2 GB',
                  type: '4K Ultra HD Video',
                  url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=90',
                },
              ].map((file, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#181820] border border-[#272732] flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center font-bold">
                      <Download className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{file.title}</p>
                      <span className="text-[10px] text-zinc-400">
                        {file.size} • {file.type}
                      </span>
                    </div>
                  </div>

                  <a
                    href={file.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#e5c158] flex items-center gap-1 shrink-0"
                  >
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PAYMENTS TAB */}
        {activeSubTab === 'payments' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-white">Billing & Invoices</h2>
              <p className="text-xs text-zinc-400">
                Official GST-compliant receipts and online payment options.
              </p>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-[#181820] border border-[#272732] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="font-bold text-white font-mono">{ord.id}</div>
                    <span className="text-[11px] text-zinc-400">{ord.serviceType}</span>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      Status: <strong className="text-zinc-300">{ord.paymentStatus}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-zinc-500 text-[10px] block">Balance</span>
                      <span className="font-mono font-bold text-amber-400">
                        ₹{ord.balanceAmount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenInvoice(ord.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#272732] hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Invoice</span>
                    </button>

                    {ord.balanceAmount > 0 && (
                      <button
                        onClick={() => onOpenPayment(ord.id, ord.balanceAmount)}
                        className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-black font-bold text-xs hover:bg-[#e5c158]"
                      >
                        Pay Online
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Confirmation & Payment Details Popup Modal */}
      {selectedBookingForDetails && (
        <BookingConfirmationModal
          isOpen={true}
          booking={selectedBookingForDetails}
          order={orders.find(
            (o) =>
              o.bookingId === selectedBookingForDetails.id ||
              o.id === selectedBookingForDetails.assignedOrderNumber
          )}
          onClose={() => {
            setSelectedBookingForDetails(null);
            loadCustomerData();
          }}
          onOpenInvoice={(orderId) => {
            setSelectedBookingForDetails(null);
            onOpenInvoice(orderId);
          }}
          onNavigateToDashboard={() => {
            setSelectedBookingForDetails(null);
            loadCustomerData();
          }}
        />
      )}
    </div>
  );
};
