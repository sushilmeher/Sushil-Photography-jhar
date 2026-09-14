import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Check, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useFounderPhoto } from '../hooks/useFounderPhoto';
import { BUSINESS_INFO } from '../data/mockData';

interface UpdateFounderPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateFounderPhotoModal: React.FC<UpdateFounderPhotoModalProps> = ({ isOpen, onClose }) => {
  const { photoUrl, updatePhoto, resetPhoto, isUpdating } = useFounderPhoto();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Image size exceeds 15MB. Please choose a smaller photo.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please drop a valid image file.');
    }
  };

  const handleApply = async () => {
    if (!selectedFile) return;
    try {
      await updatePhoto(selectedFile);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setPreviewUrl(null);
        setSelectedFile(null);
      }, 1200);
    } catch {
      setError('Failed to save photo. Please try again.');
    }
  };

  const handleReset = async () => {
    await resetPhoto();
    setPreviewUrl(null);
    setSelectedFile(null);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#272732] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white">Update Founder Photo</h3>
              <p className="text-xs text-zinc-400">
                {BUSINESS_INFO.owner} • {BUSINESS_INFO.ownerRole}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1f1f28] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#272732] hover:border-[#d4af37] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#171720]/60 hover:bg-[#1a1a24] group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#20202c] group-hover:bg-[#d4af37]/20 flex items-center justify-center text-zinc-400 group-hover:text-[#d4af37] transition-all">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                Click to browse or drag & drop your photo
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Select your photo (e.g. 20240101_155452.jpg). JPG, PNG, WEBP up to 15MB.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#171720] border border-[#272732]">
          <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-[#d4af37] shrink-0 bg-black">
            <img
              src={previewUrl || photoUrl}
              alt="Sushil Meher - Founder"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
                {previewUrl ? 'New Selection' : 'Current Active'}
              </span>
              {previewUrl && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready to apply
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white truncate">{BUSINESS_INFO.owner}</h4>
            <p className="text-xs text-zinc-400 truncate">{BUSINESS_INFO.ownerRole}</p>
            <p className="text-[11px] text-zinc-400 truncate">
              {selectedFile ? selectedFile.name : 'Updates Home, About & Profile cards'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Founder photo updated successfully!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-[#272732] hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Default
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1f1f28] hover:bg-[#272734] text-zinc-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedFile || isUpdating}
              onClick={handleApply}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 ${
                selectedFile && !isUpdating
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b89124] text-black hover:brightness-110'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Apply My Photo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
