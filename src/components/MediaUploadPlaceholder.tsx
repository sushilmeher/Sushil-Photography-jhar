import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  X,
  Upload,
} from 'lucide-react';
import { SmartMediaCategory } from '../types';
import { api } from '../services/api';

export interface MediaUploadPlaceholderProps {
  id?: string;
  label?: string; // e.g., "Upload Business Logo", "Upload Photographer Photo", "Upload Payment QR Code"
  subText?: string;
  supportedFormatsText?: string;
  accept?: string; // e.g. "image/*", "image/png,image/jpeg,image/webp,image/svg+xml", "video/mp4", "application/pdf"
  maxSizeMB?: number;
  currentUrl?: string;
  category?: SmartMediaCategory | string;
  slotKey?: string; // e.g. "logo_main", "photographer_photo", "payment_qr"
  usedIn?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto' | 'banner';
  className?: string;
  isAdmin?: boolean;
  onUploadSuccess?: (url: string, file: File) => void;
  onRemoveSuccess?: () => void;
  title?: string;
}

export const MediaUploadPlaceholder: React.FC<MediaUploadPlaceholderProps> = ({
  id,
  label = 'Upload Image',
  subText = 'Click or Drag & Drop',
  supportedFormatsText = 'PNG, JPG, JPEG, WEBP, SVG • Max 25MB',
  accept = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml',
  maxSizeMB = 25,
  currentUrl = '',
  category = 'Other',
  slotKey,
  usedIn,
  aspectRatio = 'square',
  className = '',
  isAdmin = true, // Default to true so placeholders are immediately actionable
  onUploadSuccess,
  onRemoveSuccess,
  title,
}) => {
  const [mediaUrl, setMediaUrl] = useState<string>(currentUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop if it changes externally
  React.useEffect(() => {
    setMediaUrl(currentUrl);
  }, [currentUrl]);

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);

    // 1. Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`File size exceeds limit of ${maxSizeMB}MB (Selected: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    // 2. Validate format if accept is specified
    if (accept && accept !== '*/*') {
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const prefix = type.replace('/*', '');
          return file.type.startsWith(prefix);
        }
        return file.type === type || file.name.toLowerCase().endsWith(type.replace('.', ''));
      });

      if (!isAccepted) {
        setErrorMessage(`Unsupported format. Supported: ${supportedFormatsText}`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(20);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90);
        setUploadProgress(percent);
      }
    };

    reader.onload = async () => {
      try {
        const resultUrl = reader.result as string;
        setUploadProgress(100);

        // Update local state
        setMediaUrl(resultUrl);

        // Auto-save to smart media backend
        try {
          await api.addMedia({
            name: file.name,
            type: file.type || 'image/jpeg',
            sizeBytes: file.size,
            url: resultUrl,
            category: category as SmartMediaCategory,
            slotKey,
            usedIn: usedIn || `${category} section`,
            title: title || file.name,
          });


          // If slotKey matches site media config, persist to site media and dispatch update
          if (slotKey) {
            await api.updateSiteMedia({ [slotKey]: resultUrl });
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('siteMediaConfigUpdated', {
                  detail: { [slotKey]: resultUrl },
                })
              );
            }
          }
        } catch (backendErr) {
          console.warn('Backend sync note:', backendErr);
        }

        if (onUploadSuccess) {
          onUploadSuccess(resultUrl, file);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to process file upload.');
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 400);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setErrorMessage('Error reading file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemove = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMediaUrl('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (slotKey) {
      try {
        await api.updateSiteMedia({ [slotKey]: '' });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('siteMediaConfigUpdated', {
              detail: { [slotKey]: '' },
            })
          );
        }
      } catch {
        // ignore
      }
    }

    if (onRemoveSuccess) {
      onRemoveSuccess();
    }
  };

  const handleTriggerReplace = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Determine aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'banner':
        return 'aspect-[21/9] min-h-[140px]';
      default:
        return 'min-h-[180px]';
    }
  };

  const isVideo = mediaUrl.endsWith('.mp4') || mediaUrl.includes('video/mp4') || accept.includes('video');
  const isPdf = mediaUrl.endsWith('.pdf') || mediaUrl.includes('application/pdf') || accept.includes('pdf');

  // =====================================================================
  // STATE 1: MEDIA PRESENT (UPLOADED / ASSIGNED)
  // =====================================================================
  if (mediaUrl) {
    return (
      <div
        id={id || `media-item-${slotKey || 'uploaded'}`}
        className={`relative group rounded-2xl overflow-hidden border border-[#272732] bg-[#0e0e13] ${getAspectClass()} ${className}`}
      >
        {/* Render Media Content */}
        {isVideo ? (
          <video
            src={mediaUrl}
            controls
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : isPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#161622] text-center">
            <FileText className="w-12 h-12 text-[#d4af37] mb-2" />
            <span className="text-xs font-semibold text-white truncate max-w-full">
              {title || 'Document / Wedding Card Proof (PDF)'}
            </span>
            <span className="text-[10px] text-zinc-400 mt-1">Ready for Print / Review</span>
          </div>
        ) : (
          <img
            src={mediaUrl}
            alt={title || label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => {
              // If image fails to load, gracefully fall back to upload placeholder
              setMediaUrl('');
              setErrorMessage('Failed to load image. You can re-upload below.');
            }}
          />
        )}

        {/* Action Overlay: Replace / Remove / Re-upload / Preview */}
        {isAdmin && (
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-3 gap-2 backdrop-blur-xs">
            <span className="text-[11px] font-semibold text-white tracking-wide truncate max-w-[90%] mb-1">
              {title || label}
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleTriggerReplace}
                title="Replace with another file"
                className="px-2.5 py-1.5 rounded-lg bg-[#d4af37] hover:brightness-110 text-black font-bold text-[11px] flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewModalOpen(true)}
                title="Preview full size"
                className="px-2.5 py-1.5 rounded-lg bg-[#1f1f2b] hover:bg-[#2c2c3e] text-zinc-200 text-[11px] font-semibold flex items-center gap-1 border border-zinc-700 transition-transform active:scale-95"
              >
                <Eye className="w-3 h-3 text-[#d4af37]" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                title="Remove and restore upload placeholder"
                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[11px] font-semibold flex items-center gap-1 transition-transform active:scale-95"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>Remove</span>
              </button>
            </div>

            <span className="text-[9px] text-zinc-400 mt-1">
              Live on website • Changes auto-save
            </span>
          </div>
        )}

        {/* Hidden file input for Replace action */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Fullscreen Preview Modal */}
        {previewModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewModalOpen(false)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-[#121218] border border-[#2c2c3d] rounded-2xl overflow-hidden p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {isVideo ? (
                <video src={mediaUrl} controls autoPlay className="max-h-[80vh] w-auto mx-auto rounded-lg" />
              ) : (
                <img
                  src={mediaUrl}
                  alt={title || label}
                  className="max-h-[80vh] w-auto mx-auto object-contain rounded-lg"
                />
              )}

              <div className="p-3 text-center">
                <span className="text-xs font-semibold text-zinc-300">{title || label}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =====================================================================
  // STATE 2: EMPTY PLACEHOLDER (CLEAN UPLOAD BOX)
  // =====================================================================
  return (
    <div
      id={id || `upload-box-${slotKey || 'new'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-200 flex flex-col items-center justify-center p-6 text-center ${getAspectClass()} ${
        isDragging
          ? 'border-[#d4af37] bg-[#d4af37]/10 scale-[1.01]'
          : 'border-[#2e2e3f] hover:border-[#d4af37]/70 bg-[#121218]/80 hover:bg-[#161620]'
      } ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Uploading Progress State */}
      {isUploading ? (
        <div className="flex flex-col items-center justify-center space-y-3 p-4">
          <div className="relative">
            <RefreshCw className="w-10 h-10 text-[#d4af37] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#d4af37]">
              {uploadProgress}%
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-white block">Processing Media File...</span>
            <div className="w-36 h-1.5 bg-zinc-800 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#f3cf65] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3 max-w-xs">
          {/* Upload Icon Box */}
          <div className="w-12 h-12 rounded-2xl bg-[#1d1d28] border border-[#2f2f42] flex items-center justify-center group-hover:scale-110 group-hover:border-[#d4af37]/50 group-hover:bg-[#d4af37]/10 transition-all duration-200">
            {accept.includes('video') ? (
              <Video className="w-6 h-6 text-[#d4af37]" />
            ) : accept.includes('pdf') ? (
              <FileText className="w-6 h-6 text-[#d4af37]" />
            ) : (
              <UploadCloud className="w-6 h-6 text-[#d4af37]" />
            )}
          </div>

          {/* Primary Text: "Upload Image" / Configured Label */}
          <div className="space-y-1">
            <span className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors block">
              {label}
            </span>
            {subText && (
              <span className="text-xs text-zinc-400 block">
                {subText}
              </span>
            )}
          </div>

          {/* Supported Formats info */}
          {supportedFormatsText && (
            <div className="px-2.5 py-1 rounded-md bg-[#181822] border border-[#262635] text-[10px] text-zinc-400 font-mono">
              {supportedFormatsText}
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-1.5 text-left">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
