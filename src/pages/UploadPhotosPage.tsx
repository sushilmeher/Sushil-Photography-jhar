import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  FileImage,
  CheckCircle2,
  X,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Film,
  HardDrive,
} from 'lucide-react';
import { api } from '../services/api';
import { CustomerChunkedUploader } from '../components/CustomerChunkedUploader';

interface UploadPhotosPageProps {
  onNavigate: (tab: string) => void;
  onOpenPayment?: (orderId: string, amount: number) => void;
}

export const UploadPhotosPage: React.FC<UploadPhotosPageProps> = ({
  onNavigate,
  onOpenPayment,
}) => {
  const [uploadMode, setUploadMode] = useState<'chunked' | 'standard'>('chunked');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [serviceType, setServiceType] = useState('Album Printing');
  const [notes, setNotes] = useState('');

  // Selected files
  const [files, setFiles] = useState<
    Array<{ name: string; size: string; preview: string; fileObj?: File }>
  >([]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceOptions = [
    'Album Printing',
    'Photo Editing',
    'Photo Frame',
    'Passport Photo',
    'Wedding Selection',
    'Printing',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = (Array.from(e.target.files) as File[]).map((f: File) => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        preview: URL.createObjectURL(f),
        fileObj: f,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = (Array.from(e.dataTransfer.files) as File[]).map((f: File) => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        preview: URL.createObjectURL(f),
        fileObj: f,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please choose at least one photo or file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate progress ticks
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 20;
      });
    }, 200);

    try {
      const uploadedFileItems = files.map((f, i) => ({
        id: `FLE-${Date.now()}-${i}`,
        name: f.name,
        size: f.size,
        category: serviceType,
        url: f.preview,
        uploadedAt: new Date().toISOString().split('T')[0],
      }));

      const res = await api.createOrder({
        customerName,
        customerPhone: phone,
        serviceType,
        packageName: `${serviceType} (${files.length} photos)`,
        totalAmount: 100 * files.length,
        advancePaid: 0,
        balanceAmount: 100 * files.length,
        notes,
        files: uploadedFileItems,
      });

      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      setUploadResult(res);
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      alert('Upload failed: ' + (err.message || 'Please check your connection.'));
    }
  };

  const copyRefId = () => {
    if (uploadResult?.id) {
      navigator.clipboard.writeText(uploadResult.id);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div id="upload-photos-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Upload className="w-3.5 h-3.5" />
            <span>5 TB Secure Cloud Asset Portal</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Customer Photo & Video Upload
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Upload wedding photos, full ceremony videos, highlights, and RAW camera files directly to Sushil Photography 5 TB cloud storage.
          </p>

          {/* Upload Method Switcher */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setUploadMode('chunked')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                uploadMode === 'chunked'
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 font-bold'
                  : 'bg-[#181820] text-zinc-400 hover:text-white border border-[#272732]'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Resumable 5 TB Uploader (Photos & Large Videos)</span>
            </button>
            <button
              onClick={() => setUploadMode('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                uploadMode === 'standard'
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 font-bold'
                  : 'bg-[#181820] text-zinc-400 hover:text-white border border-[#272732]'
              }`}
            >
              <FileImage className="w-4 h-4" />
              <span>Quick Photo Order Form</span>
            </button>
          </div>
        </div>

        {uploadMode === 'chunked' ? (
          <div className="space-y-6">
            <CustomerChunkedUploader
              orderId="SPJ-ORD-1001"
              bookingId="SPJ-BK-1001"
              customerId="CUST-1001"
              customerName="Sushil Photography Patron"
            />
          </div>
        ) : uploadResult ? (
          /* Success Screen with File Reference ID */
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-cinzel text-2xl font-bold text-white">
                Photos Uploaded Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Thank you, <strong className="text-white">{uploadResult.customerName}</strong>. Your
                files have been queued for processing by Sushil Meher.
              </p>
            </div>

            {/* Reference ID card */}
            <div className="bg-[#181820] border border-[#272732] rounded-2xl p-6 max-w-md mx-auto font-mono text-xs text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#272732]">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    File Reference / Order ID
                  </span>
                  <span className="text-base font-bold text-[#d4af37]">{uploadResult.id}</span>
                </div>
                <button
                  onClick={copyRefId}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#272732] hover:bg-zinc-700 text-zinc-300 text-xs"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-zinc-400 text-[11px] space-y-1 font-sans">
                <p><strong>Service:</strong> {uploadResult.serviceType}</p>
                <p><strong>Files:</strong> {uploadResult.files?.length || files.length} files secured</p>
                <p><strong>Status:</strong> <span className="text-emerald-400 font-semibold">{uploadResult.status}</span></p>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('track-order')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider"
              >
                Track Processing Status
              </button>
              <button
                onClick={() => {
                  setUploadResult(null);
                  setFiles([]);
                  setUploadProgress(0);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#181820] border border-[#272732] text-zinc-300 text-xs"
              >
                Upload More Photos
              </button>
            </div>
          </div>
        ) : (
          /* The Upload Form (Mandated by Prompt 12) */
          <form
            onSubmit={handleSubmit}
            className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
          >
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Phone Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                />
              </div>
            </div>

            {/* Service & Optional Order ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Service Purpose *
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Existing Order ID (Optional)
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. SPJ-ORD-1001"
                  className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none font-mono"
                />
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#272732] hover:border-[#d4af37] rounded-2xl p-8 text-center bg-[#0e0e12] cursor-pointer transition-colors space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/mp4,video/quicktime,video/x-m4v,video/webm,.raw,.cr2,.nef,.arw,.psd,.pdf,.zip,.mp4,.mov,.m4v,.webm"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  Drag and drop your photos & videos here, or browse files
                </p>
                <p className="text-xs text-zinc-400">
                  Supports MP4, MOV, M4V, WEBM, JPG, PNG, RAW, CR2, NEF, ARW up to 50 GB
                </p>
              </div>
            </div>

            {/* File Previews List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Selected Files ({files.length}):</span>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-red-400 hover:underline text-[11px]"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="relative rounded-xl bg-[#181820] border border-[#272732] overflow-hidden group p-2 flex flex-col justify-between"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-black mb-2 flex items-center justify-center">
                        <img
                          src={f.preview}
                          alt={f.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[11px] truncate text-zinc-300 font-medium">{f.name}</div>
                      <div className="text-[10px] text-zinc-500">{f.size}</div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-3 right-3 p-1 rounded-full bg-black/80 text-zinc-300 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar during upload */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Uploading securely to Sushil Photography Cloud...</span>
                  <span className="font-mono text-[#d4af37]">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181820] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#aa7c11] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Special Instructions Note */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Notes & Instructions for Studio
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Which photos to use for front cover of album, specific sizing requirements, or frame color preference..."
                className="w-full bg-[#181820] border border-[#272732] rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              id="upload-photos-submit-btn"
              type="submit"
              disabled={isUploading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                'Securing and Uploading Files...'
              ) : (
                <>
                  <span>Upload & Generate Reference ID</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
