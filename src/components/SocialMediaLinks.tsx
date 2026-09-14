import React from 'react';
import { Instagram, Facebook, Youtube, ExternalLink } from 'lucide-react';
import { useSocialMedia } from '../hooks/useSocialMedia';

interface SocialMediaLinksProps {
  variant?: 'header' | 'footer' | 'contact' | 'about' | 'compact' | 'pill';
  className?: string;
  showLabels?: boolean;
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  variant = 'compact',
  className = '',
  showLabels = false,
}) => {
  const { settings, hasActiveSocialLinks } = useSocialMedia();

  if (!hasActiveSocialLinks) {
    return null;
  }

  const links = [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@sushil__photography_jhar',
      url: settings.instagramUrl,
      visible: settings.showInstagram && Boolean(settings.instagramUrl?.trim()),
      icon: Instagram,
      hoverClass: 'hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10',
      activeColor: 'text-pink-400',
      badge: 'Photos & Reels',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: 'Sushil Photography',
      url: settings.facebookUrl,
      visible: settings.showFacebook && Boolean(settings.facebookUrl?.trim()),
      icon: Facebook,
      hoverClass: 'hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10',
      activeColor: 'text-blue-400',
      badge: 'Community & Reviews',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: '@sushilphotographyjhar',
      url: settings.youtubeUrl,
      visible: settings.showYouTube && Boolean(settings.youtubeUrl?.trim()),
      icon: Youtube,
      hoverClass: 'hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10',
      activeColor: 'text-red-400',
      badge: '4K Wedding Films',
    },
  ].filter((item) => item.visible);

  if (links.length === 0) return null;

  // Header / Top bar variant
  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              id={`header-social-${link.id}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visit Sushil Photography on ${link.name}`}
              className={`p-1.5 rounded-lg text-zinc-400 border border-transparent transition-all duration-200 ${link.hoverClass} focus:outline-none focus:ring-1 focus:ring-[#d4af37]`}
            >
              <Icon className="w-3.5 h-3.5" />
            </a>
          );
        })}
      </div>
    );
  }

  // Footer variant
  if (variant === 'footer') {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              id={`footer-social-${link.id}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14141c] border border-[#272733] text-zinc-300 transition-all duration-200 ${link.hoverClass} group`}
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-xs font-medium">{link.name}</span>
            </a>
          );
        })}
      </div>
    );
  }

  // Contact page card variant (Rich)
  if (variant === 'contact') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              id={`contact-social-${link.id}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 rounded-2xl bg-[#13131a] border border-[#262635] flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 ${link.hoverClass} group`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 block mb-0.5">
                  {link.badge}
                </span>
                <span className="text-xs font-bold text-white block">
                  {link.name}
                </span>
                <span className="text-[11px] text-zinc-400 truncate block mt-0.5">
                  {link.handle}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  // Default compact or pill variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.id}
            id={`social-link-${link.id}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Follow on ${link.name}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141c] border border-[#272733] text-zinc-400 text-xs transition-all duration-200 ${link.hoverClass}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {showLabels && <span>{link.name}</span>}
          </a>
        );
      })}
    </div>
  );
};
