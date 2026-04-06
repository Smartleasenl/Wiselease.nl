import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, FileText } from 'lucide-react';

const WA_NUMBER = '31858008777';
const WA_TEXT = 'Hallo, ik heb een vraag over financial lease bij Wiselease.nl';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hidden = ['/offerte', '/contact', '/bel-mij', '/admin', '/auto/'].some(p => location.pathname.startsWith(p));
  if (hidden || !visible) return null;

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-semibold rounded-xl text-sm"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
        <button
          onClick={() => navigate('/offerte')}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          <FileText size={15} />
          Offerte aanvragen
        </button>
      </div>
      <div className="bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
}
