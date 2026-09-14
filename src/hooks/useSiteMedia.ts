import { useState, useEffect, useCallback } from 'react';
import { SiteMediaConfig } from '../types';
import { api } from '../services/api';

const STORAGE_KEY = 'sushil_site_media_config';
const EVENT_KEY = 'sushil_site_media_changed';

const DEFAULT_CONFIG: SiteMediaConfig = {
  logoMain: '',
  logoHeader: '',
  logoFooter: '',
  logoMobile: '',
  logoFavicon: '',
  founderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  paymentQrCode: '',
  upiId: '7608814804@ybl',
  instagramCover: '',
  facebookCover: '',
  youtubeCover: '',
  promoBanner1: '',
  promoBanner2: '',
};

export function useSiteMedia() {
  const [config, setConfig] = useState<SiteMediaConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SiteMediaConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_KEY, handleCustomEvent);

    api.getSiteMedia()
      .then((data) => {
        if (data) {
          const merged = { ...DEFAULT_CONFIG, ...data };
          setConfig(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // graceful fallback
      });

    return () => {
      window.removeEventListener(EVENT_KEY, handleCustomEvent);
    };
  }, []);

  const updateSlot = useCallback(async (slotKey: keyof SiteMediaConfig, urlOrValue: string) => {
    setIsLoading(true);
    try {
      const updated: SiteMediaConfig = {
        ...config,
        [slotKey]: urlOrValue,
        updatedAt: new Date().toISOString(),
      };

      setConfig(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: updated }));
      await api.updateSiteMedia({ [slotKey]: urlOrValue });
      setIsLoading(false);
      return updated;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, [config]);

  const removeSlot = useCallback(async (slotKey: keyof SiteMediaConfig) => {
    return updateSlot(slotKey, '');
  }, [updateSlot]);

  return {
    config,
    updateSlot,
    removeSlot,
    isLoading,
  };
}
