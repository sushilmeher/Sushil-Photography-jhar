import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Film,
  Image as ImageIcon,
  Download,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle,
  Play,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Search,
} from 'lucide-react';
import { PrivateCustomerGallery, WeddingVideoItem } from '../types';
import { api } from '../services/api';
import { VideoPlayerModal } from './VideoPlayerModal';
import { Lightbox } from './Lightbox';

interface PrivateWeddingGalleryProps {
  initialOrderId?: string;
  initialPhone?: string;
}

export const PrivateWeddingGallery: React.FC<PrivateWeddingGalleryProps> = ({
  initialOrderId,
  initialPhone,
}) => {
  const [gallery, setGallery] = useState<PrivateCustomerGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'highlights' | 'edited' | 'album' | 'delivery'>('videos');
  const [searchQuery, setSearchQuery] = useState(initialOrderId || initialPhone || 'SPJ-ORD-1001');

  // Video Player state
  const [selectedVideo, setSelectedVideo] = useState<WeddingVideoItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Photo Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Album flipbook sheet index
  const [activeAlbumSheet, setActiveAlbumSheet] = useState<number>(0);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadGallery(searchQuery);
  }, []);

  const loadGallery = async (query: string) => {
    try {
      setLoading(true);
      const data = await api.getCustomerGallery(query);
      setGallery(data);
    } catch (err) {
      console.error('Failed to load private gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadGallery(searchQuery.trim());
    }
  };

  const handlePlayVideo = (video: WeddingVideoItem) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };

  const triggerDownload = (fileName: string, url: string) => {
    setDownloadSuccess(`Initiating secure download of "${fileName}"...`);
    setTimeout(() => setDownloadSuccess(null), 4000);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading && !gallery) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 font-cinzel text-sm">Accessing Secure 5 TB Wedding Vault...</p>
      </div>
    );
  }

  return (
    <div id="private-wedding-gallery" className="space-y-8">
      {/* Vault Authentication & Verification Header */}
      <div className="bg-gradient-to-r from-[#14141c] via-[#181824] to-[#14141c] border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private Encrypted Wedding Vault</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {gallery?.customer.name || 'Private Wedding Media Vault'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span>Order ID: <span className="text-zinc-200 font-mono">{gallery?.customer.orderId}</span></span>
              <span>•</span>
              <span>Booking ID: <span className="text-zinc-200 font-mono">{gallery?.customer.bookingId}</span></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                {gallery?.customer.weddingDate}
              </span>
            </div>
          </div>

          {/* Quick Access ID Switcher */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <input
                type="text"
                placeholder="Enter Order ID or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <button
              type="submit"
              id="btn-switch-vault-id"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-[#d4af37] hover:text-black border border-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup Vault</span>
            </button>
          </form>
        </div>
      </div>

      {/* Download Alert toast */}
      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* 5 Structural Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
        {[
          { id: 'videos', label: 'Wedding Videos (Full Film)', icon: Film, count: gallery?.videos.length || 0 },
          { id: 'highlights', label: 'Wedding Highlights', icon: Sparkles, count: gallery?.highlights.length || 0 },
          { id: 'photos', label: 'Photos Collection', icon: ImageIcon, count: gallery?.photos.length || 0 },
          { id: 'edited', label: 'Final Edited Files', icon: CheckCircle, count: gallery?.editedPhotos.length || 0 },
          { id: 'album', label: 'Album Preview (12x36)', icon: BookOpen, count: gallery?.albumPreview.sheetsCount || 0 },
          { id: 'delivery', label: 'Delivery Bundle', icon: Download, count: 1 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              id={`tab-vault-${tab.id}`}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? 'bg-[#d4af37] text-black font-semibold shadow-lg shadow-[#d4af37]/20 scale-105'
                  : 'bg-[#14141c] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Wedding Videos */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-[#d4af37]" />
              <span>Full Wedding Feature Films</span>
            </h3>
            <span className="text-xs text-zinc-400">Stream in 4K HDR or Download High-Bitrate Master</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gallery?.videos.map((vid) => (
              <div
                key={vid.id}
                className="group bg-[#121218] border border-zinc-800 hover:border-[#d4af37]/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-xl"
              >
                <div
                  className="relative aspect-video bg-black cursor-pointer overflow-hidden"
                  onClick={() => handlePlayVideo(vid)}
                >
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#d4af37] text-black flex items-center justify-center shadow-2xl group-hover:scale-115 transition-all">
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 text-[10px] font-bold text-[#d4af37] border border-[#d4af37]/40">
                    {vid.resolution || '4K Ultra HD'}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                    {vid.duration} • {vid.sizeFormatted}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-cinzel text-base font-bold text-white line-clamp-1">
                      {vid.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {vid.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => handlePlayVideo(vid)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] text-xs font-semibold transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Stream Online</span>
                    </button>

                    <button
                      onClick={() => triggerDownload(vid.title + '.' + vid.format.toLowerCase(), vid.downloadUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ({vid.sizeFormatted})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Wedding Highlights */}
      {activeTab === 'highlights' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              <span>Wedding Highlight Teasers & Reels</span>
            </h3>
            <span className="text-xs text-zinc-400">Perfect for Instagram & WhatsApp Family Sharing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery?.highlights.map((hl) => (
              <div
                key={hl.id}
                className="group bg-[#121218] border border-zinc-800 hover:border-[#d4af37]/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-xl"
              >
                <div
                  className="relative aspect-video bg-black cursor-pointer overflow-hidden"
                  onClick={() => handlePlayVideo(hl)}
                >
                  <img
                    src={hl.thumbnailUrl}
                    alt={hl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37] text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-all">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-[#d4af37]">
                    {hl.resolution || '4K UHD'}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                    {hl.duration}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white line-clamp-1">
                      {hl.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {hl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => handlePlayVideo(hl)}
                      className="text-xs font-semibold text-[#d4af37] hover:underline"
                    >
                      Watch 4K Teaser
                    </button>
                    <button
                      onClick={() => triggerDownload(hl.title + '.' + hl.format.toLowerCase(), hl.downloadUrl)}
                      className="p-1.5 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Download Teaser"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Photos Collection */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#d4af37]" />
              <span>High-Resolution Photo Gallery</span>
            </h3>
            <button
              onClick={() => triggerDownload('All_Wedding_Photos.zip', gallery?.photos[0]?.url || '')}
              className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-[#d4af37] hover:text-black border border-zinc-700 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All Photos (ZIP)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery?.photos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => setLightboxIndex(idx)}
                className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-[#d4af37]/60 cursor-pointer shadow-lg"
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <span className="text-white text-xs font-medium truncate">{photo.title}</span>
                  <span className="text-[10px] text-zinc-400">{photo.category} • {photo.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Final Edited Files */}
      {activeTab === 'edited' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Master Color Graded Retouched Portraits</span>
            </h3>
            <span className="text-xs text-zinc-400">Color Graded for 300 DPI Fine Art Printing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gallery?.editedPhotos.map((item) => (
              <div
                key={item.id}
                className="bg-[#121218] border border-zinc-800 rounded-2xl overflow-hidden p-4 space-y-3"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-semibold text-white truncate max-w-[180px]">{item.title}</h5>
                    <span className="text-[10px] font-mono text-zinc-400">{item.size}</span>
                  </div>
                  <button
                    onClick={() => triggerDownload(item.title, item.url)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-[#d4af37] hover:text-black transition-colors"
                    title="Download Master Jpeg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Album Preview (12x36 Photobook Viewer) */}
      {activeTab === 'album' && gallery?.albumPreview && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#d4af37]" />
                <span>{gallery.albumPreview.title}</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Layflat panoramic spreads. Sheet {activeAlbumSheet + 1} of {gallery.albumPreview.sheets.length}
              </p>
            </div>

            <button
              onClick={() => triggerDownload('Album_Print_Ready_Proof.pdf', gallery.albumPreview.pdfUrl)}
              className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-semibold text-xs flex items-center gap-2 hover:bg-[#e6c86e] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 300 DPI PDF Proof</span>
            </button>
          </div>

          {/* Interactive Layflat Spread Canvas */}
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-4 sm:p-8 flex items-center justify-center shadow-2xl">
            <div className="relative w-full max-w-4xl aspect-[2/1] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-black flex items-center justify-center">
              <img
                src={gallery.albumPreview.sheets[activeAlbumSheet]}
                alt={`Spread ${activeAlbumSheet + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Spine crease shadow simulation */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/20 via-black/50 to-black/20 pointer-events-none" />
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setActiveAlbumSheet((prev) => Math.max(0, prev - 1))}
              disabled={activeAlbumSheet === 0}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-[#d4af37] hover:text-black border border-zinc-700 text-white flex items-center justify-center disabled:opacity-30 transition-all shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveAlbumSheet((prev) => Math.min(gallery.albumPreview.sheets.length - 1, prev + 1))}
              disabled={activeAlbumSheet === gallery.albumPreview.sheets.length - 1}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-[#d4af37] hover:text-black border border-zinc-700 text-white flex items-center justify-center disabled:opacity-30 transition-all shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Sheet Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto py-2">
            {gallery.albumPreview.sheets.map((sheet, idx) => (
              <button
                key={idx}
                onClick={() => setActiveAlbumSheet(idx)}
                className={`relative flex-shrink-0 w-28 aspect-[2/1] rounded-lg overflow-hidden border transition-all ${
                  activeAlbumSheet === idx
                    ? 'border-[#d4af37] scale-105 shadow-md shadow-[#d4af37]/20 ring-1 ring-[#d4af37]'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={sheet} alt={`Sheet ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[8px] font-mono text-zinc-300">
                  #{idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Delivery Bundle */}
      {activeTab === 'delivery' && gallery?.finalDelivery && (
        <div className="space-y-6">
          <div className="bg-[#121218] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                  Status: {gallery.finalDelivery.status}
                </span>
                <h3 className="font-cinzel text-xl font-bold text-white pt-2">
                  Official Wedding Delivery Package
                </h3>
                <p className="text-xs text-zinc-400">
                  Delivered on {gallery.finalDelivery.deliveryDate} with complete cloud backups in 5 TB storage.
                </p>
              </div>
            </div>

            {/* Delivered Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gallery.finalDelivery.fullWeddingFilm && (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="text-sm font-semibold text-white">Full Wedding Feature Film 4K</h5>
                    <p className="text-xs text-zinc-400">{gallery.finalDelivery.fullWeddingFilm.sizeFormatted}</p>
                  </div>
                  <button
                    onClick={() => triggerDownload('Full_Wedding_Film.mp4', gallery.finalDelivery?.fullWeddingFilm?.downloadUrl || '')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#d4af37] hover:text-black text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}

              {gallery.finalDelivery.weddingHighlight && (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="text-sm font-semibold text-white">4K Cinematic Teaser Highlight</h5>
                    <p className="text-xs text-zinc-400">{gallery.finalDelivery.weddingHighlight.sizeFormatted}</p>
                  </div>
                  <button
                    onClick={() => triggerDownload('Wedding_Highlight.mp4', gallery.finalDelivery?.weddingHighlight?.downloadUrl || '')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#d4af37] hover:text-black text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}

              {gallery.finalDelivery.editedPhotos && (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="text-sm font-semibold text-white">350 Edited Master Portraits (ZIP)</h5>
                    <p className="text-xs text-zinc-400">{gallery.finalDelivery.editedPhotos.sizeFormatted}</p>
                  </div>
                  <button
                    onClick={() => triggerDownload('Edited_Portraits_350.zip', gallery.finalDelivery?.editedPhotos?.downloadZipUrl || '')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#d4af37] hover:text-black text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}

              {gallery.finalDelivery.finalAlbumFiles && (
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="text-sm font-semibold text-white">Photobook Print Masters (12x36 PDF)</h5>
                    <p className="text-xs text-zinc-400">{gallery.finalDelivery.finalAlbumFiles.sizeFormatted}</p>
                  </div>
                  <button
                    onClick={() => triggerDownload('Album_Print_Master.pdf', gallery.finalDelivery?.finalAlbumFiles?.downloadUrl || '')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#d4af37] hover:text-black text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Streaming Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        allowDownload={true}
      />

      {/* Photo Lightbox */}
      {lightboxIndex !== null && gallery?.photos && (
        <Lightbox
          images={gallery.photos.map((p) => p.url)}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};
