import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

const COOKIE_KEY = 'wiselease_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on first render
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Cookie size={20} className="text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Wiselease.nl gebruikt cookies
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Wij gebruiken functionele en analytische cookies om de website te verbeteren en je ervaring te personaliseren. 
              Lees meer in ons{' '}
              <Link to="/cookiebeleid" className="text-teal-600 hover:underline">cookiebeleid</Link>.
            </p>
          </div>
          <button
            onClick={decline}
            className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            aria-label="Sluiten"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-end">
          <button
            onClick={decline}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Alleen functioneel
          </button>
          <button
            onClick={accept}
            className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
          >
            Alles accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
