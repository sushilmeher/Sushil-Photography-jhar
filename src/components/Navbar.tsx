import React, { useState, useEffect } from 'react';
import {
  Camera,
  Phone,
  Calendar,
  Upload,
  User,
  Menu,
  X,
  Instagram,
  ShieldCheck,
  Search,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';
import { useSiteMedia } from '../hooks/useSiteMedia';
import { SocialMediaLinks } from './SocialMediaLinks';

interface NavbarProps {
  currentTab: string;
  setCurrentTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenAuth: () => void;
  isAdmin: boolean;
  isCustomer?: boolean;
  onLogoutAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onNavigate,
  onOpenBooking,
  onOpenAuth,
  isAdmin,
  isCustomer,
  onLogoutAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { config: siteMedia } = useSiteMedia();
  const brandLogoUrl = siteMedia.logoHeader || siteMedia.logoMain;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'pre-wedding', label: 'Pre-Wedding' },
    { id: 'album-design', label: 'Album Design' },
    { id: 'photo-editing', label: 'Photo Editing' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'packages', label: 'Packages' },
    { id: 'payment', label: 'Payment Details' },
    { id: 'booking', label: 'Booking' },
    { id: 'upload-photos', label: 'Upload Photos' },
    { id: 'track-order', label: 'Track Order' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else if (setCurrentTab) {
      setCurrentTab(id);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#09090b]/95 backdrop-blur-md border-b border-[#272732] shadow-2xl py-2.5'
          : 'bg-gradient-to-b from-[#09090b]/90 via-[#09090b]/60 to-transparent py-4'
      }`}
    >
      {/* Top micro contact bar */}
      <div className="hidden lg:block border-b border-[#272732]/40 pb-2 mb-2 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Booking Open for 2026-2027 Wedding Season
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-zinc-400">
              Studio: Jhar, Sohela, Bargarh, Odisha
            </span>
          </div>

          <div className="flex items-center space-x-5">
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1.5 hover:text-[#d4af37] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>+91 {BUSINESS_INFO.phone}</span>
            </a>
            <span className="text-zinc-600">/</span>
            <a
              href={`tel:${BUSINESS_INFO.secondaryPhone}`}
              className="hover:text-[#d4af37] transition-colors"
            >
              +91 {BUSINESS_INFO.secondaryPhone}
            </a>
            <span className="text-zinc-600">•</span>
            <a
              href={BUSINESS_INFO.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span className="text-emerald-400 font-medium">WhatsApp</span>
            </a>
            <span className="text-zinc-600">•</span>
            <SocialMediaLinks variant="header" />
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          id="nav-logo-btn"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          {brandLogoUrl ? (
            <div className="w-10 h-10 rounded-lg p-0.5 border border-[#d4af37]/40 bg-[#09090b] flex items-center justify-center shadow-lg shadow-[#d4af37]/20 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src={brandLogoUrl}
                alt="Sushil Photography Logo"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] via-[#aa7c11] to-[#6b4e06] p-0.5 flex items-center justify-center shadow-lg shadow-[#d4af37]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#09090b] rounded-[6px] flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#d4af37]" />
              </div>
            </div>
          )}
          <div>
            <span className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-white group-hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5">
              SUSHIL <span className="text-[#d4af37]">PHOTOGRAPHY</span>
            </span>
            <span className="block text-[10px] tracking-[0.25em] text-zinc-400 font-medium uppercase">
              Jhar • Sohela • Bargarh
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1 text-sm font-medium">
          {navLinks.slice(0, 10).map((link) => (
            <button
              key={link.id}
              id={`nav-link-${link.id}`}
              onClick={() => handleNavClick(link.id)}
              className={`px-2.5 py-1.5 rounded-md transition-all duration-200 ${
                currentTab === link.id
                  ? 'text-[#d4af37] bg-[#d4af37]/10 font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* More Dropdown for additional items */}
          <div className="relative group">
            <button
              id="nav-more-dropdown-btn"
              className="px-2.5 py-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800/40 transition-all flex items-center gap-1"
            >
              <span>More</span>
              <span className="text-[10px] text-zinc-500 group-hover:rotate-180 transition-transform">▼</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#121216] border border-[#272732] rounded-xl shadow-2xl py-2 hidden group-hover:block transition-all z-50">
              {navLinks.slice(10).map((link) => (
                <button
                  key={link.id}
                  id={`nav-more-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    currentTab === link.id
                      ? 'text-[#d4af37] bg-[#d4af37]/10 font-medium'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-[#272732] my-1"></div>
              <button
                id="nav-more-wedding-cards"
                onClick={() => handleNavClick('wedding-cards')}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50"
              >
                Wedding Card Design
              </button>
              <button
                id="nav-more-photo-frame"
                onClick={() => handleNavClick('photo-frame')}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50"
              >
                Photo Frame Studio
              </button>
              <button
                id="nav-more-passport-photo"
                onClick={() => handleNavClick('passport-photo')}
                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50"
              >
                Passport Photo Service
              </button>
            </div>
          </div>
        </nav>

        {/* Right side CTA & Quick icons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Pay Online quick button */}
          <button
            id="nav-pay-online-btn"
            onClick={() => handleNavClick('payment')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d4af37]/40 bg-[#17171d] text-xs font-semibold text-[#d4af37] hover:bg-[#d4af37]/15 transition-colors"
            title="Online Payment & UPI Portal"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Pay Online</span>
          </button>

          {/* Track Order quick button */}
          <button
            id="nav-track-order-btn"
            onClick={() => handleNavClick('track-order')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272732] bg-[#121216] text-xs font-medium text-zinc-300 hover:text-[#d4af37] hover:border-[#d4af37]/50 transition-colors"
            title="Track Your Photography Order"
          >
            <Search className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Track Order</span>
          </button>

          {/* Upload Photos Portal */}
          <button
            id="nav-upload-portal-btn"
            onClick={() => handleNavClick('upload-photos')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#272732] bg-[#18181f] text-xs font-medium text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Upload Photos</span>
          </button>

          {/* Prominent "Book Now" Button */}
          <button
            id="nav-book-now-btn"
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-[#09090b] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#d4af37]/25 hover:shadow-[#d4af37]/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>Book Now</span>
          </button>

          {/* User / Admin Portal Button */}
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <button
                id="nav-admin-dashboard-btn"
                onClick={() => handleNavClick('admin')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20"
                title="Admin Dashboard"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Admin</span>
              </button>
              <button
                id="nav-admin-logout-btn"
                onClick={onLogoutAdmin}
                className="text-xs text-zinc-400 hover:text-red-400 px-1.5 py-1"
                title="Log out Admin"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              id="nav-customer-portal-btn"
              onClick={onOpenAuth}
              className="p-2 rounded-lg text-zinc-400 hover:text-[#d4af37] hover:bg-zinc-800/40 transition-colors"
              title="Customer Login / Admin Access"
            >
              <User className="w-5 h-5" />
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            id="nav-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/50"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="xl:hidden fixed inset-x-0 top-[60px] sm:top-[70px] bottom-0 bg-[#09090b]/98 backdrop-blur-xl border-t border-[#272732] z-50 overflow-y-auto px-6 py-6"
        >
          <div className="flex flex-col space-y-2 pb-24">
            <div className="pb-3 mb-2 border-b border-[#272732]">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Explore Studio
              </span>
            </div>

            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`mobile-nav-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center justify-between py-3 px-3 rounded-xl text-base font-medium transition-colors ${
                  currentTab === link.id
                    ? 'bg-[#d4af37]/15 text-[#d4af37] font-semibold'
                    : 'text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <span>{link.label}</span>
                {currentTab === link.id && <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />}
              </button>
            ))}

            <div className="pt-4 border-t border-[#272732] space-y-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Specialized Craft
              </span>
              <button
                id="mobile-nav-wedding-cards"
                onClick={() => handleNavClick('wedding-cards')}
                className="w-full text-left py-2.5 px-3 rounded-lg text-zinc-300 hover:bg-zinc-800/40 text-sm"
              >
                Wedding Card Design
              </button>
              <button
                id="mobile-nav-photo-frame"
                onClick={() => handleNavClick('photo-frame')}
                className="w-full text-left py-2.5 px-3 rounded-lg text-zinc-300 hover:bg-zinc-800/40 text-sm"
              >
                Photo Frame Studio
              </button>
              <button
                id="mobile-nav-passport-photo"
                onClick={() => handleNavClick('passport-photo')}
                className="w-full text-left py-2.5 px-3 rounded-lg text-zinc-300 hover:bg-zinc-800/40 text-sm"
              >
                Passport Photo Service
              </button>
            </div>

            {/* Mobile Contact Bar in Drawer */}
            <div className="mt-6 pt-6 border-t border-[#272732] space-y-3">
              <div className="text-xs text-zinc-400">Owner: Sushil Meher</div>
              <div className="text-xs text-zinc-300">Jhar, Sohela, Bargarh, Odisha</div>

              {/* Social Media Links */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-2">Connect with Sushil:</span>
                <SocialMediaLinks variant="compact" showLabels={true} className="justify-start flex-wrap" />
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 text-xs font-semibold text-white"
                >
                  <Phone className="w-4 h-4 text-[#d4af37]" /> Call Studio
                </a>
                <a
                  href={BUSINESS_INFO.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-700/80 text-xs font-semibold text-white"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
