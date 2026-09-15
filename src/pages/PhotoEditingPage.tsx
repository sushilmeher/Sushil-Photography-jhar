import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Layers,
  Upload,
  CheckCircle2,
  X,
  Trash2,
  RefreshCw,
  Plus,
  ShieldCheck,
  Search,
  FileImage,
  ArrowRight,
  Clock,
  Palette,
  Eye,
  Sliders,
  AlertCircle,
  HelpCircle,
  Smartphone,
  CreditCard,
  Building2,
  Check,
  FileText,
  Calendar,
  Phone,
  User,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { PhotoEditingService, PhotoEditingUploadFile } from '../types';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { PhotoEditingPaymentModal } from '../components/PhotoEditingPaymentModal';
import { PhotoEditingTrackingModal } from '../components/PhotoEditingTrackingModal';

interface PhotoEditingPageProps {
  onNavigate?: (tab: string) => void;
  onOpenBooking?: () => void;
}

export const PhotoEditingPage: React.FC<PhotoEditingPageProps> = ({
  onNavigate,
  onOpenBooking,
}) => {
  // Main view tab
  const [activeTab, setActiveTab] = useState<'order' | 'track' | 'showcase'>('order');

  // Services State
  const [services, setServices] = useState<PhotoEditingService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [loadingServices, setLoadingServices] = useState(true);

  // Upload & Photos State
  const [uploadedFiles, setUploadedFiles] = useState<PhotoEditingUploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [replacingFileId, setReplacingFileId] = useState<string | null>(null);

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [eventType, setEventType] = useState('Wedding / Portrait');
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Validation & UI State
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);

  // Load Services from Backend on Mount
  useEffect(() => {
    api
      .getPhotoEditingServices()
      .then((data) => {
        if (data && data.length > 0) {
          setServices(data);
          setSelectedServiceId(data[0].id);
        }
        setLoadingServices(false);
      })
      .catch((err) => {
        console.error('Failed to load services:', err);
        setLoadingServices(false);
      });
  }, []);

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0] || null;

  const quantity = Math.max(1, uploadedFiles.length || 1);
  const unitPrice = selectedService?.price || 80;
  const unitName = selectedService?.unit || 'photo';
  const totalAmount = unitPrice * quantity;

  // Handle File Selection / Upload
  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadProgress(10);
    const newFiles: PhotoEditingUploadFile[] = [];

    Array.from(files).forEach((file, index) => {
      const fileId = `FILE-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`;
      const previewUrl = URL.createObjectURL(file);

      newFiles.push({
        id: fileId,
        name: file.name,
        size: file.size,
        sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        url: previewUrl,
        type: file.type,
        status: 'uploaded',
        uploadedAt: new Date().toISOString(),
      });
    });

    setTimeout(() => {
      setUploadProgress(100);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setTimeout(() => setUploadProgress(null), 400);
    }, 300);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesChosen(e.dataTransfer.files);
    }
  };

  // Replace individual file
  const handleTriggerReplace = (fileId: string) => {
    setReplacingFileId(fileId);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  const handleExecuteReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replacingFileId) {
      const previewUrl = URL.createObjectURL(file);
      setUploadedFiles((prev) =>
        prev.map((item) =>
          item.id === replacingFileId
            ? {
                ...item,
                name: file.name,
                size: file.size,
                sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                url: previewUrl,
                type: file.type,
                uploadedAt: new Date().toISOString(),
              }
            : item
        )
      );
      setReplacingFileId(null);
    }
  };

  // Remove individual file
  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== fileId));
  };

  // Validate and Proceed to Payment
  const handleProceedToPayment = () => {
    const errors: { [key: string]: string } = {};

    if (!selectedService) {
      errors.service = 'Please select a photo editing service.';
    }
    if (uploadedFiles.length === 0) {
      errors.files = 'Please select and upload at least 1 photo.';
    }
    if (!customerName.trim()) {
      errors.name = 'Please enter your Full Name.';
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsPaymentModalOpen(true);
    } else {
      const firstError = Object.values(errors)[0];
      const errorElem = document.getElementById('form-error-banner');
      if (errorElem) {
        errorElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Handle Order Success from Payment Modal
  const handleOrderSuccess = (order: any, payment: any) => {
    setIsPaymentModalOpen(false);
    setSubmittedOrder(order);
    // Reset file selections
    setUploadedFiles([]);
    setSpecialInstructions('');
    // Scroll to success card
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <div id="photo-editing-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*,.raw,.dng,.cr2,.nef,.arw,.psd,.tif,.tiff"
          onChange={(e) => handleFilesChosen(e.target.files)}
          className="hidden"
        />
        <input
          type="file"
          ref={replaceInputRef}
          accept="image/*,.raw,.dng,.cr2,.nef,.arw,.psd,.tif,.tiff"
          onChange={handleExecuteReplace}
          className="hidden"
        />

        {/* ==================================================== */}
        {/* HERO BANNER */}
        {/* ==================================================== */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Digital Darkroom & Professional Retouching</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Professional Photo Editing Service
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Upload your raw or high-res photos, select your editing requirement, get instant upfront pricing,
            and receive magazine-grade master retouched portraits delivered directly to your inbox.
          </p>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setActiveTab('order');
                setSubmittedOrder(null);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'order'
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                  : 'bg-[#14141b] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Order Editing Service</span>
            </button>
            <button
              onClick={() => setIsTrackingModalOpen(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#14141b] text-zinc-300 hover:text-[#d4af37] border border-zinc-800 flex items-center gap-2 transition-all hover:border-[#d4af37]/40"
            >
              <Search className="w-4 h-4" />
              <span>Track Existing Order</span>
            </button>
            <button
              onClick={() => setActiveTab('showcase')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'showcase'
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                  : 'bg-[#14141b] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Before & After Showcase</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SUCCESS CONFIRMATION SCREEN */}
        {/* ==================================================== */}
        {submittedOrder && (
          <div
            id="photo-editing-order-success-card"
            className="p-8 rounded-3xl bg-gradient-to-b from-[#181824] to-[#101017] border border-[#d4af37]/40 shadow-2xl max-w-3xl mx-auto space-y-6 animate-fade-in"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase">
                Order Received Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-cinzel">
                Thank You, {submittedOrder.customerName}!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Your photos have been securely uploaded to our editing vault and assigned to our master retoucher.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0e0e14] border border-zinc-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block">Generated Order ID</span>
                  <span className="font-mono font-bold text-[#d4af37] text-sm">
                    {submittedOrder.id}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Service Ordered</span>
                  <span className="font-semibold text-white truncate block">
                    {submittedOrder.serviceTitle}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Quantity</span>
                  <span className="font-semibold text-white">
                    {submittedOrder.quantity} {submittedOrder.unit}s
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Total Amount</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{submittedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Payment Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                      submittedOrder.paymentStatus === 'Paid'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {submittedOrder.paymentStatus}
                  </span>
                </div>
                <div className="text-zinc-400">
                  Target Delivery: <strong className="text-white">{submittedOrder.requiredDeliveryDate || 'Within 24-48 Hours'}</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsTrackingModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#d4af37] hover:bg-[#c59e2b] text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Search className="w-4 h-4" />
                <span>Track This Order Live</span>
              </button>
              <button
                onClick={() => setSubmittedOrder(null)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-zinc-700"
              >
                <Plus className="w-4 h-4" />
                <span>Place Another Order</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 1: ORDER PHOTO EDITING SERVICE (6-STEP WORKFLOW) */}
        {/* ==================================================== */}
        {activeTab === 'order' && !submittedOrder && (
          <div className="space-y-10">
            {/* Error Banner */}
            {Object.keys(formErrors).length > 0 && (
              <div
                id="form-error-banner"
                className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3 animate-shake"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <div>
                  <p className="font-bold">Please complete the required details:</p>
                  <p className="text-red-300/90">{Object.values(formErrors).join(' • ')}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: STEPS 1 to 5 (8 Columns) */}
              <div className="lg:col-span-8 space-y-8">
                {/* ---------------------------------------------- */}
                {/* STEP 1: SELECT SERVICE */}
                {/* ---------------------------------------------- */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-bold text-xs flex items-center justify-center">
                        1
                      </span>
                      <h3 className="text-base font-bold text-white font-cinzel">
                        Select Photo Editing Service
                      </h3>
                    </div>
                    <span className="text-xs text-[#d4af37] font-semibold">
                      {services.length} Specialized Services Available
                    </span>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Choose Service Requirement <span className="text-red-400">*</span>
                    </label>

                    {loadingServices ? (
                      <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
                        <span>Loading studio editing services...</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          id="photo-editing-service-select"
                          value={selectedServiceId}
                          onChange={(e) => setSelectedServiceId(e.target.value)}
                          className="w-full px-4 py-3.5 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-[#d4af37] transition-colors appearance-none cursor-pointer"
                        >
                          {services.map((svc, index) => (
                            <option key={svc.id} value={svc.id} className="bg-zinc-900 text-white py-2">
                              {index + 1}. {svc.title} — ₹{svc.price}/{svc.unit} ({svc.category || 'Editing'})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs">
                          ▼
                        </div>
                      </div>
                    )}

                    {/* Selected Service Highlights Card */}
                    {selectedService && (
                      <div className="p-4 rounded-xl bg-[#181822] border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{selectedService.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-semibold text-[#d4af37]">
                              {selectedService.category || 'Specialty'}
                            </span>
                          </div>
                          <p className="text-zinc-400 leading-relaxed max-w-lg">
                            {selectedService.description}
                          </p>
                        </div>
                        <div className="text-left sm:text-right shrink-0 bg-zinc-900/90 p-3 rounded-lg border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Standard Rate</span>
                          <span className="text-xl font-bold text-[#d4af37]">
                            ₹{selectedService.price}
                          </span>
                          <span className="text-zinc-400 text-[11px]"> / {selectedService.unit}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ---------------------------------------------- */}
                {/* STEP 2: SELECT / UPLOAD PHOTOS */}
                {/* ---------------------------------------------- */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-bold text-xs flex items-center justify-center">
                        2
                      </span>
                      <h3 className="text-base font-bold text-white font-cinzel">
                        Select & Upload Photos
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400">
                      Supports JPG, PNG, WEBP, TIFF, PSD, RAW (.dng, .cr2, .nef, .arw)
                    </span>
                  </div>

                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#d4af37] bg-[#d4af37]/10'
                        : 'border-zinc-700 hover:border-[#d4af37]/60 bg-[#0e0e13] hover:bg-[#14141b]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#181822] border border-zinc-700 flex items-center justify-center text-[#d4af37] mx-auto mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Drag & Drop Your Photos Here, or <span className="text-[#d4af37] underline">Browse Files</span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Upload single or multiple images. Maximum file size: 100MB per photo.
                    </p>
                  </div>

                  {/* Upload Progress Bar */}
                  {uploadProgress !== null && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#181822] border border-zinc-800">
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
                          <span>Uploading & indexing photos...</span>
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-[#d4af37] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------- */}
                  {/* STEP 3: PHOTO PREVIEW LIST */}
                  {/* ---------------------------------------------- */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Uploaded Photos ({uploadedFiles.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/25 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add More Photos</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={file.id}
                            className="p-3 rounded-xl bg-[#181822] border border-zinc-800 flex items-center justify-between gap-3 text-xs hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex items-center gap-3 truncate">
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-12 h-12 rounded-lg object-cover bg-zinc-800 shrink-0 border border-zinc-700"
                              />
                              <div className="truncate space-y-0.5">
                                <span className="font-semibold text-white block truncate">
                                  {file.name}
                                </span>
                                <span className="text-[11px] text-zinc-400 block">
                                  {file.sizeFormatted}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                                  <Check className="w-3 h-3" /> Uploaded Successfully
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTriggerReplace(file.id)}
                                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition-colors"
                                title="Replace Photo"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1.5 rounded bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 transition-colors"
                                title="Remove Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ---------------------------------------------- */}
                {/* STEP 4 & 5: CUSTOMER DETAILS & INSTRUCTIONS */}
                {/* ---------------------------------------------- */}
                <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <h3 className="text-base font-bold text-white font-cinzel">
                        Customer Details & Instructions
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400">Order Delivery Notification</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          id="photo-editing-customer-name"
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Ananya Meher"
                          className="w-full pl-9 pr-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Mobile Number (For Delivery SMS / Call) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          id="photo-editing-customer-phone"
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full pl-9 pr-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        WhatsApp Number (Optional)
                      </label>
                      <input
                        id="photo-editing-customer-whatsapp"
                        type="tel"
                        value={customerWhatsapp}
                        onChange={(e) => setCustomerWhatsapp(e.target.value)}
                        placeholder="WhatsApp number if different"
                        className="w-full px-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Email Address (For High-Res Delivery Link)
                      </label>
                      <input
                        id="photo-editing-customer-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full px-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Event / Occasion Type
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="Wedding / Reception">Wedding / Reception</option>
                        <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                        <option value="Portrait / Headshot">Portrait / Headshot</option>
                        <option value="Passport / Visa Standard">Passport / Visa Standard</option>
                        <option value="Old Heritage Restoration">Old Heritage Restoration</option>
                        <option value="Commercial / Product">Commercial / Product</option>
                        <option value="Fashion / Model Portfolio">Fashion / Model Portfolio</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Required Delivery Date
                      </label>
                      <input
                        type="date"
                        value={requiredDeliveryDate}
                        onChange={(e) => setRequiredDeliveryDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Special Editing Instructions & Retouching Notes
                    </label>
                    <textarea
                      rows={3}
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Please remove the glare on the left glasses, smoothen skin tone naturally without plastic look, replace background with royal palace courtyard..."
                      className="w-full px-4 py-3 bg-[#0a0a0d] border border-zinc-700 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE PRICING & ORDER SUMMARY (4 Columns Sticky) */}
              <div className="lg:col-span-4 space-y-6 sticky top-24">
                <div className="p-6 rounded-2xl bg-[#121217] border border-[#d4af37]/30 shadow-2xl space-y-5">
                  <div className="pb-3 border-b border-zinc-800">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37]">
                      Live Price Calculation
                    </span>
                    <h3 className="text-lg font-bold text-white font-cinzel">
                      Order Summary
                    </h3>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Service:</span>
                      <span className="font-semibold text-white truncate max-w-[170px]">
                        {selectedService?.title || 'None Selected'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Unit Rate:</span>
                      <span className="font-semibold text-white">
                        ₹{unitPrice} / {unitName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Quantity:</span>
                      <span className="font-semibold text-white">
                        {quantity} {unitName}s
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Turnaround Time:</span>
                      <span className="text-[#d4af37] font-semibold">24 - 48 Hours</span>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-sm font-bold text-white uppercase tracking-wider">
                        Total Payable:
                      </span>
                      <span className="text-2xl font-bold text-[#d4af37]">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="p-3.5 rounded-xl bg-[#181822] border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5 leading-relaxed">
                    <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>100% Satisfaction Guarantee</span>
                    </div>
                    <p>Free revisions until you are completely satisfied with the edited photos.</p>
                  </div>

                  {/* Action Button */}
                  <button
                    id="proceed-to-payment-btn"
                    type="button"
                    onClick={handleProceedToPayment}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-zinc-950 font-bold text-sm tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#d4af37]/20"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center text-[10px] text-zinc-500">
                    Payment Options: UPI • QR Code • Cards • NetBanking • HDFC Bank Transfer
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: SHOWCASE & BEFORE/AFTER EXAMPLES */}
        {/* ==================================================== */}
        {activeTab === 'showcase' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-cinzel">
                Interactive Before & After Retouching
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Drag the slider left and right to see real transformations performed by our master retouchers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                <h3 className="text-base font-bold text-white font-cinzel">
                  Bridal Skin Retouch & Jewelry Sparkle
                </h3>
                <BeforeAfterSlider
                  beforeImage="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=70"
                  afterImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=90"
                  beforeLabel="Raw Capture"
                  afterLabel="Master Retouched"
                />
                <p className="text-xs text-zinc-400">
                  Frequency separation retaining genuine epidermal pores while polishing bridal gold jewelry highlights.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#121217] border border-zinc-800 space-y-4">
                <h3 className="text-base font-bold text-white font-cinzel">
                  Cinematic Color Grading & Backdrop Replacement
                </h3>
                <BeforeAfterSlider
                  beforeImage="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=70"
                  afterImage="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=90"
                  beforeLabel="Original Venue"
                  afterLabel="Cinematic Warm Tone"
                />
                <p className="text-xs text-zinc-400">
                  Graded with custom LUTs matching high-definition 300 DPI Italian matte album printing.
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setActiveTab('order')}
                className="px-8 py-3.5 rounded-xl bg-[#d4af37] hover:bg-[#c59e2b] text-black font-bold text-sm shadow-xl transition-all"
              >
                Order Photo Editing For Your Photos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* PAYMENT MODAL */}
      {/* ==================================================== */}
      {isPaymentModalOpen && selectedService && (
        <PhotoEditingPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          orderData={{
            serviceId: selectedService.id,
            serviceTitle: selectedService.title,
            unitPrice: unitPrice,
            unit: unitName,
            quantity: quantity,
            subtotal: totalAmount,
            totalAmount: totalAmount,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerWhatsapp: customerWhatsapp.trim(),
            customerEmail: customerEmail.trim(),
            eventType: eventType,
            requiredDeliveryDate: requiredDeliveryDate,
            specialInstructions: specialInstructions,
            files: uploadedFiles,
          }}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* ==================================================== */}
      {/* TRACKING MODAL */}
      {/* ==================================================== */}
      {isTrackingModalOpen && (
        <PhotoEditingTrackingModal
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
          initialOrderId={submittedOrder?.id || ''}
        />
      )}
    </div>
  );
};
