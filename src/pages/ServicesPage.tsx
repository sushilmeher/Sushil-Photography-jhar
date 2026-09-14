import React, { useState } from 'react';
import {
  Camera,
  Film,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Palette,
  CheckCircle2,
  X,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { ServiceItem } from '../types';
import { INITIAL_SERVICES } from '../data/mockData';

interface ServicesPageProps {
  services?: ServiceItem[];
  onOpenBookingWithService?: (serviceName: string) => void;
  selectedService?: ServiceItem | null;
  setSelectedService?: (service: ServiceItem | null) => void;
  onNavigate?: (tab: string) => void;
  onOpenBooking?: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services = [],
  onOpenBookingWithService,
  selectedService: propSelectedService,
  setSelectedService: propSetSelectedService,
  onNavigate,
  onOpenBooking,
}) => {
  const [localSelectedService, setLocalSelectedService] = useState<ServiceItem | null>(null);
  const selectedService = propSelectedService !== undefined ? propSelectedService : localSelectedService;
  const setSelectedService = propSetSelectedService || setLocalSelectedService;

  const safeServices = services && services.length > 0 ? services : INITIAL_SERVICES;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBookService = (serviceTitle: string) => {
    if (onOpenBookingWithService) {
      onOpenBookingWithService(serviceTitle);
    } else if (onOpenBooking) {
      onOpenBooking();
    } else if (onNavigate) {
      onNavigate('booking');
    }
  };

  const categories = [
    { id: 'all', label: 'All Services (22)' },
    { id: 'photography', label: 'Photography' },
    { id: 'cinematography', label: 'Cinematography' },
    { id: 'editing', label: 'Photo & Video Editing' },
    { id: 'albums', label: 'Album Design' },
    { id: 'design', label: 'Card & Graphic Design' },
    { id: 'printing', label: 'Frames & Photo Printing' },
  ];

  const filteredServices = safeServices.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div id="services-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Creative Studio Suite</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Our Professional Studio Services
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            From royal wedding ceremonies and 4K films to bespoke 12x36 albums, photo restoration,
            and passport photos. Every project is crafted with uncompromised precision.
          </p>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121216] p-2 sm:p-3 rounded-2xl border border-[#272732]">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#d4af37] text-black shadow-md shadow-[#d4af37]/20 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search services (e.g. Wedding, Album, PSD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
            />
          </div>
        </div>

        {/* Services Grid (All 22 services with image, title, short desc, price, View Details, Book Service) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-[#121216] border border-[#272732] hover:border-[#d4af37]/60 rounded-2xl overflow-hidden flex flex-col shadow-xl transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-xs font-bold text-[#f5e7b2]">
                  Starts ₹{service.startingPrice.toLocaleString()}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                    {service.category}
                  </span>
                  <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-[#f5e7b2] transition-colors mt-0.5">
                    {service.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-3">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Service feature bullets */}
                <div className="space-y-1 text-[11px] text-zinc-400 border-t border-[#272732]/80 pt-3">
                  {(service.features || []).slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#d4af37] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Actions: "View Details" and "Book Service" */}
                <div className="pt-3 border-t border-[#272732] flex items-center justify-between gap-3">
                  <button
                    id={`service-details-${service.id}`}
                    onClick={() => setSelectedService(service)}
                    className="text-xs font-semibold text-zinc-300 hover:text-[#d4af37] transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    id={`service-book-${service.id}`}
                    onClick={() => handleBookService(service.title)}
                    className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs tracking-wide shadow-md shadow-[#d4af37]/20 active:scale-95 transition-all"
                  >
                    Book Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-[#121216] border border-[#272732] rounded-2xl space-y-3">
            <p className="text-sm text-zinc-400">No services found matching "{searchQuery}".</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#d4af37] underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#121216] border border-[#272732] rounded-3xl overflow-hidden shadow-2xl text-zinc-200 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] w-full bg-black">
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] bg-black/80 px-2.5 py-1 rounded">
                  {selectedService.category}
                </span>
                <h2 className="font-cinzel text-2xl font-bold text-white mt-1 shadow-sm">
                  {selectedService.title}
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Service Overview
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {selectedService.fullDescription}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Included Features & Quality Standards
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(selectedService.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#181820] border border-[#272732] flex items-center gap-2 text-xs text-zinc-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#272732] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400">Starting Price</span>
                  <div className="text-xl font-extrabold text-white font-mono">
                    ₹{selectedService.startingPrice.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const name = selectedService.title;
                      setSelectedService(null);
                      handleBookService(name);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-black" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
