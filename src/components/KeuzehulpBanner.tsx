import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Clock, CheckCircle } from 'lucide-react';

export function KeuzehulpBanner() {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/40 rounded-full px-3 py-1 mb-3">
              <Sparkles size={14} className="text-blue-100" />
              <span className="text-blue-100 text-xs font-semibold">Nieuw: AI-gestuurde keuzehulp</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Weet je nog niet welke auto je wilt?
            </h2>
            <p className="text-blue-100 text-lg max-w-xl">
              Beantwoord 5 vragen en wij vinden de perfecte financial lease auto voor jouw bedrijf en budget.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-blue-100 text-sm">
                <Clock size={14} /> 2 minuten
              </div>
              <div className="flex items-center gap-1.5 text-blue-100 text-sm">
                <CheckCircle size={14} /> Gratis en vrijblijvend
              </div>
              <div className="flex items-center gap-1.5 text-blue-100 text-sm">
                <CheckCircle size={14} /> Persoonlijk advies
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/keuzehulp')}
            className="flex-shrink-0 flex items-center gap-3 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-lg"
          >
            Start keuzehulp
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
