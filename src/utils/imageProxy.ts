// src/utils/imageProxy.ts
// Afbeeldingen via Supabase Edge Function — vaste IPs gewhitelisted bij nederlandmobiel.nl
const SUPABASE_IMG_PROXY = 'https://bcjbghqrdlzwxgfuuxss.supabase.co/functions/v1/og-image';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjamJnaHFyZGx6d3hnZnV1eHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTUzNDksImV4cCI6MjA4NzY5MTM0OX0.TboqxP8kTiJgouaO5zZJdvbki07HK6M0FPj6uo5uG-M';

function buildUrl(id: string | number, s: number, n: number): string {
  return `${SUPABASE_IMG_PROXY}?id=${id}&s=${s}&n=${n}&apikey=${ANON_KEY}`;
}

export function proxyThumb(externalId: string | number, size = 640, n = 1): string {
  if (!externalId) return '';
  return buildUrl(externalId, size, n);
}

export function proxyLargeImage(externalId: string | number, n = 1): string {
  if (!externalId) return '';
  return buildUrl(externalId, 1280, n);
}

export function getProxiedImageUrl(originalUrl: string | null | undefined): string {
  if (!originalUrl) return '';
  if (originalUrl.includes('og-image') || originalUrl.includes('img.php')) return originalUrl;
  const match = originalUrl.match(/nederlandmobiel\.nl\/auto\/(\d+)\/(\d+)\/(\d+)/);
  if (match) {
    const [, id, size, number] = match;
    return buildUrl(id, Number(size), Number(number));
  }
  return originalUrl;
}

export function getVehicleImageUrl(smallPicture: string | null | undefined, size = 640): string {
  if (!smallPicture) return '';
  const proxied = getProxiedImageUrl(smallPicture);
  if (proxied.includes('og-image')) {
    return proxied.replace(/s=\d+/, `s=${size}`);
  }
  return proxied;
}

export function getOgImageUrl(externalId: string | number): string {
  if (!externalId) return 'https://smartlease.nl/smart-lease-logo.gif';
  return buildUrl(externalId, 1280, 1);
}