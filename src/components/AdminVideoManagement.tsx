import React, { useState, useEffect } from 'react';
import {
  Film,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Play,
  Copy,
  CheckCircle,
  Eye,
  Shield,
  Clock,
  Sparkles,
  Calendar,
  User,
  HardDrive,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { WeddingVideoItem, VideoVisibility, VideoCategory, SupportedVideoFormat } from '../types';
import { api } from '../services/api';
import { VideoPlayerModal } from './VideoPlayerModal';

export const AdminVideoManagement: React.FC = () => {
  const [videos, setVideos] = useState<WeddingVideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<WeddingVideoItem | null>(null);
  const [selectedVideoToPlay, setSelectedVideoToPlay] = useState<WeddingVideoItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<VideoCategory>('highlight');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formOrderId, setFormOrderId] = useState('');
  const [formBookingId, setFormBookingId] = useState('');
  const [formWeddingDate, setFormWeddingDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('4:30');
  const [formResolution, setFormResolution] = useState('4K Ultra HD');
  const [formFormat, setFormFormat] = useState<SupportedVideoFormat>('MP4');
  const [formSizeBytes, setFormSizeBytes] = useState<number>(850000000);
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formStreamUrl, setFormStreamUrl] = useState('');
  const [formVisibility, setFormVisibility] = useState<VideoVisibility>('Public Portfolio');
  const [formIsHighlight, setFormIsHighlight] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await api.getVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormCategory('highlight');
    setFormCustomerName('');
    setFormOrderId('SPJ-ORD-1001');
    setFormBookingId('SPJ-BK-1001');
    setFormWeddingDate(new Date().toISOString().split('T')[0]);
    setFormDescription('Cinematic 4K wedding film filmed by Sushil Meher with gimbal stabilization and licensed soundtrack.');
    setFormDuration('4:15');
    setFormResolution('4K Ultra HD');
    setFormFormat('MP4');
    setFormSizeBytes(880000000);
    setFormThumbnailUrl('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85');
    setFormStreamUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setFormVisibility('Public Portfolio');
    setFormIsHighlight(true);
    setIsModalOpen(true);
  };

  const openEditModal = (vid: WeddingVideoItem) => {
    setEditingVideo(vid);
    setFormTitle(vid.title);
    setFormCategory(vid.category);
    setFormCustomerName(vid.customerName || '');
    setFormOrderId(vid.orderId || '');
    setFormBookingId(vid.bookingId || '');
    setFormWeddingDate(vid.weddingDate || vid.eventDate || '');
    setFormDescription(vid.description || '');
    setFormDuration(vid.duration || '4:30');
    setFormResolution(vid.resolution || '4K Ultra HD');
    setFormFormat(vid.format || 'MP4');
    setFormSizeBytes(vid.sizeBytes);
    setFormThumbnailUrl(vid.thumbnailUrl);
    setFormStreamUrl(vid.streamUrl);
    setFormVisibility(vid.visibility);
    setFormIsHighlight(Boolean(vid.isHighlight));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload: Partial<WeddingVideoItem> = {
        title: formTitle,
        category: formCategory,
        customerName: formCustomerName,
        orderId: formOrderId,
        bookingId: formBookingId,
        weddingDate: formWeddingDate,
        description: formDescription,
        duration: formDuration,
        resolution: formResolution,
        format: formFormat,
        sizeBytes: Number(formSizeBytes) || 850000000,
        thumbnailUrl: formThumbnailUrl,
        streamUrl: formStreamUrl,
        downloadUrl: formStreamUrl,
        visibility: formVisibility,
        isHighlight: formIsHighlight,
      };

      if (editingVideo) {
        await api.updateVideo(editingVideo.id, payload);
      } else {
        await api.uploadVideo(payload);
      }

      setIsModalOpen(false);
      loadVideos();
    } catch (err: any) {
      alert('Error saving video: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this wedding video from 5 TB cloud storage?')) return;
    try {
      await api.deleteVideo(id);
      loadVideos();
    } catch (err: any) {
      alert('Failed to delete video: ' + err.message);
    }
  };

  const handleCopyPrivateLink = async (video: WeddingVideoItem) => {
    try {
      const res = await api.getVideoSignedUrl(video.id);
      navigator.clipboard.writeText(res.signedStreamUrl);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      const fallbackUrl = `${window.location.origin}/#private-vault?order=${video.orderId}`;
      navigator.clipboard.writeText(fallbackUrl);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.customerName && v.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (v.orderId && v.orderId.toLowerCase().includes(search.toLowerCase()));

    const matchCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'highlight' && v.isHighlight) ||
      (categoryFilter === 'full' && v.category === 'full_wedding_film');

    const matchVisibility =
      visibilityFilter === 'all' || v.visibility === visibilityFilter;

    return matchSearch && matchCategory && matchVisibility;
  });

  return (
    <div id="admin-video-management" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121216] border border-zinc-800 rounded-2xl p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-cinzel text-lg font-bold text-white">
              Wedding Video & Highlights Library
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Upload and manage 4K wedding films, highlights, teasers, and customer access permissions in 5 TB storage.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          id="btn-upload-wedding-video-admin"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6c86e] text-black font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#d4af37]/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Wedding Video / Highlight</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14141c] border border-zinc-800/80 rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, customer, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
            <span className="text-zinc-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-zinc-300 font-medium focus:outline-none"
            >
              <option value="all" className="bg-zinc-900">All Types</option>
              <option value="highlight" className="bg-zinc-900">Highlights Only</option>
              <option value="full" className="bg-zinc-900">Full Films Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg">
            <span className="text-zinc-500">Privacy:</span>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="bg-transparent text-zinc-300 font-medium focus:outline-none"
            >
              <option value="all" className="bg-zinc-900">All Visibilities</option>
              <option value="Public Portfolio" className="bg-zinc-900">Public Portfolio</option>
              <option value="Customer Only" className="bg-zinc-900">Customer Only</option>
              <option value="Private" className="bg-zinc-900">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div className="py-16 text-center text-zinc-400 text-xs">Loading video storage...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16 bg-[#121216] border border-zinc-800 rounded-2xl p-8">
          <Film className="w-12 h-12 text-[#d4af37]/40 mx-auto mb-2" />
          <h4 className="font-cinzel text-base font-bold text-white">No Wedding Videos Found</h4>
          <p className="text-xs text-zinc-400 mt-1">Upload your first 4K video to start organizing client media.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-[#121218] border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      onClick={() => {
                        setSelectedVideoToPlay(video);
                        setIsPlayerOpen(true);
                      }}
                      className="w-12 h-12 rounded-full bg-[#d4af37] text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                      title="Preview Video"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-[#d4af37] border border-[#d4af37]/30">
                      {video.resolution || '4K UHD'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 bg-black/80">
                      {video.format}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        video.visibility === 'Public Portfolio'
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                          : video.visibility === 'Customer Only'
                          ? 'bg-sky-950/80 text-sky-400 border-sky-700/60'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {video.visibility}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                    {video.duration} • {video.sizeFormatted}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#d4af37]">
                    <span className="font-semibold">{video.category.replace(/_/g, ' ').toUpperCase()}</span>
                    <span>{video.weddingDate || video.eventDate}</span>
                  </div>

                  <h4 className="font-cinzel text-sm font-bold text-white line-clamp-1">
                    {video.title}
                  </h4>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-[11px] text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span>Patron / Couple:</span>
                      <span className="text-zinc-200 font-medium">{video.customerName || 'General'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Linked Order ID:</span>
                      <span className="font-mono text-[#d4af37]">{video.orderId || 'SPJ-ORD-1001'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Storage Path:</span>
                      <span className="font-mono text-zinc-500 text-[10px] truncate max-w-[160px]">{video.storagePath}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCopyPrivateLink(video)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-[11px]"
                  title="Copy Signed Streaming Link"
                >
                  {copiedId === video.id ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Signed Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Private Link</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(video)}
                    id={`btn-edit-video-${video.id}`}
                    className="p-1.5 hover:text-[#d4af37] hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Edit Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(video.id)}
                    id={`btn-delete-video-${video.id}`}
                    className="p-1.5 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#14141c] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Film className="w-5 h-5 text-[#d4af37]" />
                <h3 className="font-cinzel text-lg font-bold text-white">
                  {editingVideo ? 'Edit Wedding Video Details' : 'Upload & Register Wedding Video / Highlight'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">Video Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Barat Procession & Varmala Royal Highlight | Priya & Rajesh"
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Video Type / Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const val = e.target.value as VideoCategory;
                      setFormCategory(val);
                      setFormIsHighlight(val === 'highlight' || val === 'teaser');
                    }}
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="highlight">Wedding Highlight</option>
                    <option value="full_wedding_film">Full Wedding Film</option>
                    <option value="teaser">Cinematic Teaser</option>
                    <option value="sangeet">Sangeet & Haldi Reel</option>
                    <option value="raw_footage">Raw Footage</option>
                    <option value="drone_aerial">Drone Aerial Shots</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Privacy / Access Setting</label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value as VideoVisibility)}
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Public Portfolio">Public Portfolio (Shows in Highlights Showcase)</option>
                    <option value="Customer Only">Customer Only (Visible in Private Vault)</option>
                    <option value="Private">Private (Admin only / Internal Archive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Customer / Couple Name</label>
                  <input
                    type="text"
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    placeholder="Priya & Rajesh"
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Order ID</label>
                  <input
                    type="text"
                    value={formOrderId}
                    onChange={(e) => setFormOrderId(e.target.value)}
                    placeholder="SPJ-ORD-1001"
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Wedding Date</label>
                  <input
                    type="date"
                    value={formWeddingDate}
                    onChange={(e) => setFormWeddingDate(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Duration (MM:SS or HH:MM:SS)</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="4:15 or 1:22:00"
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Format</label>
                  <select
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value as SupportedVideoFormat)}
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="MP4">MP4 (Recommended)</option>
                    <option value="MOV">MOV (Apple ProRes)</option>
                    <option value="M4V">M4V</option>
                    <option value="WEBM">WEBM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold">Resolution</label>
                  <select
                    value={formResolution}
                    onChange={(e) => setFormResolution(e.target.value)}
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="4K Ultra HD">4K Ultra HD (3840x2160)</option>
                    <option value="1080p Full HD">1080p Full HD (1920x1080)</option>
                    <option value="720p HD">720p HD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">Thumbnail URL *</label>
                <input
                  type="url"
                  required
                  value={formThumbnailUrl}
                  onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">Video Stream / Storage File URL</label>
                <input
                  type="url"
                  required
                  value={formStreamUrl}
                  onChange={(e) => setFormStreamUrl(e.target.value)}
                  placeholder="https://commondatastorage.googleapis.com/.../video.mp4"
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Emotional highlights, cinematic moments..."
                  className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="btn-save-video-submit"
                  className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold hover:bg-[#e6c86e] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to 5 TB Cloud...' : editingVideo ? 'Save Changes' : 'Upload Video to Cloud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Streaming Modal */}
      <VideoPlayerModal
        video={selectedVideoToPlay}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        allowDownload={true}
      />
    </div>
  );
};
