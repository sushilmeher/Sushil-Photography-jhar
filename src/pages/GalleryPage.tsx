import React, { useState } from 'react';
import {
  Camera,
  Film,
  Sparkles,
  Maximize2,
  Share2,
  Play,
  Heart,
  Filter,
} from 'lucide-react';
import { GalleryItem } from '../types';
import { INITIAL_GALLERY } from '../data/mockData';

interface GalleryPageProps {
  galleryItems?: GalleryItem[];
  onOpenLightbox?: (item: GalleryItem) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  galleryItems = [],
  onOpenLightbox,
}) => {
  const safeGallery = galleryItems && galleryItems.length > 0 ? galleryItems : INITIAL_GALLERY;
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Wedding',
    'Pre-Wedding',
    'Candid',
    'Traditional',
    'Drone Shots',
    'Album Pages',
    'Photo Editing',
    'Video Highlights',
  ];

  const filteredItems = safeGallery.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div id="gallery-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Camera className="w-3.5 h-3.5" />
            <span>Curated Visual Showcase</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Portfolio & Master Gallery
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            A testament to genuine laughter, sacred rituals, sweeping drone vistas, and custom
            editorial post-processing across Western Odisha.
          </p>
        </div>

        {/* Category Filters (Mandated by user prompt) */}
        <div className="flex flex-wrap items-center justify-center gap-2 bg-[#121216] p-2 rounded-2xl border border-[#272732] max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry / Responsive Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid group bg-[#121216] border border-[#272732] hover:border-[#d4af37]/70 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 relative cursor-pointer"
              onClick={() => onOpenLightbox(item)}
            >
              <div className="relative overflow-hidden bg-black">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Video Play Badge overlay */}
                {item.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37]/90 text-black flex items-center justify-center shadow-2xl pl-1 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-black" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 rounded bg-black/70 border border-white/20 text-[10px] font-bold text-[#f5e7b2] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Photo link copied!');
                        }
                      }}
                      className="p-2 rounded-full bg-black/70 text-white hover:text-[#d4af37]"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 text-left">
                    <h3 className="font-cinzel text-base font-bold text-white">{item.title}</h3>
                    {item.location && <p className="text-xs text-zinc-300">{item.location}</p>}
                    <div className="flex items-center gap-1 text-[11px] text-[#d4af37] pt-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Click to view full screen</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom metadata tag always visible on mobile */}
              <div className="p-3 bg-[#0d0d12] flex items-center justify-between text-xs text-zinc-400 sm:hidden">
                <span className="font-semibold text-zinc-200">{item.title}</span>
                <span className="text-[10px] text-[#d4af37]">{item.category}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-[#121216] rounded-2xl border border-[#272732] space-y-3">
            <p className="text-zinc-400 text-sm">No items found for category "{selectedCategory}".</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-[#d4af37] underline"
            >
              Show all photos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
