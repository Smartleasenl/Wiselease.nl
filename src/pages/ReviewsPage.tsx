import { useCanonical } from '../hooks/useCanonical';
// src/pages/ReviewsPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Review {
  id: string;
  naam: string;
  bedrijf: string;
  sterren: number;
  tekst: string;
  datum: string;
}

export default function ReviewsPage() {
  useCanonical();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true)
      .order('sort_order')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data as Review[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered   = filter ? reviews.filter(r => r.sterren === filter) : reviews;
  const avgRating  = reviews.length
    ? (reviews.reduce((s, r) => s + r.sterren, 0) / reviews.length).toFixed(1)
    : '0';
  const fiveStars  = reviews.filter(r => r.sterren === 5).length;

  function avatarColor(naam: string) {
    const hue = naam.charCodeAt(0) * 7 % 360;
    return `hsl(${hue}, 60%, 48%)`;
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-smartlease-blue via-[#1a3d5c] to-smartlease-blue py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Sterren */}
          <div className="flex justify-center gap-1.5 mb-4">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="h-8 w-8 fill-amber-400 text-amber-400 drop-shadow-sm" />
            ))}
          </div>
          <div className="text-white font-black mb-2" style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 1 }}>
            {avgRating}
          </div>
          <p className="text-white/60 text-base mb-6">
            Gemiddeld over {reviews.length} beoordelingen &nbsp;·&nbsp; {fiveStars}× 5 sterren
          </p>
          <p className="text-white/80 text-lg max-w-xl mx-auto leading-relaxed">
            Onze klanten waarderen ons om onze snelheid, eerlijkheid en persoonlijke aanpak.
            Lees wat zij zeggen.
          </p>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter(null)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              !filter ? 'bg-smartlease-yellow text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alle ({reviews.length})
          </button>
          {[5,4,3,2,1].map(s => {
            const count = reviews.filter(r => r.sterren === s).length;
            if (!count) return null;
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? null : s)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  filter === s ? 'bg-smartlease-yellow text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s} <Star className="h-3.5 w-3.5 fill-current" /> ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── REVIEWS GRID ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-smartlease-yellow rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Geen reviews gevonden.</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filtered.map(r => (
              <div
                key={r.id}
                className="break-inside-avoid bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                {/* Quote icoon */}
                <Quote className="h-6 w-6 text-smartlease-yellow/20 mb-3 -scale-x-100" />

                {/* Sterren */}
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s <= r.sterren ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>

                {/* Tekst */}
                <p className="text-gray-700 text-sm leading-relaxed mb-5">{r.tekst}</p>

                {/* Auteur */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: avatarColor(r.naam) }}
                  >
                    {r.naam.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{r.naam}</p>
                    <p className="text-xs text-gray-400">
                      {r.bedrijf && <span className="mr-1">{r.bedrijf} ·</span>}
                      {new Date(r.datum).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="bg-gradient-to-r from-smartlease-yellow to-smartlease-blue py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white font-extrabold text-2xl sm:text-3xl mb-3">
            Ook zo tevreden worden?
          </h2>
          <p className="text-white/75 mb-7 text-sm sm:text-base">
            Vraag vandaag nog een gratis offerte aan. Wij reageren binnen 24 uur.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/offerte" className="bg-white text-smartlease-yellow font-bold py-3 px-8 rounded-xl text-sm hover:bg-white/90 transition shadow-md">
              Gratis offerte aanvragen
            </Link>
            <a href="tel:0858008777" className="border-2 border-white/40 text-white font-semibold py-3 px-8 rounded-xl text-sm hover:bg-white/10 transition">
              📞 085 - 80 08 600
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}