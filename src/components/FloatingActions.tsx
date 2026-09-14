import React from 'react';
import { Phone, Calendar, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

interface FloatingActionsProps {
  onOpenBooking: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ onOpenBooking }) => {
  return (
    <>
      {/* Floating WhatsApp Button for Desktop and Tablet */}
      <aside
        id="floating-whatsapp-container"
        className="fixed bottom-20 md:bottom-8 right-5 sm:right-8 z-40"
        aria-label="Quick WhatsApp Contact"
      >
        <a
          id="floating-whatsapp-btn"
          href={BUSINESS_INFO.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-emerald-950/80 border border-emerald-400/30 hover:scale-105 active:scale-95 transition-all duration-300"
          title="Chat directly with Sushil Meher on WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </div>
          <span className="hidden sm:inline text-xs font-semibold tracking-wide">
            Chat on WhatsApp
          </span>
        </a>
      </aside>

      {/* Sticky Bottom Mobile Bar (Call, WhatsApp, Book Now) */}
      <nav
        id="mobile-sticky-bottom-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c10]/95 backdrop-blur-lg border-t border-[#272732] px-3 py-2.5 flex items-center justify-between gap-2 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.8)]"
        aria-label="Mobile quick actions"
      >
        {/* Call button */}
        <a
          id="mobile-sticky-call"
          href={`tel:${BUSINESS_INFO.phone}`}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-[#181820] border border-[#272732] text-zinc-200 active:bg-zinc-800 transition-colors"
        >
          <Phone className="w-4 h-4 text-[#d4af37] mb-0.5" />
          <span className="text-[11px] font-medium">Call</span>
        </a>

        {/* WhatsApp button */}
        <a
          id="mobile-sticky-whatsapp"
          href={BUSINESS_INFO.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 active:bg-emerald-900 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400 mb-0.5" />
          <span className="text-[11px] font-medium">WhatsApp</span>
        </a>

        {/* Book Now button */}
        <button
          id="mobile-sticky-book-now"
          onClick={onOpenBooking}
          className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs shadow-lg shadow-[#d4af37]/30 active:scale-95 transition-transform"
        >
          <Calendar className="w-3.5 h-3.5 text-black" />
          <span>Book Now</span>
        </button>
      </nav>
    </>
  );
};
