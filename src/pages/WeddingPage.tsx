import React, { useState } from 'react';
import {
  Calendar,
  Camera,
  Film,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { BUSINESS_INFO } from '../data/mockData';
import { WeddingHighlightsSection } from '../components/WeddingHighlightsSection';

interface WeddingPageProps {
  initialService?: string;
  onNavigate?: (tab: string) => void;
  onBookingComplete?: (booking: any) => void;
  packages?: any[];
  onOpenBookingWithPackage?: (pkg: any) => void;
  onOpenBooking?: () => void;
  onOpenLightbox?: (item: any) => void;
}

export const WeddingPage: React.FC<WeddingPageProps> = ({
  initialService,
  onNavigate = (_tab: string) => {},
  onBookingComplete,
  onOpenBooking,
}) => {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Bargarh');
  const [eventType, setEventType] = useState('Full Wedding & Reception');
  const [guestCount, setGuestCount] = useState('400 - 600 Guests');
  const [budget, setBudget] = useState('₹15,000 - ₹25,000');
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [requiredServices, setRequiredServices] = useState<string[]>([
    initialService || 'Wedding Photography',
    'Wedding Cinematography',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);

  const availableServices = [
    'Wedding Photography',
    'Wedding Cinematography',
    'Candid Photography',
    'Traditional Photography',
    'Pre-Wedding Photography',
    'Wedding Album (12x36)',
    'Wedding Highlight Video',
    'Drone Aerial Coverage',
  ];

  const handleToggleService = (svc: string) => {
    if (requiredServices.includes(svc)) {
      setRequiredServices(requiredServices.filter((s) => s !== svc));
    } else {
      setRequiredServices([...requiredServices, svc]);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        customerName,
        phone,
        whatsapp: whatsapp || phone,
        email,
        weddingDate,
        eventDate: eventDate || weddingDate,
        venue,
        city,
        eventType,
        guestCount,
        requiredServices,
        budget,
        additionalMessage,
      };

      const result = await api.createBooking(payload);
      setIsSubmitting(false);
      setConfirmedBooking(result);
      if (onBookingComplete) onBookingComplete(result);
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Booking error: ' + (err.message || 'Please check your connection.'));
    }
  };

  const copyBookingId = () => {
    if (confirmedBooking?.bookingId) {
      navigator.clipboard.writeText(confirmedBooking.bookingId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div id="wedding-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Top Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grand Indian Wedding Experience</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Royal Wedding Photography & Cinematography
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Immortalizing love, customs, laughter, and sacred traditions with cinematic finesse
            across Bargarh, Sohela, and all of Odisha.
          </p>
        </div>

        {/* Dedicated 7 Wedding Disciplines Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[
            {
              title: 'Wedding Photography',
              desc: 'Dual full-frame mirrorless coverage capturing every ritual, smile, and garland exchange with flawless dynamic range.',
              image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Wedding Cinematography',
              desc: '4K slow-motion motion picture film with gimbal stabilization, wireless audio capture, and emotional licensed soundtrack.',
              image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Candid Photography',
              desc: 'Unposed, authentic smiles, joyous tears, and hidden glimpses frozen forever with razor-sharp telephoto prime lenses.',
              image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Traditional Photography',
              desc: 'Crisp stage portraits, family group memories, and complete custom documentation ensuring no guest is missed.',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Pre-Wedding Shoots',
              desc: 'Romantic outdoor sessions amidst Odisha’s serene hills, lakes, and heritage temples with editorial styling guidance.',
              image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Wedding Album (12x36)',
              desc: 'Ultra-luxurious lay-flat panoramic albums with gold foil embossed covers, scratch-resistant coating, and royal motifs.',
              image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Wedding Highlight Video',
              desc: 'A breathtaking 3-5 minute cinematic teaser designed to be shared proudly on Instagram reels and family groups.',
              image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
            },
            {
              title: 'Drone Aerial Highlights',
              desc: 'Sweeping 4K bird’s eye views of the marriage procession (Barat), floral welcome gates, and mandap venue architecture.',
              image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#121216] border border-[#272732] rounded-2xl overflow-hidden group hover:border-[#d4af37]/60 transition-all duration-300 shadow-xl"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-cinzel text-base font-bold text-white group-hover:text-[#f5e7b2] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BOOKING SECTION & AVAILABILITY CHECKER */}
        <div id="check-availability-section" className="scroll-mt-24">
          <div className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

            {confirmedBooking ? (
              /* Booking Confirmation Screen */
              <div className="max-w-2xl mx-auto text-center space-y-6 py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                    Booking Request Confirmed
                  </span>
                  <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                    Thank You, {confirmedBooking.booking.customerName}!
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                    Your wedding date reservation request for{' '}
                    <strong className="text-white">{confirmedBooking.booking.weddingDate}</strong> has been received by Sushil Meher.
                  </p>
                </div>

                {/* Unique IDs Card */}
                <div className="bg-[#181820] border border-[#272732] rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#272732]">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                        Unique Booking ID
                      </span>
                      <span className="text-base font-bold text-[#d4af37]">
                        {confirmedBooking.bookingId}
                      </span>
                    </div>
                    <button
                      onClick={copyBookingId}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#272732] hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#272732]">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                        Live Tracking Order ID
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {confirmedBooking.orderId}
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigate('track-order')}
                      className="text-xs text-[#d4af37] hover:underline"
                    >
                      Track Now →
                    </button>
                  </div>

                  <div className="text-zinc-400 text-[11px] space-y-1 font-sans">
                    <p><strong>Venue:</strong> {confirmedBooking.booking.venue}, {confirmedBooking.booking.city}</p>
                    <p><strong>Selected Services:</strong> {confirmedBooking.booking.requiredServices?.join(', ')}</p>
                    <p><strong>Status:</strong> <span className="text-amber-400 font-semibold">Pending Admin Review</span></p>
                  </div>
                </div>

                {/* WhatsApp instant alert action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={`https://wa.me/917608814804?text=Hello%20Sushil%20Meher,%20I%20just%20submitted%20Wedding%20Booking%20ID%20${confirmedBooking.bookingId}%20for%20date%20${confirmedBooking.booking.weddingDate}.%20Please%20confirm%20availability.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Notify Sushil Bhai on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setConfirmedBooking(null)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#181820] border border-[#272732] hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
                  >
                    Submit Another Booking
                  </button>
                </div>
              </div>
            ) : (
              /* Full Booking Form (13 Fields from Prompt) */
              <div className="space-y-8">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                  <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                    Reserve Your Special Date
                  </span>
                  <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                    Check Wedding Date Availability
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    We accept limited wedding assignments each month to ensure cinematic excellence.
                    Fill in your details below for instant reservation verification.
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-6 max-w-4xl mx-auto">
                  {/* Row 1: Name, Phone, WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Bride / Groom / Family Name"
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Phone Number *
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

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="For quotes & photos updates"
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email, Wedding Date, Event Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="For formal quotations & invoices"
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Wedding Date *
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
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Event Date / Haldi Date
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Venue, City, Event Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Venue Name / Hall *
                      </label>
                      <input
                        type="text"
                        required
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="e.g. Royal Palace / Kalyan Mandap"
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bargarh, Sohela, Jhar, Sambalpur"
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Event Type
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                      >
                        <option value="Full Wedding & Reception">Full Wedding & Reception</option>
                        <option value="Wedding Day Only">Wedding Day Only</option>
                        <option value="Engagement & Ring Ceremony">Engagement & Ring Ceremony</option>
                        <option value="Haldi, Sangeet & Barat">Haldi, Sangeet & Barat</option>
                        <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                        <option value="Reception Celebration">Reception Celebration</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Guest Count, Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Approximate Guest Count
                      </label>
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                      >
                        <option value="Under 200 Guests">Under 200 Guests (Intimate)</option>
                        <option value="200 - 400 Guests">200 - 400 Guests</option>
                        <option value="400 - 600 Guests">400 - 600 Guests (Standard)</option>
                        <option value="600 - 1000 Guests">600 - 1000 Guests (Grand)</option>
                        <option value="1000+ Guests">1000+ Guests (Royal Gathering)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Estimated Budget Range
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                      >
                        <option value="₹5,000 (Basic Package 1)">₹5,000 (Basic Package 1)</option>
                        <option value="₹8,000 (Package 2 Photo + Edit)">₹8,000 (Package 2 Photo + Edit)</option>
                        <option value="₹12,000 (Package 3 Photo + Cinema)">₹12,000 (Package 3 Photo + Cinema)</option>
                        <option value="₹15,000 (Package 4 Premium)">₹15,000 (Package 4 Premium)</option>
                        <option value="₹20,000 (Package 5 Complete)">₹20,000 (Package 5 Complete)</option>
                        <option value="₹25,000+ (Multi-Day Luxury)">₹25,000+ (Multi-Day Luxury)</option>
                      </select>
                    </div>
                  </div>

                  {/* Required Services Selection Checkboxes */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      Required Services (Select all that apply) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {availableServices.map((svc) => {
                        const checked = requiredServices.includes(svc);
                        return (
                          <button
                            type="button"
                            key={svc}
                            onClick={() => handleToggleService(svc)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 ${
                              checked
                                ? 'bg-[#d4af37]/20 border-[#d4af37] text-white'
                                : 'bg-[#181820] border-[#272732] text-zinc-400 hover:border-zinc-600'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                checked ? 'bg-[#d4af37] border-[#d4af37] text-black' : 'border-zinc-600'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{svc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Additional Requirements or Special Notes
                    </label>
                    <textarea
                      rows={3}
                      value={additionalMessage}
                      onChange={(e) => setAdditionalMessage(e.target.value)}
                      placeholder="e.g. Schedule of morning barat, bride makeup timing, specific parent portrait requests..."
                      className="w-full bg-[#181820] border border-[#272732] rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  {/* Submission Button */}
                  <div className="pt-2">
                    <button
                      id="wedding-book-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa7c11] text-black font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-2xl shadow-[#d4af37]/30 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Reserving Date & Generating Booking ID...</span>
                        </>
                      ) : (
                        <>
                          <span>Check Availability & Book</span>
                          <ArrowRight className="w-5 h-5 text-black" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Wedding Highlights Section */}
        <div className="pt-8">
          <WeddingHighlightsSection onBookWedding={onOpenBooking} />
        </div>
      </div>
    </div>
  );
};
