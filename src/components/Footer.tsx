import React from 'react';
import {
  Camera,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  ArrowUp,
  Heart,
  Shield,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setCurrentTab,
  onOpenBooking,
  onOpenAdmin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#070709] border-t border-[#272732] pt-16 pb-24 md:pb-12 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-[#272732]/70">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#8c6411] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#09090b] rounded-[6px] flex items-center justify-center">
                  <Camera className="w-5 h-5 text-[#d4af37]" />
                </div>
              </div>
              <div>
                <h3 className="font-cinzel text-xl font-bold tracking-wider text-white">
                  SUSHIL <span className="text-[#d4af37]">PHOTOGRAPHY</span>
                </h3>
                <p className="text-xs tracking-widest text-zinc-400 uppercase">
                  Studio & Creative Lab • Jhar
                </p>
              </div>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              "Capturing Your Beautiful Moments." Professional photography, cinematography,
              luxurious wedding album design, and master retouching dedicated to preserving your
              most cherished memories with timeless elegance.
            </p>

            <div className="pt-2 text-xs text-zinc-400 space-y-1">
              <p>
                <strong className="text-zinc-200">Owner & Chief Photographer:</strong> Sushil Meher
              </p>
              <p>
                <strong className="text-zinc-200">Serving:</strong> Jhar, Sohela, Bargarh, Sambalpur, Jharsuguda, and across Odisha & Western India.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                id="footer-social-instagram"
                href={BUSINESS_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#14141a] border border-[#272732] flex items-center justify-center text-zinc-400 hover:text-pink-400 hover:border-pink-500/40 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                id="footer-social-facebook"
                href={BUSINESS_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#14141a] border border-[#272732] flex items-center justify-center text-zinc-400 hover:text-blue-400 hover:border-blue-500/40 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                id="footer-social-youtube"
                href={BUSINESS_INFO.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#14141a] border border-[#272732] flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                id="footer-social-whatsapp"
                href={BUSINESS_INFO.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#14141a] border border-[#272732] flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                aria-label="WhatsApp"
              >
                <span className="text-emerald-400 font-bold text-xs">WA</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-sm font-semibold tracking-wider text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span> Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  About Sushil Meher
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('packages')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Wedding Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('gallery')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Portfolio Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('booking')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Check Availability & Book
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('track-order')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('reviews')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Client Reviews & Ratings
                </button>
              </li>
            </ul>
          </div>

          {/* Specialized Services */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-sm font-semibold tracking-wider text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span> Studio Craft
            </h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <button
                  onClick={() => navigateTo('wedding')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Wedding Cinematography
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('pre-wedding')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Pre-Wedding Shoots
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('album-design')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  12x36 Album Design
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('photo-editing')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  High-End Photo Retouching
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('wedding-cards')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Wedding Card Design
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('photo-frame')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Custom Wall Frames
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('passport-photo')}
                  className="hover:text-[#d4af37] transition-colors"
                >
                  Biometric Passport Photos
                </button>
              </li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-sm font-semibold tracking-wider text-white uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span> Studio Location
            </h4>
            <div className="space-y-3 text-sm text-zinc-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>
                  Jhar, Sohela, Bargarh District, Odisha, India - 768033
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
                <div className="flex flex-col">
                  <a href={`tel:${BUSINESS_INFO.phone}`} className="hover:text-white">
                    +91 {BUSINESS_INFO.phone}
                  </a>
                  <a href={`tel:${BUSINESS_INFO.secondaryPhone}`} className="hover:text-white text-xs text-zinc-500">
                    +91 {BUSINESS_INFO.secondaryPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-white text-xs truncate">
                  {BUSINESS_INFO.email}
                </a>
              </div>
              <div className="pt-2">
                <button
                  id="footer-upload-photos-btn"
                  onClick={() => navigateTo('upload-photos')}
                  className="w-full py-2 px-3 rounded-lg bg-[#14141b] border border-[#272732] hover:border-[#d4af37] text-xs text-center font-medium text-white transition-colors"
                >
                  Upload Customer Photos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Keywords tags bar */}
        <div className="py-6 border-b border-[#272732]/40 text-[11px] text-zinc-500 leading-relaxed">
          <span className="text-zinc-400 font-semibold mr-2">Serving Regions & Keywords:</span>
          Sushil Photography Jhar • Photography in Jhar • Wedding Photographer in Jhar • Wedding Photographer in Bargarh • Photography in Sohela • Wedding Photography Bargarh • Pre Wedding Photography Bargarh • Album Design Bargarh • Photo Editing Bargarh • Wedding Album Design Odisha • Photo Studio Jhar • Professional Photographer Jhar • Candid Wedding Cinematography Western Odisha.
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © 2026 <span className="text-zinc-300 font-medium">{BUSINESS_INFO.name}</span>. All Rights Reserved. Owned & Operated by Sushil Meher.
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenAdmin}
              className="text-zinc-500 hover:text-zinc-300 text-[11px] transition-colors"
            >
              Admin Portal
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-zinc-400 hover:text-[#d4af37] transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
