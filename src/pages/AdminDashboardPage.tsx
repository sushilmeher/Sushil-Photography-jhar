import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Package,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  MessageCircle,
  FileText,
  CreditCard,
  Camera,
  Layers,
  Sparkles,
  Users,
  Search,
  ExternalLink,
  LogOut,
  Film,
  HardDrive,
  PackageCheck,
  Palette,
  UploadCloud,
  Globe,
} from 'lucide-react';
import {
  BookingItem,
  OrderItem,
  ServiceItem,
  PackageItem,
  GalleryItem,
  ReviewItem,
} from '../types';
import { api } from '../services/api';
import { BUSINESS_INFO } from '../data/mockData';
import { useFounderPhoto } from '../hooks/useFounderPhoto';
import { UpdateFounderPhotoModal } from '../components/UpdateFounderPhotoModal';
import { AdminVideoManagement } from '../components/AdminVideoManagement';
import { AdminStorageDashboard } from '../components/AdminStorageDashboard';
import { AdminFinalDeliveryManager } from '../components/AdminFinalDeliveryManager';
import { AlbumDesignerPortal } from '../components/AlbumDesignerPortal';
import { AdminPaymentManagement } from '../components/AdminPaymentManagement';
import { AdminMediaUploadCenter } from '../components/AdminMediaUploadCenter';
import { AdminSocialMediaManager } from '../components/AdminSocialMediaManager';

interface AdminDashboardPageProps {
  onLogout: () => void;
  onOpenInvoice: (orderId: string) => void;
  onOpenPayment: (orderId: string, amount: number) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onLogout,
  onOpenInvoice,
  onOpenPayment,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'media-system'
    | 'social-settings'
    | 'payments'
    | 'videos'
    | 'storage'
    | 'designer'
    | 'delivery'
    | 'bookings'
    | 'orders'
    | 'services'
    | 'packages'
    | 'gallery'
    | 'uploads'
    | 'reviews'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { photoUrl: founderPhoto } = useFounderPhoto();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // New Service state modal
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(2500);
  const [newServiceCategory, setNewServiceCategory] = useState('photography');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // New Gallery Photo state modal
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Wedding');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoLocation, setNewPhotoLocation] = useState('Bargarh, Odisha');

  // Load all admin data
  const loadData = async () => {
    setLoading(true);
    try {
      const [st, bk, ord, svc, pkg, gal, rev] = await Promise.all([
        api.getAdminStats(),
        api.getBookings(),
        api.getOrders(),
        api.getServices(),
        api.getPackages(),
        api.getGallery(),
        api.getReviews(),
      ]);

      setStats(st);
      setBookings(bk || []);
      setOrders(ord || []);
      setServices(svc || []);
      setPackages(pkg || []);
      setGallery(gal || []);
      setReviews(rev || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Booking Status
  const handleUpdateBookingStatus = async (
    id: string,
    status: 'Confirmed' | 'Rejected' | 'Pending',
    assignedPhotographer?: string
  ) => {
    try {
      await api.updateBookingStatus(id, status, assignedPhotographer);
      await loadData();
    } catch (err: any) {
      alert('Error updating booking: ' + err.message);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await api.updateOrderStatus(id, status);
      await loadData();
    } catch (err: any) {
      alert('Error updating order status: ' + err.message);
    }
  };

  // Create Service Handler
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createService({
        title: newServiceTitle,
        category: newServiceCategory,
        startingPrice: newServicePrice,
        shortDescription: newServiceDesc,
        fullDescription: newServiceDesc,
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
        features: ['Professional Equipment', 'High Resolution Files', 'Quick Delivery'],
      });
      setShowAddService(false);
      setNewServiceTitle('');
      setNewServiceDesc('');
      await loadData();
    } catch (err: any) {
      alert('Error adding service: ' + err.message);
    }
  };

  // Add Photo Handler
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addGalleryItem({
        title: newPhotoTitle,
        category: newPhotoCategory,
        image: newPhotoUrl || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
        location: newPhotoLocation,
        featured: true,
      });
      setShowAddPhoto(false);
      setNewPhotoTitle('');
      setNewPhotoUrl('');
      await loadData();
    } catch (err: any) {
      alert('Error adding photo: ' + err.message);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to remove this photo from the public portfolio?')) return;
    try {
      await api.deleteGalleryItem(id);
      await loadData();
    } catch (err: any) {
      alert('Error deleting photo: ' + err.message);
    }
  };

