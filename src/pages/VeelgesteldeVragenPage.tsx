// src/pages/VeelgesteldeVragenPage.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Phone, MessageCircle, ChevronDown, Search, Zap, TrendingUp, FileText, Car, Clock, Shield } from 'lucide-react';

interface Faq {
  id: string;
  vraag: string;
  antwoord: string;
  categorie: string;
  sort_order: number;
}

const CAT_CONFIG: Record<string, { icon: React.ElementType; color: string; glow: string; label: string }> = {
  Algemeen:   { icon: Zap,        color: '#00D4C8', glow: 'rgba(0,212,200,0.18)',   label: 'Algemeen'   },
  Financieel: { icon: TrendingUp, color: '#60A5FA', glow: 'rgba(96,165,250,0.18)',  label: 'Financieel' },
  Contract:   { icon: FileText,   color: '#A78BFA', glow: 'rgba(167,139,250,0.18)', label: 'Contract'   },
  Aanbod:     { icon: Car,        color: '#FCD34D', glow: 'rgba(252,211,77,0.18)',  label: 'Aanbod'     },
  Proces:     { icon: Clock,      color: '#34D399', glow: 'rgba(52,211,153,0.18)',  label: 'Proces'     },
};
const CATS = Object.keys(CAT_CONFIG);

