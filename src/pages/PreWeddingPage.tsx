import React from 'react';
import {
  Sparkles,
  Heart,
  MapPin,
  Camera,
  Film,
  Compass,
  Shirt,
  Music,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

interface PreWeddingPageProps {
  onOpenBooking?: () => void;
  onNavigate?: (tab: string) => void;
  onOpenLightbox?: (item: any) => void;
}

export const PreWeddingPage: React.FC<PreWeddingPageProps> = ({
  onOpenBooking = () => {},
  onNavigate = (_tab: string) => {},
}) => {
  const preWeddingConcepts = [
    {
      title: 'Romantic Sunset & Heritage Temples',
      desc: 'Golden hour silhouette frames against ancient stone carvings and peaceful temple lakes in Sambalpur & Bargarh.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: 'Cinematic Drone & Misty Forests',
      desc: 'Aerial top-down angles capturing couples walking through scenic reserve hills and lakeside shorelines.',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: 'Music Video Bollywood Style',
      desc: 'Choreographed slow-motion transitions, dupatta fluttering, and 4K music video color-grading matching your love song.',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: 'Royal Ethnic Traditional Elegance',
      desc: 'Sambalpuri handloom sarees, regal kurta styling, and traditional Odia cultural aesthetics captured with magazine flair.',
      image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=700&q=80',
    },
  ];

  const preWeddingPackages = [
    {
      title: 'Silver Outdoor Pre-Wedding',
      price: 8000,
      duration: 'Half Day (4-5 Hours)',
      locations: '1 Outdoor Scenic Location',
      inclusions: [
        '1 Senior Candid Photographer',
        '25 Master Retouched High-Res Photos',
        'All Unedited Raw Photos Delivered',
        'Costume & Pose Direction',
        'Private Cloud Gallery Link',
      ],
    },
    {
      title: 'Golden Cinematic Film & Drone',
      price: 15000,
      popular: true,
      duration: 'Full Day (Sunrise to Sunset)',
      locations: '2 Multiple Scenic Locations',
      inclusions: [
        '1 Candid Photographer + 1 4K Cinematographer',
        'Licensed 4K Aerial Drone Coverage',
        '40 Master Retouched Magazine Edits',
        '2-3 Minute 4K Cinematic Love Story Teaser',
        'Styling & Wardrobe Coordination Guidance',
      ],
    },
    {
      title: 'Royal Destination Pre-Wedding',
      price: 25000,
      duration: '2 Days / Multi-Destination',
      locations: '3+ Locations (Debrigarh / Hirakud / Temple Sites)',
      inclusions: [
        'Dual Cinematographers + Dual Photographers',
        'Complete Drone Aerial Film',
        'Romantic 5-Minute Music Video Song Film',
        'Exclusive 12x24 Velvet Pre-Wedding Photobook',
        'Express 48-Hour Highlight Delivery',
      ],
    },
  ];

  return (
    <div id="pre-wedding-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Cherished Romance Before The Big Day</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Cinematic Pre-Wedding Shoots
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Tell your intimate love story with breathtaking outdoor locations, 4K aerial drone
            glides, curated costume consultation, and soulful music video editing.
          </p>
        </div>

        {/* 6 Key Pre-Wedding Pillars (From prompt) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Romantic Concepts', icon: Heart },
            { label: 'Location Shoots', icon: MapPin },
            { label: 'Drone 4K Aerials', icon: Compass },
            { label: 'Cinematic Teaser', icon: Film },
            { label: 'Costume Guidance', icon: Shirt },
            { label: 'Music Video Style', icon: Music },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#121216] border border-[#272732] text-center space-y-2 hover:border-[#d4af37]/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-zinc-200">{feat.label}</h4>
              </div>
            );
          })}
        </div>

        {/* Visual Concepts Grid */}
        <div className="space-y-6">
          <h2 className="font-cinzel text-2xl font-bold text-white text-center">
            Inspiring Pre-Wedding Visual Concepts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {preWeddingConcepts.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#121216] border border-[#272732] rounded-2xl overflow-hidden shadow-xl group hover:border-[#d4af37]/60 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-cinzel text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Wedding Packages */}
        <div className="space-y-8 bg-[#0c0c10] border border-[#272732] rounded-3xl p-6 sm:p-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              Transparent Pricing
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
              Pre-Wedding Photography Packages
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Personalized shoot itineraries with Sushil Meher leading artistic direction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {preWeddingPackages.map((pkg, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 flex flex-col justify-between space-y-6 ${
                  pkg.popular
                    ? 'bg-[#181824] border-2 border-[#d4af37] shadow-2xl shadow-[#d4af37]/15'
                    : 'bg-[#121216] border border-[#272732]'
                }`}
              >
                <div className="space-y-4">
                  {pkg.popular && (
                    <span className="px-3 py-1 rounded-full bg-[#d4af37] text-black text-[10px] font-extrabold uppercase tracking-wider">
                      Most Chosen by Couples
                    </span>
                  )}
                  <div>
                    <h3 className="font-cinzel text-lg font-bold text-white">{pkg.title}</h3>
                    <div className="text-2xl font-black text-white font-mono mt-2">
                      ₹{pkg.price.toLocaleString()}
                    </div>
                    <p className="text-xs text-[#d4af37] mt-1">{pkg.duration}</p>
                    <p className="text-[11px] text-zinc-400">{pkg.locations}</p>
                  </div>

                  <ul className="space-y-2 text-xs text-zinc-300 border-t border-[#272732] pt-4">
                    {pkg.inclusions.map((inc, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onOpenBooking}
                  className="w-full py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs tracking-wider uppercase transition-colors"
                >
                  Book Pre-Wedding Shoot
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