  return (
    <div id="admin-dashboard" className="min-h-screen bg-[#070709] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#272732] gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={founderPhoto}
                alt="Sushil Meher"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#d4af37] shadow-lg bg-[#14141c]"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-[#d4af37] text-black hover:scale-110 transition-transform shadow-md"
                title="Change Founder Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                  Master Control Center
                </span>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="text-[10px] text-[#d4af37] hover:underline"
                >
                  (Change Photo)
                </button>
              </div>
              <h1 className="font-cinzel text-2xl font-bold text-white">
                Sushil Photography Jhar Admin
              </h1>
              <p className="text-xs text-zinc-400">
                Logged in as <strong className="text-zinc-200">{BUSINESS_INFO.owner}</strong> • {BUSINESS_INFO.ownerRole}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl bg-[#181820] border border-[#272732] hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
            >
              Refresh Data
            </button>
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-800/60 hover:bg-red-900/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* 6 Metric KPI Cards (Mandated by section 19) */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-[#121216] border border-[#272732] space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                Total Bookings
              </span>
              <div className="text-2xl font-black font-cinzel text-white">
                {stats.totalBookings}
              </div>
              <span className="text-[10px] text-zinc-500">All registered dates</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-[#272732] space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                Total Orders
              </span>
              <div className="text-2xl font-black font-cinzel text-white">
                {stats.totalOrders}
              </div>
              <span className="text-[10px] text-zinc-500">Live workflows</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-[#272732] space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">
                Pending Bookings
              </span>
              <div className="text-2xl font-black font-cinzel text-amber-400">
                {stats.pendingBookings}
              </div>
              <span className="text-[10px] text-amber-400/70">Needs confirmation</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-[#272732] space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block">
                Completed Orders
              </span>
              <div className="text-2xl font-black font-cinzel text-emerald-400">
                {stats.completedOrders}
              </div>
              <span className="text-[10px] text-emerald-400/70">Delivered to clients</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-[#272732] space-y-1">
              <span className="text-[10px] text-[#d4af37] uppercase font-semibold block">
                Total Revenue
              </span>
              <div className="text-xl font-black font-mono text-[#d4af37]">
                ₹{stats.totalRevenue?.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500">Billed value</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121216] border border-[#272732] space-y-1">
              <span className="text-[10px] text-rose-400 uppercase font-semibold block">
                Pending Payments
              </span>
              <div className="text-xl font-black font-mono text-rose-400">
                ₹{stats.pendingPayments?.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500">Due upon delivery</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#272732] pb-3">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Sparkles },
            { id: 'media-system', label: 'Smart Media Uploads', icon: UploadCloud },
            { id: 'social-settings', label: 'Social Media Channels', icon: Globe },
            { id: 'payments', label: 'Payment Details & UPI', icon: CreditCard },
            { id: 'videos', label: 'Wedding Videos & Highlights', icon: Film },
            { id: 'storage', label: '5 TB Cloud Storage', icon: HardDrive },
            { id: 'designer', label: '12x36 Album Designer Lab', icon: Palette },
            { id: 'delivery', label: 'Final Delivery Package', icon: PackageCheck },
            { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
            { id: 'services', label: `Services (${services.length})`, icon: Camera },
            { id: 'packages', label: `Packages (${packages.length})`, icon: DollarSign },
            { id: 'gallery', label: `Portfolio Gallery (${gallery.length})`, icon: Layers },
            { id: 'uploads', label: 'Customer Uploads', icon: Upload },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20'
                    : 'text-zinc-400 hover:text-white hover:bg-[#181820]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SMART MEDIA UPLOADS & PLACEHOLDERS VIEW */}
        {activeTab === 'media-system' && <AdminMediaUploadCenter />}

        {/* SOCIAL MEDIA CHANNELS & CLICKABLE ICONS VIEW */}
        {activeTab === 'social-settings' && <AdminSocialMediaManager />}

        {/* PAYMENT DETAILS & FINANCIAL CENTER VIEW */}
        {activeTab === 'payments' && <AdminPaymentManagement />}

        {/* VIDEOS & HIGHLIGHTS VIEW */}
        {activeTab === 'videos' && <AdminVideoManagement />}

        {/* 5 TB STORAGE DASHBOARD VIEW */}
        {activeTab === 'storage' && <AdminStorageDashboard />}

        {/* 12x36 ALBUM DESIGNER LAB PORTAL */}
        {activeTab === 'designer' && <AlbumDesignerPortal />}

        {/* FINAL DELIVERY MANAGER VIEW */}
        {activeTab === 'delivery' && <AdminFinalDeliveryManager />}

        {/* 1. OVERVIEW VIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings Widget */}
              <div className="p-6 rounded-3xl bg-[#121216] border border-[#272732] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-cinzel text-base font-bold text-white">
                    Recent Date Reservations
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-[#d4af37] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {(bookings || []).slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl bg-[#181820] border border-[#272732] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{b.customerName}</div>
                        <span className="text-[11px] text-zinc-400">
                          Date: <strong className="text-zinc-200">{b.weddingDate}</strong> • {b.city}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {b.status}
                        </span>
                        <a
                          href={`https://wa.me/91${b.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            b.customerName
                          )},%20this%20is%20Sushil%20Meher%20from%20Sushil%20Photography%20Jhar%20regarding%20your%20wedding%20booking%20${b.bookingId}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900"
                          title="WhatsApp Update"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Widget */}
              <div className="p-6 rounded-3xl bg-[#121216] border border-[#272732] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-cinzel text-base font-bold text-white">
                    Live Production Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#d4af37] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {(orders || []).slice(0, 4).map((o) => (
                    <div
                      key={o.id}
                      className="p-3.5 rounded-xl bg-[#181820] border border-[#272732] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-mono text-zinc-300 font-bold">{o.id}</div>
                        <span className="text-[11px] text-zinc-400">
                          {o.customerName} • {o.serviceType}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold block mb-0.5">
                          {o.status}
                        </span>
                        <span className="text-[11px] font-mono text-amber-400 font-bold">
                          Due: ₹{o.balanceAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. BOOKINGS TAB (Full CRUD & WhatsApp update) */}
        {activeTab === 'bookings' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-cinzel text-lg font-bold text-white">
                All Wedding & Event Bookings
              </h2>
              <span className="text-xs text-zinc-400">{bookings.length} reservations</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#181820] text-zinc-400 uppercase text-[10px] border-b border-[#272732]">
                  <tr>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Wedding Date</th>
                    <th className="p-3">Location & Venue</th>
                    <th className="p-3">Services</th>
                    <th className="p-3">Budget</th>
                    <th className="p-3">Assigned Crew</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272732]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-800/20">
                      <td className="p-3 font-mono font-bold text-[#d4af37]">{b.bookingId}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{b.customerName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          +91 {b.phone}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-white">{b.weddingDate}</td>
                      <td className="p-3">
                        <div>{b.venue}</div>
                        <div className="text-[10px] text-zinc-500">{b.city}</div>
                      </td>
                      <td className="p-3 text-[11px] text-zinc-400 max-w-xs truncate">
                        {b.requiredServices?.join(', ')}
                      </td>
                      <td className="p-3 font-mono text-zinc-300">{b.budget}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={b.assignedPhotographer || 'Sushil Meher'}
                          onBlur={(e) =>
                            handleUpdateBookingStatus(b.id, b.status, e.target.value)
                          }
                          className="bg-[#181820] border border-[#272732] rounded px-2 py-1 text-xs text-white"
                        />
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-950 text-emerald-300'
                              : b.status === 'Rejected'
                              ? 'bg-red-950 text-red-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                          className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'Rejected')}
                          className="px-2 py-1 rounded bg-red-900/60 hover:bg-red-800 text-red-200 text-[11px]"
                        >
                          Reject
                        </button>
                        <a
                          href={`https://wa.me/91${b.phone.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(
                            b.customerName
                          )},%20this%20is%20Sushil%20Meher%20confirming%20your%20wedding%20date%20${b.weddingDate}%20at%20${b.venue}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block p-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-800"
                          title="Instant WhatsApp message"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ORDERS TAB (Status lifecycle, Payment, Invoicing) */}
        {activeTab === 'orders' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-cinzel text-lg font-bold text-white">Live Customer Orders</h2>
              <span className="text-xs text-zinc-400">{orders.length} active jobs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#181820] text-zinc-400 uppercase text-[10px] border-b border-[#272732]">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Service & Package</th>
                    <th className="p-3">Lifecycle Status</th>
                    <th className="p-3">Financials</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3 text-right">Invoice & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272732]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-800/20">
                      <td className="p-3 font-mono font-bold text-white">{ord.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">+91 {ord.customerPhone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-zinc-200">{ord.serviceType}</div>
                        <div className="text-[10px] text-zinc-400">{ord.packageName}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="bg-[#181820] border border-[#272732] rounded px-2 py-1 text-xs text-white focus:border-[#d4af37] outline-none"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Photo Selection">Photo Selection</option>
                          <option value="Editing">Editing</option>
                          <option value="Album Designing">Album Designing</option>
                          <option value="Printing">Printing</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="p-3 font-mono">
                        <div>Total: ₹{ord.totalAmount.toLocaleString()}</div>
                        <div className="text-emerald-400 text-[10px]">
                          Adv: ₹{ord.advancePaid.toLocaleString()}
                        </div>
                        <div className="text-amber-400 text-[10px]">
                          Bal: ₹{ord.balanceAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.paymentStatus === 'Paid Full'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onOpenInvoice(ord.id)}
                          className="px-2.5 py-1 rounded bg-[#181820] hover:bg-zinc-800 text-xs border border-[#272732] text-zinc-200"
                        >
                          Invoice
                        </button>
                        {ord.balanceAmount > 0 && (
                          <button
                            onClick={() => onOpenPayment(ord.id, ord.balanceAmount)}
                            className="px-2.5 py-1 rounded bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs"
                          >
                            Collect ₹{ord.balanceAmount}
                          </button>
                        )}
                        <a
                          href={`https://wa.me/91${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            ord.customerName
                          )},%20update%20on%20Order%20${ord.id}:%20current%20status%20is%20"${ord.status}".%20Estimated%20delivery:%20${ord.estimatedDelivery}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block p-1 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-800 align-middle"
                          title="Send WhatsApp update"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. SERVICES MANAGEMENT TAB */}
        {activeTab === 'services' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-cinzel text-lg font-bold text-white">
                  Studio Services Catalog
                </h2>
                <p className="text-xs text-zinc-400">
                  Manage services, pricing, and showcase descriptions.
                </p>
              </div>
              <button
                onClick={() => setShowAddService(true)}
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-[#181820] border border-[#272732] space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-[#d4af37] font-bold uppercase">
                        {s.category}
                      </span>
                      <h3 className="font-cinzel font-bold text-white text-sm">{s.title}</h3>
                    </div>
                    <span className="font-mono font-bold text-white">
                      ₹{s.startingPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] line-clamp-2">{s.shortDescription}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PORTFOLIO GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-cinzel text-lg font-bold text-white">Portfolio Showcase</h2>
                <p className="text-xs text-zinc-400">
                  Upload and curate public images on the main gallery.
                </p>
              </div>
              <button
                onClick={() => setShowAddPhoto(true)}
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Photo
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((g) => (
                <div
                  key={g.id}
                  className="relative rounded-xl overflow-hidden border border-[#272732] bg-black group"
                >
                  <img
                    src={g.image}
                    alt={g.title}
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 flex flex-col justify-between">
                    <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] text-[#d4af37] self-start">
                      {g.category}
                    </span>
                    <div className="flex justify-between items-end">
                      <div className="truncate pr-2">
                        <p className="text-xs font-bold text-white truncate">{g.title}</p>
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(g.id)}
                        className="p-1.5 rounded bg-red-950/80 text-red-300 hover:bg-red-800"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CUSTOMER UPLOADS TAB */}
        {activeTab === 'uploads' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-6">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-white">
                Customer Uploaded Assets & Photos
              </h2>
              <p className="text-xs text-zinc-400">
                Direct raw and album selection uploads queued for studio retouching.
              </p>
            </div>

            <div className="space-y-3">
              {orders
                .filter((o) => o.files && o.files.length > 0)
                .map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-2xl bg-[#181820] border border-[#272732] space-y-3"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">{o.customerName}</span> ({o.customerPhone})
                        <span className="text-zinc-400 ml-2 font-mono">Order: {o.id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        {o.serviceType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {o.files?.map((f) => (
                        <div
                          key={f.id}
                          className="p-2 rounded-xl bg-[#121216] border border-[#272732] flex items-center justify-between text-xs"
                        >
                          <div className="truncate pr-2">
                            <p className="truncate font-medium text-white">{f.name}</p>
                            <span className="text-[10px] text-zinc-500">{f.size}</span>
                          </div>
                          <a
                            href={f.url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-[#d4af37] text-black hover:bg-[#e5c158]"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 7. REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-6">
            <h2 className="font-cinzel text-lg font-bold text-white">Client Reviews Management</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-[#181820] border border-[#272732] flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-white">{r.customerName}</strong>
                      <span className="text-amber-400">{'★'.repeat(r.rating)}</span>
                      <span className="text-zinc-500 text-[10px]">{r.date}</span>
                    </div>
                    <p className="text-zinc-300 italic">"{r.review}"</p>
                    <span className="text-[10px] text-zinc-400 block">{r.serviceUsed}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                      Published
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-cinzel text-lg font-bold text-white">Wedding Packages</h2>
                <p className="text-xs text-zinc-400">
                  Standard tier packages configuration and inclusions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl bg-[#181820] border border-[#272732] space-y-2 text-xs"
                >
                  <span className="text-[10px] text-[#d4af37] font-bold uppercase">{pkg.name}</span>
                  <div className="text-xl font-bold text-white font-mono">
                    ₹{pkg.price.toLocaleString()}
                  </div>
                  <p className="text-zinc-400 text-[11px]">{pkg.subtitle}</p>
                  <div className="border-t border-[#272732] pt-2 text-[10px] text-zinc-500 space-y-1">
                    <p>{pkg.photographers}</p>
                    <p>{pkg.album}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Service Modal */}
        {showAddService && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#121216] border border-[#272732] rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="font-cinzel text-lg font-bold text-white">Add New Studio Service</h3>
              <form onSubmit={handleCreateService} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    placeholder="e.g. Drone Cinematography"
                    className="w-full bg-[#181820] border border-[#272732] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full bg-[#181820] border border-[#272732] rounded px-3 py-2 text-white"
                  >
                    <option value="photography">Photography</option>
                    <option value="cinematography">Cinematography</option>
                    <option value="editing">Editing</option>
                    <option value="albums">Albums</option>
                    <option value="design">Design</option>
                    <option value="printing">Printing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full bg-[#181820] border border-[#272732] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    className="w-full bg-[#181820] border border-[#272732] rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddService(false)}
                    className="px-3 py-1.5 rounded text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-[#d4af37] text-black font-bold"
                  >
                    Save Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Photo Modal */}
        {showAddPhoto && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#121216] border border-[#272732] rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="font-cinzel text-lg font-bold text-white">Add Photo to Portfolio</h3>
              <form onSubmit={handleAddPhoto} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Photo Title</label>
                  <input
                    type="text"
                    required
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    placeholder="e.g. Royal Bargarh Mandap Rituals"
                    className="w-full bg-[#181820] border border-[#272732] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newPhotoCategory}
                    onChange={(e) => setNewPhotoCategory(e.target.value)}
                    className="w-full bg-[#181820] border border-[#272732] rounded px-3 py-2 text-white"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Pre-Wedding">Pre-Wedding</option>
                    <option value="Candid">Candid</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Drone Shots">Drone Shots</option>
                    <option value="Album Pages">Album Pages</option>
                    <option value="Photo Editing">Photo Editing</option>
                    <option value="Video Highlights">Video Highlights</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#181820] border border-[#272732] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Location Tag</label>
                  <input
                    type="text"
                    value={newPhotoLocation}
                    onChange={(e) => setNewPhotoLocation(e.target.value)}
                    className="w-full bg-[#181820] border border-[#272732] rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPhoto(false)}
                    className="px-3 py-1.5 rounded text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-[#d4af37] text-black font-bold"
                  >
                    Publish to Gallery
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <UpdateFounderPhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
        />
      </div>
    </div>
  );
};
