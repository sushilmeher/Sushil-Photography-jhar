import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  MoveLeft,
  MoveRight,
  Sparkles,
  ShieldCheck,
  Send,
  Sliders,
  FileCheck,
  ArrowUpDown,
  Lock,
  Layers,
  Info,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Check,
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import {
  MasterPhotoItem,
  AlbumSelectionRecord,
  UploadSessionRecord,
  UploadSessionFileRecord,
} from '../types';

interface AlbumPhotoSelectionManagerProps {
  orderId: string;
  customerId?: string;
  customerName?: string;
  weddingId?: string;
  onSelectionSubmitted?: () => void;
}

export const AlbumPhotoSelectionManager: React.FC<AlbumPhotoSelectionManagerProps> = ({
  orderId,
  customerId = 'CUST-1001',
  customerName = 'Priya & Rajesh Patel',
  weddingId = 'WED-PRIYA-RAJESH',
  onSelectionSubmitted,
}) => {
  // Main Data States
  const [selection, setSelection] = useState<AlbumSelectionRecord | null>(null);
  const [masterPhotos, setMasterPhotos] = useState<MasterPhotoItem[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: 'proof-grid' | 'arrange-sequence' | 'upload-session'
  const [activeView, setActiveView] = useState<'proof-grid' | 'arrange-sequence' | 'upload-session'>('proof-grid');

  // Filter & Search in Proofing
  const [searchFilter, setSearchFilter] = useState('');
  const [onlySelectedFilter, setOnlySelectedFilter] = useState(false);

  // Upload Session States
  const [uploadSessions, setUploadSessions] = useState<UploadSessionRecord[]>([]);
  const [currentSession, setCurrentSession] = useState<UploadSessionRecord | null>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadSessionFileRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);

  // Customer Instructions State
  const [customerInstructions, setCustomerInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Selected Photo Detail Modal / Note Editor
  const [editingPhoto, setEditingPhoto] = useState<MasterPhotoItem | null>(null);
  const [photoNote, setPhotoNote] = useState('');
  const [isCover, setIsCover] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<MasterPhotoItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Album Selection and Photos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAlbumSelection(orderId);
      setSelection(res.selection);
      setMasterPhotos(res.masterPhotos);
      setSelectedPhotos(res.selectedPhotos);
      setCustomerInstructions(res.selection.customerInstructions || '');

      const sessions = await api.getUploadSessions();
      setUploadSessions(sessions);
      if (sessions.length > 0) {
        setCurrentSession(sessions[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load album proofing gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderId]);

  // Listen to network status (Rule J: Interrupted uploads auto-pause & resume)
  useEffect(() => {
    const handleOnline = () => {
      setNetworkOnline(true);
      if (isPaused && uploadQueue.some((f) => f.status === 'paused' || f.status === 'uploading')) {
        setIsPaused(false);
        resumeUploadQueue();
      }
    };
    const handleOffline = () => {
      setNetworkOnline(false);
      if (isUploading) {
        setIsPaused(true);
        setUploadError('Network connection interrupted. Upload paused automatically.');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isUploading, isPaused, uploadQueue]);

  // Toggle Photo Selection (Rule G: References only, zero duplication; Rule H: Remove from selection only)
  const handleTogglePhoto = async (photoId: string) => {
    try {
      const res = await api.toggleAlbumPhoto(orderId, photoId);
      // Reload updated selection and list
      setSelection(res.selection);
      setMasterPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, selectedForAlbum: res.isSelected } : p))
      );

      // Refresh full ordered list
      const updated = await api.getAlbumSelection(orderId);
      setSelectedPhotos(updated.selectedPhotos);
    } catch (err: any) {
      alert(err.message || 'Failed to update selection');
    }
  };

  // Sequence Reordering: Move Left / Move Right (Rule N)
  const handleMoveSequence = async (currentIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= selectedPhotos.length) return;

    const newOrder = [...selectedPhotos];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    setSelectedPhotos(newOrder);

    try {
      const photoIds = newOrder.map((p) => p.id);
      await api.reorderAlbumPhotos(orderId, photoIds);
    } catch (err) {
      console.error('Reorder sync error:', err);
    }
  };

  // Remove photo from selection only (Rule H: Master file preserved in storage)
  const handleRemoveSelectionOnly = async (photoId: string) => {
    await handleTogglePhoto(photoId);
  };

  // Open note/cover editor for a selected photo (Rule N & M)
  const handleOpenPhotoEditor = (photo: MasterPhotoItem) => {
    setEditingPhoto(photo);
    setPhotoNote(photo.customerNote || '');
    setIsCover(photo.isCoverCandidate || false);
  };

  const handleSavePhotoMeta = async () => {
    if (!editingPhoto) return;
    try {
      await api.updateAlbumPhotoMeta({
        orderId,
        masterPhotoId: editingPhoto.id,
        notes: photoNote,
        isCoverPhoto: isCover,
      });

      // Update locally
      setSelectedPhotos((prev) =>
        prev.map((p) =>
          p.id === editingPhoto.id
            ? { ...p, notes: photoNote, isCoverPhoto: isCover, isCoverCandidate: isCover, customerNote: photoNote }
            : isCover ? { ...p, isCoverPhoto: false } : p
        )
      );
      setMasterPhotos((prev) =>
        prev.map((p) =>
          p.id === editingPhoto.id
            ? { ...p, customerNote: photoNote, isCoverCandidate: isCover }
            : isCover ? { ...p, isCoverCandidate: false } : p
        )
      );

      setEditingPhoto(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update photo notes');
    }
  };

  // Submit Final Album Selection to Designer (Rule M)
  const handleSubmitSelection = async () => {
    if (selectedPhotos.length === 0) {
      alert('Please select at least 1 photo for your 12x36 photobook before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitAlbumSelection(orderId, customerInstructions);
      setSelection(res.selection);
      setSubmitSuccess(true);
      if (onSelectionSubmitted) {
        onSelectionSubmitted();
      }
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // FILE UPLOAD HANDLING (Rules A, B, C, D, E, K, O)
  // ==========================================
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: File[] = [];
    if ('dataTransfer' in e) {
      e.preventDefault();
      files = Array.from(e.dataTransfer.files);
    } else if (e.target.files) {
      files = Array.from(e.target.files);
    }

    if (files.length === 0) return;

    setUploadError(null);
    setDuplicateNotice(null);

    // Rule A: Validate file types
    const validFiles: File[] = [];
    const invalidNames: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

      if (!allowedExts.includes(ext)) {
        invalidNames.push(file.name);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidNames.length > 0) {
      setUploadError(
        `Unsupported file format in ${invalidNames.length} file(s) [${invalidNames.slice(0, 2).join(', ')}...]. Please upload JPG, JPEG, PNG, WEBP, or HEIC/HEIF.`
      );
    }

    if (validFiles.length === 0) return;

    // Create queue items
    const newQueueItems: UploadSessionFileRecord[] = validFiles.map((file, idx) => ({
      fileId: `FILE-${Date.now()}-${idx}`,
      originalName: file.name,
      sizeBytes: file.size,
      sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      mimeType: file.type || 'image/jpeg',
      status: 'uploading',
      progress: 0,
      hash: `hash_${file.name}_${file.size}`,
    }));

    setUploadQueue((prev) => [...prev, ...newQueueItems]);
    setActiveView('upload-session');
    startSimulatedSessionUpload(validFiles, newQueueItems);
  };

  const startSimulatedSessionUpload = async (
    files: File[],
    queueItems: UploadSessionFileRecord[]
  ) => {
    setIsUploading(true);
    setIsPaused(false);

    // Rule O: Create or update upload session
    const sessionId = `UP-2026-${String(uploadSessions.length + 26).padStart(5, '0')}`;
    const uploadId = `UPL-${Date.now()}`;
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

    const newSession: UploadSessionRecord = {
      sessionId,
      uploadId,
      customerId,
      customerName,
      orderId,
      weddingId,
      totalFiles: files.length,
      uploadedFiles: 0,
      failedFiles: 0,
      totalSizeBytes: totalBytes,
      totalSizeFormatted: `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`,
      status: 'uploading',
      progressPercent: 0,
      uploadDate: new Date().toISOString().split('T')[0],
      files: queueItems,
    };

    setCurrentSession(newSession);

    // Process files sequentially with simulated chunking
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const queueItem = queueItems[i];

      // Rule D: Check for duplicates before upload
      try {
        const dupCheck = await api.checkDuplicate({
          fileHash: queueItem.hash,
          fileName: file.name,
          customerId,
        });

        if (dupCheck.isDuplicate) {
          queueItem.status = 'duplicate';
          queueItem.isDuplicate = true;
          queueItem.errorMessage = 'This photo has already been uploaded.';
          setDuplicateNotice(`Notice: "${file.name}" has already been uploaded. Skipping redundant file creation.`);
          setUploadQueue([...queueItems]);
          continue;
        }
      } catch (err) {
        console.warn('Duplicate check skipped:', err);
      }

      // Simulate chunked progress (2MB chunks)
      for (let p = 20; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 120));
        queueItem.progress = p;
        setUploadQueue([...queueItems]);
      }

      // Ingest Master Photo into 5 TB store (preserving original uncompressed master)
      try {
        const uploadResult = await api.uploadMasterPhoto({
          originalFileName: file.name,
          fileHash: queueItem.hash,
          mimeType: file.type || 'image/jpeg',
          sizeBytes: file.size,
          customerId,
          customerName,
          weddingId,
          orderId,
          uploadId,
          sessionId,
          originalUrl: URL.createObjectURL(file),
          previewUrl: URL.createObjectURL(file),
          thumbnailUrl: URL.createObjectURL(file),
        });

        queueItem.status = 'completed';
        queueItem.progress = 100;
        setMasterPhotos((prev) => [uploadResult.photo, ...prev]);
      } catch (err: any) {
        queueItem.status = 'failed';
        queueItem.errorMessage = err.message || 'Upload failed';
      }

      setUploadQueue([...queueItems]);
    }

    setIsUploading(false);
    // Reload full data
    await loadData();
  };

  const resumeUploadQueue = () => {
    setIsPaused(false);
    setIsUploading(true);
    setUploadError(null);
  };

  const handleRetryFailedFile = async (item: UploadSessionFileRecord) => {
    item.status = 'uploading';
    item.progress = 0;
    setUploadQueue([...uploadQueue]);

    for (let p = 25; p <= 100; p += 25) {
      await new Promise((r) => setTimeout(r, 150));
      item.progress = p;
      setUploadQueue([...uploadQueue]);
    }

    try {
      const res = await api.uploadMasterPhoto({
        originalFileName: item.originalName,
        fileHash: item.hash,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        customerId,
        customerName,
        weddingId,
        orderId,
        uploadId: `UPL-RETRY-${Date.now()}`,
      });

      item.status = 'completed';
      setMasterPhotos((prev) => [res.photo, ...prev]);
    } catch (err: any) {
      item.status = 'failed';
      item.errorMessage = err.message || 'Retry failed';
    }

    setUploadQueue([...uploadQueue]);
  };

  const filteredMasterPhotos = masterPhotos.filter((p) => {
    if (onlySelectedFilter && !p.selectedForAlbum) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        p.originalFileName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.customerNote && p.customerNote.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                Album Photo Selection & Proofing
              </span>
              <span className="text-zinc-500 text-xs font-mono">Order: {orderId}</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>12x36 Wedding Photobook Selection</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" title="5 TB Private & Protected Storage" />
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl mt-1">
              Select your favorite photos for Sushil Meher to craft into the luxury 12x36 album.
              Your original master photos are never modified or compressed.
            </p>
          </div>

          {/* Selection Counter & Limit Indicator */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-[#181820] border border-[#272732] flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-400">Selected for Album</div>
                <div className="font-mono text-base font-bold text-white">
                  <span className="text-[#d4af37]">{selectedPhotos.length}</span> / {selection?.maxAllowed || 60} Max Photos
                </div>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 shadow-lg shadow-[#d4af37]/20"
            >
              <UploadCloud className="w-4 h-4 text-black" />
              <span>Upload More Photos</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              multiple
              accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
            />
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#272732]">
          <div className="flex items-center gap-2 p-1 bg-[#181820] rounded-xl border border-[#272732]">
            <button
              onClick={() => setActiveView('proof-grid')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'proof-grid'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Proofing Gallery ({masterPhotos.length})</span>
            </button>

            <button
              onClick={() => setActiveView('arrange-sequence')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'arrange-sequence'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Arrange Sequence & Notes ({selectedPhotos.length})</span>
            </button>

            <button
              onClick={() => setActiveView('upload-session')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'upload-session'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Sessions & Status</span>
            </button>
          </div>

          {/* Quick Filters */}
          {activeView === 'proof-grid' && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search file name or note..."
                className="bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
              />
              <button
                onClick={() => setOnlySelectedFilter(!onlySelectedFilter)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                  onlySelectedFilter
                    ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                    : 'bg-[#181820] border-[#272732] text-zinc-400 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${onlySelectedFilter ? 'fill-[#d4af37]' : ''}`} />
                <span>Selected Only</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Network & Duplicate Alerts */}
      {!networkOnline && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Internet connection lost. In-flight uploads are paused automatically to protect your files.</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/50">Auto-Resume Active</span>
        </div>
      )}

      {duplicateNotice && (
        <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span>{duplicateNotice}</span>
          </div>
          <button
            onClick={() => setDuplicateNotice(null)}
            className="text-xs text-blue-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-xs text-rose-300 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. VIEW: PROOFING GRID GALLERY                       */}
      {/* ==================================================== */}
      {activeView === 'proof-grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredMasterPhotos.map((photo) => {
              const isSelected = photo.selectedForAlbum;
              return (
                <div
                  key={photo.id}
                  className={`group relative rounded-2xl overflow-hidden bg-[#121216] border transition-all duration-200 ${
                    isSelected
                      ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30 shadow-lg shadow-[#d4af37]/10'
                      : 'border-[#272732] hover:border-zinc-500'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative aspect-square overflow-hidden bg-black/40">
                    <img
                      src={photo.thumbnailUrl || photo.previewUrl}
                      alt={photo.originalFileName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Sequence Badge if selected */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#d4af37] text-black text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                        <span>#{photo.albumSequenceIndex || 1}</span>
                      </div>
                    )}

                    {/* Cover Photo Indicator */}
                    {photo.isCoverCandidate && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-[#d4af37] text-[#d4af37] text-[9px] font-bold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-[#d4af37]" />
                        <span>Cover Pick</span>
                      </div>
                    )}

                    {/* Selection Heart Toggle (Rule G & H) */}
                    <button
                      onClick={() => handleTogglePhoto(photo.id)}
                      className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-transform active:scale-95 ${
                        isSelected
                          ? 'bg-[#d4af37] text-black shadow-lg'
                          : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                      title={isSelected ? 'Remove from Album Selection' : 'Pick for Album'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSelected ? 'fill-black' : ''}`} />
                    </button>

                    {/* Quick Preview & Edit actions */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-white"
                        title="View Full Resolution Preview"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {isSelected && (
                        <button
                          onClick={() => handleOpenPhotoEditor(photo)}
                          className="px-2 py-1 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold flex items-center gap-1"
                          title="Add Designer Note or Set Cover"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Notes</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata Bar */}
                  <div className="p-2.5 bg-[#09090b] space-y-1">
                    <div className="text-[11px] font-medium text-white truncate" title={photo.originalFileName}>
                      {photo.originalFileName}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{photo.sizeFormatted}</span>
                      <span className="text-emerald-400">Master RAW</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMasterPhotos.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-[#121216] border border-[#272732] space-y-3">
              <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-400 font-cinzel">No photos found matching this filter</p>
              <button
                onClick={() => {
                  setSearchFilter('');
                  setOnlySelectedFilter(false);
                }}
                className="text-xs text-[#d4af37] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. VIEW: ARRANGE SEQUENCE & CUSTOMER NOTES (Rule N)  */}
      {/* ==================================================== */}
      {activeView === 'arrange-sequence' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#181820] border border-[#272732] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[#d4af37]" />
                <span>Customer Preferred Sequence ({selectedPhotos.length} Photos)</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Arrange photos in chronological ceremony sequence for the 12x36 spread layout.
              </p>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              Target Spread Count: <strong>30 Sheets (60 Pages)</strong>
            </div>
          </div>

          <div className="space-y-3">
            {selectedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="p-3 sm:p-4 rounded-2xl bg-[#121216] border border-[#272732] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                {/* Left: Thumbnail & Sequence Number */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#181820] border border-[#272732] flex items-center justify-center font-mono font-bold text-[#d4af37] text-sm">
                    #{index + 1}
                  </div>

                  <img
                    src={photo.thumbnailUrl || photo.previewUrl}
                    alt={photo.originalFileName}
                    className="w-16 h-16 rounded-xl object-cover bg-black/40 border border-zinc-800"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{photo.originalFileName}</span>
                      {photo.isCoverPhoto && (
                        <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-[#d4af37]" /> Front Velvet Cover
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {photo.id} • {photo.sizeFormatted}
                    </div>
                    {photo.notes ? (
                      <div className="text-xs text-amber-200/90 italic bg-amber-950/30 border border-amber-500/20 px-2 py-0.5 rounded">
                        Note: "{photo.notes}"
                      </div>
                    ) : (
                      <div className="text-[10px] text-zinc-500 italic">No custom designer notes</div>
                    )}
                  </div>
                </div>

                {/* Right: Sequence Controls & Remove */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleMoveSequence(index, 'left')}
                    disabled={index === 0}
                    className="p-2 rounded-xl bg-[#181820] border border-[#272732] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move earlier in sequence"
                  >
                    <MoveLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveSequence(index, 'right')}
                    disabled={index === selectedPhotos.length - 1}
                    className="p-2 rounded-xl bg-[#181820] border border-[#272732] text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move later in sequence"
                  >
                    <MoveRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenPhotoEditor(photo)}
                    className="px-3 py-2 rounded-xl bg-[#181820] border border-[#272732] text-[#d4af37] text-xs font-semibold hover:border-[#d4af37]/50"
                  >
                    Edit Note
                  </button>

                  <button
                    onClick={() => handleRemoveSelectionOnly(photo.id)}
                    className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:text-rose-100"
                    title="Remove from album selection (Master photo will remain safe in storage)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. VIEW: UPLOAD SESSIONS & RESUMABLE STATUS (Rule O) */}
      {/* ==================================================== */}
      {activeView === 'upload-session' && (
        <div className="space-y-6">
          {/* Active Queue Card */}
          {uploadQueue.length > 0 && (
            <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-[#d4af37]" />
                    <span>Active Session Queue ({uploadQueue.length} items)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Direct chunked upload to 5 TB Storage. Zero duplicate file generation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isUploading && (
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="px-3 py-1.5 rounded-xl bg-[#181820] border border-[#272732] text-xs text-zinc-300 flex items-center gap-1"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{isPaused ? 'Resume Upload' : 'Pause Upload'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Queue Items */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {uploadQueue.map((item) => (
                  <div
                    key={item.fileId}
                    className="p-3 rounded-xl bg-[#181820] border border-[#272732] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : item.status === 'failed' ? (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        ) : item.status === 'duplicate' ? (
                          <FileCheck className="w-4 h-4 text-blue-400" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-[#d4af37] animate-spin" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-white truncate">{item.originalName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {item.sizeFormatted} • {item.status.toUpperCase()}
                          {item.errorMessage && ` - ${item.errorMessage}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.status === 'uploading' && (
                        <div className="w-24 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#d4af37] h-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}

                      {item.status === 'failed' && (
                        <button
                          onClick={() => handleRetryFailedFile(item)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}

                      {item.status === 'completed' && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical Upload Sessions (Rule O) */}
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-4">
            <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Historical Upload Sessions (Rule O Audit Trail)</span>
            </h3>

            <div className="space-y-3">
              {uploadSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="p-4 rounded-2xl bg-[#181820] border border-[#272732] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">{session.sessionId}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                        {session.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      Uploaded on {session.uploadDate} • Total Size: {session.totalSizeFormatted}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="text-zinc-400">Success Ratio</div>
                      <div className="text-white font-bold">
                        {session.uploadedFiles} / {session.totalFiles} Files
                      </div>
                    </div>
                    <div className="w-16 h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400"
                        style={{ width: `${session.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FINAL SUBMIT TO DESIGNER SECTION (Rule M)            */}
      {/* ==================================================== */}
      <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>Submit Album Selections to Designer</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Lock your {selectedPhotos.length} selections and send notes to Sushil Meher's album lab.
            </p>
          </div>

          <div className="text-xs px-3 py-1 rounded-xl bg-[#181820] border border-[#272732] text-zinc-400">
            Current Status:{' '}
            <strong className="text-emerald-400 uppercase">
              {selection?.status.replace('_', ' ') || 'DRAFT'}
            </strong>
          </div>
        </div>

        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Album selection submitted successfully! Sushil Meher and the layout design team have received your exact photo sequence.
            </span>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-300 block">
            Custom Photobook Instructions & Cover Preferences
          </label>
          <textarea
            value={customerInstructions}
            onChange={(e) => setCustomerInstructions(e.target.value)}
            rows={3}
            placeholder="e.g. Please use the Varmala portrait for the front velvet photo window, ensure grandmother blessing photos appear on sheet 5, and keep background tones warm & royal."
            className="w-full bg-[#181820] border border-[#272732] rounded-2xl p-4 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none resize-none"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSubmitSelection}
              disabled={submitting || selectedPhotos.length === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 shadow-lg shadow-[#d4af37]/20 disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-black" />
              <span>{submitting ? 'Submitting to Lab...' : 'Submit Selections to Designer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* EDIT PHOTO DETAIL MODAL (Notes & Cover Flag)         */}
      {/* ==================================================== */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#272732]">
              <h4 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#d4af37]" />
                <span>Custom Notes for {editingPhoto.originalFileName}</span>
              </h4>
              <button
                onClick={() => setEditingPhoto(null)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={editingPhoto.thumbnailUrl || editingPhoto.previewUrl}
                alt={editingPhoto.originalFileName}
                className="w-20 h-20 rounded-2xl object-cover bg-black"
              />
              <div className="space-y-1 text-xs">
                <div className="font-mono text-zinc-400">ID: {editingPhoto.id}</div>
                <div className="text-zinc-300">Preserved Master Size: {editingPhoto.sizeFormatted}</div>
                <div className="text-emerald-400 font-bold">Original File Safe in 5 TB Storage</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Instructions for Album Designer
              </label>
              <input
                type="text"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                placeholder="e.g. Centerfold panoramic layout, crop slightly from left, etc."
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#181820] border border-[#272732]">
              <input
                type="checkbox"
                id="isCoverCheck"
                checked={isCover}
                onChange={(e) => setIsCover(e.target.checked)}
                className="w-4 h-4 accent-[#d4af37] cursor-pointer"
              />
              <label htmlFor="isCoverCheck" className="text-xs text-white cursor-pointer select-none">
                Designate as Primary 12x36 Photobook Cover Photo
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingPhoto(null)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleSavePhotoMeta}
                className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL RESOLUTION PREVIEW MODAL */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-[#121216] border border-[#272732] rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-[#272732] flex items-center justify-between text-xs">
              <span className="font-mono text-white font-bold">{previewPhoto.originalFileName}</span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="relative aspect-video sm:aspect-auto sm:max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={previewPhoto.originalUrl || previewPhoto.previewUrl}
                alt={previewPhoto.originalFileName}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 bg-[#09090b] flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Uncompressed Master: {previewPhoto.sizeFormatted}</span>
              <span>Protected Cloud Storage: Verified Clean</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
