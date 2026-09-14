import React, { useState, useEffect } from 'react';
import {
  Palette,
  Download,
  CheckCircle,
  ExternalLink,
  Layers,
  ArrowUpDown,
  FileText,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Star,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { AlbumSelectionRecord, MasterPhotoItem } from '../types';

interface AlbumDesignerPortalProps {
  designerName?: string;
}

export const AlbumDesignerPortal: React.FC<AlbumDesignerPortalProps> = ({
  designerName = 'Sushil Meher (Master Album Artist)',
}) => {
  const [selections, setSelections] = useState<
    (AlbumSelectionRecord & {
      photos: (MasterPhotoItem & {
        sequenceOrder: number;
        isCoverPhoto: boolean;
        notes: string;
        designerProcessed: boolean;
        processedAt?: string;
      })[];
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activePhotoPreview, setActivePhotoPreview] = useState<any | null>(null);

  const loadDesignerSelections = async () => {
    try {
      setLoading(true);
      const data = await api.getDesignerSelections();
      setSelections(data);
      if (data.length > 0 && !selectedOrderId) {
        setSelectedOrderId(data[0].orderId);
      }
    } catch (err) {
      console.error('Failed to load designer selections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignerSelections();
  }, []);

  const activeSelection = selections.find((s) => s.orderId === selectedOrderId) || selections[0];

  const handleToggleProcessed = async (photoId: string, currentStatus: boolean) => {
    if (!activeSelection) return;
    try {
      await api.markDesignerPhotoProcessed(activeSelection.orderId, photoId, !currentStatus);

      // Local optimistic update
      setSelections((prev) =>
        prev.map((sel) => {
          if (sel.orderId !== activeSelection.orderId) return sel;
          return {
            ...sel,
            photos: sel.photos.map((p) =>
              p.id === photoId
                ? {
                    ...p,
                    designerProcessed: !currentStatus,
                    processedAt: !currentStatus ? new Date().toISOString() : undefined,
                  }
                : p
            ),
          };
        })
      );
    } catch (err) {
      console.error('Failed to update processed status:', err);
    }
  };

  const handleDownloadOriginalMaster = (photo: MasterPhotoItem) => {
    // Direct link to the uncompressed master file
    const link = document.createElement('a');
    link.href = photo.originalUrl;
    link.download = photo.originalFileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#121216] border border-[#272732] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#d4af37] animate-spin mx-auto" />
        <div className="text-zinc-400 font-cinzel text-sm">Loading Album Designer Workspace...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Designer Header Banner */}
      <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold uppercase tracking-wider">
              Rule M • Album Designer Access Portal
            </span>
            <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Isolated Designer Access
            </span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#d4af37]" />
            <span>12x36 Photobook Design Lab</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl mt-1">
            Assigned Artist: <strong className="text-white">{designerName}</strong>. Access customer's exact
            selection sequence, custom annotations, and direct uncompressed master RAW files.
          </p>
        </div>

        {/* Order Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 font-medium">Select Wedding Order:</label>
          <select
            value={activeSelection?.orderId || ''}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="bg-[#181820] border border-[#272732] rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
          >
            {selections.map((s) => (
              <option key={s.orderId} value={s.orderId}>
                {s.customerName} ({s.orderId}) - {s.totalSelected} Photos
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeSelection ? (
        <div className="space-y-6">
          {/* Customer Preferences Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#121216] border border-[#272732] space-y-2">
              <div className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Customer & Wedding</span>
              </div>
              <div className="text-base font-bold text-white">{activeSelection.customerName}</div>
              <div className="text-xs text-zinc-400 font-mono">
                Order: {activeSelection.orderId} • {activeSelection.weddingId}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121216] border border-[#272732] space-y-2">
              <div className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Album Specifications</span>
              </div>
              <div className="text-base font-bold text-white">
                {activeSelection.totalSelected} Photos Selected
              </div>
              <div className="text-xs text-emerald-400 font-mono">
                Target: {activeSelection.targetSheetCount || 30} Sheets (60 Luxury Pages)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121216] border border-[#272732] space-y-2">
              <div className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Submission Status</span>
              </div>
              <div className="text-base font-bold text-amber-400 capitalize">
                {activeSelection.status.replace('_', ' ')}
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Submitted: {activeSelection.submittedAt ? new Date(activeSelection.submittedAt).toLocaleDateString() : 'Active Proofing'}
              </div>
            </div>
          </div>

          {/* Customer General Instructions */}
          {activeSelection.customerInstructions && (
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-amber-400">
                <FileText className="w-4 h-4" />
                <span>Customer's Photobook Brief & Cover Wishes</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-200">
                "{activeSelection.customerInstructions}"
              </p>
            </div>
          )}

          {/* Photos Sequence Table & Direct Download */}
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-[#d4af37]" />
                  <span>Customer's Selected Photos in Exact Sequence ({activeSelection.photos.length})</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Download 100% full-resolution masters. Mark layout progress as spreads are completed in Photoshop / InDesign.
                </p>
              </div>

              <div className="text-xs font-mono text-zinc-400">
                Master Files Protected: <span className="text-emerald-400">Original RAW</span>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {activeSelection.photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`p-4 rounded-2xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    photo.designerProcessed
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-[#181820] border-[#272732]'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-black/50 border border-zinc-800 flex items-center justify-center font-mono font-bold text-[#d4af37] text-sm">
                      #{photo.sequenceOrder}
                    </div>

                    <img
                      src={photo.thumbnailUrl || photo.previewUrl}
                      alt={photo.originalFileName}
                      className="w-16 h-16 rounded-xl object-cover bg-black border border-zinc-700 cursor-pointer"
                      onClick={() => setActivePhotoPreview(photo)}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{photo.originalFileName}</span>
                        {photo.isCoverPhoto && (
                          <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-bold flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-[#d4af37]" /> Velvet Cover Front
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Internal ID: {photo.id} • Size: {photo.sizeFormatted} • MIME: {photo.mimeType}
                      </div>
                      {photo.notes && (
                        <div className="text-xs text-amber-300 italic bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded">
                          Customer note: "{photo.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      onClick={() => handleDownloadOriginalMaster(photo)}
                      className="px-3 py-2 rounded-xl bg-[#121216] border border-[#272732] text-xs font-bold text-[#d4af37] hover:border-[#d4af37] flex items-center gap-1.5 transition-colors"
                      title="Download full 24+ MP uncompressed original master photo"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download RAW Master</span>
                    </button>

                    <button
                      onClick={() => handleToggleProcessed(photo.id, photo.designerProcessed)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        photo.designerProcessed
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#181820] text-zinc-300 border border-[#272732] hover:text-white'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          photo.designerProcessed ? 'text-emerald-400' : 'text-zinc-500'
                        }`}
                      />
                      <span>{photo.designerProcessed ? 'Layout Spread Done' : 'Mark Spread Done'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#121216] border border-[#272732] space-y-2">
          <p className="text-sm text-zinc-400 font-cinzel">No active album selections currently submitted.</p>
        </div>
      )}

      {/* FULL PREVIEW MODAL */}
      {activePhotoPreview && (
        <div
          onClick={() => setActivePhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-[#121216] border border-[#272732] rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-[#272732] flex items-center justify-between text-xs">
              <span className="font-mono text-white font-bold">{activePhotoPreview.originalFileName}</span>
              <button
                onClick={() => setActivePhotoPreview(null)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex items-center justify-center bg-black max-h-[70vh]">
              <img
                src={activePhotoPreview.originalUrl}
                alt={activePhotoPreview.originalFileName}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 bg-[#09090b] flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Sequence Order: #{activePhotoPreview.sequenceOrder}</span>
              <button
                onClick={() => handleDownloadOriginalMaster(activePhotoPreview)}
                className="text-[#d4af37] hover:underline font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download Uncompressed File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
