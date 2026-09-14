import React, { useState, useRef } from 'react';
import {
  Upload,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RotateCw,
  Trash2,
  FileCheck,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';
import { api } from '../services/api';

interface FileUploadQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  category: 'Photos' | 'Videos' | 'Highlights' | 'Album' | 'Final Delivery';
  progress: number;
  status: 'queued' | 'uploading' | 'paused' | 'completed' | 'error';
  speedFormatted: string;
  error?: string;
  uploadId: string;
  signedUrl?: string;
}

interface CustomerChunkedUploaderProps {
  orderId?: string;
  bookingId?: string;
  customerId?: string;
  customerName?: string;
  defaultCategory?: 'Photos' | 'Videos' | 'Highlights';
  onUploadSuccess?: (uploadedItems: any[]) => void;
}

export const CustomerChunkedUploader: React.FC<CustomerChunkedUploaderProps> = ({
  orderId = 'SPJ-ORD-1001',
  bookingId = 'SPJ-BK-1001',
  customerId = 'CUST-1001',
  customerName = 'Valued Customer',
  defaultCategory = 'Photos',
  onUploadSuccess,
}) => {
  const [queue, setQueue] = useState<FileUploadQueueItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'Photos' | 'Videos' | 'Highlights'>(defaultCategory);
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pausedRef = useRef<Record<string, boolean>>({});

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: FileUploadQueueItem[] = [];

    Array.from(files).forEach((file) => {
      const isVideo =
        file.type.startsWith('video/') ||
        /\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(file.name);

      const category = isVideo
        ? (selectedCategory === 'Highlights' ? 'Highlights' : 'Videos')
        : 'Photos';

      const uploadId = `UPL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        type: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        category,
        progress: 0,
        status: 'queued',
        speedFormatted: '0 MB/s',
        uploadId,
      });
    });

    setQueue((prev) => [...prev, ...newItems]);
  };

  const startUploadForItem = async (item: FileUploadQueueItem) => {
    pausedRef.current[item.id] = false;

    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', error: undefined } : q))
    );

    // Calculate chunks (simulate high-speed resumable chunk pipeline)
    const chunkSize = 2 * 1024 * 1024; // 2MB chunk
    const totalChunks = Math.max(1, Math.ceil(item.size / chunkSize));

    let currentChunk = 0;
    const startTime = Date.now();

    while (currentChunk < totalChunks) {
      if (pausedRef.current[item.id]) {
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'paused' } : q))
        );
        return;
      }

      try {
        const res = await api.uploadChunk({
          uploadId: item.uploadId,
          chunkIndex: currentChunk,
          totalChunks,
          fileName: item.name,
          fileSize: item.size,
          fileType: item.type,
          customerId,
          customerName,
          orderId,
          bookingId,
          category: item.category,
        });

        currentChunk++;
        const elapsedSecs = Math.max(0.1, (Date.now() - startTime) / 1000);
        const uploadedBytes = (currentChunk / totalChunks) * item.size;
        const speedMBs = (uploadedBytes / (1024 * 1024) / elapsedSecs).toFixed(1);

        const progressPercent = Math.min(100, Math.round((currentChunk / totalChunks) * 100));

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  progress: progressPercent,
                  speedFormatted: `${speedMBs} MB/s`,
                  status: currentChunk >= totalChunks ? 'completed' : 'uploading',
                  signedUrl: res.storageFile?.signedUrl,
                }
              : q
          )
        );

        // Small delay for smooth UI progress animation
        await new Promise((r) => setTimeout(r, 60));
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error', error: err.message || 'Upload chunk failed' }
              : q
          )
        );
        return;
      }
    }
  };

  const uploadAllQueued = async () => {
    setIsProcessing(true);
    const queuedItems = queue.filter((i) => i.status === 'queued' || i.status === 'error');

    for (const item of queuedItems) {
      await startUploadForItem(item);
    }

    setIsProcessing(false);
    setSuccessMessage('Files uploaded and securely structured into your 5 TB storage repository!');
    setTimeout(() => setSuccessMessage(null), 5000);

    if (onUploadSuccess) {
      const completed = queue.filter((i) => i.status === 'completed');
      onUploadSuccess(completed);
    }
  };

  const togglePauseResume = (item: FileUploadQueueItem) => {
    if (item.status === 'uploading') {
      pausedRef.current[item.id] = true;
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'paused' } : q))
      );
    } else if (item.status === 'paused') {
      startUploadForItem(item);
    }
  };

  const retryItem = (item: FileUploadQueueItem) => {
    startUploadForItem(item);
  };

  const removeItem = (id: string) => {
    pausedRef.current[id] = true;
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const clearCompleted = () => {
    setQueue((prev) => prev.filter((q) => q.status !== 'completed'));
  };

  return (
    <div id="customer-chunked-uploader" className="space-y-6">
      {/* Category selector & metadata bar */}
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Target Category:</span>
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedCategory('Photos')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === 'Photos'
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photos</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('Videos')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === 'Videos'
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Full Videos</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('Highlights')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === 'Highlights'
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Highlights</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500">
            Files are automatically linked to Order <span className="text-zinc-300 font-mono">{orderId}</span> / Booking <span className="text-zinc-300 font-mono">{bookingId}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>Resumable 5 TB Cloud Pipeline</span>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-[#d4af37] bg-[#d4af37]/5 scale-[1.01]'
            : 'border-zinc-800 hover:border-[#d4af37]/60 bg-[#121218]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/quicktime,video/x-m4v,video/webm,.cr2,.nef,.arw,.raw"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="chunked-file-input"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#181824] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-xl">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-cinzel text-base sm:text-lg font-bold text-white">
              Drag & Drop Wedding Photos & Large Videos
            </h4>
            <p className="text-xs text-zinc-400">
              Supports large files up to 50 GB per video. Accepted: <span className="text-zinc-200 font-medium">MP4, MOV, M4V, WEBM, JPG, PNG, RAW</span>.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors">
              Browse Files on Device
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="space-y-3 bg-[#121216] border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#d4af37]" />
              <h4 className="font-cinzel text-sm font-bold text-white">
                Upload Queue ({queue.length} files)
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCompleted}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                Clear Completed
              </button>
              <button
                onClick={uploadAllQueued}
                disabled={isProcessing}
                id="btn-upload-all-queued"
                className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#e6c86e] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Uploading...' : 'Start All Uploads'}
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#171720] border border-zinc-800/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.category === 'Photos' ? (
                      <ImageIcon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    ) : (
                      <Film className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium text-white truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {item.sizeFormatted}
                    </span>
                    <span className="text-[10px] font-semibold text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.5 rounded border border-[#d4af37]/30">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'uploading' && (
                      <span className="text-[11px] font-mono text-emerald-400">
                        {item.speedFormatted}
                      </span>
                    )}

                    {item.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Stored
                      </span>
                    ) : item.status === 'error' ? (
                      <button
                        onClick={() => retryItem(item)}
                        className="p-1 text-amber-400 hover:text-amber-300"
                        title="Retry upload"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => togglePauseResume(item)}
                        className="p-1 text-zinc-300 hover:text-white"
                        title={item.status === 'uploading' ? 'Pause' : 'Resume'}
                      >
                        {item.status === 'uploading' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'completed'
                          ? 'bg-emerald-500'
                          : item.status === 'error'
                          ? 'bg-rose-500'
                          : 'bg-[#d4af37]'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>
                      Upload ID: <span className="font-mono text-zinc-400">{item.uploadId}</span>
                    </span>
                    <span>{item.progress}%</span>
                  </div>
                </div>

                {item.error && (
                  <div className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{item.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
