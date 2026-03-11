// src/pages/BlogPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, ArrowRight, Sparkles, Search, ArrowUpRight } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  category: string;
  read_time: number;
  published_at: string;
}

const CAT_STYLE: Record<string, { color: string; bg: string; gradient: string }> = {
  'Advies':     { color: '#00D4C8', bg: 'rgba(0,212,200,0.15)',    gradient: 'linear-gradient(135deg,#00D4C8,#0EA5E9)' },
  'Fiscaal':    { color: '#60A5FA', bg: 'rgba(96,165,250,0.15)',   gradient: 'linear-gradient(135deg,#60A5FA,#6366F1)' },
  'Top 10':     { color: '#A78BFA', bg: 'rgba(167,139,250,0.15)',  gradient: 'linear-gradient(135deg,#A78BFA,#EC4899)' },
  'Elektrisch': { color: '#34D399', bg: 'rgba(52,211,153,0.15)',   gradient: 'linear-gradient(135deg,#34D399,#059669)' },
  'Nieuws':     { color: '#FCD34D', bg: 'rgba(252,211,77,0.15)',   gradient: 'linear-gradient(135deg,#FCD34D,#F97316)' },
  'Algemeen':   { color: '#94A3B8', bg: 'rgba(148,163,184,0.15)',  gradient: 'linear-gradient(135deg,#94A3B8,#64748B)' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CategoryBadge({ cat, small }: { cat: string; small?: boolean }) {
  const s = CAT_STYLE[cat] || CAT_STYLE['Algemeen'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: small ? '4px 10px' : '5px 12px',
      borderRadius: 8,
      background: s.gradient,
      color: '#fff',
      fontSize: small ? 9 : 10,
      fontWeight: 900,
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
    }}>
      {cat}
    </span>
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('Alle');
  const [query, setQuery]     = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    supabase
      .from('blog_posts')
      .select('id,slug,title,excerpt,image_url,category,read_time,published_at')
      .eq('is_published', true)
      .order('sort_order')
      .order('published_at', { ascending: false })
      .then(({ data }) => { setPosts((data as BlogPost[]) || []); setLoading(false); });
  }, []);

  const cats = ['Alle', ...Array.from(new Set(posts.map(p => p.category)))];

  const searched = query.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(query.toLowerCase())
      )
    : posts;

  const filtered = filter === 'Alle' ? searched : searched.filter(p => p.category === filter);
  const [hero, ...grid] = filtered;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(155deg, #04081a 0%, #080f1e 45%, #050c18 100%)',
    }}>

      {/* ══ HERO HEADER ══ */}
      <div className="relative overflow-hidden">
        {/* Ambient */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: -100, left: '25%', width: 700, height: 500,
            borderRadius: '50%', filter: 'blur(180px)',
            background: 'radial-gradient(circle, rgba(0,212,200,0.08) 0%, transparent 70%)',
            animation: 'slowPulse 14s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', top: 0, right: '20%', width: 500, height: 400,
            borderRadius: '50%', filter: 'blur(150px)',
            background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)',
            animation: 'slowPulse 18s ease-in-out infinite 5s',
          }} />
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.02,
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Top label */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 24,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 40,
              background: 'rgba(0,212,200,0.08)',
              border: '1px solid rgba(0,212,200,0.22)',
              color: '#00D4C8', fontSize: 10, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.2em',
            }}>
              <Sparkles style={{ width: 12, height: 12 }} />
              Financial lease insights
            </span>
          </div>

          <h1 style={{
            textAlign: 'center',
            fontSize: 'clamp(30px, 5.5vw, 66px)',
            fontWeight: 900, color: '#fff',
            lineHeight: 1.04, letterSpacing: '-0.025em',
            marginBottom: 16,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1) 0.1s',
          }}>
            Tips, trends &{' '}
            <span style={{
              background: 'linear-gradient(120deg, #00D4C8 0%, #38BDF8 50%, #818CF8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              fiscale inzichten
            </span>
          </h1>

          <p style={{
            textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '1.05rem',
            maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1) 0.18s',
          }}>
            Alles over financial lease, fiscale voordelen en slim ondernemen.
          </p>

          {/* Search */}
          <div style={{
            maxWidth: 460, margin: '0 auto 28px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1) 0.24s',
          }}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                width: 15, height: 15, color: 'rgba(255,255,255,0.26)',
              }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Zoek een artikel..."
                style={{
                  width: '100%', padding: '13px 16px 13px 44px',
                  borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#fff', fontSize: 14, outline: 'none',
                  backdropFilter: 'blur(20px)', boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,212,200,0.45)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,200,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Category pills */}
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1) 0.3s',
          }}>
            {cats.map(cat => {
              const s = CAT_STYLE[cat];
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                    fontWeight: 800, fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    border: `1px solid ${active ? (s?.color || '#00D4C8') + '70' : 'rgba(255,255,255,0.08)'}`,
                    background: active ? (s?.bg || 'rgba(0,212,200,0.12)') : 'rgba(255,255,255,0.04)',
                    color: active ? (s?.color || '#00D4C8') : 'rgba(255,255,255,0.42)',
                    boxShadow: active ? `0 0 20px ${s?.color || '#00D4C8'}30` : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.07)', borderTopColor: '#00D4C8',
              animation: 'spin 0.9s linear infinite',
            }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📝</div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Geen artikelen</p>
            <p style={{ color: 'rgba(255,255,255,0.35)' }}>Probeer een andere categorie of zoekterm.</p>
          </div>
        ) : (
          <>
            {/* ── HERO CARD ── */}
            {hero && (
              <div
                onClick={() => navigate(`/blog/${hero.slug}`)}
                style={{
                  position: 'relative', overflow: 'hidden', borderRadius: 24,
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', marginBottom: 24,
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  minHeight: 320,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.35s',
                }}
                className="group"
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,200,0.3)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 24px 80px rgba(0,212,200,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Image panel */}
                <div style={{ position: 'relative', minHeight: 280, overflow: 'hidden' }}>
                  {hero.image_url && (
                    <img
                      src={hero.image_url} alt={hero.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                    />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(4,8,26,0.55) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', top: 20, left: 20 }}>
                    <CategoryBadge cat={hero.category} />
                  </div>
                </div>

                {/* Content panel */}
                <div style={{
                  padding: '40px 44px',
                  background: 'rgba(255,255,255,0.025)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <span style={{ color: '#00D4C8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 20, height: 1.5, background: '#00D4C8' }} />
                    Uitgelicht artikel
                  </span>

                  <h2 style={{
                    color: '#fff', fontWeight: 900, fontSize: 'clamp(20px, 2.5vw, 30px)',
                    lineHeight: 1.2, marginBottom: 16,
                    transition: 'color 0.3s ease',
                  }}>
                    {hero.title}
                  </h2>

                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.75, marginBottom: 28 }}>
                    {hero.excerpt}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                        <Clock style={{ width: 13, height: 13 }} />
                        {hero.read_time} min
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                        {formatDate(hero.published_at)}
                      </span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00D4C8', fontWeight: 800, fontSize: 13 }}>
                      Lees verder
                      <ArrowRight style={{ width: 15, height: 15, transition: 'transform 0.3s ease' }} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── GRID ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}>
              {grid.map((post, idx) => {
                const s = CAT_STYLE[post.category] || CAT_STYLE['Algemeen'];
                return (
                  <article
                    key={post.id}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    style={{
                      borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.07)',
                      background: 'rgba(255,255,255,0.025)',
                      display: 'flex', flexDirection: 'column',
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                      transition: `all 0.7s cubic-bezier(0.4,0,0.2,1) ${0.4 + idx * 0.06}s`,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = s.color + '45';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${s.color}15`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                      {post.image_url ? (
                        <img
                          src={post.image_url} alt={post.title} loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.04)' }} />
                      )}
                      {/* Gradient overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,8,26,0.9) 0%, transparent 55%)' }} />
                      {/* Category */}
                      <div style={{ position: 'absolute', top: 14, left: 14 }}>
                        <CategoryBadge cat={post.category} small />
                      </div>
                      {/* Read time */}
                      <div style={{
                        position: 'absolute', bottom: 12, right: 12,
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 10px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                        color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600,
                      }}>
                        <Clock style={{ width: 11, height: 11 }} />
                        {post.read_time} min
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, marginBottom: 10, fontWeight: 600 }}>
                        {formatDate(post.published_at)}
                      </p>
                      <h3 style={{
                        color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: 15,
                        lineHeight: 1.45, marginBottom: 10, flex: 1,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {post.title}
                      </h3>
                      <p style={{
                        color: 'rgba(255,255,255,0.36)', fontSize: 13, lineHeight: 1.65, marginBottom: 18,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {post.excerpt}
                      </p>

                      {/* CTA row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: s.color, fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                          Lees verder
                          <ArrowUpRight style={{ width: 13, height: 13 }} />
                        </span>
                        {/* Bottom color line */}
                        <div style={{ width: 32, height: 2, borderRadius: 2, background: s.gradient }} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slowPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}