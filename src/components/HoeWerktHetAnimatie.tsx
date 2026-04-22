import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── CONFIG ── wordt per site ingevuld
const CONFIG = {
  accentBg: 'bg-yellow-400',
  accentText: 'text-yellow-700',
  accentLight: 'bg-yellow-50',
  accentBorder: 'border-yellow-300',
  accentDot: 'bg-yellow-400',
  accentBtn: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900',
  accentDotActive: 'bg-yellow-400',
  badgeBg: 'bg-yellow-50 border-yellow-200',
  badgeText: 'text-yellow-700',
  checkBg: 'bg-yellow-400',
  highlightBorder: 'border-yellow-300',
  highlightBg: 'bg-yellow-50',
  highlightText: 'text-yellow-700',
  highlightDot: 'bg-yellow-300',
};

const STAPPEN = [
  {
    id: 1,
    titel: 'Kies je auto',
    beschrijving: '29.000+ occasions van Nederlandse dealers. Vertel ons wat je zoekt — wij zoeken actief mee en vinden de auto die bij jou past.',
    badge: '29.000+ occasions beschikbaar',
    duur: 4500,
  },
  {
    id: 2,
    titel: 'Ontvang je offerte',
    beschrijving: 'Binnen 24 uur een persoonlijk voorstel. Alle lease- en financieringskosten inbegrepen. Volledig transparant, geen verborgen kosten.',
    badge: 'Binnen 24 uur · Vrijblijvend',
    duur: 4500,
  },
  {
    id: 3,
    titel: 'Teken je contract digitaal',
    beschrijving: 'Sluit je leasecontract volledig online af. Geen papierwerk, geen kantoorbezoek. Alles geregeld vanuit huis.',
    badge: '100% digitaal',
    duur: 4500,
  },
  {
    id: 4,
    titel: 'Rij weg in jouw auto',
    beschrijving: 'De auto wordt afgeleverd op jouw adres of je haalt hem op bij de dealer. Vaste maandlast, geen zorgen.',
    badge: 'Snel geleverd · Vaste maandlast',
    duur: 4500,
  },
];

function Scene1() {
  const merken = ['BMW','Mercedes','Audi','VW','Toyota','Volvo','Porsche','Skoda','Ford','Kia'];
  const uitgelicht = [1, 6];
  return (
    <div className="grid grid-cols-5 gap-2 w-full max-w-xs mx-auto">
      {merken.map((m, i) => (
        <div key={m} className={`rounded-xl p-2 text-center border transition-all duration-300 ${uitgelicht.includes(i) ? CONFIG.highlightBorder + ' ' + CONFIG.highlightBg : 'border-slate-100 bg-white'}`}>
          <div className={`w-full h-3 rounded mb-1.5 ${uitgelicht.includes(i) ? CONFIG.highlightDot : 'bg-slate-100'}`} />
          <span className={`text-[9px] font-medium leading-none ${uitgelicht.includes(i) ? CONFIG.highlightText : 'text-slate-400'}`}>{m}</span>
        </div>
      ))}
    </div>
  );
}

function Scene2() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 w-48 mx-auto shadow-sm">
      <div className={`h-2 rounded-full w-3/5 mb-3 ${CONFIG.highlightDot}`} />
      <div className="space-y-2 mb-4">
        {[100, 80, 95, 65, 80].map((w, i) => (
          <div key={i} className="h-1.5 bg-slate-100 rounded-full" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className={`flex items-center gap-2 ${CONFIG.badgeBg} border rounded-full px-3 py-1.5`}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CONFIG.accentDot}`} />
        <span className={`text-[11px] font-medium ${CONFIG.badgeText}`}>Offerte klaar</span>
      </div>
    </div>
  );
}

function Scene3() {
  const velden = ['Leasecontract', 'iDIN verificatie', 'Betaling'];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 w-52 mx-auto shadow-sm">
      {velden.map((v) => (
        <div key={v} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5 mb-2 border border-slate-100">
          <span className="text-[12px] text-slate-500 flex-1">{v}</span>
          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${CONFIG.checkBg}`}>
            <CheckCircle size={11} className="text-white" />
          </div>
        </div>
      ))}
      <div className={`${CONFIG.accentBg} rounded-xl py-2.5 text-center mt-3`}>
        <span className="text-slate-900 text-[12px] font-semibold">Digitaal getekend ✓</span>
      </div>
    </div>
  );
}

