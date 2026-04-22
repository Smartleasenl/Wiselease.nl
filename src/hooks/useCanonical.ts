// Hook om canonical tag te zetten op elke pagina
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useCanonical(overrideUrl?: string) {
  const location = useLocation();

  useEffect(() => {
    const url = overrideUrl || 'https://wiselease.nl' + location.pathname;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    return () => {
      // Cleanup niet nodig - volgende pagina overschrijft
    };
  }, [location.pathname, overrideUrl]);
}
