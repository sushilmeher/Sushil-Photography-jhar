import React, { useState } from 'react';
import {
  PackageCheck,
  Send,
  CheckCircle,
  Film,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { WeddingFinalDelivery } from '../types';

export const AdminFinalDeliveryManager: React.FC = () => {
  const [orderId, setOrderId] = useState('SPJ-ORD-1001');
  const [customerName, setCustomerName] = useState('Priya & Rajesh Sharma');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [weddingDate, setWeddingDate] = useState('2026-02-14');
  const [filmUrl, setFilmUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [highlightUrl, setHighlightUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
  const [albumPdfUrl, setAlbumPdfUrl] = useState('https://sushilphotography.com/deliveries/SPJ-ORD-1001/album-master.pdf');
  const [photosZipUrl, setPhotosZipUrl] = useState('https://sushilphotography.com/deliveries/SPJ-ORD-1001/photos-edited-master.zip');
  const [notificationNote, setNotificationNote] = useState('Namaskar! Your official Sushil Photography Jhar Wedding Film, Highlights & 300 DPI Photobook album files are now ready in your private 5 TB vault.');
  const [deliveryStatus, setDeliveryStatus] = useState<'In Editing' | 'Ready for Delivery' | 'Delivered'>('Ready for Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const deliveryPayload: Partial<WeddingFinalDelivery> = {
        orderId,
        bookingId: 'SPJ-BK-1001',
        customerId: 'CUST-1001',
        customerName,
        weddingDate,
        deliveryDate: new Date().toISOString().split('T')[0],
        status: deliveryStatus,
        fullWeddingFilm: {
          title: 'Official Full Wedding Film 4K',
          streamUrl: filmUrl,
          downloadUrl: filmUrl,
          sizeFormatted: '18.4 GB',
          duration: '01:45:20',
        },
        weddingHighlight: {
          title: 'Royal Wedding Highlight Teaser',
          streamUrl: highlightUrl,
          downloadUrl: highlightUrl,
          thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          sizeFormatted: '850 MB',
          duration: '04:35',
        },
        editedPhotos: {
          count: 350,
          downloadZipUrl: photosZipUrl,
          sizeFormatted: '4.2 GB',
          samplePhotos: [
            'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
          ],
        },
        finalAlbumFiles: {
          title: '12x36 Wedding Album Ready for Print & HD View',
          downloadUrl: albumPdfUrl,
          sizeFormatted: '1.2 GB',
        },
        notificationMessage: `Dear ${customerName}, your Sushil Photography Jhar final wedding delivery package is now accessible in your Private Vault.`,
        notificationSentAt: new Date().toISOString(),
      };

      await api.saveFinalDelivery(deliveryPayload);
      setSuccessAlert(`Final delivery package saved! Notification prepared for ${customerName} (${customerPhone}).`);
      setTimeout(() => setSuccessAlert(null), 6000);
    } catch (err: any) {
      alert('Error saving delivery package: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsAppNotification = () => {
    const vaultUrl = `${window.location.origin}/#private-vault?order=${orderId}`;
    const text = encodeURIComponent(
      `*Sushil Photography Jhar - Wedding Delivery Ready!*\n\nDear ${customerName},\nYour royal wedding film, 4K highlights, edited portraits and photobook print masters are ready in your private 5 TB media vault!\n\nAccess your private vault here:\n${vaultUrl}\n\nWith warm regards,\nSushil Meher\nFounder & Lead Artist`
    );
    window.open(`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div id="admin-final-delivery-manager" className="space-y-6">
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-5 h-5 text-[#d4af37]" />
          <h3 className="font-cinzel text-lg font-bold text-white">
            Wedding Final Delivery Package Manager
          </h3>
        </div>
        <p className="text-xs text-zinc-400">
          Bundle the Full Wedding Film, 4K Highlights, Color-Graded Portraits, and Album Files into a verified client delivery. Notify customers via WhatsApp & SMS with 5 TB vault access.
        </p>
      </div>

      {successAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successAlert}</span>
          </div>
          <button
            onClick={handleSendWhatsAppNotification}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send WhatsApp Notice</span>
          </button>
        </div>
      )}

      <form onSubmit={handleDeliver} className="bg-[#121218] border border-zinc-800 rounded-2xl p-6 space-y-6 text-xs">
        {/* Client Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold">Target Order ID</label>
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold">Couple / Customer Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold">Registered Phone / WhatsApp</label>
            <input
              type="text"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-300 font-semibold">Delivery Status</label>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value as any)}
              className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
            >
              <option value="In Editing">In Post-Production / Editing</option>
              <option value="Ready for Delivery">Ready for Client Review</option>
              <option value="Delivered">Delivered & Archived (Completed)</option>
            </select>
          </div>
        </div>

        {/* Media Package Links */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span>Delivered Package Assets (5 TB Cloud Paths)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Full Wedding Film Stream / Master Download URL</span>
              </label>
              <input
                type="url"
                required
                value={filmUrl}
                onChange={(e) => setFilmUrl(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Wedding Highlights / Teaser URL</span>
              </label>
              <input
                type="url"
                required
                value={highlightUrl}
                onChange={(e) => setHighlightUrl(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Edited Master Portraits ZIP URL (300 DPI)</span>
              </label>
              <input
                type="url"
                required
                value={photosZipUrl}
                onChange={(e) => setPhotosZipUrl(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Album Print-Ready Master PDF (12x36)</span>
              </label>
              <input
                type="url"
                required
                value={albumPdfUrl}
                onChange={(e) => setAlbumPdfUrl(e.target.value)}
                className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>

        {/* Notification Message */}
        <div className="space-y-1 pt-2">
          <label className="text-zinc-300 font-semibold">Custom Notification Message for Couple</label>
          <textarea
            rows={3}
            value={notificationNote}
            onChange={(e) => setNotificationNote(e.target.value)}
            className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Submit & Notify Actions */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Assets will remain indefinitely archived in 5 TB storage</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSendWhatsAppNotification}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Couple</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-save-final-delivery"
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold hover:bg-[#e6c86e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing Delivery...' : 'Save & Publish Delivery'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