function Scene4() {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
      <div className={`flex items-center gap-2.5 ${CONFIG.badgeBg} border ${CONFIG.accentBorder} rounded-xl px-4 py-3 w-full`}>
        <span className="text-2xl">🚗</span>
        <div>
          <div className={`text-[13px] font-semibold ${CONFIG.accentText}`}>Auto klaar voor levering</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Aflevering op jouw adres of bij dealer</div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 w-full shadow-sm">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Jouw maandlast</div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold ${CONFIG.accentText}`}>€ 299</span>
          <span className="text-sm text-slate-400">/ maand</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Vast · Geen verborgen kosten</div>
      </div>
    </div>
  );
}

const SCENES = [Scene1, Scene2, Scene3, Scene4];

export default function HoeWerktHetAnimatie() {
  const [actief, setActief] = useState(0);
  const [voortgang, setVoortgang] = useState(0);
  const navigate = useNavigate();

  const gaaNaar = useCallback((n: number) => {
    setActief(n);
    setVoortgang(0);
  }, []);

  const volgende = useCallback(() => {
    gaaNaar(actief < STAPPEN.length - 1 ? actief + 1 : 0);
  }, [actief, gaaNaar]);

  const vorige = useCallback(() => {
    if (actief > 0) gaaNaar(actief - 1);
  }, [actief, gaaNaar]);

  useEffect(() => {
    setVoortgang(0);
    const duur = STAPPEN[actief].duur;
    const interval = 50;
    const totaal = duur / interval;
    let teller = 0;
    const timer = setInterval(() => {
      teller++;
      setVoortgang(Math.min((teller / totaal) * 100, 100));
      if (teller >= totaal) {
        clearInterval(timer);
        setActief(prev => prev < STAPPEN.length - 1 ? prev + 1 : 0);
        setVoortgang(0);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [actief]);

  const Scene = SCENES[actief];
  const stap = STAPPEN[actief];

  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p className={`${CONFIG.accentText} text-xs font-semibold tracking-widest uppercase mb-2`}>In 4 stappen</p>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-2">Zo werkt het</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-sm mx-auto">Van keuze tot sleutels — wij regelen alles.</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-slate-100">
            <div className={`h-full ${CONFIG.accentDot} transition-none rounded-r-full`} style={{ width: `${voortgang}%` }} />
          </div>

          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-1.5">
              {STAPPEN.map((_, i) => (
                <button
                  key={i}
                  onClick={() => gaaNaar(i)}
                  className={`transition-all duration-300 rounded-full ${i === actief ? `w-6 h-2 ${CONFIG.accentDotActive}` : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">{actief + 1} / {STAPPEN.length}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-0">
            <div className="flex items-center justify-center px-6 pt-5 pb-6 lg:px-10 lg:py-10 lg:bg-slate-50 lg:border-r border-slate-100 min-h-[200px] sm:min-h-[240px]">
              <div className="w-full transition-all duration-500">
                <Scene />
              </div>
            </div>

            <div className="px-6 pb-6 pt-0 lg:px-10 lg:py-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${CONFIG.accentLight}`}>
                    <span className={`text-xs font-bold ${CONFIG.accentText}`}>{stap.id}</span>
                  </div>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mb-2 leading-snug">{stap.titel}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{stap.beschrijving}</p>
                <div className={`inline-flex items-center gap-1.5 ${CONFIG.badgeBg} border rounded-full px-3 py-1`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${CONFIG.accentDot}`} />
                  <span className={`text-xs font-semibold ${CONFIG.badgeText}`}>{stap.badge}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                <button onClick={vorige} disabled={actief === 0}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={15} /> Vorige
                </button>
                <button onClick={() => navigate('/aanbod')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${CONFIG.accentBtn}`}>
                  Bekijk aanbod
                </button>
                <button onClick={volgende}
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                  {actief === STAPPEN.length - 1
                    ? <><RotateCcw size={13} /> Opnieuw</>
                    : <>Volgende <ChevronRight size={15} /></>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
