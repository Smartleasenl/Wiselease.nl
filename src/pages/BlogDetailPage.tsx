// src/pages/BlogDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, Calendar, ArrowLeft, Phone, ChevronRight, BookOpen, MessageCircle } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  read_time: number;
  published_at: string;
}

const CAT_STYLE: Record<string, { color: string; gradient: string; glow: string }> = {
  'Advies':     { color: '#00B8A9', gradient: 'linear-gradient(135deg,#00D4C8,#0EA5E9)', glow: 'rgba(0,184,169,0.2)' },
  'Fiscaal':    { color: '#3B82F6', gradient: 'linear-gradient(135deg,#60A5FA,#6366F1)', glow: 'rgba(59,130,246,0.2)' },
  'Top 10':     { color: '#8B5CF6', gradient: 'linear-gradient(135deg,#A78BFA,#EC4899)', glow: 'rgba(139,92,246,0.2)' },
  'Elektrisch': { color: '#10B981', gradient: 'linear-gradient(135deg,#34D399,#059669)', glow: 'rgba(16,185,129,0.2)' },
  'Nieuws':     { color: '#F59E0B', gradient: 'linear-gradient(135deg,#FCD34D,#F97316)', glow: 'rgba(245,158,11,0.2)' },
  'Algemeen':   { color: '#64748B', gradient: 'linear-gradient(135deg,#94A3B8,#64748B)', glow: 'rgba(100,116,139,0.2)' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost]       = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true); setMounted(false); setProgress(0);
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data }) => {
        if (!data) { navigate('/blog'); return; }
        setPost(data as BlogPost);
        setLoading(false);
        setTimeout(() => setMounted(true), 80);
        // Related posts
        supabase
          .from('blog_posts')
          .select('id,slug,title,excerpt,image_url,category,read_time,published_at')
          .eq('is_published', true).neq('slug', slug).eq('category', (data as BlogPost).category).limit(3)
          .then(({ data: rel }) => setRelated((rel as BlogPost[]) || []));
      });
  }, [slug]);

  // Reading progress bar
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '2px solid #e2e8f0', borderTopColor: '#00B8A9',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!post) return null;

  const cs = CAT_STYLE[post.category] || CAT_STYLE['Algemeen'];

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* Reading progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 100,
        background: '#f1f5f9',
      }}>
        <div style={{
          height: '100%', background: cs.gradient,
          width: `${progress}%`, transition: 'width 0.1s linear',
          boxShadow: `0 0 12px ${cs.glow}`,
        }} />
      </div>

      {/* ══ HERO IMAGE ══ */}
      <div style={{ position: 'relative', height: 'clamp(300px, 50vh, 580px)', overflow: 'hidden' }}>
        {post.image_url && (
          <img src={post.image_url} alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.72) 100%)' }} />

        {/* Back */}
        <div style={{ position: 'absolute', top: 24, left: 24 }}>
          <button
            onClick={() => navigate('/blog')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'; }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Blog
          </button>
        </div>

        {/* Hero content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 32px 36px' }}>
          <div className="max-w-5xl mx-auto">
            <span style={{
              display: 'inline-block', padding: '5px 14px', borderRadius: 8,
              background: cs.gradient, color: '#fff',
              fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em',
              marginBottom: 16,
            }}>
              {post.category}
            </span>
            <h1 style={{
              color: '#fff', fontWeight: 900, lineHeight: 1.1,
              fontSize: 'clamp(22px, 3.8vw, 48px)',
              maxWidth: 800, marginBottom: 20,
              textShadow: '0 2px 30px rgba(0,0,0,0.4)',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}>
              {post.title}
            </h1>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                <Calendar style={{ width: 14, height: 14 }} />
                {formatDate(post.published_at)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                <Clock style={{ width: 14, height: 14 }} />
                {post.read_time} min leestijd
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTENT LAYOUT ══ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: 52, paddingBottom: 80 }}>

        {/* ── ARTICLE (altijd bovenaan, ook op mobiel) ── */}
        <article
          className="blog-article"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.1s',
          }}
        >
          {/* Excerpt highlight */}
          <p style={{
            fontSize: '1.15rem', fontWeight: 500, color: '#374151',
            lineHeight: 1.8, paddingBottom: 28, marginBottom: 32,
            borderBottom: '1px solid #f1f5f9',
          }}>
            {post.excerpt}
          </p>

          {/* Main HTML content */}
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Tags */}
          <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 600 }}>Categorie:</span>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 8,
                background: cs.gradient, color: '#fff',
                fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>
                {post.category}
              </span>
            </div>
          </div>
        </article>

        {/* ── SIDEBAR (op desktop rechts naast artikel, op mobiel eronder) ── */}
        <aside
          className="blog-sidebar"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.25s',
          }}
        >
          {/* CTA Card */}
          <div style={{
            borderRadius: 20, overflow: 'hidden',
            background: 'linear-gradient(145deg, #0a1628 0%, #0f2040 100%)',
            marginBottom: 24,
          }}>
            {/* Color bar */}
            <div style={{ height: 4, background: cs.gradient }} />
            <div style={{ padding: '24px 24px 28px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: cs.color, boxShadow: `0 0 10px ${cs.glow}`,
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                <span style={{ color: cs.color, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                  Gratis advies
                </span>
              </div>
              <h3 style={{ color: '#fff', fontWeight: 900, fontSize: 18, lineHeight: 1.3, marginBottom: 10 }}>
                Interesse in financial lease?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, lineHeight: 1.7, marginBottom: 22 }}>
                Binnen 24 uur een persoonlijk voorstel op maat. Gratis en vrijblijvend.
              </p>

              <Link to="/offerte" style={{
                display: 'block', textAlign: 'center',
                padding: '13px 20px', borderRadius: 12, marginBottom: 10,
                background: cs.gradient, color: '#fff',
                fontWeight: 900, fontSize: 14, textDecoration: 'none',
                boxShadow: `0 8px 28px ${cs.glow}`,
                transition: 'transform 0.2s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                Gratis offerte →
              </Link>

              <a href="tel:0858008600" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12, marginBottom: 8,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 13,
                textDecoration: 'none',
              }}>
                <Phone style={{ width: 14, height: 14 }} />
                085 – 80 08 600
              </a>

              <a href="https://wa.me/31613669328" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 13,
                textDecoration: 'none',
              }}>
                <MessageCircle style={{ width: 14, height: 14 }} />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div style={{
              borderRadius: 20, border: '1px solid #f1f5f9',
              overflow: 'hidden', background: '#fafafa',
            }}>
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#1e293b', fontSize: 13 }}>
                  <BookOpen style={{ width: 15, height: 15, color: '#94a3b8' }} />
                  Meer lezen
                </h4>
              </div>
              <div>
                {related.map((r, i) => (
                  <Link
                    key={r.id}
                    to={`/blog/${r.slug}`}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '14px 20px',
                      borderBottom: i < related.length - 1 ? '1px solid #f1f5f9' : 'none',
                      textDecoration: 'none',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {r.image_url && (
                      <img src={r.image_url} alt={r.title}
                        style={{ width: 52, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: '#1e293b', fontWeight: 700, fontSize: 13, lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {r.title}
                      </p>
                      <span style={{ color: '#94a3b8', fontSize: 11, marginTop: 4, display: 'block' }}>{r.read_time} min</span>
                    </div>
                    <ChevronRight style={{ width: 14, height: 14, color: '#cbd5e1', flexShrink: 0, marginTop: 2 }} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(0.9)} }

        /* ── Desktop: artikel links, sidebar rechts ── */
        @media (min-width: 768px) {
          .max-w-5xl > .blog-article,
          .max-w-5xl > .blog-sidebar {
            display: block;
          }
          /* Wrap article + sidebar in pseudo-grid via CSS Grid on parent */
        }

        /* Grid wrapper voor desktop */
        .max-w-5xl.mx-auto.px-4 {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto;
        }

        @media (min-width: 768px) {
          .max-w-5xl.mx-auto.px-4 {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 300px;
            gap: 56px;
            align-items: start;
          }
          .blog-sidebar {
            position: sticky;
            top: 28px;
          }
        }

        /* ── Mobiel: artikel bovenaan, sidebar eronder als volle breedte ── */
        @media (max-width: 767px) {
          .max-w-5xl.mx-auto.px-4 {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .blog-sidebar {
            position: static !important;
          }
        }

        .blog-prose h2 {
          font-size: clamp(1.2rem, 2.5vw, 1.6rem);
          font-weight: 900;
          color: #0f172a;
          margin-top: 2.5rem;
          margin-bottom: 0.85rem;
          line-height: 1.25;
          letter-spacing: -0.01em;
        }
        .blog-prose h2:first-child { margin-top: 0; }
        .blog-prose p {
          color: #374151;
          line-height: 1.9;
          margin-bottom: 1.4rem;
          font-size: 1rem;
        }
        .blog-prose strong {
          color: #0f172a;
          font-weight: 800;
        }
        .blog-prose ul {
          margin: 0.75rem 0 1.5rem 0;
          padding-left: 0;
          list-style: none;
        }
        .blog-prose li {
          position: relative;
          padding-left: 22px;
          color: #374151;
          line-height: 1.8;
          margin-bottom: 0.5rem;
          font-size: 0.97rem;
        }
        .blog-prose li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 11px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00B8A9;
        }
      `}</style>
    </div>
  );
}