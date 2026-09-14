import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  Box,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Upload,
  Eye,
} from 'lucide-react';
import { AlbumTemplate } from '../types';

interface AlbumDesignPageProps {
  albumTemplates?: AlbumTemplate[];
  onOpenBooking?: () => void;
  onNavigate?: (tab: string) => void;
}

const DEFAULT_ALBUM_TEMPLATES: AlbumTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Royal Heritage Odia Wedding',
    dimensions: '12x36 Inches',
    description: 'Gold-accented panoramic layout featuring traditional Sambalpuri motifs, mandap sacred fire, and emotional bidaai spreads.',
    pricePerSheet: 250,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'tmpl-2',
    title: 'Minimalist Editorial Velvet',
    dimensions: '12x36 Inches',
    description: 'Clean negative space with contemporary typography, soft-touch matte lamination, and black-and-white candid spreads.',
    pricePerSheet: 280,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'tmpl-3',
    title: 'Cinematic Sunset Romance',
    dimensions: '12x36 Inches',
    description: 'Edge-to-edge panoramic landscape spreads highlighting outdoor golden hour silhouettes and lake reflections.',
    pricePerSheet: 240,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'tmpl-4',
    title: 'Sparkle & Zari Traditional Luxe',
    dimensions: '12x36 Inches',
    description: 'Vibrant color grading with metallic foil embossing, focusing on bridal jewellery, mehendi intricacies, and haldi smiles.',
    pricePerSheet: 300,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'tmpl-5',
    title: 'Grand Barat & Reception Symphony',
    dimensions: '12x36 Inches',
    description: 'Multi-frame collage balance displaying high-energy wedding processions, fireworks, drone stage angles, and family groups.',
    pricePerSheet: 260,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'tmpl-6',
    title: 'Acrylic Glass Box Keepsake',
    dimensions: '12x36 Inches',
    description: 'High-gloss acrylic cover with thermal bind and personalized bride & groom laser etched heirloom wooden box.',
    pricePerSheet: 350,
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85',
  },
];

export const AlbumDesignPage: React.FC<AlbumDesignPageProps> = ({
  albumTemplates = [],
  onOpenBooking = () => {},
  onNavigate = (_tab: string) => {},
}) => {
  const safeTemplates = albumTemplates && albumTemplates.length > 0 ? albumTemplates : DEFAULT_ALBUM_TEMPLATES;
  const [selectedTemplate, setSelectedTemplate] = useState<AlbumTemplate | null>(null);

  const finishes = [
    {
      title: 'Velvet Soft-Touch',
      desc: 'Silky, anti-scratch luxury finish with zero glare. Our #1 recommended choice for royal wedding keepsakes.',
      tag: 'Studio Signature',
    },
    {
      title: 'Metallic Pearl High-Gloss',
      desc: 'Radiant metallic shimmer that accentuates jewellery gold, silk zari, and vivid vibrant stage lights.',
      tag: 'Ultra-Vibrant',
    },
    {
      title: 'Archival Matte Premium',
      desc: 'Non-reflective, smooth editorial museum grade surface ideal for natural skin tones and candid moments.',
      tag: 'Classic Art',
    },
    {
      title: 'Leatherette + Acrylic Glass Box',
      desc: 'Custom wooden briefcase box with magnetic closure, personalized bride & groom laser engraving, and silk pull ribbon.',
      tag: 'Heritage Box',
    },
  ];

  return (
    <div id="album-design-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Master 12x36 Photobooks</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Panoramic Wedding Album Design & Crafting
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Every page is an emotional work of art. Designed with seamless 12x36 panoramic spreads,
            ultra-thick layflat binding, and waterproof thermal preservation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('upload-photos')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-black" />
              <span>Upload Photos for Album</span>
            </button>

            <button
              onClick={onOpenBooking}
              className="px-6 py-3 rounded-xl bg-[#181820] border border-[#272732] hover:border-[#d4af37] text-white font-semibold text-xs tracking-wider uppercase transition-all"
            >
              Order Custom Album Design
            </button>
          </div>
        </div>

        {/* 4 Album Finishes & Box Design (Mandated by prompt) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {finishes.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#121216] border border-[#272732] hover:border-[#d4af37]/60 flex flex-col justify-between space-y-4 shadow-xl transition-all"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                  {item.tag}
                </span>
                <h3 className="font-cinzel text-base font-bold text-white mt-1">{item.title}</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-2 border-t border-[#272732] flex items-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Water & Tear Resistant</span>
              </div>
            </div>
          ))}
        </div>

        {/* 12x36 Page Templates & Preview Gallery */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                Curated Layouts
              </span>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white mt-1">
                12x36 Panoramic Spread Templates
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Seamless lay-flat panoramic design with zero image loss across the spine.
              </p>
            </div>
            <span className="text-xs text-zinc-500">
              Showing {safeTemplates.length} Master Designs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-[#121216] border border-[#272732] rounded-2xl overflow-hidden group hover:border-[#d4af37]/60 transition-all shadow-xl flex flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-black">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-[#f5e7b2]">
                    {template.dimensions}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="p-2 rounded-lg bg-black/80 text-white hover:text-[#d4af37] transition-colors"
                      title="Preview Full Screen"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-white">{template.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{template.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#272732] flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">
                      ₹{template.pricePerSheet} / Sheet
                    </span>
                    <button
                      onClick={() => onNavigate('upload-photos')}
                      className="px-3 py-1.5 rounded-lg bg-[#181820] hover:bg-[#d4af37] hover:text-black border border-[#272732] text-xs font-semibold transition-all"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal for viewing spread in detail */}
        {selectedTemplate && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#121216] border border-[#272732] rounded-2xl overflow-hidden p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-white">
                    {selectedTemplate.title} ({selectedTemplate.dimensions})
                  </h3>
                  <p className="text-xs text-zinc-400">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-[#272732] bg-black">
                <img
                  src={selectedTemplate.image}
                  alt={selectedTemplate.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    onNavigate('upload-photos');
                  }}
                  className="px-5 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs"
                >
                  Upload My Photos for This Layout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
