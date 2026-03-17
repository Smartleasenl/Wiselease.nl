const VPS_IMG_PROXY = 'https://img.wiselease.nl/img.php';

export function getProxiedImageUrl(originalUrl: string | null | undefined): string {
  if (!originalUrl) return '';
  if (!originalUrl.includes('nederlandmobiel.nl')) return originalUrl;
  const match = originalUrl.match(/nederlandmobiel\.nl\/auto\/(\d+)\/(\d+)\/(\d+)/);
  if (match) {
    const [, id, size, number] = match;
    return `${VPS_IMG_PROXY}?id=${id}&s=${size}&n=${number}`;
  }
  return originalUrl;
}

export function proxyThumb(externalId: string | number, size = 1280, n = 1): string {
  if (!externalId) return '';
  return `${VPS_IMG_PROXY}?id=${externalId}&s=${size}&n=${n}`;
}

export function proxyLargeImage(externalId: string | number, n = 1): string {
  if (!externalId) return '';
  return `${VPS_IMG_PROXY}?id=${externalId}&s=1280&n=${n}`;
}

export function getVehicleImageUrl(smallPicture: string | null | undefined, size = 320): string {
  if (!smallPicture) return '';
  return getProxiedImageUrl(smallPicture);
}

export function getOgImageUrl(externalId: string | number): string {
  if (!externalId) return 'https://wiselease.nl/wiselease-logo.png';
  return `${VPS_IMG_PROXY}?id=${externalId}&s=1280&n=1`;
}