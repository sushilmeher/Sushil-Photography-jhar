import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Wand2,
  RefreshCcw,
  Palette,
  Eye,
  Sliders,
  Upload,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { api } from '../services/api';

interface PhotoEditingPageProps {
  onNavigate: (tab: string) => void;
  onOpenBooking: () => void;
}

export const PhotoEditingPage: React.FC<PhotoEditingPageProps> = ({
  onNavigate,
  onOpenBooking,
}) => {
  // Quick Upload for Editing Request state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('Skin Retouching & Face Clean');
  const [instructions, setInstructions] = useState('');
  const [filesCount, setFilesCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  // 13 Photo Editing specialties as enumerated in user prompt
  const editingServices = [
    { title: 'Background Change', desc: 'Replace cluttered venue backdrops with scenic gardens, royal palaces, or solid studio gradients.' },
    { title: 'Skin Retouching', desc: 'Frequency separation preserving natural pore texture while smoothing out harsh shadows and blemishes.' },
    { title: 'Color Grading', desc: 'Cinematic warm gold tones, vintage film hues, and color calibration matching print specifications.' },
    { title: 'Old Photo Restoration', desc: 'Repair torn, scratched, water-damaged ancestral heritage photographs with modern digital renewal.' },
    { title: 'Passport Photo Editing', desc: 'Strict biometric standard background removal, suit overlay, contrast correction, and print tiling.' },
    { title: 'Face Clean & Blemish Removal', desc: 'Eliminate acne, stray hair strands, dark eye circles, and shine without artificial plastic blur.' },
    { title: 'Lighting Correction', desc: 'Recover clipped highlights, open underexposed dark shadows, and balance ambient flash glow.' },
    { title: 'Teeth Whitening & Eye Enhance', desc: 'Gentle dental brightening and sparkling corneal iris enhancement for captivating portraits.' },
    { title: 'Object & Guest Removal', desc: 'Seamlessly clone out accidental photobombers, wires, mic stands, and unwanted clutter.' },
    { title: 'Dress Color Change', desc: 'Change saree, sherwani, or background fabric colors to coordinate harmoniously with event decor.' },
    { title: 'Jewelry Highlight & Polish', desc: 'Sharpen intricate gold filigree, diamond sparkles, and bridal necklace shine with micro-contrast.' },
    { title: 'Wedding Photo Retouching', desc: 'Editorial magazine polish applied consistently across entire album series and ceremonial portraits.' },
    { title: 'Album Page Designing', desc: 'Layered PSD compositions formatted to 300 DPI for high-definition 12x36 commercial offset presses.' },
  ];

  const handleQuickUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const order = await api.createOrder({
        customerName: clientName,
        customerPhone: clientPhone,
        serviceType: 'Photo Editing',
        packageName: selectedServiceType,
        totalAmount: 150 * filesCount,
        advancePaid: 0,
        balanceAmount: 150 * filesCount,
        notes: `Customer requested editing: ${instructions}`,
        files: [
          {
            id: `FLE-${Date.now()}`,
            name: `edit_request_${filesCount}_files.zip`,
            size: `${filesCount * 4.5} MB`,
            category: 'Photo Editing',
            url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=90',
            uploadedAt: new Date().toISOString().split('T')[0],
          },
        ],
      });

      setIsSubmitting(false);
      setSubmittedOrderId(order.id);
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Upload error: ' + (err.message || 'Please try again'));
    }
  };

  return (
    <div id="photo-editing-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Digital Darkroom & Photoshop Suite</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            High-End Photo Editing & Retouching
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Natural beauty enhanced to perfection. We specialize in high-frequency separation,
            complex background replacements, old photo restorations, and cinematic tone grading.
          </p>
        </div>

        {/* Interactive Before / After Comparison */}
        <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center space-y-2 mb-6">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Interactive Live Demonstration
            </span>
            <h2 className="font-cinzel text-2xl font-bold text-white">
              Slide to Compare Raw vs Master Retouch
            </h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Notice the skin texture preservation, delicate blemish softening, eye iris sharpening,
              and cinematic skin luminescence.
            </p>
          </div>

          <BeforeAfterSlider />
        </div>

        {/* 13 Photo Editing Specialties Grid (Mandated by prompt) */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Comprehensive Retouching Catalog
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
              Specialized Editing Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Every photograph is retouched by hand using industry-standard Adobe Photoshop & Lightroom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {editingServices.map((svc, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#121216] border border-[#272732] hover:border-[#d4af37]/60 space-y-2 transition-all shadow-md group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center text-xs font-bold font-mono">
                    {i + 1}
                  </div>
                  <h3 className="font-cinzel text-sm font-bold text-white group-hover:text-[#f5e7b2] transition-colors">
                    {svc.title}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* "Upload Photo for Editing" Section (Prompt 7 requirement) */}
        <div id="upload-photo-for-editing" className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-12 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center mx-auto text-[#d4af37] mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                Upload Photo for Editing
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Upload your mobile or camera photos. Sushil Meher will personally review, retouch,
                and deliver high-resolution files.
              </p>
            </div>

            {submittedOrderId ? (
              <div className="bg-[#181820] border border-[#272732] rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-white">
                  Photo Editing Request Received!
                </h3>
                <p className="text-xs text-zinc-300">
                  Your request has been filed under Order ID:{' '}
                  <strong className="text-[#d4af37] font-mono text-sm">{submittedOrderId}</strong>
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => onNavigate('track-order')}
                    className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs"
                  >
                    Track Progress in Real Time
                  </button>
                  <button
                    onClick={() => setSubmittedOrderId(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#272732] text-white text-xs font-semibold"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickUploadSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Ramesh Sahu"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Type of Photo Editing
                    </label>
                    <select
                      value={selectedServiceType}
                      onChange={(e) => setSelectedServiceType(e.target.value)}
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    >
                      {editingServices.map((s, idx) => (
                        <option key={idx} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Approximate Number of Photos
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={filesCount}
                      onChange={(e) => setFilesCount(Number(e.target.value))}
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                  </div>
                </div>

                {/* Dropzone mockup */}
                <div className="border-2 border-dashed border-[#272732] hover:border-[#d4af37] rounded-2xl p-8 text-center bg-[#0d0d12] cursor-pointer transition-colors space-y-2">
                  <Upload className="w-8 h-8 text-[#d4af37] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-white">
                    Click to select photos or drag & drop files here
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Supports JPG, PNG, RAW, TIFF, PSD up to 100MB per photo
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Special Editing Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Please remove person on the left, make teeth slightly whiter, and warm up the skin tone."
                    className="w-full bg-[#181820] border border-[#272732] rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Submitting to Studio Editor...'
                  ) : (
                    <>
                      <span>Submit Photo for Retouching</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
