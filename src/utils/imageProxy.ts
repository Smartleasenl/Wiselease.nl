// src/utils/imageProxy.ts
// Afbeeldingen via Netlify function — proxiet nederlandmobiel.nl images
const IMG_PROXY = '/img-proxy';

export function getProxiedImageUrl(originalUrl: string | null | undefined): string {
  if (!originalUrl) return '';
  if (!originalUrl.includes('nederlandmobiel.nl')) return originalUrl;
  return `${IMG_PROXY}?url=${encodeURIComponent(originalUrl)}`;
}

export function proxyThumb(externalId: string | number, size = 640, n = 1): string {
  if (!externalId) return '';
  const url = `https://images.nederlandmobiel.nl/auto/${externalId}/${size}/${n}.jpg?download=true&platform=wiselease`;
  return `${IMG_PROXY}?url=${encodeURIComponent(url)}`;
}

export function proxyLargeImage(externalId: string | number, n = 1): string {
  if (!externalId) return '';
  const url = `https://images.nederlandmobiel.nl/auto/${externalId}/1280/${n}.jpg?download=true&platform=wiselease`;
  return `${IMG_PROXY}?url=${encodeURIComponent(url)}`;
}

export function getVehicleImageUrl(smallPicture: string | null | undefined, size = 640): string {
  if (!smallPicture) return '';
  return getProxiedImageUrl(smallPicture);
}

export function getOgImageUrl(externalId: string | number): string {
  if (!externalId) return 'https://wiselease.nl/wiselease-logo.png';
  const url = `https://images.nederlandmobiel.nl/auto/${externalId}/1280/1.jpg?download=true&platform=wiselease`;
  return `${IMG_PROXY}?url=${encodeURIComponent(url)}`;
}