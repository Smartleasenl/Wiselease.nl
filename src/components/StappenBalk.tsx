import { useNavigate } from 'react-router-dom';
import { Search, FileText, Car, ArrowRight } from 'lucide-react';

const STAPPEN = [
  {
    icon: Search,
    titel: 'Kies je auto',
    sub: 'Uit duizenden occasions',
  },
  {
    icon: FileText,
    titel: 'Ontvang offerte',
    sub: 'Binnen 24 uur, vrijblijvend',
  },
  {
    icon: Car,
    titel: 'Rij weg',
    sub: 'Snel geleverd, vaste last',
  },
];

export function StappenBalk() {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2 sm:gap-0 flex-wrap justify-center sm:justify-start">
            {STAPPEN.map((stap, i) => {
              const Icon = stap.icon;
              return (
                <div key={i} className="flex items-center">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={17} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 leading-tight">{stap.titel}</div>
                      <div className="text-xs text-gray-400 leading-tight mt-0.5">{stap.sub}</div>
                    </div>
                  </div>
                  {i < STAPPEN.length - 1 && (
                    <ArrowRight size={14} className="text-gray-200 hidden sm:block flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/offerte')}
            className="flex-shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            Gratis offerte aanvragen
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
