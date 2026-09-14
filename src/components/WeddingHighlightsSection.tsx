import React, { useState, useEffect } from 'react';
import {
  Play,
  Film,
  Sparkles,
  Calendar,
  Clock,
  Share2,
  ShieldCheck,
  Filter,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { WeddingVideoItem } from '../types';
import { api } from '../services/api';
import { VideoPlayerModal } from './VideoPlayerModal';

interface WeddingHighlightsSectionProps {
  onBookClick?: () => void;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export const WeddingHighlightsSection: React.FC<WeddingHighlightsSectionProps> = ({
  onBookClick,
  title = 'Cinematic Wedding Highlights',
  subtitle = 'Experience the majesty of regal Odisha weddings captured in true 4K HDR motion picture cinematography by Sushil Meher.',
  limit,
}) => {
  const [highlights, setHighlights] = useState<WeddingVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<WeddingVideoItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      setLoading(true);
      const data = await api.getVideos({ publicOnly: true, isHighlight: true });
      setHighlights(data);
    } catch (err) {
      console.error('Failed to load highlights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (video: WeddingVideoItem) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const handleShare = (video: WeddingVideoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = window.location.origin + `/#wedding-highlights?video=${video.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(video.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filtered = highlights.filter((v) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'teaser') return v.category === 'teaser';
    if (activeFilter === 'sangeet') return v.category === 'sangeet' || v.title.toLowerCase().includes('sangeet');
    return true;
  });

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  return (
    <section id="wedding-highlights-section" className="relative py-16 scroll-mt-24">
      {/* Subtle glowing ambient backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#d4af37]/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181820] border border-[#d4af37]/40 text-xs font-semibold text-[#d4af37] shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>4K Ultra HD Wedding Films & Highlights</span>
          </div>
          <h2 className="font-cinzel text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'all', label: 'All Highlights' },
            { id: 'barat', label: 'Royal Barat & Varmala' },
            { id: 'teaser', label: 'Cinematic Teasers' },
            { id: 'sangeet', label: 'Haldi & Sangeet' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${
                activeFilter === tab.id
                  ? 'bg-[#d4af37] text-black border-[#d4af37] font-semibold shadow-lg shadow-[#d4af37]/20 scale-105'
                  : 'bg-[#14141a] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Highlights Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-12 bg-[#121216] border border-zinc-800/80 rounded-2xl p-8 max-w-lg mx-auto">
            <Film className="w-12 h-12 text-[#d4af37]/60 mx-auto mb-3" />
            <h3 className="font-cinzel text-lg font-bold text-white mb-1">No Highlights Available Yet</h3>
            <p className="text-xs text-zinc-400">Admin can upload new wedding highlight videos directly from the dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayList.map((item) => (
              <div
                key={item.id}
                id={`highlight-card-${item.id}`}
                onClick={() => handlePlay(item)}
                className="group relative bg-[#121218] border border-[#262632] hover:border-[#d4af37]/70 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#d4af37]/10 flex flex-col cursor-pointer"
              >
                {/* Thumbnail Container with Play overlay */}
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-black/20 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#d4af37]/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-115 group-hover:bg-[#e8cd78] transition-all">
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/80 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/40">
                      {item.resolution || '4K Ultra HD'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-black/80 backdrop-blur-md text-zinc-200 border border-zinc-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#d4af37]" />
                      {item.duration}
                    </span>
                  </div>

                  {/* Format pill */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900/90 text-zinc-300 border border-zinc-700">
                      {item.format} • {item.sizeFormatted}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#d4af37] font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.weddingDate || item.eventDate}</span>
                      {item.customerName && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-300 font-normal">{item.customerName}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-cinzel text-base font-bold text-white group-hover:text-[#f5e7b2] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>5 TB Secure Stream</span>
                    </div>

                    <button
                      onClick={(e) => handleShare(item, e)}
                      id={`btn-share-highlight-${item.id}`}
                      className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                      title="Copy Share Link"
                    >
                      {copiedId === item.id ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Bar */}
        {onBookClick && (
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#181824] via-[#1a1a28] to-[#181824] border border-[#d4af37]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                Want a Royal 4K Cinematic Highlight for Your Wedding?
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400">
                Full ceremony coverage, drone aerials, gimbal slow motion & licensed audio design across Odisha.
              </p>
            </div>
            <button
              onClick={onBookClick}
              id="btn-book-cinematography-cta"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c86e] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-[#d4af37]/20 whitespace-nowrap"
            >
              Book Wedding Cinematography
            </button>
          </div>
        )}
      </div>

      {/* Video Streaming Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        allowDownload={true}
      />
    </section>
  );
};
