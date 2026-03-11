import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  TrendingUp,
  Banknote,
  Clock,
  Users,
  Car,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

// ─── Animated Counter Hook ───────────────────────────────────────────────────

function useCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      setCount(Math.round(eased * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return { count, ref };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function WhySmartlease() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const c1 = useCounter(62000, 2200);
  const c2 = useCounter(500, 1800);
  const c3 = useCounter(49, 1400);
  const c4 = useCounter(247, 1600);

  const usps = [
    {
      icon: TrendingUp,
      title: 'Investeer in je bedrijf',
      desc: 'Financial lease is een investering, geen kostenpost. De auto staat op jouw balans en bouwt waarde op voor je onderneming.',
      gradient: 'from-teal-500 to-cyan-500',
      glow: 'shadow-teal-500/20',
    },
    {
      icon: Car,
      title: 'Direct eigenaar',
      desc: 'Vanaf dag één ben jij de eigenaar van het voertuig. Na afloop van het contract is de auto volledig van jou.',
      gradient: 'from-blue-500 to-indigo-500',
      glow: 'shadow-blue-500/20',
    },
    {
      icon: Banknote,
      title: 'Fiscale voordelen',
      desc: 'Trek de rente en afschrijving af van je winst. BTW op de aanschaf kun je direct terugvorderen. Maximaal fiscaal voordeel.',
      gradient: 'from-emerald-500 to-green-500',
      glow: 'shadow-emerald-500/20',
    },
    {
      icon: Shield,
      title: 'Lage maandlasten',
      desc: 'Betaal alleen wat je gebruikt. Met een slottermijn houd je de maandlasten laag — al vanaf €149 per maand.',
      gradient: 'from-violet-500 to-purple-500',
      glow: 'shadow-violet-500/20',
    },
    {
      icon: Clock,
      title: 'Snel geregeld',
      desc: 'Geen wekenlange procedures. Ontvang binnen 24 uur een offerte op maat en rijd snel in je nieuwe auto.',
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20',
    },
    {
      icon: Users,
      title: 'Persoonlijk advies',
      desc: 'Onze lease-experts denken met je mee. Welke constructie past bij jouw situatie? Wij helpen je kiezen.',
      gradient: 'from-rose-500 to-pink-500',
      glow: 'shadow-rose-500/20',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 overflow-hidden bg-[#0a1628]">
      {/* ── Animated background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className={`text-center mb-16 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-teal-400 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-sm">Financial Lease Specialist</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight leading-[1.1]">
            Waarom{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Smartlease.nl
            </span>
            ?
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            De slimste keuze voor ondernemers die willen investeren in mobiliteit
          </p>
        </div>

        {/* ── USP Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {usps.map((usp, idx) => {
            const Icon = usp.icon;
            return (
              <div
                key={idx}
                className={`group relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-7 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${usp.glow} ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: visible ? `${200 + idx * 100}ms` : '0ms', transitionDuration: '800ms' }}
              >
                {/* Glow border on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${usp.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${usp.gradient} flex items-center justify-center mb-4 shadow-lg ${usp.glow} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition-colors duration-300">
                    {usp.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                    {usp.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Stats Counter Bar ── */}
        <div className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '800ms' }}>
          <div className="relative bg-gradient-to-r from-white/[0.06] to-white/[0.03] backdrop-blur-md border border-white/[0.1] rounded-2xl p-8 md:p-10">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
              {/* Stat 1 */}
              <div ref={c1.ref} className="text-center group">
                <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
                  {c1.count.toLocaleString('nl-NL')}<span className="text-teal-400">+</span>
                </div>
                <p className="text-sm text-white/40 font-medium">Voertuigen beschikbaar</p>
              </div>

              {/* Divider (desktop) */}
              <div className="hidden md:block absolute left-1/4 top-6 bottom-6 w-px bg-white/[0.08]" />

              {/* Stat 2 */}
              <div ref={c2.ref} className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
                  {c2.count}<span className="text-teal-400">+</span>
                </div>
                <p className="text-sm text-white/40 font-medium">Gecertificeerde dealers</p>
              </div>

              <div className="hidden md:block absolute left-2/4 top-6 bottom-6 w-px bg-white/[0.08]" />

              {/* Stat 3 */}
              <div ref={c3.ref} className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
                  <span className="text-teal-400">4</span>,{c3.count - 40}<span className="text-white/60">/5</span>
                </div>
                <p className="text-sm text-white/40 font-medium">Klantbeoordeling</p>
              </div>

              <div className="hidden md:block absolute left-3/4 top-6 bottom-6 w-px bg-white/[0.08]" />

              {/* Stat 4 */}
              <div ref={c4.ref} className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 tracking-tight">
                  <span className="text-teal-400">24</span>/7
                </div>
                <p className="text-sm text-white/40 font-medium">Online beschikbaar</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className={`text-center mt-12 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
          <button
            onClick={() => navigate('/aanbod')}
            className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5"
          >
            Bekijk ons aanbod
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}