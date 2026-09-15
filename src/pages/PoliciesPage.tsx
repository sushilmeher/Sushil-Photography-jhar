import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileText,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Scale,
  Lock,
  Camera,
  Share2,
  Printer,
  Download,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { StudioPoliciesData, PolicySection } from '../types';
import { DEFAULT_POLICIES_DATA } from '../data/defaultPolicies';
import { api } from '../services/api';

interface PoliciesPageProps {
  initialSlug?: string;
  onNavigate?: (tab: string) => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({
  initialSlug = 'terms-and-conditions',
  onNavigate,
}) => {
  const [policiesData, setPoliciesData] = useState<StudioPoliciesData>(() => {
    try {
      const stored = localStorage.getItem('sushil_policies_data');
      if (stored) {
        return { ...DEFAULT_POLICIES_DATA, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_POLICIES_DATA;
  });

  const [activeSectionId, setActiveSectionId] = useState<string>(policiesData.sections[0]?.id || 'sec-terms');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch live policies if available
    api.getPolicies()
      .then((data) => {
        if (data && data.sections) {
          setPoliciesData(data);
          try {
            localStorage.setItem('sushil_policies_data', JSON.stringify(data));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // use default
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filteredSections = policiesData.sections.filter((sec) => {
    if (!sec.isPublished) return false;
    const matchesCategory = selectedCategory === 'all' || sec.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeSection = policiesData.sections.find((s) => s.id === activeSectionId) || policiesData.sections[0];

  return (
    <div id="policies-page" className="min-h-screen bg-[#09090d] text-zinc-200 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#15151f] via-[#101017] to-[#0d0d12] border border-[#272732] p-8 sm:p-12 overflow-hidden shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Studio Legal, Terms & Policies</span>
            </div>

            <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide">
              Terms & Conditions <span className="text-[#d4af37]">& Policies</span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Transparent, professional guidelines governing bookings, advance payments, wedding cinematography, album customization, photo copyright, and customer privacy for <strong className="text-white">Sushil Photography Jhar</strong>.
            </p>

            {/* Business Verification Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-400 border-t border-[#272732]/70">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span><strong>Owner:</strong> Sushil Meher – Professional Photographer & Editor</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                <span>Jhar, Sohela, Bargarh, Odisha, India</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-mono">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Last Updated: {policiesData.lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Tools: Print & Download */}
          <div className="mt-6 sm:mt-0 sm:absolute sm:top-10 sm:right-10 flex items-center gap-2">
            <button
              type="button"
              id="btn-print-policies"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#1c1c28] hover:bg-[#252535] border border-[#2e2e42] text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-2 transition-colors shadow-lg"
            >
              <Printer className="w-4 h-4 text-[#d4af37]" />
              <span>Print Policies</span>
            </button>
          </div>
        </div>

        {/* Category Pills & Quick Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#272732] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All 14 Sections' },
              { id: 'terms', label: 'Terms & Conditions' },
              { id: 'payment', label: 'Payment & Advance' },
              { id: 'refund', label: 'Refunds & Rescheduling' },
              { id: 'privacy', label: 'Privacy & Security' },
              { id: 'usage', label: 'Photo & Video Usage' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20'
                    : 'bg-[#14141b] text-zinc-400 hover:text-white border border-[#272732]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search policies (e.g. advance, refund)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14141b] border border-[#272732] rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none"
            />
          </div>
        </div>

        {/* Content Layout: Left Table of Contents / Sidebar, Right Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Table of Contents Sidebar */}
          <div className="lg:col-span-4 bg-[#121217] border border-[#272732] rounded-3xl p-5 space-y-2 sticky top-28 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-cinzel text-xs font-bold text-zinc-400 uppercase tracking-wider px-3 py-1">
              Table of Contents
            </h3>
            
            <div className="space-y-1">
              {filteredSections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      const el = document.getElementById(sec.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f5e7b2] font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181822]'
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#d4af37]' : 'text-zinc-600'}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick Contact Box in Sidebar */}
            <div className="pt-4 mt-4 border-t border-[#272732] p-3 rounded-2xl bg-[#0d0d12] space-y-2 text-xs">
              <span className="font-semibold text-white block">Need Policy Clarification?</span>
              <p className="text-zinc-400 text-[11px]">
                Speak directly with Sushil Meher for custom event agreements.
              </p>
              <div className="space-y-1 text-zinc-300 font-mono text-[11px]">
                <a href="tel:7608814804" className="block text-[#d4af37] hover:underline">
                  📞 +91 7608814804
                </a>
                <a href="mailto:sushilmeher947@gmail.com" className="block text-zinc-400 hover:underline truncate">
                  ✉️ sushilmeher947@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Main Policy Content Sections */}
          <div className="lg:col-span-8 space-y-8">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl transition-all scroll-mt-28"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272732] pb-4 gap-2">
                  <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                    <span>{section.title}</span>
                  </h2>
                  <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 bg-[#181822] px-2.5 py-1 rounded-md self-start sm:self-center">
                    Section {section.order}
                  </span>
                </div>

                {/* Summary Banner */}
                {section.summary && (
                  <div className="p-3.5 rounded-xl bg-[#161622] border border-[#2e2e42] text-xs text-[#e8dcb8] leading-relaxed">
                    <strong>Summary: </strong>{section.summary}
                  </div>
                )}

                {/* Formatted Markdown Content */}
                <div className="text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed font-sans">
                  {section.content.split('\n\n').map((para, pIdx) => {
                    if (para.startsWith('### ')) {
                      return (
                        <h3 key={pIdx} className="font-cinzel text-sm sm:text-base font-bold text-amber-300 pt-2 border-b border-[#272732]/50 pb-1">
                          {para.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (para.startsWith('* ')) {
                      const lines = para.split('\n');
                      return (
                        <ul key={pIdx} className="space-y-1.5 pl-2">
                          {lines.map((l, lIdx) => {
                            const clean = l.replace(/^\*\s*/, '');
                            return (
                              <li key={lIdx} className="flex items-start gap-2">
                                <span className="text-[#d4af37] font-bold text-base leading-none">•</span>
                                <span className="text-zinc-300">
                                  {clean.split('**').map((chunk, cIdx) =>
                                    cIdx % 2 === 1 ? <strong key={cIdx} className="text-white font-semibold">{chunk}</strong> : chunk
                                  )}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-zinc-300">
                        {para.split('**').map((chunk, cIdx) =>
                          cIdx % 2 === 1 ? <strong key={cIdx} className="text-white font-semibold">{chunk}</strong> : chunk
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Bottom Official Contact Card */}
            <div className="bg-gradient-to-br from-[#181822] to-[#121217] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-white">
                    Sushil Photography Jhar
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Professional Photography, Cinematography & Album Design
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0d0d12] border border-[#272732] space-y-1">
                  <span className="text-zinc-500 font-semibold block text-[10px] uppercase">Location</span>
                  <p className="text-zinc-200">Jhar, Sohela, Bargarh District, Odisha - 768033</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d0d12] border border-[#272732] space-y-1">
                  <span className="text-zinc-500 font-semibold block text-[10px] uppercase">Contact Numbers</span>
                  <p className="text-[#d4af37] font-mono font-bold">
                    <a href="tel:7608814804" className="hover:underline">+91 7608814804</a><br />
                    <a href="tel:7735045136" className="hover:underline text-zinc-300 font-normal">+91 7735045136</a>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d0d12] border border-[#272732] space-y-1">
                  <span className="text-zinc-500 font-semibold block text-[10px] uppercase">Official Email</span>
                  <a href="mailto:sushilmeher947@gmail.com" className="text-zinc-200 hover:text-white hover:underline block truncate font-mono">
                    sushilmeher947@gmail.com
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 border-t border-[#272732]">
                <span>All photography copyrights & creative templates reserved © 2026 Sushil Meher.</span>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('contact')}
                    className="text-[#d4af37] font-bold hover:underline"
                  >
                    Contact Studio Desk →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
