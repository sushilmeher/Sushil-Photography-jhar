import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  QrCode,
  User,
  Sparkles,
  Layers,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Eye,
  FileText,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { MediaUploadPlaceholder } from './MediaUploadPlaceholder';
import { useSiteMedia } from '../hooks/useSiteMedia';
import { useFounderPhoto } from '../hooks/useFounderPhoto';
import { SmartMediaItem, SmartMediaCategory } from '../types';
import { api } from '../services/api';

export const AdminMediaUploadCenter: React.FC = () => {
  const { config: siteMedia, updateConfig } = useSiteMedia();
  const { photoUrl: founderPhoto, updatePhoto: updateFounderPhoto } = useFounderPhoto();
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'logos' | 'photographer' | 'payment' | 'services' | 'gallery' | 'library'
  >('logos');
  const [mediaList, setMediaList] = useState<SmartMediaItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<SmartMediaItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchMediaLibrary = async () => {
    setIsLoadingList(true);
    try {
      const items = await api.getMediaList();
      setMediaList(items);
    } catch (err) {
      console.warn('Could not load media library:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchMediaLibrary();
  }, []);

  const handleDeleteMediaItem = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this media item?')) {
      try {
        await api.deleteMedia(id);
        setMediaList((prev) => prev.filter((m) => m.id !== id));
        setStatusMessage('Media removed successfully.');
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err: any) {
        alert('Delete failed: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleFounderPhotoUploaded = (url: string) => {
    updateFounderPhoto(url);
    updateConfig({ photographerPhoto: url });
    setStatusMessage('Photographer photo updated across Home and About sections!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const categories = [
    { id: 'logos', label: '1. Business Logos', icon: ImageIcon },
    { id: 'photographer', label: '2. Photographer Photo', icon: User },
    { id: 'payment', label: '3. Payment QR Code', icon: QrCode },
    { id: 'services', label: '4. Service Portfolio Placeholders', icon: Layers },
    { id: 'gallery', label: '5. Gallery & Video Highlights', icon: Sparkles },
    { id: 'library', label: '6. All Uploaded Files Library', icon: FileText },
  ];

  return (
    <div id="admin-media-upload-center" className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#14141d] border border-[#272732]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Smart Media Upload System</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            Website Media & Upload Placeholders
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Upload and manage every required logo, artist portrait, payment QR code, and portfolio sample. Uploaded media automatically reflects in its exact position on the live website.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMediaLibrary}
          disabled={isLoadingList}
          className="px-4 py-2 rounded-xl bg-[#22222d] hover:bg-[#2c2c3b] border border-[#333342] text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
          <span>Refresh Files</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#272732]">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20 font-bold'
                  : 'bg-[#14141d] border border-[#272732] text-zinc-300 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* 1. BUSINESS LOGOS */}
      {/* ==================================================== */}
      {activeCategory === 'logos' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#d4af37]" />
              <span>Business Logo Placeholders</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Upload official logo versions. Supported formats: PNG, JPG, WEBP, SVG (with transparency).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Main Website Logo */}
            <div className="p-5 rounded-3xl bg-[#14141d] border border-[#272732] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Main Website Logo</span>
                <span className="text-[10px] text-zinc-500 font-mono">Slot: logoMain</span>
              </div>
              <MediaUploadPlaceholder
                label="Upload Business Logo"
                subText="Main Website Logo"
                supportedFormatsText="PNG, JPG, WEBP, SVG • Max 15MB"
                slotKey="logoMain"
                category="Business Logo"
                usedIn="Global Brand Identity"
                currentUrl={siteMedia.logoMain}
                aspectRatio="square"
                onUploadSuccess={() => fetchMediaLibrary()}
              />
              <p className="text-[11px] text-zinc-400">
                Primary logo displayed in hero sections, invoices, and receipts.
              </p>
            </div>

            {/* Header Logo */}
            <div className="p-5 rounded-3xl bg-[#14141d] border border-[#272732] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Header / Navbar Logo</span>
                <span className="text-[10px] text-zinc-500 font-mono">Slot: logoHeader</span>
              </div>
              <MediaUploadPlaceholder
                label="Upload Header Logo"
                subText="Sticky Navigation Bar"
                supportedFormatsText="PNG, SVG, WEBP • Max 15MB"
                slotKey="logoHeader"
                category="Business Logo"
                usedIn="Header Navbar"
                currentUrl={siteMedia.logoHeader}
                aspectRatio="square"
                onUploadSuccess={() => fetchMediaLibrary()}
              />
              <p className="text-[11px] text-zinc-400">
                Shows in the top sticky navbar across all pages.
              </p>
            </div>

            {/* Footer Logo */}
            <div className="p-5 rounded-3xl bg-[#14141d] border border-[#272732] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Footer Logo</span>
                <span className="text-[10px] text-zinc-500 font-mono">Slot: logoFooter</span>
              </div>
              <MediaUploadPlaceholder
                label="Upload Footer Logo"
                subText="Website Footer Section"
                supportedFormatsText="PNG, SVG, WEBP • Max 15MB"
                slotKey="logoFooter"
                category="Business Logo"
                usedIn="Footer"
                currentUrl={siteMedia.logoFooter}
                aspectRatio="square"
                onUploadSuccess={() => fetchMediaLibrary()}
              />
              <p className="text-[11px] text-zinc-400">
                Displays in the bottom footer next to studio copyright info.
              </p>
            </div>

            {/* Mobile Logo */}
            <div className="p-5 rounded-3xl bg-[#14141d] border border-[#272732] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Mobile Menu Logo</span>
                <span className="text-[10px] text-zinc-500 font-mono">Slot: logoMobile</span>
              </div>
              <MediaUploadPlaceholder
                label="Upload Mobile Logo"
                subText="Mobile Navigation Drawer"
                supportedFormatsText="PNG, SVG, WEBP • Max 15MB"
                slotKey="logoMobile"
                category="Business Logo"
                usedIn="Mobile Menu"
                currentUrl={siteMedia.logoMobile}
                aspectRatio="square"
                onUploadSuccess={() => fetchMediaLibrary()}
              />
              <p className="text-[11px] text-zinc-400">
                Optimized compact logo for mobile screens and drawers.
              </p>
            </div>

            {/* Favicon */}
            <div className="p-5 rounded-3xl bg-[#14141d] border border-[#272732] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Browser Tab Favicon</span>
                <span className="text-[10px] text-zinc-500 font-mono">Slot: logoFavicon</span>
              </div>
              <MediaUploadPlaceholder
                label="Upload Favicon"
                subText="Browser Tab Icon"
                supportedFormatsText="PNG, ICO, SVG • 32x32 to 512x512"
                slotKey="logoFavicon"
                category="Business Logo"
                usedIn="Browser Tab & Bookmark"
                currentUrl={siteMedia.logoFavicon}
                aspectRatio="square"
                onUploadSuccess={() => fetchMediaLibrary()}
              />
              <p className="text-[11px] text-zinc-400">
                Displays in browser tabs and home screen app shortcuts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. PHOTOGRAPHER PHOTO */}
      {/* ==================================================== */}
      {activeCategory === 'photographer' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#d4af37]" />
              <span>Photographer Photo Upload</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Upload Sushil Meher's portrait. Uploaded photo automatically updates the About section and Home page artist profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="p-6 rounded-3xl bg-[#14141d] border border-[#272732] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Upload Photographer Photo</span>
                <span className="text-[10px] text-zinc-500 font-mono">Slot: photographerPhoto</span>
              </div>
              <MediaUploadPlaceholder
                label="Upload Photographer Photo"
                subText="Click or Drag & Drop Portrait"
                supportedFormatsText="PNG, JPG, WEBP • Max 25MB"
                slotKey="photographerPhoto"
                category="Photographer Photo"
                usedIn="About section & Home artist profile"
                currentUrl={siteMedia.photographerPhoto || founderPhoto}
                aspectRatio="portrait"
                onUploadSuccess={(url) => {
                  handleFounderPhotoUploaded(url);
                  fetchMediaLibrary();
                }}
              />
            </div>

            <div className="p-6 rounded-3xl bg-[#111116] border border-[#272732] space-y-4">
              <h4 className="text-sm font-bold text-white">Photo Placement Details</h4>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Artist Profile Card:</strong> Displayed prominently on the About Page alongside bio and credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Home Page Feature:</strong> Featured in the "Meet Founder Sushil Meher" section.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Recommended Dimensions:</strong> Vertical portrait ratio (4:5 or 3:4), minimum 800x1000px resolution.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. PAYMENT QR CODE */}
      {/* ==================================================== */}
      {activeCategory === 'payment' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#d4af37]" />
              <span>Payment QR Code Upload</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Upload official UPI Payment QR Code. Uploaded QR Code automatically appears in the dedicated "Pay via UPI" section.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="p-6 rounded-3xl bg-[#14141d] border border-[#272732] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Upload UPI Payment QR Code</span>
                <span className="text-[10px] text-zinc-500 font-mono">Slot: paymentQrCode</span>
              </div>
              <MediaUploadPlaceholder
                label="Upload UPI Payment QR Code"
                subText="Click or Drag & Drop UPI QR"
                supportedFormatsText="PNG, JPG, WEBP, SVG • Max 10MB"
                slotKey="paymentQrCode"
                category="Payment QR"
                usedIn="Pay via UPI section"
                currentUrl={siteMedia.paymentQrCode}
                aspectRatio="square"
                onUploadSuccess={() => fetchMediaLibrary()}
              />
            </div>

            <div className="p-6 rounded-3xl bg-[#111116] border border-[#272732] space-y-4">
              <h4 className="text-sm font-bold text-white">UPI Payment Rules</h4>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Live Sync:</strong> When uploaded, customers see this QR code immediately in the "Pay via UPI" tab.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Supported Apps:</strong> Compatible with Google Pay, PhonePe, Paytm, BHIM, and Cred.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Recommended Aspect:</strong> Square 1:1, crisp black-and-white or high-contrast image.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. SERVICE PORTFOLIO PLACEHOLDERS */}
      {/* ==================================================== */}
      {activeCategory === 'services' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d4af37]" />
              <span>Service Portfolio Placeholders</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Upload representative sample media for all 9 studio services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Wedding Photography',
                slot: 'service_wedding_photo',
                sub: 'Traditional & Candid rituals',
                isVideo: false,
              },
              {
                title: 'Wedding Cinematography',
                slot: 'service_cinematography',
                sub: 'Teaser reels & 4K wedding films',
                isVideo: true,
              },
              {
                title: 'Pre-Wedding Shoot',
                slot: 'service_pre_wedding',
                sub: 'Outdoor romantic cinematic couple shoots',
                isVideo: false,
              },
              {
                title: 'Album Design & Printing',
                slot: 'service_album_design',
                sub: '12x36 royal glossy photobooks',
                isVideo: false,
              },
              {
                title: 'Photo Editing & Retouching',
                slot: 'service_photo_editing',
                sub: 'Skin tones, lighting, background cleanup',
                isVideo: false,
              },
              {
                title: 'Wedding Highlights Reel',
                slot: 'service_wedding_highlights',
                sub: '3 to 5 minute emotional highlight cut',
                isVideo: true,
              },
              {
                title: 'Photo Frames Studio',
                slot: 'service_photo_frames',
                sub: 'Canvas, Acrylic & Wooden luxury wall frames',
                isVideo: false,
              },
              {
                title: 'Wedding Cards & Invitations',
                slot: 'service_wedding_cards',
                sub: 'Digital video invites & printed wedding cards',
                isVideo: false,
              },
              {
                title: 'Passport Photos & Urgent Prints',
                slot: 'service_passport_photo',
                sub: 'Instant 5-minute passport & visa size prints',
                isVideo: false,
              },
            ].map((svc) => (
              <div key={svc.slot} className="p-5 rounded-3xl bg-[#14141d] border border-[#272732] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{svc.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {svc.isVideo ? 'Video/MP4' : 'Image'}
                  </span>
                </div>
                <MediaUploadPlaceholder
                  label={svc.isVideo ? `Upload ${svc.title} Sample Video` : `Upload ${svc.title} Sample Image`}
                  subText={svc.sub}
                  supportedFormatsText={
                    svc.isVideo
                      ? 'MP4, MOV, WEBM • Max 100MB'
                      : 'PNG, JPG, WEBP • Max 25MB'
                  }
                  accept={
                    svc.isVideo
                      ? 'video/mp4,video/quicktime,video/webm'
                      : 'image/png,image/jpeg,image/jpg,image/webp'
                  }
                  maxSizeMB={svc.isVideo ? 100 : 25}
                  category="Service Portfolio"
                  slotKey={svc.slot}
                  usedIn={`${svc.title} Service Page`}
                  aspectRatio={svc.isVideo ? 'video' : 'square'}
                  onUploadSuccess={() => fetchMediaLibrary()}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. GALLERY & HIGHLIGHTS PLACEHOLDERS */}
      {/* ==================================================== */}
      {activeCategory === 'gallery' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>Gallery & Highlights Placeholders</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Manage upload boxes for wedding gallery grids, event highlights, and 4K video showcases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Wedding Gallery Showcase',
                slot: 'gallery_wedding_showcase',
                sub: 'Vedic ritual ceremonies & bride portraits',
                isVideo: false,
              },
              {
                title: 'Event Highlights Reel',
                slot: 'gallery_event_highlights',
                sub: 'Sangeet, Ring ceremony, and Haldi moments',
                isVideo: true,
              },
              {
                title: '4K Wedding Teaser Film',
                slot: 'gallery_teaser_film',
                sub: 'Cinematic trailer video',
                isVideo: true,
              },
              {
                title: 'Client Delivery Preview',
                slot: 'gallery_client_delivery',
                sub: 'Sample finished album layout spread',
                isVideo: false,
              },
            ].map((g) => (
              <div key={g.slot} className="p-5 rounded-3xl bg-[#14141d] border border-[#272732] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{g.title}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {g.isVideo ? 'Video' : 'Image'}
                  </span>
                </div>
                <MediaUploadPlaceholder
                  label={g.isVideo ? `Upload ${g.title} Video` : `Upload ${g.title} Photo`}
                  subText={g.sub}
                  supportedFormatsText={
                    g.isVideo ? 'MP4, MOV • Max 100MB' : 'JPG, PNG, WEBP • Max 25MB'
                  }
                  accept={g.isVideo ? 'video/mp4,video/quicktime' : 'image/*'}
                  maxSizeMB={g.isVideo ? 100 : 25}
                  category="Gallery Highlights"
                  slotKey={g.slot}
                  usedIn="Gallery & Portfolio"
                  aspectRatio={g.isVideo ? 'video' : 'square'}
                  onUploadSuccess={() => fetchMediaLibrary()}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. ALL UPLOADED FILES LIBRARY */}
      {/* ==================================================== */}
      {activeCategory === 'library' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-cinzel text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#d4af37]" />
                <span>Uploaded Media Library ({mediaList.length})</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Comprehensive file logs with details: file name, type, size, category, and date.
              </p>
            </div>
          </div>

          {isLoadingList ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#d4af37]" />
              <span>Loading media repository...</span>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#14141d] border border-[#272732] space-y-3">
              <UploadCloud className="w-10 h-10 text-zinc-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Uploads Logged Yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Use any of the upload placeholder boxes in the tabs above to add official logos, photos, or QR codes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaList.map((item) => {
                const isVideo = item.type?.startsWith('video/');
                const sizeFormatted = item.sizeBytes
                  ? `${(item.sizeBytes / (1024 * 1024)).toFixed(2)} MB`
                  : '—';
                const dateFormatted = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recently';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#14141d] border border-[#272732] hover:border-[#d4af37]/60 space-y-3 transition-all group"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-[#272732]">
                      {isVideo ? (
                        <video src={item.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-contain bg-zinc-950"
                        />
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#d4af37]">
                        {item.category}
                      </span>
                    </div>

                    {/* File Details */}
                    <div className="space-y-1 text-left">
                      <div className="text-xs font-bold text-white truncate" title={item.name}>
                        {item.name}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>{item.type || 'Media'}</span>
                        <span>{sizeFormatted}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Uploaded: {dateFormatted}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#272732]/60">
                      <button
                        type="button"
                        onClick={() => setSelectedPreview(item)}
                        className="text-[11px] text-zinc-300 hover:text-[#d4af37] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMediaItem(item.id)}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="bg-[#121217] border border-[#272732] rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedPreview.name}</h4>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Category: {selectedPreview.category} • Slot: {selectedPreview.slotKey || 'Custom'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-[#272732] flex items-center justify-center p-2">
              {selectedPreview.type?.startsWith('video/') ? (
                <video src={selectedPreview.url} controls autoPlay className="max-h-[60vh] w-full" />
              ) : (
                <img
                  src={selectedPreview.url}
                  alt={selectedPreview.name}
                  className="max-h-[60vh] object-contain mx-auto"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#272732]">
              <a
                href={selectedPreview.url}
                download={selectedPreview.name}
                className="px-4 py-2 rounded-xl bg-[#22222d] text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5"
              >
                Download File
              </a>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
