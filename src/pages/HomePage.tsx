import React, { useState } from 'react';
import {
  Camera,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Film,
  Award,
  Users,
  Image as ImageIcon,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { BUSINESS_INFO, INITIAL_SERVICES, INITIAL_PACKAGES, INITIAL_REVIEWS } from '../data/mockData';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { ServiceItem, PackageItem, ReviewItem } from '../types';
import { useFounderPhoto } from '../hooks/useFounderPhoto';
import { UpdateFounderPhotoModal } from '../components/UpdateFounderPhotoModal';
import { WeddingHighlightsSection } from '../components/WeddingHighlightsSection';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenBooking: () => void;
  packages?: PackageItem[];
  services?: ServiceItem[];
  reviews?: ReviewItem[];
  galleryItems?: any[];
  onSelectService?: (service: ServiceItem) => void;
  onSelectPackage?: (pkg: PackageItem) => void;
  onOpenLightbox?: (item: any) => void;
  onOpenBookingWithPackage?: (pkg: PackageItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenBooking,
  packages = [],
  services = [],
  reviews = [],
  onSelectService,
  onSelectPackage,
  onOpenBookingWithPackage,
}) => {
  const safeServices = services && services.length > 0 ? services : INITIAL_SERVICES;
  const safePackages = packages && packages.length > 0 ? packages : INITIAL_PACKAGES;
  const safeReviews = reviews && reviews.length > 0 ? reviews : INITIAL_REVIEWS;

  const { photoUrl: founderPhoto } = useFounderPhoto();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const [heroBgIndex, setHeroBgIndex] = useState(0);

  const heroBackgrounds = [
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=85',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=85',
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* 1. CINEMATIC HERO SECTION */}
      <section
        id="hero-section"
        className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background Image Carousel with Vignette & Luxury Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBackgrounds[heroBgIndex]}
            alt="Cinematic Wedding Photography by Sushil Photography Jhar"
            className="w-full h-full object-cover scale-105 transition-transform duration-1000 brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/65 to-[#09090b]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#09090b_85%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-10">
          {/* Studio Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181820]/90 border border-[#d4af37]/40 backdrop-blur-md shadow-xl text-xs font-semibold text-[#f5e7b2]">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
            <span>Sushil Photography • Jhar, Sohela, Bargarh</span>
          </div>

          {/* Headline */}
          <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Capturing Your{' '}
            <span className="gold-gradient-text block sm:inline">
              Beautiful Moments
            </span>
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
            Professional Photography, Cinematography, Album Design & Photo Editing
          </p>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Led by <strong className="text-zinc-200">Sushil Meher</strong>. We craft timeless royal wedding films, panoramic 12x36 photobooks, and flawless magazine retouching across Western Odisha.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="hero-book-date-btn"
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-[#d4af37]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-black" />
              <span>Book Your Date</span>
            </button>

            <button
              id="hero-view-portfolio-btn"
              onClick={() => onNavigate('gallery')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#14141c]/90 border border-[#272732] hover:border-[#d4af37] text-zinc-200 hover:text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5 text-[#d4af37]" />
              <span>View Portfolio</span>
            </button>
          </div>

          {/* Image switch controls */}
          <div className="flex justify-center items-center gap-2 pt-6">
            {heroBackgrounds.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroBgIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  heroBgIndex === idx ? 'w-8 bg-[#d4af37]' : 'w-2 bg-zinc-600'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. ANIMATED STATISTICS BAR */}
      <section
        id="stats-section"
        className="relative z-20 -mt-8 max-w-6xl mx-auto px-4 sm:px-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#121216]/95 border border-[#272732] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
          <div className="text-center space-y-1 border-r border-[#272732]/50 last:border-none">
            <div className="font-cinzel text-2xl sm:text-4xl font-black text-[#d4af37]">
              500+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-zinc-200">
              Happy Clients
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">Across Odisha & India</p>
          </div>

          <div className="text-center space-y-1 border-r border-[#272732]/50 last:border-none">
            <div className="font-cinzel text-2xl sm:text-4xl font-black text-white">
              1000+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-zinc-200">
              Events Covered
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">Weddings & Ceremonies</p>
          </div>

          <div className="text-center space-y-1 border-r border-[#272732]/50 last:border-none">
            <div className="font-cinzel text-2xl sm:text-4xl font-black text-[#d4af37]">
              1000+
            </div>
            <div className="text-xs sm:text-sm font-semibold text-zinc-200">
              Albums Designed
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">Luxury Panoramic Photobooks</p>
          </div>

          <div className="text-center space-y-1">
            <div className="font-cinzel text-2xl sm:text-4xl font-black text-white flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5 text-[#d4af37]" /> Pro
            </div>
            <div className="text-xs sm:text-sm font-semibold text-zinc-200">
              Photo Editing
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">Studio Retouching Suite</p>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SUSHIL MEHER (Spotlight Intro) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Owner Portrait card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#272732] shadow-2xl bg-[#14141c]">
              <img
                src={founderPhoto}
                alt="Sushil Meher - Founder & Lead Artist"
                className="w-full aspect-[4/5] object-cover hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/70 hover:bg-[#d4af37] text-zinc-200 hover:text-black border border-[#d4af37]/40 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg group"
                title="Update Founder Photo"
              >
                <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-[#d4af37] group-hover:text-black" />
                <span>Change Photo</span>
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1 pointer-events-none">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#d4af37]">
                  Founder & Lead Artist
                </span>
                <h3 className="font-cinzel text-xl font-bold text-white">Sushil Meher</h3>
                <p className="text-xs text-zinc-300">
                  Founder & Lead Artist • Master Cinematographer
                </p>
                <p className="text-xs text-zinc-400">Jhar, Sohela, Bargarh, Odisha</p>
              </div>
            </div>
            {/* Gold Corner Badge */}
            <div className="absolute -bottom-4 -right-4 bg-[#181824] border border-[#d4af37] p-3 rounded-xl shadow-xl flex items-center gap-3">
              <Award className="w-6 h-6 text-[#d4af37]" />
              <div>
                <span className="block text-xs font-bold text-white">10+ Years</span>
                <span className="text-[10px] text-zinc-400">Visual Excellence</span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#272732] text-xs font-semibold text-[#d4af37]">
              <span>About Sushil Photography Jhar</span>
            </div>

            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white leading-tight">
              Preserving Beautiful Memories with Creativity, Quality & Heart
            </h2>

            <blockquote className="border-l-2 border-[#d4af37] pl-4 text-zinc-300 italic text-base sm:text-lg leading-relaxed font-playfair">
              "Sushil Photography Jhar is a professional photography, cinematography, album
              design and photo editing studio dedicated to preserving beautiful memories with
              creativity, quality and professional service."
            </blockquote>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Based in Jhar (Sohela, Bargarh), we understand the emotional weight and spiritual
              grandeur of traditional Odia rituals, joyful haldi splashes, emotional bidaai, and
              modern celebrations. Every shot is crafted with cinema-grade mirrorless cameras,
              telephoto prime optics, and custom editorial color palettes.
            </p>

            {/* 5 Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: 'Rich Experience', desc: 'Over a decade of trusted wedding coverage across Western Odisha.' },
                { title: 'Creative Team', desc: 'Dedicated candid cinematographers, drone pilots & light artists.' },
                { title: 'Professional Editing', desc: 'Handcrafted tone grading, frequency separation & raw culling.' },
                { title: 'Premium Album Design', desc: 'Layflat 12x36 scratch-resistant velvet & gold-embossed albums.' },
              ].map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#121216] border border-[#272732] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] hover:text-[#f3e5ab] group"
              >
                <span>Read Full Studio Story & Equipment Specs</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED SERVICES (Cards with image, title, price, details, booking) */}
      <section className="py-20 bg-[#0c0c10] border-y border-[#272732]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                Complete Visual Suite
              </span>
              <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mt-1">
                Featured Photography & Creative Services
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-2">
                From full-scale royal wedding films to 12x36 custom album layouts and instant passport photos.
              </p>
            </div>

            <button
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181820] border border-[#272732] hover:border-[#d4af37] text-xs font-semibold text-zinc-200 hover:text-white transition-colors self-start md:self-auto"
            >
              <span>View All 22 Services</span>
              <ArrowRight className="w-4 h-4 text-[#d4af37]" />
            </button>
          </div>

          {/* Grid of 6 highlight services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeServices.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="group bg-[#121216] border border-[#272732] hover:border-[#d4af37]/60 rounded-2xl overflow-hidden flex flex-col shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[11px] font-bold text-[#f5e7b2]">
                    Starts ₹{service.startingPrice.toLocaleString()}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                      {service.category}
                    </span>
                    <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-[#f5e7b2] transition-colors mt-0.5">
                      {service.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-2">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#272732] flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        onSelectService?.(service);
                        onNavigate('services');
                      }}
                      className="text-xs text-zinc-400 hover:text-white font-medium"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => {
                        onSelectService?.(service);
                        onOpenBooking();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs transition-colors"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE BEFORE / AFTER PHOTO EDITING SHOWCASE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-8">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
            Signature Post-Production
          </span>
          <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white">
            Professional Photo Retouching & Color Grading
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            See the transformative difference between raw camera captures and Sushil Meher’s
            handcrafted frequency separation, skin contouring, and rich film tone grading.
          </p>
        </div>

        <BeforeAfterSlider />

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('photo-editing')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#181820] border border-[#272732] hover:border-[#d4af37] text-xs font-semibold text-white transition-colors"
          >
            <span>Explore All 13 Photo Editing Services</span>
            <ArrowRight className="w-4 h-4 text-[#d4af37]" />
          </button>
        </div>
      </section>

      {/* 6. WEDDING PACKAGES SHOWCASE */}
      <section className="py-20 bg-[#0c0c10] border-t border-[#272732]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Transparent & Affordable
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white">
              Standard Wedding Packages
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Clear inclusions with no hidden costs. All packages include high-speed delivery and
              custom backup. Prices can be customized for multi-day events.
            </p>
          </div>

          {/* Packages 5-column or grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {safePackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                  pkg.popular
                    ? 'bg-[#181824] border-2 border-[#d4af37] shadow-2xl shadow-[#d4af37]/15 -translate-y-1'
                    : 'bg-[#121216] border border-[#272732] hover:border-zinc-500'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#d4af37] text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-cinzel text-sm font-bold text-zinc-300 uppercase">
                      {pkg.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white font-mono">
                        ₹{pkg.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#d4af37] mt-0.5">
                      {pkg.subtitle}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs border-t border-[#272732] pt-4 text-zinc-300">
                    <div className="flex items-start gap-2">
                      <Camera className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                      <span>{pkg.photographers}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Film className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{pkg.videoCoverage}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                      <span>{pkg.album}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      if (onOpenBookingWithPackage) {
                        onOpenBookingWithPackage(pkg);
                      } else if (onSelectPackage) {
                        onSelectPackage(pkg);
                        onOpenBooking();
                      } else {
                        onOpenBooking();
                      }
                    }}
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs tracking-wide transition-all ${
                      pkg.popular
                        ? 'bg-[#d4af37] hover:bg-[#e5c158] text-black shadow-lg shadow-[#d4af37]/20'
                        : 'bg-[#181820] hover:bg-zinc-800 text-zinc-200 border border-[#272732]'
                    }`}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate('packages')}
              className="text-xs font-semibold text-zinc-400 hover:text-[#d4af37] inline-flex items-center gap-1"
            >
              <span>Compare all package inclusions & delivery timelines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* WEDDING HIGHLIGHTS CINEMATIC SHOWCASE (Mandated Feature 2) */}
      <WeddingHighlightsSection onBookWedding={onOpenBooking} />

      {/* 7. VERIFIED REVIEWS & RATINGS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Client Testimonials
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white mt-1">
              Loved by 500+ Families in Western Odisha
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-2">
              Real reviews from couples, parents, and businesses in Bargarh, Sohela, and Jhar.
            </p>
          </div>

          <button
            onClick={() => onNavigate('reviews')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181820] border border-[#272732] hover:border-[#d4af37] text-xs font-semibold text-zinc-200 hover:text-white transition-colors self-start md:self-auto"
          >
            <span>Read All Reviews & Write One</span>
            <ArrowRight className="w-4 h-4 text-[#d4af37]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeReviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-[#121216] border border-[#272732] rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-4"
            >
              <div className="space-y-3">
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed font-sans">
                  "{rev.review}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#272732] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {rev.photo ? (
                    <img
                      src={rev.photo}
                      alt={rev.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#181824] border border-[#272732] flex items-center justify-center font-cinzel text-xs font-bold text-[#d4af37]">
                      {rev.customerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.customerName}</h4>
                    <span className="text-[10px] text-zinc-400">{rev.serviceUsed}</span>
                  </div>
                </div>

                {rev.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. STRONG HOMEPAGE CALL TO ACTION (Item 31 from prompt) */}
      <section
        id="home-cta-section"
        className="relative py-20 overflow-hidden bg-gradient-to-b from-[#101016] to-[#09090b] border-t border-[#272732]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa7c11] p-0.5 mx-auto shadow-xl shadow-[#d4af37]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#09090b] rounded-[14px] flex items-center justify-center">
              <Camera className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>

          <h2 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Your Story Deserves to Be Beautiful.
          </h2>

          <p className="font-sans text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
            "Let Sushil Photography Jhar capture your special moments with professional
            photography, cinematic videos, creative album design and premium editing."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="cta-book-wedding-btn"
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-2xl shadow-[#d4af37]/30 hover:scale-105 active:scale-95 transition-all"
            >
              BOOK YOUR WEDDING
            </button>

            <button
              id="cta-upload-photos-btn"
              onClick={() => onNavigate('upload-photos')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#181824] border border-[#272732] hover:border-[#d4af37] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              UPLOAD PHOTOS
            </button>

            <button
              id="cta-get-quote-btn"
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-transparent border border-zinc-700 hover:border-zinc-400 text-zinc-300 hover:text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              GET A QUOTE
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-zinc-500">
            <span>Direct Call: +91 {BUSINESS_INFO.phone}</span>
            <span>•</span>
            <span>Jhar, Sohela, Bargarh</span>
          </div>
        </div>
      </section>

      <UpdateFounderPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
};
