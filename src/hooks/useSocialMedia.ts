import { useState, useEffect, useCallback } from 'react';
import { SocialMediaSettings } from '../types';
import { api } from '../services/api';

const STORAGE_KEY = 'sushil_social_media_settings';
const EVENT_KEY = 'sushil_social_media_changed';

const DEFAULT_SETTINGS: SocialMediaSettings = {
  instagramUrl: 'https://www.instagram.com/sushil__photography_jhar?stkn=dWYxM2Z6cW5hbWt4',
  facebookUrl: 'https://www.facebook.com/share/1X7CCrhwjN/',
  youtubeUrl: 'https://youtube.com/@sushilphotographyjhar?si=Sz-sGwGLGphMeUKX',
  showInstagram: true,
  showFacebook: true,
  showYouTube: true,
};

export function useSocialMedia() {
  const [settings, setSettings] = useState<SocialMediaSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SocialMediaSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_KEY, handleCustomEvent);

    // Fetch from backend
    api.getSocialMedia()
      .then((data) => {
        if (data) {
          const merged = { ...DEFAULT_SETTINGS, ...data };
          setSettings(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Fallback gracefully
      });

    return () => {
      window.removeEventListener(EVENT_KEY, handleCustomEvent);
    };
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<SocialMediaSettings>) => {
    setIsLoading(true);
    try {
      const updated: SocialMediaSettings = {
        ...settings,
        ...newSettings,
        updatedAt: new Date().toISOString(),
      };

      setSettings(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: updated }));

      await api.updateSocialMedia(updated);
      setIsLoading(false);
      return updated;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, [settings]);

  const hasActiveSocialLinks = Boolean(
    (settings.showInstagram && settings.instagramUrl?.trim()) ||
    (settings.showFacebook && settings.facebookUrl?.trim()) ||
    (settings.showYouTube && settings.youtubeUrl?.trim())
  );

  return {
    settings,
    saveSettings,
    isLoading,
    hasActiveSocialLinks,
  };
}
