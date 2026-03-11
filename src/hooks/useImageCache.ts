/**
 * useImageCache.ts
 * 
 * Hook die op de VehicleDetailPage draait (waar de foto WÉL laadt).
 * Vangt de afbeelding via een hidden <img> → canvas → base64 → upload naar Supabase Storage.
 * Geeft de gecachte Supabase URL terug die overal werkt (offertepagina, emails, etc).
 * 
 * Plaats in: src/hooks/useImageCache.ts
 */
import { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bcjbghqrdlzwxgfuuxss.supabase.co';
const CACHE_FN_URL = `${SUPABASE_URL}/functions/v1/cache-vehicle-image`;

export function useImageCache(vehicleId?: number, originalUrl?: string) {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!vehicleId || !originalUrl) {
      setIsReady(true);
      return;
    }

    let cancelled = false;

    async function cacheImage() {
      try {
        // 1. Check if already cached
        const checkRes = await fetch(`${CACHE_FN_URL}?vehicle_id=${vehicleId}`);
        const checkData = await checkRes.json();
        
        if (checkData.exists && checkData.url) {
          if (!cancelled) {
            setCachedUrl(checkData.url);
            setIsReady(true);
          }
          return;
        }

        // 2. Not cached yet — load image in a hidden img tag and capture via canvas
        // This works because the browser already loaded this image on the current page
        const base64 = await loadAndCapture(originalUrl!);
        
        if (!base64 || cancelled) {
          if (!cancelled) setIsReady(true);
          return;
        }

        // 3. Upload to Supabase Storage
        const uploadRes = await fetch(CACHE_FN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicle_id: vehicleId,
            image_data: base64,
          }),
        });
        const uploadData = await uploadRes.json();
        
        if (!cancelled && uploadData.success && uploadData.url) {
          setCachedUrl(uploadData.url);
        }
      } catch (e) {
        console.warn('Image cache failed (non-critical):', e);
      }
      
      if (!cancelled) setIsReady(true);
    }

    cacheImage();
    return () => { cancelled = true; };
  }, [vehicleId, originalUrl]);

  return { cachedUrl, isReady };
}

/**
 * Loads an image and captures it as base64 via canvas.
 * The trick: the browser can load this image (it already did on the page),
 * and since it's from the browser cache, the canvas capture works.
 * 
 * We do NOT set crossOrigin="anonymous" because Cloudflare would block it.
 * Instead we load it as a regular image (which works from cache) and
 * try to capture it. If the canvas is tainted, we return null.
 */
function loadAndCapture(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    // Timeout after 5 seconds
    const timeout = setTimeout(() => resolve(null), 5000);

    const img = document.createElement('img');
    // NO crossOrigin attribute — this is critical!
    // The image loads from browser cache without CORS restrictions
    
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        // This will throw if canvas is tainted (CORS)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch (e) {
        // Canvas tainted — can't extract pixel data
        console.warn('Canvas tainted, cannot capture image');
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };

    img.src = url;
  });
}

export default useImageCache;