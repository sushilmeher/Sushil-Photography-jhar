import React, { useState } from 'react';
import {
  Instagram,
  Facebook,
  Youtube,
  Phone,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Save,
  RotateCcw,
  ShieldCheck,
  Globe,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useSocialMedia } from '../hooks/useSocialMedia';
import { SocialMediaLinks } from './SocialMediaLinks';
import { SocialMediaSettings } from '../types';

export const AdminSocialMediaManager: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useSocialMedia();
  const [formData, setFormData] = useState<SocialMediaSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync formData when settings change
  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleChange = (field: keyof SocialMediaSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveSuccess(false);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateSettings(formData);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to save social media settings.');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all social links back to Sushil Photography Jhar verified defaults?')) {
      await resetToDefaults();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div id="admin-social-manager" className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#14141d] border border-[#272732]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" />
            <span>Social Channels & Clickable Icons</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            Manage Verified Social Media Profiles
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Configure official links for Instagram, Facebook, YouTube, WhatsApp, and Phone. All links update across the Header, Footer, Contact Page, and Mobile Menu in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-[#22222d] hover:bg-[#2c2c3b] border border-[#333342] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Social media links and visibility settings saved successfully and broadcast to all pages!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="p-6 rounded-3xl bg-[#111116] border border-[#272732] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#d4af37]" />
              <span>Live Website Icon Bar Preview</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Interactive preview of how visitors see and click your social icons.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-[#181822] text-[#d4af37] border border-[#272732]">
            Synchronized
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#09090d] border border-[#272732]/70 flex flex-wrap items-center justify-center sm:justify-start gap-4">
          <SocialMediaLinks variant="footer" />
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instagram Settings */}
          <div className="p-6 rounded-3xl bg-[#14141d] border border-[#272732] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">Instagram Profile</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showInstagram}
                  onChange={(e) => handleChange('showInstagram', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://www.instagram.com/..."
                className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none font-mono"
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Action: Opens in new tab</span>
              <a
                href={formData.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:underline flex items-center gap-1"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Facebook Settings */}
          <div className="p-6 rounded-3xl bg-[#14141d] border border-[#272732] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Facebook className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">Facebook Page</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showFacebook}
                  onChange={(e) => handleChange('showFacebook', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://www.facebook.com/..."
                className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none font-mono"
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Action: Opens in new tab</span>
              <a
                href={formData.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* YouTube Settings */}
          <div className="p-6 rounded-3xl bg-[#14141d] border border-[#272732] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                  <Youtube className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">YouTube Channel</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showYouTube}
                  onChange={(e) => handleChange('showYouTube', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                YouTube Channel URL
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none font-mono"
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Action: Opens in new tab</span>
              <a
                href={formData.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline flex items-center gap-1"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Direct Contact Links (WhatsApp & Phone) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#14141d] border border-[#272732] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">Direct WhatsApp</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showWhatsApp}
                  onChange={(e) => handleChange('showWhatsApp', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                WhatsApp Phone Number (10 Digits)
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="7608814804"
                className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Generates WhatsApp link to chat with Sushil Meher.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#14141d] border border-[#272732] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-white">Direct Call Now</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showPhone}
                  onChange={(e) => handleChange('showPhone', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d4af37]"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Phone Number (Primary)
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="7608814804"
                className="w-full bg-[#181822] border border-[#272732] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d4af37] outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Triggers direct telephone dialer on mobile devices.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#272732]">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-black font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4 text-black" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Social Media Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
