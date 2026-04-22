// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Scroll posities per route opslaan
const scrollPositions = new Map<string, number>();

export function ScrollToTop() {
  const { pathname, search, key } = useLocation();
  const navigationType = useNavigationType();
  const routeKey = pathname + search;

  // Scroll positie opslaan tijdens scrollen
  useEffect(() => {
    const save = () => scrollPositions.set(routeKey, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [routeKey]);

  // Scroll herstellen bij navigatie
  useEffect(() => {
    if (navigationType === 'POP') {
      const target = scrollPositions.get(routeKey) ?? 0;

      if (target === 0) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      // Wacht tot de pagina lang genoeg is (content laadt async van Supabase)
      // Retry elke 100ms, max 3 seconden
      let elapsed = 0;
      const interval = setInterval(() => {
        const pageHeight = document.documentElement.scrollHeight;
        elapsed += 100;

        if (pageHeight >= target + window.innerHeight * 0.5 || elapsed >= 3000) {
          clearInterval(interval);
          window.scrollTo({ top: target, behavior: 'instant' });
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      // PUSH / REPLACE → altijd naar boven
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [key]); // key is uniek per navigatie-event

  return null;
}