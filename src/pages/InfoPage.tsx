// src/pages/InfoPage.tsx
import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { usePage, useSubPages } from '../hooks/usePage';
import { Phone, ChevronRight, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';

export default function InfoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const slug       = location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const parentSlug = slug.split('/')[0];

  const { page, loading, error } = usePage(slug);
  const { pages: subPages }      = useSubPages(parentSlug);

  useEffect(() => {
    if (page) {
      document.title = page.meta_title || page.title;
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', page.meta_description || '');
    }
  }, [page]);

  useEffect(() => {
    if (!loading && !page && subPages.length > 0) {
      navigate(`/${subPages[0].slug}`, { replace: true });
    }
  }, [loading, page, subPages, navigate]);

  const parentLabel = parentSlug === 'financial-lease' ? 'Financial Lease' : 'Meer informatie';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-smartlease-yellow/20 border-t-smartlease-yellow rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Laden…</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <h2 className="text-2xl font-bold text-smartlease-blue">Pagina niet gevonden</h2>
        <p className="text-gray-400 text-sm">
          Gezochte slug: <code className="bg-gray-100 px-2 py-0.5 rounded">{slug}</code>
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-smartlease-yellow text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-smartlease-yellow/90 transition"
        >
          ← Terug
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ height: 'clamp(220px, 38vw, 440px)' }}>
        {page.hero_image_url
          ? <img src={page.hero_image_url} alt={page.title} className="w-full h-full object-cover" loading="eager" />
          : <div className="w-full h-full bg-gradient-to-br from-smartlease-blue to-blue-900" />
        }
        <div className="absolute inset-0 bg-gradient-to-r from-smartlease-blue/90 via-smartlease-blue/60 to-transparent" />

        <div className="absolute top-4 sm:top-6 left-0 right-0 px-4 sm:px-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-1.5 text-xs text-white/60 flex-wrap">
            <Link to="/" className="text-white/60 hover:text-white transition">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/${parentSlug}`} className="text-white/60 hover:text-white transition">{parentLabel}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{page.menu_label}</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-6 sm:pb-10 max-w-6xl mx-auto">
          <div className="inline-flex bg-smartlease-yellow text-smartlease-blue text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded mb-3">
            {parentLabel}
          </div>
          <h1 className="text-white font-extrabold leading-tight mb-2 max-w-2xl"
            style={{ fontSize: 'clamp(20px, 4vw, 46px)' }}>
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="text-white/80 max-w-lg leading-relaxed" style={{ fontSize: 'clamp(13px, 2vw, 17px)' }}>
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* MAIN CONTENT */}
          <div className="w-full lg:flex-1 min-w-0">

            {page.intro && (
              <div className="bg-white rounded-xl p-6 sm:p-8 mb-6 border-l-4 border-smartlease-yellow shadow-sm">
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed m-0">{page.intro}</p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {page.content?.map((section, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderTop: `3px solid ${i % 2 === 0 ? '#F9C349' : '#1B2F5E'}` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle2
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: i % 2 === 0 ? '#F9C349' : '#1B2F5E' }}
                    />
                    <h2 className="text-smartlease-blue font-bold text-base sm:text-lg leading-snug m-0">
                      {section.heading}
                    </h2>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed m-0 pl-8">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center gap-2 border-2 border-smartlease-yellow text-smartlease-yellow hover:bg-smartlease-yellow hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Terug
            </button>
          </div>

          {/* SIDEBAR */}
          <div className="w-full lg:w-72 flex flex-col gap-4 lg:sticky lg:top-24">

            <div className="bg-smartlease-blue rounded-2xl p-6 shadow-lg">
              <h3 className="text-white font-bold text-lg mb-2">Offerte aanvragen</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-5">
                Binnen 24 uur een persoonlijk voorstel. Gratis en vrijblijvend.
              </p>
              <Link
                to="/offerte"
                className="block text-center bg-smartlease-yellow text-smartlease-blue font-bold py-3 px-4 rounded-xl text-sm hover:bg-smartlease-yellow/90 transition-colors shadow-md"
              >
                Gratis offerte aanvragen →
              </Link>
              <a
                href="tel:0858008777"
                className="flex items-center justify-center gap-2 mt-3 text-white/60 hover:text-white text-sm transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> 085 800 8777
              </a>
            </div>

            {subPages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  className="lg:hidden w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setSidebarOpen(o => !o)}
                >
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{parentLabel}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`lg:block ${sidebarOpen ? 'block' : 'hidden'} px-4 pb-4 lg:px-4 lg:py-4`}>
                  <p className="hidden lg:block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">{parentLabel}</p>
                  <nav className="flex flex-col gap-0.5">
                    {subPages.map(p => {
                      const active = `/${p.slug}` === location.pathname;
                      return (
                        <Link
                          key={p.slug}
                          to={`/${p.slug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            active
                              ? 'bg-smartlease-yellow/10 text-smartlease-yellow font-bold'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-smartlease-yellow'
                          }`}
                        >
                          {p.menu_label}
                          {active && <ChevronRight className="h-3.5 w-3.5 text-smartlease-yellow" />}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            )}

            <div className="bg-smartlease-yellow/8 rounded-xl p-4 border border-smartlease-yellow/20 hidden sm:block">
              {[
                '✓  Binnen 24 uur reactie',
                '✓  Geen kilometerrestrictie',
                '✓  Fiscaal voordelig',
                '✓  Persoonlijk advies',
              ].map((u, i, a) => (
                <div
                  key={i}
                  className={`text-smartlease-blue text-sm font-semibold py-2 ${
                    i < a.length - 1 ? 'border-b border-smartlease-yellow/15' : ''
                  }`}
                >
                  {u}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM BANNER */}
      <div className="bg-gradient-to-r from-smartlease-yellow to-smartlease-blue py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-extrabold mb-3" style={{ fontSize: 'clamp(18px, 3vw, 30px)' }}>
            Klaar om te starten?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6">
            Onze adviseurs helpen je binnen 24 uur — gratis en vrijblijvend.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/offerte"
              className="bg-white text-smartlease-blue font-bold py-3 px-7 rounded-xl text-sm sm:text-base hover:bg-white/90 transition shadow-md"
            >
              Gratis offerte aanvragen
            </Link>
            <a
              href="tel:0858008777"
              className="border-2 border-white/50 text-white font-semibold py-3 px-7 rounded-xl text-sm sm:text-base hover:border-white hover:bg-white/10 transition"
            >
              📞 085 800 8777
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