/* ── Single FAQ item with smooth height animation ── */
function FaqItem({
  faq, color, glow, isOpen, onToggle, idx,
}: { faq: Faq; color: string; glow: string; isOpen: boolean; onToggle: () => void; idx: number }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
  }, [faq.antwoord]);

  return (
    <div
      onClick={onToggle}
      className="relative overflow-hidden cursor-pointer group"
      style={{
        borderRadius: 16,
        border: `1px solid ${isOpen ? color + '55' : 'rgba(255,255,255,0.07)'}`,
        background: isOpen ? `rgba(255,255,255,0.055)` : 'rgba(255,255,255,0.025)',
        boxShadow: isOpen ? `0 0 60px ${glow}` : 'none',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Animated top border */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: isOpen ? `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)` : 'transparent',
          transition: 'all 0.4s ease',
        }}
      />

      {/* Question row */}
      <div className="flex items-center gap-4 px-5 py-5">
        {/* Number badge */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black"
          style={{
            background: isOpen ? color : 'rgba(255,255,255,0.06)',
            color: isOpen ? '#000' : 'rgba(255,255,255,0.28)',
            transition: 'all 0.3s ease',
            boxShadow: isOpen ? `0 0 20px ${glow}` : 'none',
          }}
        >
          {String(idx + 1).padStart(2, '0')}
        </div>

        <p
          className="flex-1 text-sm sm:text-[15px] font-semibold leading-snug"
          style={{
            color: isOpen ? '#ffffff' : 'rgba(255,255,255,0.7)',
            transition: 'color 0.3s ease',
          }}
        >
          {faq.vraag}
        </p>

        <div
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: isOpen ? color + '25' : 'rgba(255,255,255,0.05)',
            transition: 'all 0.3s ease',
          }}
        >
          <ChevronDown
            style={{
              width: 15, height: 15,
              color: isOpen ? color : 'rgba(255,255,255,0.25)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      </div>

      {/* Answer */}
      <div
        style={{
          maxHeight: isOpen ? height + 48 : 0,
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        }}
      >
        <div ref={bodyRef} className="px-5 pb-6 pt-1">
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, ${color}40, transparent)`,
              marginBottom: 16,
            }}
          />
          <p className="text-sm leading-[1.85]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {faq.antwoord}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function VeelgesteldeVragenPage() {
  const [faqs, setFaqs]           = useState<Faq[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [activecat, setActivecat] = useState('Alle');
  const [query, setQuery]         = useState('');
  const [mounted, setMounted]     = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .order('categorie')
      .order('sort_order')
      .then(({ data }) => {
        setFaqs((data as Faq[]) || []);
        setLoading(false);
      });
  }, []);

  const catCounts = CATS.reduce((acc, c) => {
    acc[c] = faqs.filter(f => f.categorie === c).length;
    return acc;
  }, {} as Record<string, number>);

  const searched = query.trim()
    ? faqs.filter(f =>
        f.vraag.toLowerCase().includes(query.toLowerCase()) ||
        f.antwoord.toLowerCase().includes(query.toLowerCase())
      )
    : faqs;

  const filtered = activecat === 'Alle' ? searched : searched.filter(f => f.categorie === activecat);

  const grouped = CATS.reduce((acc, cat) => {
    const items = filtered.filter(f => f.categorie === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, Faq[]>);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(155deg, #04081a 0%, #080f1e 40%, #050c18 70%, #030712 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ══════════════ HERO ══════════════ */}
      <div className="relative overflow-hidden">
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: -80, left: '20%', width: 600, height: 600,
            borderRadius: '50%', filter: 'blur(160px)',
            background: 'radial-gradient(circle, rgba(0,212,200,0.1) 0%, transparent 70%)',
            animation: 'slowPulse 12s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', top: 40, right: '15%', width: 400, height: 400,
            borderRadius: '50%', filter: 'blur(130px)',
            background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)',
            animation: 'slowPulse 15s ease-in-out infinite 4s',
          }} />
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.025,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
          {/* Scanline effect */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)',
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
          {/* Pill badge */}
          <div
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8`}
            style={{
              background: 'rgba(0,212,200,0.08)',
              border: '1px solid rgba(0,212,200,0.25)',
              color: '#00D4C8',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <Shield style={{ width: 13, height: 13 }} />
            {faqs.length} vragen &amp; antwoorden
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 'clamp(30px, 5.5vw, 64px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginBottom: 20,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1) 0.1s',
            }}
          >
            Veelgestelde vragen<br />
            <span style={{
              background: 'linear-gradient(120deg, #00D4C8 0%, #38BDF8 45%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              over financial lease
            </span>
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.42)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              maxWidth: 500,
              margin: '0 auto 40px',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1) 0.18s',
            }}
          >
            Antwoorden op de meest gestelde vragen van onze klanten.
            Staat jouw vraag er niet bij? Wij helpen je direct verder.
          </p>

          {/* Search */}
          <div
            style={{
              maxWidth: 520,
              margin: '0 auto',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1) 0.26s',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, color: 'rgba(255,255,255,0.28)',
              }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Zoek een vraag..."
                style={{
                  width: '100%',
                  padding: '15px 18px 15px 46px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 14,
                  backdropFilter: 'blur(20px)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,200,0.5)';
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,200,0.12)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.5)',
                    borderRadius: 8, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700,
                  }}
                >
                  wis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ STICKY CATEGORY BAR ══════════════ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(4,8,26,0.88)',
        backdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        padding: '10px 16px',
      }}>
        <div
          className="max-w-4xl mx-auto"
          style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}
        >
          {/* All */}
          {['Alle', ...CATS.filter(c => catCounts[c] > 0)].map(cat => {
            const isAll = cat === 'Alle';
            const cfg = isAll ? null : CAT_CONFIG[cat];
            const Icon = cfg?.icon;
            const active = activecat === cat;
            const color = cfg?.color || '#00D4C8';
            const count = isAll ? faqs.length : catCounts[cat];
            return (
              <button
                key={cat}
                onClick={() => { setActivecat(cat); setExpanded(null); }}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: `1px solid ${active ? color + '70' : 'rgba(255,255,255,0.08)'}`,
                  background: active ? color + '20' : 'rgba(255,255,255,0.04)',
                  color: active ? color : 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  boxShadow: active ? `0 0 20px ${color}30` : 'none',
                  transition: 'all 0.25s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {Icon && <Icon style={{ width: 13, height: 13 }} />}
                {cat}
                <span style={{ opacity: 0.55, marginLeft: 2 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════ FAQ CONTENT ══════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.06)',
              borderTopColor: '#00D4C8',
              animation: 'spin 0.9s linear infinite',
            }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Vragen laden...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Geen resultaten gevonden</p>
            <p style={{ color: 'rgba(255,255,255,0.35)' }}>Probeer een andere zoekterm of categorie.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
            {(activecat === 'Alle' ? Object.entries(grouped) : [[activecat, filtered] as [string, Faq[]]]).map(([cat, items], secIdx) => {
              const cfg = CAT_CONFIG[cat as string];
              const Icon = cfg?.icon || Zap;
              let globalIdx = 0;
              return (
                <div key={cat as string}>
                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                      background: cfg?.glow || 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 20, height: 20, color: cfg?.color || '#fff' }} />
                    </div>
                    <div>
                      <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>{cat as string}</h2>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 3 }}>
                        {(items as Faq[]).length} vragen
                      </p>
                    </div>
                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${cfg?.color || '#fff'}30, transparent)` }} />
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(items as Faq[]).map((faq, i) => (
                      <FaqItem
                        key={faq.id}
                        faq={faq}
                        color={cfg?.color || '#00D4C8'}
                        glow={cfg?.glow || 'rgba(0,212,200,0.15)'}
                        isOpen={expanded === faq.id}
                        idx={i}
                        onToggle={() => setExpanded(expanded === faq.id ? null : faq.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════ CTA BLOCK ══════════════ */}
        <div
          style={{
            marginTop: 80,
            borderRadius: 28,
            padding: '56px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(0,212,200,0.09) 0%, rgba(96,165,250,0.06) 50%, rgba(167,139,250,0.09) 100%)',
            border: '1px solid rgba(0,212,200,0.18)',
          }}
        >
          {/* Glow orbs */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 220, height: 220,
            borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
            background: 'rgba(0,212,200,0.14)',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: -60, width: 220, height: 220,
            borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
            background: 'rgba(96,165,250,0.1)',
          }} />

          <div style={{ position: 'relative' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20, marginBottom: 20,
              background: 'rgba(0,212,200,0.12)', color: '#00D4C8',
              border: '1px solid rgba(0,212,200,0.22)',
              fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em',
            }}>
              Persoonlijk advies
            </span>

            <h3 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(22px, 3vw, 34px)', marginBottom: 12 }}>
              Staat je vraag er niet bij?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
              Onze adviseurs staan klaar — snel, persoonlijk en volledig vrijblijvend.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <a
                href="tel:0858008777"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 28px', borderRadius: 14,
                  background: '#00D4C8', color: '#04081a',
                  fontWeight: 900, fontSize: 14, textDecoration: 'none',
                  boxShadow: '0 0 40px rgba(0,212,200,0.35)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                <Phone style={{ width: 16, height: 16 }} />
                085 – 80 08 600
              </a>

              <a
                href="https://wa.me/31613669328"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 28px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                <MessageCircle style={{ width: 16, height: 16 }} />
                WhatsApp
              </a>

              <Link
                to="/offerte"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 28px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.08)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontWeight: 900, fontSize: 14, textDecoration: 'none',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                Gratis offerte →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slowPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        input::placeholder { color: rgba(255,255,255,0.22); }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}