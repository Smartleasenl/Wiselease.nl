import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const COOKIE_KEY = 'wiselease_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
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
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Gele accentbalk bovenaan */}
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-500" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              {"🍪"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Wiselease.nl gebruikt cookies
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Wij gebruiken functionele en analytische cookies om de website te verbeteren en je ervaring te personaliseren.
                Lees meer in ons{' '}
                <Link to="/cookiebeleid" className="text-yellow-600 hover:underline font-medium">
                  cookiebeleid
                </Link>.
              </p>
            </div>
            <button
              onClick={decline}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
              aria-label="Sluiten"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:justify-end">
            <button
              onClick={decline}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Alleen functioneel
            </button>
            <button
              onClick={accept}
              className="px-5 py-2.5 text-sm font-bold text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors shadow-sm"
              style={{ color: '#1a1a1a' }}
            >
              Alles accepteren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
