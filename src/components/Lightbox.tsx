import React from 'react';
import { X, MapPin, Film, Share2, Sparkles } from 'lucide-react';
import { GalleryItem } from '../types';

interface LightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div
      id="portfolio-lightbox"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] bg-[#121216] border border-[#272732] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#272732] bg-[#0c0c10]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              {item.category}
            </span>
            <h3 className="font-cinzel text-lg text-white font-bold">{item.title}</h3>
          </div>
          <button
            id="lightbox-close-btn"
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Content */}
        <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 min-h-[350px]">
          {item.videoUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <video
                src={item.videoUrl}
                controls
                autoPlay
                className="max-h-[65vh] w-full rounded-lg"
              />
            </div>
          ) : (
            <img
              src={item.image}
              alt={item.title}
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>

        {/* Caption & Location footer */}
        <div className="px-6 py-4 bg-[#0e0e12] border-t border-[#272732] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="space-y-1">
            {item.location && (
              <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{item.location}</span>
              </div>
            )}
            {item.description && <p className="text-zinc-400">{item.description}</p>}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-500">Sushil Photography Jhar</span>
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Portfolio link copied to clipboard!');
                }
              }}
              className="flex items-center gap-1 text-zinc-400 hover:text-[#d4af37]"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
