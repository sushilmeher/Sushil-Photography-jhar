import React, { useState, useEffect } from 'react';
import {
  Scale,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  Clock,
  ShieldCheck,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { StudioPoliciesData, PolicySection } from '../types';
import { DEFAULT_POLICIES_DATA } from '../data/defaultPolicies';
import { api } from '../services/api';

export const AdminPolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<StudioPoliciesData>(() => {
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

  const [selectedSectionId, setSelectedSectionId] = useState<string>(policies.sections[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable section state
  const selectedSection = policies.sections.find((s) => s.id === selectedSectionId) || policies.sections[0];
  const [editTitle, setEditTitle] = useState(selectedSection?.title || '');
  const [editSummary, setEditSummary] = useState(selectedSection?.summary || '');
  const [editContent, setEditContent] = useState(selectedSection?.content || '');
  const [editPublished, setEditPublished] = useState(selectedSection?.isPublished ?? true);
  const [lastUpdatedDate, setLastUpdatedDate] = useState(policies.lastUpdated || 'September 14, 2026');

  useEffect(() => {
    if (selectedSection) {
      setEditTitle(selectedSection.title);
      setEditSummary(selectedSection.summary);
      setEditContent(selectedSection.content);
      setEditPublished(selectedSection.isPublished);
    }
  }, [selectedSectionId]);

  const handleUpdateCurrentSection = () => {
    const updatedSections = policies.sections.map((sec) => {
      if (sec.id === selectedSectionId) {
        return {
          ...sec,
          title: editTitle,
          summary: editSummary,
          content: editContent,
          isPublished: editPublished,
          lastModified: new Date().toISOString(),
        };
      }
      return sec;
    });

    const updatedData: StudioPoliciesData = {
      ...policies,
      lastUpdated: lastUpdatedDate,
      sections: updatedSections,
    };

    setPolicies(updatedData);
    return updatedData;
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const dataToSave = handleUpdateCurrentSection();
      localStorage.setItem('sushil_policies_data', JSON.stringify(dataToSave));
      await api.updatePolicies(dataToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save policies to server. Saved to browser storage.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all policies back to standard studio legal defaults?')) {
      setPolicies(DEFAULT_POLICIES_DATA);
      localStorage.setItem('sushil_policies_data', JSON.stringify(DEFAULT_POLICIES_DATA));
      setSelectedSectionId(DEFAULT_POLICIES_DATA.sections[0].id);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal & Studio Governance</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            Policies & Legal Management
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage Terms & Conditions, Cancellation, Payment rules, Privacy, and copyright policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl bg-[#1c1c28] hover:bg-[#252535] border border-[#2e2e42] text-xs text-zinc-300 transition-colors"
          >
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:brightness-110 transition-all disabled:opacity-60"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
            <span>Save Policies</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Policies successfully updated and synchronized with live website!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Global Policy Settings Banner */}
      <div className="bg-[#121217] border border-[#272732] rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Studio Legal Name
          </label>
          <input
            type="text"
            value={policies.businessName}
            onChange={(e) => setPolicies({ ...policies, businessName: e.target.value })}
            className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Owner & Licensee
          </label>
          <input
            type="text"
            value={policies.ownerName}
            onChange={(e) => setPolicies({ ...policies, ownerName: e.target.value })}
            className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Last Updated Display Date
          </label>
          <input
            type="text"
            value={lastUpdatedDate}
            onChange={(e) => setLastUpdatedDate(e.target.value)}
            className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none font-mono"
          />
        </div>
      </div>

      {/* Two Column Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section List */}
        <div className="lg:col-span-4 bg-[#121217] border border-[#272732] rounded-3xl p-4 space-y-1 max-h-[750px] overflow-y-auto custom-scrollbar">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 py-2 block">
            Select Policy Section (14 Total)
          </span>

          {policies.sections.map((sec) => {
            const isSelected = sec.id === selectedSectionId;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  handleUpdateCurrentSection();
                  setSelectedSectionId(sec.id);
                }}
                className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-[#d4af37]/20 border border-[#d4af37] text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181822]'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="text-zinc-500 font-mono mr-1.5">{sec.order}.</span>
                  <span>{sec.title}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${sec.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {sec.isPublished ? 'Active' : 'Hidden'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Section Content Editor */}
        <div className="lg:col-span-8 bg-[#121217] border border-[#272732] rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272732] pb-4 gap-3">
            <div>
              <h3 className="font-cinzel text-base font-bold text-white">
                Edit Section: {selectedSection?.title}
              </h3>
              <span className="text-xs text-zinc-400">Category: {selectedSection?.category}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={editPublished}
                onChange={(e) => setEditPublished(e.target.checked)}
                className="w-4 h-4 rounded text-[#d4af37] focus:ring-0 bg-[#181820]"
              />
              <span>Published on Website</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Section Heading / Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Short Summary Highlight
              </label>
              <input
                type="text"
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="w-full bg-[#181820] border border-[#272732] rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                Detailed Policy Content (Supports Markdown & Bullet points)
              </label>
              <textarea
                rows={14}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-[#181820] border border-[#272732] rounded-xl p-4 text-xs font-mono text-zinc-200 focus:border-[#d4af37] outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4 text-black" />
                <span>Save Current Section</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
