import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  X,
  FileText,
  DollarSign,
  User,
  Phone,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Building2,
  RefreshCw,
  FolderDown,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { PhotoEditingService, PhotoEditingOrderItem } from '../types';

export const AdminPhotoEditingManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'services'>('orders');
  const [services, setServices] = useState<PhotoEditingService[]>([]);
  const [orders, setOrders] = useState<PhotoEditingOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Selected Order for detail / editing modal
  const [selectedOrder, setSelectedOrder] = useState<PhotoEditingOrderItem | null>(null);

  // Service Edit / Add Modals
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<PhotoEditingService | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    price: 80,
    unit: 'photo',
    description: '',
    category: 'Custom Editing',
    enabled: true,
  });

  // Admin file upload state
  const [uploadTarget, setUploadTarget] = useState<'edited' | 'final'>('final');
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [svc, ord] = await Promise.all([
        api.getPhotoEditingServices(true),
        api.getPhotoEditingOrders({
          search: searchQuery,
          paymentStatus: filterPayment,
          orderStatus: filterStatus,
        }),
      ]);
      setServices(svc || []);
      setOrders(ord || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, filterPayment, filterStatus]);

  // Order Status update
  const handleUpdateOrderStatus = async (
    orderId: string,
    updates: Partial<PhotoEditingOrderItem> & { notes?: string }
  ) => {
    try {
      const res = await api.updatePhotoEditingOrder(orderId, updates);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(res.order);
      }
      loadData();
    } catch (err: any) {
      alert('Error updating order: ' + err.message);
    }
  };

  // Upload Edited or Final Files
  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedOrder) return;
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadingFiles(true);
    const filesToUpload = Array.from(fileList).map((file: File) => ({
      name: file.name,
      size: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=90',
    }));

    try {
      const res = await api.uploadPhotoEditingAdminFiles(
        selectedOrder.id,
        uploadTarget,
        filesToUpload
      );
      setSelectedOrder(res.order);
      setUploadingFiles(false);
      loadData();
      alert(`Successfully uploaded ${filesToUpload.length} ${uploadTarget} files for ${selectedOrder.customerName}!`);
    } catch (err: any) {
      setUploadingFiles(false);
      alert('Upload error: ' + err.message);
    }
  };

  // Service Save (Add / Edit)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.updatePhotoEditingService(editingService.id, serviceForm);
      } else {
        await api.addPhotoEditingService(serviceForm);
      }
      setShowAddServiceModal(false);
      setEditingService(null);
      setServiceForm({
        title: '',
        price: 80,
        unit: 'photo',
        description: '',
        category: 'Custom Editing',
        enabled: true,
      });
      loadData();
    } catch (err: any) {
      alert('Error saving service: ' + err.message);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this photo editing service?')) return;
    try {
      await api.deletePhotoEditingService(id);
      loadData();
    } catch (err: any) {
      alert('Error deleting service: ' + err.message);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Customer Name',
      'Phone',
      'WhatsApp',
      'Email',
      'Service',
      'Quantity',
      'Unit Price',
      'Total Amount',
      'Advance Paid',
      'Payment Status',
      'Order Status',
      'Payment Method',
      'Transaction ID',
      'Order Date',
      'Delivery Date',
    ];

    const rows = orders.map((o) => [
      o.id,
      `"${o.customerName}"`,
      o.customerPhone,
      o.customerWhatsapp || '',
      o.customerEmail || '',
      `"${o.serviceTitle}"`,
      o.quantity,
      o.unitPrice,
      o.totalAmount,
      o.advancePaid,
      o.paymentStatus,
      o.orderStatus,
      o.paymentMethod || '',
      o.transactionId || '',
      o.orderDate,
      o.requiredDeliveryDate || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sushil_Photography_Photo_Editing_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF Report (Print Friendly)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div id="admin-photo-editing-manager" className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'orders'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Photo Editing Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'services'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Services & Pricing ({services.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'orders' ? (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print PDF Report</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditingService(null);
                setServiceForm({
                  title: '',
                  price: 80,
                  unit: 'photo',
                  description: '',
                  category: 'Custom Editing',
                  enabled: true,
                });
                setShowAddServiceModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c59e2b] text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Editing Service</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: PHOTO EDITING ORDERS */}
      {/* ==================================================== */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#14141b] border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Total Editing Orders</span>
              <p className="text-2xl font-bold text-white font-cinzel">{orders.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#14141b] border border-zinc-800 space-y-1">
              <span className="text-xs text-amber-400">In Editing / Review</span>
              <p className="text-2xl font-bold text-amber-300 font-cinzel">
                {orders.filter((o) => o.orderStatus === 'Editing' || o.orderStatus === 'Review').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#14141b] border border-zinc-800 space-y-1">
              <span className="text-xs text-emerald-400">Delivered / Completed</span>
              <p className="text-2xl font-bold text-emerald-300 font-cinzel">
                {orders.filter((o) => o.orderStatus === 'Completed' || o.orderStatus === 'Delivered').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#14141b] border border-zinc-800 space-y-1">
              <span className="text-xs text-[#d4af37]">Total Order Volume</span>
              <p className="text-2xl font-bold text-[#d4af37] font-cinzel">
                ₹{orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-xl bg-[#14141b] border border-zinc-800 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Customer Name, Phone, Service..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-[#d4af37]"
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Payment Verification Pending">Verification Required</option>
                <option value="Pending">Pending</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-[#d4af37]"
              >
                <option value="All">All Statuses</option>
                <option value="Order Received">Order Received</option>
                <option value="Editing">Editing</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-xl border border-zinc-800 bg-[#121217] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#181822] text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold">Order ID</th>
                    <th className="px-4 py-3.5 font-semibold">Customer</th>
                    <th className="px-4 py-3.5 font-semibold">Service & Quantity</th>
                    <th className="px-4 py-3.5 font-semibold">Total Amount</th>
                    <th className="px-4 py-3.5 font-semibold">Payment Status</th>
                    <th className="px-4 py-3.5 font-semibold">Order Status</th>
                    <th className="px-4 py-3.5 font-semibold">Order Date</th>
                    <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#d4af37]">
                        {order.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{order.customerName}</div>
                        <div className="text-[11px] text-zinc-400">{order.customerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-zinc-200 font-medium block">{order.serviceTitle}</span>
                        <span className="text-[11px] text-zinc-400">
                          {order.quantity} {order.unit}s ({order.originalFiles?.length || order.quantity} uploaded)
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                              : order.paymentStatus === 'Payment Verification Pending'
                              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 animate-pulse'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            order.orderStatus === 'Completed' || order.orderStatus === 'Delivered'
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                              : order.orderStatus === 'Editing'
                              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                              : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-[11px]">
                        {order.orderDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#d4af37] hover:text-black font-semibold text-zinc-200 text-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-zinc-500 text-xs">
                        No photo editing orders matching the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: SERVICES & PRICING MANAGEMENT */}
      {/* ==================================================== */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`p-4 rounded-xl border transition-all ${
                  svc.enabled
                    ? 'bg-[#14141b] border-zinc-800 hover:border-[#d4af37]/40'
                    : 'bg-zinc-950 border-zinc-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold uppercase">
                      {svc.category || 'Editing'}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{svc.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#d4af37]">₹{svc.price}</span>
                    <span className="text-[10px] text-zinc-500 block">/{svc.unit}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {svc.description}
                </p>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() =>
                      handleUpdateOrderStatus('', { notes: '' }).then(() => {
                        api
                          .updatePhotoEditingService(svc.id, { enabled: !svc.enabled })
                          .then(() => loadData());
                      })
                    }
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      svc.enabled ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        svc.enabled ? 'bg-emerald-400' : 'bg-zinc-600'
                      }`}
                    />
                    <span>{svc.enabled ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingService(svc);
                        setServiceForm({
                          title: svc.title,
                          price: svc.price,
                          unit: svc.unit,
                          description: svc.description,
                          category: svc.category || 'Custom Editing',
                          enabled: svc.enabled,
                        });
                        setShowAddServiceModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Edit Service"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/50 hover:text-red-300 text-zinc-400 transition-colors"
                      title="Delete Service"
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

      {/* ==================================================== */}
      {/* ORDER DETAILS & FILE MANAGEMENT MODAL */}
      {/* ==================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#121217] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#181822] border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-cinzel">
                      Order {selectedOrder.id}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                      {selectedOrder.serviceTitle}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Received on {selectedOrder.orderDate} • Customer: {selectedOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Customer & Order Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Customer Card */}
                <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 space-y-2 text-xs">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider block text-[10px]">
                    Customer Details
                  </span>
                  <div className="font-bold text-white text-sm">{selectedOrder.customerName}</div>
                  <div className="text-zinc-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                  {selectedOrder.customerWhatsapp && (
                    <div className="text-zinc-400">
                      WhatsApp: <span className="text-zinc-200">{selectedOrder.customerWhatsapp}</span>
                    </div>
                  )}
                  {selectedOrder.customerEmail && (
                    <div className="text-zinc-400">
                      Email: <span className="text-zinc-200">{selectedOrder.customerEmail}</span>
                    </div>
                  )}
                  {selectedOrder.eventType && (
                    <div className="text-zinc-400">
                      Event: <span className="text-zinc-200">{selectedOrder.eventType}</span>
                    </div>
                  )}
                </div>

                {/* 2. Pricing & Payment Card */}
                <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 space-y-2 text-xs">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider block text-[10px]">
                    Payment & Pricing
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Total Amount:</span>
                    <span className="font-bold text-white">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Payment Status:</span>
                    <span
                      className={`font-semibold ${
                        selectedOrder.paymentStatus === 'Paid'
                          ? 'text-emerald-400'
                          : selectedOrder.paymentStatus === 'Payment Verification Pending'
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Method / Txn:</span>
                    <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[120px]">
                      {selectedOrder.paymentMethod || 'UPI'} ({selectedOrder.transactionId || 'Pending'})
                    </span>
                  </div>

                  {/* Verification action for Bank Transfer */}
                  {selectedOrder.paymentStatus === 'Payment Verification Pending' && (
                    <button
                      onClick={() =>
                        handleUpdateOrderStatus(selectedOrder.id, {
                          paymentStatus: 'Paid',
                          orderStatus: 'Order Received',
                          notes: 'Bank deposit verified and confirmed in studio HDFC account.',
                        })
                      }
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Mark as Paid</span>
                    </button>
                  )}
                </div>

                {/* 3. Status Controls Card */}
                <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800 space-y-3 text-xs">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider block text-[10px]">
                    Update Workflow Status
                  </span>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Order Status</label>
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) =>
                        handleUpdateOrderStatus(selectedOrder.id, {
                          orderStatus: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white font-semibold focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Payment Pending">Payment Pending</option>
                      <option value="Payment Processing">Payment Processing</option>
                      <option value="Order Received">Order Received</option>
                      <option value="Editing">Editing (In Progress)</option>
                      <option value="Review">Quality Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Payment Status</label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) =>
                        handleUpdateOrderStatus(selectedOrder.id, {
                          paymentStatus: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Paid">Paid (Verified)</option>
                      <option value="Payment Verification Pending">Verification Required</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div className="p-4 rounded-xl bg-[#14141b] border border-zinc-800 space-y-1">
                  <span className="text-xs font-semibold text-[#d4af37]">
                    Customer Special Instructions:
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{selectedOrder.specialInstructions}"
                  </p>
                </div>
              )}

              {/* Bank Proof Screenshot Preview (if bank transfer) */}
              {selectedOrder.paymentProofUrl && (
                <div className="p-4 rounded-xl bg-[#14141b] border border-zinc-800 space-y-2">
                  <span className="text-xs font-semibold text-amber-400 block">
                    Uploaded Bank Transfer Receipt:
                  </span>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedOrder.paymentProofUrl}
                      alt="Payment Receipt"
                      className="w-24 h-24 object-cover rounded-lg border border-zinc-700"
                    />
                    <div className="text-xs text-zinc-300 space-y-1">
                      <p>UTR Number: <strong className="text-white">{selectedOrder.transactionId}</strong></p>
                      <a
                        href={selectedOrder.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#d4af37] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Full Screen Receipt</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* File Vault Tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Files Vault ({selectedOrder.originalFiles?.length || 0} Original,{' '}
                    {selectedOrder.editedFiles?.length || 0} In-Progress,{' '}
                    {selectedOrder.finalFiles?.length || 0} Final Delivery)
                  </h4>

                  {/* Upload trigger */}
                  <div className="flex items-center gap-2">
                    <select
                      value={uploadTarget}
                      onChange={(e) => setUploadTarget(e.target.value as any)}
                      className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300"
                    >
                      <option value="final">Upload Final Delivery</option>
                      <option value="edited">Upload WIP / Edited</option>
                    </select>

                    <label className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#c59e2b] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingFiles ? 'Uploading...' : 'Upload Files'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.zip,.psd,.tif"
                        onChange={handleAdminFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 1. Original Customer Uploaded Files */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      Original Photos Uploaded by Customer
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Storage: photo-editing/{selectedOrder.id}/original/
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedOrder.originalFiles?.map((file, idx) => (
                      <div
                        key={file.id || idx}
                        className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-medium text-white block truncate">{file.name}</span>
                            <span className="text-[10px] text-zinc-400">{file.sizeFormatted}</span>
                          </div>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          download={file.name}
                          className="p-2 text-zinc-400 hover:text-[#d4af37]"
                          title="Download Original"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Final Delivery Files (Customer Downloads) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">
                      Final Delivery Files (Delivered to Customer)
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Storage: photo-editing/{selectedOrder.id}/final/
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedOrder.finalFiles && selectedOrder.finalFiles.length > 0 ? (
                      selectedOrder.finalFiles.map((file, idx) => (
                        <div
                          key={file.id || idx}
                          className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between text-xs"
                        >
                          <div className="truncate">
                            <span className="font-medium text-white block truncate">{file.name}</span>
                            <span className="text-[10px] text-zinc-400">{file.sizeFormatted}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              download={file.name}
                              className="p-1.5 text-emerald-400 hover:text-emerald-300"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() =>
                                api
                                  .deletePhotoEditingOrderFile(selectedOrder.id, file.id)
                                  .then((res) => setSelectedOrder(res.order))
                              }
                              className="p-1.5 text-zinc-500 hover:text-red-400"
                              title="Delete File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="sm:col-span-3 p-4 rounded-xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
                        No final delivery files uploaded yet. Click "Upload Files" above with "Upload Final Delivery" selected.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SERVICE ADD / EDIT MODAL */}
      {/* ==================================================== */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#121217] border border-[#d4af37]/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white font-cinzel">
                {editingService ? 'Edit Photo Editing Service' : 'Add New Photo Editing Service'}
              </h3>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Service Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. Skin Retouching & Color Grading"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Unit</label>
                  <select
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="photo">photo</option>
                    <option value="page">page</option>
                    <option value="image">image</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Category</label>
                <input
                  type="text"
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                  placeholder="e.g. Retouching, Restoration, Background"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Describe the editing service details..."
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="service-enabled"
                  checked={serviceForm.enabled}
                  onChange={(e) => setServiceForm({ ...serviceForm, enabled: e.target.checked })}
                  className="rounded border-zinc-700 text-[#d4af37] focus:ring-[#d4af37]"
                />
                <label htmlFor="service-enabled" className="text-xs text-zinc-300 font-medium">
                  Enable service for customer selection
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d4af37] hover:bg-[#c59e2b] text-black text-xs font-bold shadow"
                >
                  {editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
