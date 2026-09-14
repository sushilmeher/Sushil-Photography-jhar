import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Film,
  Compass,
  BookOpen,
  Clock,
  HardDrive,
  CreditCard,
  CheckCircle2,
  XCircle,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { PackageItem } from '../types';
import { INITIAL_PACKAGES } from '../data/mockData';

interface PackagesPageProps {
  packages?: PackageItem[];
  onOpenBookingWithPackage?: (pkg: PackageItem) => void;
  onOpenBooking?: () => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({
  packages = [],
  onOpenBookingWithPackage,
  onOpenBooking,
}) => {
  const safePackages = packages && packages.length > 0 ? packages : INITIAL_PACKAGES;
  // Custom Package Builder state
  const [customPhotoDays, setCustomPhotoDays] = useState(1);
  const [includeCinema, setIncludeCinema] = useState(true);
  const [includeDrone, setIncludeDrone] = useState(false);
  const [albumSheets, setAlbumSheets] = useState(30); // 30 sheets
  const [includePreWedding, setIncludePreWedding] = useState(false);
  const [includeOldRestoration, setIncludeOldRestoration] = useState(false);

  // Dynamic estimate calculation
  const calculateCustomPrice = () => {
    let base = customPhotoDays * 5000;
    if (includeCinema) base += customPhotoDays * 4500;
    if (includeDrone) base += 4000;
    if (albumSheets > 0) base += albumSheets * 200;
    if (includePreWedding) base += 7500;
    if (includeOldRestoration) base += 1000;
    return base;
  };

  const estimatedCustomTotal = calculateCustomPrice();

  return (
    <div id="packages-page" className="min-h-screen bg-[#09090b] text-zinc-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181820] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clear, Honest & Transparent Value</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Wedding Photography Packages
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            From budget-friendly ceremony documentation to complete royal multi-camera cinematic
            coverage with drone aerials and handcrafted 12x36 photobooks.
          </p>
        </div>

        {/* 5 Standard Packages Detailed Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {safePackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                pkg.popular
                  ? 'bg-[#181824] border-2 border-[#d4af37] shadow-2xl shadow-[#d4af37]/20 -translate-y-2'
                  : 'bg-[#121216] border border-[#272732] hover:border-zinc-500'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#d4af37] text-black font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                  Most Popular Choice
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="font-cinzel text-base font-bold text-zinc-200 uppercase">
                    {pkg.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white font-mono">
                      ₹{pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#d4af37] mt-0.5">{pkg.subtitle}</p>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                {/* Granular inclusions mandated by prompt */}
                <div className="space-y-2.5 text-xs text-zinc-300 border-t border-[#272732] pt-4">
                  <div className="flex items-start gap-2">
                    <Camera className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Photography:</strong> {pkg.photographers}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Film className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Cinematography:</strong> {pkg.cinematographers} ({pkg.videoCoverage})
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Compass className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Drone 4K:</strong>{' '}
                      {pkg.droneIncluded ? (
                        <span className="text-emerald-400 font-semibold">Included</span>
                      ) : (
                        <span className="text-zinc-500">Optional Add-on</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Album:</strong> {pkg.album}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <HardDrive className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Delivery:</strong> {pkg.deliveryFormat}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Turnaround:</strong> {pkg.deliveryTime}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-200">Advance:</strong> ₹{pkg.advanceRequired.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onOpenBookingWithPackage(pkg)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                    pkg.popular
                      ? 'bg-[#d4af37] hover:bg-[#e5c158] text-black shadow-[#d4af37]/20'
                      : 'bg-[#181820] hover:bg-zinc-800 text-zinc-200 border border-[#272732]'
                  }`}
                >
                  Book This Package
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CUSTOM PACKAGE BUILDER (Mandated by section 10) */}
        <div
          id="custom-package-builder"
          className="bg-[#121216] border border-[#272732] rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center mx-auto text-[#d4af37] mb-2">
                <Calculator className="w-6 h-6" />
              </div>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-white">
                Interactive Custom Package Builder
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Tailor your event coverage by toggling exactly the crew, gear, and album size you need.
              </p>
            </div>

            <div className="space-y-6 bg-[#09090b] p-6 sm:p-8 rounded-2xl border border-[#272732]">
              {/* Option 1: Days */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Number of Event Days / Ceremonies
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((days) => (
                    <button
                      type="button"
                      key={days}
                      onClick={() => setCustomPhotoDays(days)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        customPhotoDays === days
                          ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold'
                          : 'bg-[#121216] text-zinc-400 border-[#272732] hover:border-zinc-700'
                      }`}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 2: Services Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIncludeCinema(!includeCinema)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    includeCinema
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                      : 'bg-[#121216] border-[#272732] text-zinc-400'
                  }`}
                >
                  <span>4K Cinematography + Highlight Teaser</span>
                  <span className="font-mono font-bold text-[#d4af37]">+₹4,500/day</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeDrone(!includeDrone)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    includeDrone
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                      : 'bg-[#121216] border-[#272732] text-zinc-400'
                  }`}
                >
                  <span>Drone 4K Barat & Mandap Aerials</span>
                  <span className="font-mono font-bold text-[#d4af37]">+₹4,000</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIncludePreWedding(!includePreWedding)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    includePreWedding
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                      : 'bg-[#121216] border-[#272732] text-zinc-400'
                  }`}
                >
                  <span>Pre-Wedding Outdoor Shoot Session</span>
                  <span className="font-mono font-bold text-[#d4af37]">+₹7,500</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeOldRestoration(!includeOldRestoration)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    includeOldRestoration
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                      : 'bg-[#121216] border-[#272732] text-zinc-400'
                  }`}
                >
                  <span>Heritage Parents Photo Restoration</span>
                  <span className="font-mono font-bold text-[#d4af37]">+₹1,000</span>
                </button>
              </div>

              {/* Album Sheet Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-zinc-300">
                    12x36 Photobook Sheets: <strong className="text-[#d4af37]">{albumSheets} Sheets</strong> ({albumSheets * 2} Pages)
                  </label>
                  <span className="text-xs font-mono text-zinc-400">
                    ₹{(albumSheets * 200).toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={albumSheets}
                  onChange={(e) => setAlbumSheets(Number(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>No Album (0)</span>
                  <span>20 Sheets</span>
                  <span>30 Sheets (Standard)</span>
                  <span>50 Sheets (Royal)</span>
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="p-5 rounded-xl bg-[#181820] border border-[#272732] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">
                    Estimated Custom Investment
                  </span>
                  <div className="text-3xl font-black text-[#f5e7b2] font-mono mt-0.5">
                    ₹{estimatedCustomTotal.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Includes full editing, color grading & 90-day cloud backup.
                  </p>
                </div>

                <button
                  onClick={onOpenBooking}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs tracking-wider uppercase shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Send for Approval</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
