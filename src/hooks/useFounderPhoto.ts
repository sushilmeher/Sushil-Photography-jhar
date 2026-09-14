import { useState, useEffect, useCallback } from 'react';
import { BUSINESS_INFO } from '../data/mockData';
import { api } from '../services/api';

const STORAGE_KEY = 'sushil_founder_photo';
const EVENT_KEY = 'sushil_founder_photo_changed';

export function useFounderPhoto() {
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    } catch {
      // ignore
    }
    return BUSINESS_INFO.founderPhoto;
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Sync across tabs and components
  useEffect(() => {
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setPhotoUrl(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_KEY, handleCustomEvent);

    // Also check server for any persisted photo
    api.getFounderPhoto()
      .then((data) => {
        if (data && data.photoUrl) {
          setPhotoUrl(data.photoUrl);
          try {
            localStorage.setItem(STORAGE_KEY, data.photoUrl);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Fallback or offline
      });

    return () => {
      window.removeEventListener(EVENT_KEY, handleCustomEvent);
    };
  }, []);

  const updatePhoto = useCallback(async (file: File): Promise<string> => {
    setIsUpdating(true);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          // 1. Update local state
          setPhotoUrl(result);

          // 2. Persist to localStorage
          try {
            localStorage.setItem(STORAGE_KEY, result);
          } catch {
            // Storage quota warning or private browsing
          }

          // 3. Broadcast to all mounted components
          window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: result }));

          // 4. Save to backend
          await api.updateFounderPhoto(result).catch(console.error);

          setIsUpdating(false);
          resolve(result);
        } catch (err) {
          setIsUpdating(false);
          reject(err);
        }
      };
      reader.onerror = (err) => {
        setIsUpdating(false);
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const setPhotoByUrl = useCallback(async (url: string) => {
    setPhotoUrl(url);
    try {
      localStorage.setItem(STORAGE_KEY, url);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: url }));
    await api.updateFounderPhoto(url).catch(console.error);
  }, []);

  const resetPhoto = useCallback(async () => {
    const defaultPhoto = BUSINESS_INFO.founderPhoto;
    setPhotoUrl(defaultPhoto);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: defaultPhoto }));
    await api.updateFounderPhoto(defaultPhoto).catch(console.error);
  }, []);

  return {
    photoUrl,
    updatePhoto,
    setPhotoByUrl,
    resetPhoto,
    isUpdating,
  };
}
