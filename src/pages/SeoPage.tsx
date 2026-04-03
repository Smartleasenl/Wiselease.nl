import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SeoPageData {
  id: string;
  type: string;
  merk: string | null;
  model: string | null;
  slug: string;
  slug_merk: string;
  slug_model: string | null;
  title: string;
  seo_title: string;
  seo_description: string;
  h1: string;
  intro_tekst: string;
  body_tekst: string;
  faq: { vraag: string; antwoord: string }[];
}

export default function SeoPage() {
  const { slugMerk, slugModel } = useParams<{ slugMerk: string; slugModel?: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<SeoPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!slugMerk) return;
    setLoading(true);

    let query = supabase
      .from('seo_pages')
      .select('*')
      .eq('slug_merk', slugMerk)
      .eq('is_published', true);

    if (slugModel) {
      query = query.eq('slug_model', slugModel);
    } else {
      query = query.is('slug_model', null);
    }

    query.maybeSingle().then(({ data, error }) => {
      if (error || !data) {
        navigate('/aanbod', { replace: true });
        return;
      }
      setPage(data as SeoPageData);

      document.title = data.seo_title || data.title || 'Wiselease.nl';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', data.seo_description || '');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = data.seo_description || '';
        document.head.appendChild(meta);
      }

      setLoading(false);
    });
  }, [slugMerk, slugModel, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!page) return null;

  const aanbodUrl = page.type === 'merk' && page.merk
    ? `/aanbod?mark=${encodeURIComponent(page.merk)}`
    : page.type === 'model' && page.merk && page.model
    ? `/aanbod?mark=${encodeURIComponent(page.merk)}&model=${encodeURIComponent(page.model)}`
    : '/aanbod';

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-6">
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/financial-lease/wat-is-financial-lease" className="hover:text-white/70 transition-colors">Financial Lease</Link>
            <ChevronRight size={12} />
            {page.type === 'model' && (
              <>
                <Link to={`/financial-lease/${page.slug_merk}`} className="hover:text-white/70 transition-colors">
                  {page.merk}
                </Link>
                <ChevronRight size={12} />
              </>
            )}
            <span className="text-white/60">{page.h1 || page.title}</span>
          </nav>

          <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Wiselease.nl
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {page.h1 || page.title}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-8">
            {page.intro_tekst}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={aanbodUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all text-base"
            >
              <Search size={18} />
              Bekijk ons aanbod
            </Link>
            <Link
              to="/offerte"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all text-base"
            >
              Gratis offerte aanvragen
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* USPs */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{"💼"}</span>
              <div>
                <p className="font-bold text-slate-900">Direct eigenaar</p>
                <p className="text-sm text-slate-500">Auto staat op jouw naam</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{"📊"}</span>
              <div>
                <p className="font-bold text-slate-900">Fiscale voordelen</p>
                <p className="text-sm text-slate-500">Renteaftrek en meer voor ondernemers</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{"🚗"}</span>
              <div>
                <p className="font-bold text-slate-900">60.000+ occasions</p>
                <p className="text-sm text-slate-500">Groot aanbod, scherpe prijzen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body tekst */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div
          className="prose prose-slate prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: page.body_tekst || '' }}
        />

        {/* CTA blok */}
        <div className="mt-12 bg-teal-50 border border-teal-100 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Klaar om te beginnen?</h3>
          <p className="text-slate-600 mb-6">Bekijk ons aanbod of vraag direct een vrijblijvende offerte aan.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={aanbodUrl}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
            >
              <Search size={16} />
              Bekijk aanbod
            </Link>
            <Link
              to="/offerte"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Offerte aanvragen
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ */}
      {Array.isArray(page.faq) && page.faq.length > 0 && (
        <div className="bg-slate-50 py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Veelgestelde vragen
            </h2>
            <div className="space-y-3">
              {page.faq.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="font-semibold text-slate-900 text-sm sm:text-base">{item.vraag}</span>
                    {openFaq === i
                      ? <ChevronUp size={18} className="text-teal-600 flex-shrink-0" />
                      : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3">
                      {item.antwoord}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
