import React, { useState } from 'react';
import { X, Calendar, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { PackageItem } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage?: PackageItem | null;
  onBookingSuccess: (bookingId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  onBookingSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Bargarh');
  const [services, setServices] = useState<string[]>(['Wedding Photography', '12x36 Photobook']);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleService = (svc: string) => {
    if (services.includes(svc)) {
      setServices(services.filter((s) => s !== svc));
    } else {
      setServices([...services, svc]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.createBooking({
        customerName,
        phone,
        weddingDate,
        venue,
        city,
        packageChosen: selectedPackage ? selectedPackage.name : 'Custom Wedding Package',
        budget: selectedPackage ? `₹${selectedPackage.price.toLocaleString()}` : '₹12,000 - ₹20,000',
        requiredServices: services,
        notes,
      });

      setIsSubmitting(false);
      onBookingSuccess(res.bookingId);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Booking error: ' + (err.message || 'Please check your connection'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121216] border-2 border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181820] text-[#d4af37] text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Date Reservation</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
              Reserve Your Wedding Date
            </h2>
            <p className="text-xs text-zinc-400">
              {selectedPackage ? `Package: ${selectedPackage.name} (₹${selectedPackage.price.toLocaleString()})` : 'Reserve dates with Sushil Meher'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white bg-[#181820]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Groom / Bride / Client Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh & Suman"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Event / Wedding Date *
              </label>
              <input
                type="date"
                required
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                City / Region *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Sohela / Bargarh / Sambalpur"
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Venue / Mandap Name
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Royal Palace Kalyan Mandap, Sohela"
              className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
            />
          </div>

          {/* Services Checklist */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Select Desired Services
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'Traditional Photography',
                'Candid Photography',
                'Cinematography & Teaser',
                'Drone 4K Barat Shots',
                '12x36 Photobook Album',
                'Pre-Wedding Shoot',
              ].map((svc) => (
                <button
                  type="button"
                  key={svc}
                  onClick={() => toggleService(svc)}
                  className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between ${
                    services.includes(svc)
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                      : 'bg-[#181820] border-[#272732] text-zinc-400'
                  }`}
                >
                  <span className="text-[11px] truncate">{svc}</span>
                  {services.includes(svc) && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Special Notes / Requests
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific ceremonies or requirements..."
              className="w-full bg-[#181820] border border-[#272732] rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              'Transmitting Reservation Request...'
            ) : (
              <>
                <span>Confirm & Reserve Wedding Date</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
