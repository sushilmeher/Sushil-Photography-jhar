import React, { useState } from 'react';
import {
  Camera,
  Award,
  Users,
  Sparkles,
  BookOpen,
  Heart,
  ShieldCheck,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';
import { useFounderPhoto } from '../hooks/useFounderPhoto';
import { UpdateFounderPhotoModal } from '../components/UpdateFounderPhotoModal';

interface AboutPageProps {
  onOpenBooking: () => void;
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenBooking, onNavigate }) => {
  const { photoUrl: founderPhoto } = useFounderPhoto();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  return (
    <div id="about-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Breadcrumb & Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <span>About The Studio</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            The Vision Behind Sushil Photography Jhar
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Preserving life’s most precious milestones with timeless visual artistry, heart, and technical mastery.
          </p>
        </div>

        {/* Owner Profile & Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Owner Photograph */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#d4af37]/30 shadow-2xl bg-[#09090b] group">
              <img
                src={founderPhoto}
                alt="Sushil Meher - Founder & Lead Artist"
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/70 hover:bg-[#d4af37] text-zinc-200 hover:text-black border border-[#d4af37]/40 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg"
                title="Update Founder Photo"
              >
                <Camera className="w-3.5 h-3.5 text-[#d4af37] hover:text-black" />
                <span>Change Photo</span>
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 text-white pointer-events-none">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
                  Founder & Lead Artist
                </span>
                <h3 className="font-cinzel text-2xl font-bold">Sushil Meher</h3>
                <p className="text-xs text-zinc-300">Founder & Lead Artist • Master Cinematographer</p>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Jhar, Sohela, Bargarh, Odisha</span>
                </div>
              </div>
            </div>

            {/* Quick contact pills */}
            <div className="flex gap-3">
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#181824] border border-[#272732] hover:border-[#d4af37] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" /> Call Sushil
              </a>
              <a
                href={BUSINESS_INFO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>

          {/* About Biography & Manifesto */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                Studio Philosophy
              </span>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                "Preserving Beautiful Memories With Creativity, Quality & Professional Service"
              </h2>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
              <strong>Sushil Photography Jhar</strong> is a professional photography, cinematography,
              album design and photo editing studio dedicated to preserving beautiful memories with
              creativity, quality and professional service.
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Founded and managed by <strong>Sushil Meher</strong> in Jhar (Sohela, Bargarh District, Odisha), our studio bridges traditional cultural values with state-of-the-art visual technology. Whether capturing the solemn sanctity of a Vedic wedding ritual, the candid joy of Haldi splashes, or crafting bespoke 12x36 royal Sambalpuri photobooks, we give every family the dedication and craftsmanship they deserve.
            </p>

            {/* 5 Distinct Highlights mandated by prompt */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-[#09090b] border border-[#272732] flex items-start gap-3.5">
                <Award className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Experience</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Over 1,000 successful events documented with 10+ years of photography and photo laboratory expertise across Bargarh and Western Odisha.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09090b] border border-[#272732] flex items-start gap-3.5">
                <Users className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Creative Team</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    A synchronized crew consisting of senior candid photographers, 4K gimbal cinematographers, licensed drone aerial operators, and graphic layout artists.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09090b] border border-[#272732] flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Professional Editing</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    High-end frequency separation skin retouching, color grading in DaVinci Resolve & Lightroom, and Photoshop master compositions.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09090b] border border-[#272732] flex items-start gap-3.5">
                <BookOpen className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Premium Album Design</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Panoramic 12x36 lay-flat albums, luxury leatherette covers with gold foil stamping, waterproof thermal lamination, and archival longevity.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09090b] border border-[#272732] flex items-start gap-3.5">
                <Heart className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Customer Satisfaction</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    500+ happy families with a transparent progress tracking system, digital draft approvals before printing, and lifetime backup.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 transition-all"
              >
                Book An Appointment
              </button>
              <button
                onClick={() => onNavigate('gallery')}
                className="px-6 py-3 rounded-xl bg-[#181820] border border-[#272732] text-zinc-300 hover:text-white text-xs font-semibold transition-all"
              >
                Browse Our Work
              </button>
            </div>
          </div>
        </div>

        {/* Studio Equipment & Standard of Craft */}
        <div className="bg-[#0c0c10] border border-[#272732] rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Behind The Scenes
            </span>
            <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
              Studio Technology & Equipment
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              We never compromise on optics, sensor resolution, or backup storage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#121216] border border-[#272732] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-bold text-xs">
                CAM
              </div>
              <h4 className="text-sm font-bold text-white">Full-Frame Cameras</h4>
              <p className="text-xs text-zinc-400">
                High dynamic range Sony & Canon mirrorless sensors with low-light clarity for evening mandap ceremonies.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121216] border border-[#272732] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-bold text-xs">
                OPT
              </div>
              <h4 className="text-sm font-bold text-white">G-Master Prime Lenses</h4>
              <p className="text-xs text-zinc-400">
                f/1.4 and f/1.8 telephoto and wide-angle primes delivering creamy bokeh and edge-to-edge sharpness.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121216] border border-[#272732] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-bold text-xs">
                CIN
              </div>
              <h4 className="text-sm font-bold text-white">Gimbal & Drone Gear</h4>
              <p className="text-xs text-zinc-400">
                DJI Ronin 3-axis stabilization and 4K aerial drones capturing breathtaking venue perspectives.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121216] border border-[#272732] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-bold text-xs">
                LAB
              </div>
              <h4 className="text-sm font-bold text-white">Color Calibrated Editing</h4>
              <p className="text-xs text-zinc-400">
                IPS color-accurate monitors with hardware calibration ensuring printed albums match true-to-life tones.
              </p>
            </div>
          </div>
        </div>
      </div>

      <UpdateFounderPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};
