import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Car,
  Briefcase,
  ChevronRight,
  Fuel,
  Gauge,
  Calendar,
  Wallet,
  Tag,
  LayoutGrid,
  Sun,
  Armchair,
  Camera,
  Navigation,
  Snowflake,
  Disc,
} from 'lucide-react';
import { vehicleApi } from '../services/api';

// ─── Image helper ────────────────────────────────────────────────────────────

function getImg(v: any): string {
  if (v.external_id) return `/img-proxy?id=${v.external_id}&s=640&n=1`;
  if (v.small_picture) return `/img-proxy?url=${encodeURIComponent(v.small_picture)}`;
  return '';
}
function makeSlug(v: any): string {
  const raw = `${v.merk || ''}-${v.model || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return raw || 'auto';
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Prefs {
  vehicleType: string;
  budgetType: 'maand' | 'aanschaf';
  budgetMin: number;
  budgetMax: number;
  carrosserie: string[];
  brandstof: string[];
  transmissie: string;
  bouwjaarMin: number;
  merken: string[];
  mustHave: string[];
}

interface CriteriaItem {
  label: string;
  matched: boolean;
  icon: any;
  detail: string;
}

interface ScoredVehicle {
  vehicle: any;
  score: number;
  criteria: CriteriaItem[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STEP_NAMES = ['Voertuig', 'Budget', 'Type', 'Voorkeuren', 'Opties', 'Merken'];
const TOTAL = STEP_NAMES.length;

const VEHICLE_TYPE = [
  { id: 'personen', label: 'Personenauto', desc: 'Auto voor privé of zakelijk gebruik', icon: Car },
  { id: 'bedrijf', label: 'Bedrijfsauto', desc: 'Bestelwagen of bedrijfsvoertuig', icon: Briefcase },
];

const TYPES = [
  { label: 'SUV / Crossover', value: 'Terreinwagen/Pick Up' },
  { label: 'Hatchback', value: 'Hatchback' },
  { label: 'Sedan', value: 'Sedan' },
  { label: 'Stationwagon', value: 'Stationcar' },
  { label: 'Coupé', value: 'Sportwagen/Coupé' },
  { label: 'Cabriolet', value: 'Cabriolet' },
  { label: 'MPV', value: 'MPV' },
  { label: 'Bedrijfswagen', value: 'Bedrijfswagen' },
];

const FUELS = ['Benzine', 'Diesel', 'Elektrisch', 'Hybride'];

const MUST_HAVE = [
  { id: 'navigatie', label: 'Navigatiesysteem', optie: 'navigatiesysteem', icon: Navigation },
  { id: 'stoelverwarming', label: 'Stoelverwarming', optie: 'stoelverwarming', icon: Snowflake },
  { id: 'panoramadak', label: 'Panoramadak / Schuifdak', optie: 'open dak (electrisch)', icon: Sun },
  { id: 'trekhaak', label: 'Trekhaak', optie: 'trekhaak', icon: Disc },
  { id: 'leder', label: 'Lederen bekleding', optie: 'lederen bekleding', icon: Armchair },
  { id: 'parkeer', label: 'Parkeersensoren', optie: 'parkeersensor', icon: Camera },
];

const BRANDS = [
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Mercedes-Benz', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
  { name: 'Volkswagen', logo: 'https://www.carlogos.org/car-logos/volkswagen-logo.png' },
  { name: 'Toyota', logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
  { name: 'Volvo', logo: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
  { name: 'Ford', logo: 'https://www.carlogos.org/car-logos/ford-logo.png' },
  { name: 'Renault', logo: 'https://www.carlogos.org/car-logos/renault-logo.png' },
  { name: 'Peugeot', logo: 'https://www.carlogos.org/car-logos/peugeot-logo.png' },
  { name: 'Opel', logo: 'https://www.carlogos.org/car-logos/opel-logo.png' },
  { name: 'Skoda', logo: 'https://www.carlogos.org/car-logos/skoda-logo.png' },
  { name: 'KIA', logo: 'https://www.carlogos.org/car-logos/kia-logo.png' },
  { name: 'Tesla', logo: 'https://www.carlogos.org/car-logos/tesla-logo.png' },
  { name: 'Hyundai', logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
];

// ─── Scoring ─────────────────────────────────────────────────────────────────

function checkMustHave(_vehicle: any, _featureId: string): boolean {
  return true;
}

function scoreVehicle(v: any, p: Prefs): ScoredVehicle {
  const criteria: CriteriaItem[] = [];
  const price = v.verkoopprijs || 0;
  const mp = v.maandprijs || 0;
  const bj = v.bouwjaar_year || 0;

  if (p.budgetType === 'maand') {
    const ok = mp > 0 && mp <= p.budgetMax;
    criteria.push({ label: 'Budget', matched: ok, icon: Wallet, detail: ok ? `€${mp} p/m` : `€${mp} p/m` });
  } else {
    const ok = price <= p.budgetMax && price >= p.budgetMin;
    criteria.push({ label: 'Budget', matched: ok, icon: Wallet, detail: ok ? 'Binnen budget' : 'Buiten budget' });
  }

  if (p.brandstof.length > 0) {
    const ok = p.brandstof.includes(v.brandstof);
    criteria.push({ label: 'Brandstof', matched: ok, icon: Fuel, detail: v.brandstof || '?' });
  }

  if (p.transmissie) {
    const ok = p.transmissie === v.transmissie;
    criteria.push({ label: 'Transmissie', matched: ok, icon: Gauge, detail: v.transmissie || '?' });
  }

  if (p.merken.length > 0) {
    const ok = p.merken.includes(v.merk);
    criteria.push({ label: 'Merk', matched: ok, icon: Tag, detail: v.merk || '?' });
  }

  criteria.push({ label: 'Bouwjaar', matched: bj >= p.bouwjaarMin, icon: Calendar, detail: `${bj}` });

  if (p.carrosserie.length > 0) {
    const ok = p.carrosserie.includes(v.categorie);
    criteria.push({ label: 'Type', matched: ok, icon: LayoutGrid, detail: v.categorie || '?' });
  }

  p.mustHave.forEach((fid) => {
    const feat = MUST_HAVE.find((m) => m.id === fid);
    if (!feat) return;
    const ok = checkMustHave(v, fid);
    const shortLabel = feat.label.split(' / ')[0];
    criteria.push({
      label: shortLabel,
      matched: ok,
      icon: feat.icon,
      detail: ok ? shortLabel : `Geen ${shortLabel.toLowerCase()}`,
    });
  });

  const weights: Record<string, number> = { Budget: 30, Brandstof: 20, Transmissie: 15, Merk: 15, Bouwjaar: 10, Type: 10 };
  let totalW = 0;
  let earned = 0;
  criteria.forEach((c) => {
    const w = weights[c.label] || 8;
    totalW += w;
    if (c.matched) earned += w;
  });

  const raw = totalW > 0 ? (earned / totalW) * 100 : 50;
  return { vehicle: v, score: Math.min(Math.round(raw), 100), criteria };
}

// ─── Components ──────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-smartlease-yellow to-yellow-400 rounded-full transition-all duration-500"
        style={{ width: `${((step + 1) / total) * 100}%` }} />
    </div>
  );
}

function Ring({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const col = score >= 80 ? '#22c55e' : score >= 60 ? '#14b8a6' : '#f59e0b';
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color: col }}>{score}%</span>
      </div>
    </div>
  );
}

function Badge({ c }: { c: CriteriaItem }) {
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
      c.matched ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-100'
    }`}>
      {c.matched ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-300" />}
      <Icon className="h-3 w-3" />
      <span className="truncate max-w-[80px]">{c.detail}</span>
    </span>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function KeuzehulpPage() {
  const nav = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScoredVehicle[]>([]);
  const [prefs, setPrefs] = useState<Prefs>({
    vehicleType: '',
    budgetType: 'maand',
    budgetMin: 0,
    budgetMax: 500,
    carrosserie: [],
    brandstof: [],
    transmissie: '',
    bouwjaarMin: 2018,
    merken: [],
    mustHave: [],
  });

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const tog = (arr: string[], v: string) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const canProceed = step === 0 ? prefs.vehicleType !== '' : true;
  const isResults = step >= TOTAL;

  const isBedrijf = prefs.vehicleType === 'bedrijf';

  const goNext = () => {
    if (step < TOTAL - 1) {
      const nextStep = step === 1 && isBedrijf ? 3 : step + 1;
      setStep(nextStep);
      scrollTop();
    } else {
      runSearch();
    }
  };

  const goPrev = () => {
    if (step > 0) {
      const prevStep = step === 3 && isBedrijf ? 1 : step - 1;
      setStep(prevStep);
      scrollTop();
    }
  };

  const goBack = () => { setStep(TOTAL - 1); setResults([]); scrollTop(); };
  const doReset = () => {
    setStep(0);
    setResults([]);
    setPrefs({
      vehicleType: '',
      budgetType: 'maand',
      budgetMin: 0,
      budgetMax: 500,
      carrosserie: [],
      brandstof: [],
      transmissie: '',
      bouwjaarMin: 2018,
      merken: [],
      mustHave: [],
    });
    scrollTop();
  };

  const runSearch = async () => {
    setStep(TOTAL);
    setLoading(true);
    scrollTop();
    try {
      const params: any = { per_page: 80, sort: 'nieuwste' };

      if (isBedrijf && prefs.carrosserie.length === 0) {
        params.categorie = 'Bedrijfswagen';
      }

      if (prefs.merken.length > 0) params.merk = prefs.merken.join(',');
      if (prefs.brandstof.length === 1) params.brandstof = prefs.brandstof[0];
      if (prefs.transmissie) params.transmissie = prefs.transmissie;
      if (prefs.bouwjaarMin) params.jaar_min = prefs.bouwjaarMin;
      if (prefs.carrosserie.length === 1) params.categorie = prefs.carrosserie[0];

      if (prefs.budgetType === 'maand') {
        if (prefs.budgetMax > 0) params.budget_max = prefs.budgetMax;
      } else {
        if (prefs.budgetMax > 0) params.prijs_max = prefs.budgetMax;
        if (prefs.budgetMin > 0) params.prijs_min = prefs.budgetMin;
      }

      if (prefs.mustHave.length > 0) {
        const optieValues = prefs.mustHave.map((fid) => {
          const f = MUST_HAVE.find((m) => m.id === fid);
          return f ? f.optie : '';
        }).filter(Boolean);
        if (optieValues.length > 0) params.opties = optieValues.join(',');
      }

      const data = await vehicleApi.search(params);
      const scored = (data.vehicles || [])
        .map((v: any) => scoreVehicle(v, prefs))
        .sort((a: ScoredVehicle, b: ScoredVehicle) => b.score - a.score)
        .slice(0, 12);

      await new Promise((r) => setTimeout(r, 1600));
      setResults(scored);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  const fmtKm = (n: number) => new Intl.NumberFormat('nl-NL').format(n);

  // ─── Step 0: Voertuigtype ─────────────────────────────────────────────────

  const stepVehicleType = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Wat voor voertuig zoek je?</h2>
      <p className="text-sm text-gray-500 mb-5">Kies een type</p>
      <div className="space-y-2.5">
        {VEHICLE_TYPE.map((o) => {
          const sel = prefs.vehicleType === o.id;
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              onClick={() => setPrefs({ ...prefs, vehicleType: o.id })}
              className={`w-full flex items-center space-x-3 p-5 rounded-xl border-2 text-left transition-all ${
                sel ? 'border-smartlease-yellow bg-smartlease-yellow/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                sel ? 'bg-smartlease-yellow text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{o.label}</p>
                <p className="text-xs text-gray-500">{o.desc}</p>
              </div>
              {sel && <Check className="h-5 w-5 text-smartlease-yellow flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── Step 1: Budget ───────────────────────────────────────────────────────

  const stepBudget = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Wat is je budget?</h2>
      <p className="text-sm text-gray-500 mb-5">Kies hoe je wilt zoeken</p>
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setPrefs({ ...prefs, budgetType: 'maand', budgetMin: 0, budgetMax: 500 })}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
            prefs.budgetType === 'maand' ? 'bg-white text-smartlease-yellow shadow-sm' : 'text-gray-500'
          }`}
        >
          Per maand
        </button>
        <button
          onClick={() => setPrefs({ ...prefs, budgetType: 'aanschaf', budgetMin: 0, budgetMax: 30000 })}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
            prefs.budgetType === 'aanschaf' ? 'bg-white text-smartlease-yellow shadow-sm' : 'text-gray-500'
          }`}
        >
          Aankoopbedrag
        </button>
      </div>
      {prefs.budgetType === 'maand' ? (
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Maximum per maand</span>
            <span className="text-lg font-bold text-smartlease-yellow">€ {prefs.budgetMax} p/m</span>
          </div>
          <input type="range" min={100} max={2000} step={50} value={prefs.budgetMax}
            onChange={(e) => setPrefs({ ...prefs, budgetMax: +e.target.value })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-smartlease-yellow" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>€ 100</span><span>€ 2.000</span>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Maximum</span>
            <span className="text-lg font-bold text-smartlease-yellow">{fmt(prefs.budgetMax)}</span>
          </div>
          <input type="range" min={5000} max={150000} step={1000} value={prefs.budgetMax}
            onChange={(e) => setPrefs({ ...prefs, budgetMax: +e.target.value })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-smartlease-yellow" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>€ 5.000</span><span>€ 150.000</span>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Step 2: Carrosserie ──────────────────────────────────────────────────

  const stepType = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Wat voor type auto zoek je?</h2>
      <p className="text-sm text-gray-500 mb-5">Selecteer één of meerdere types</p>
      <div className="grid grid-cols-2 gap-2.5">
        {TYPES.filter((t) => t.value !== 'Bedrijfswagen').map((t) => {
          const sel = prefs.carrosserie.includes(t.value);
          return (
            <button
              key={t.value}
              onClick={() => setPrefs({ ...prefs, carrosserie: tog(prefs.carrosserie, t.value) })}
              className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                sel ? 'border-smartlease-yellow bg-smartlease-yellow/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-semibold text-sm">{t.label}</span>
              {sel && <Check className="h-4 w-4 text-smartlease-yellow" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── Step 3: Voorkeuren ───────────────────────────────────────────────────

  const stepPrefs = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Wat zijn je voorkeuren?</h2>
      <p className="text-sm text-gray-500 mb-5">Optioneel</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Brandstof</label>
          <div className="flex flex-wrap gap-2">
            {FUELS.map((b) => {
              const sel = prefs.brandstof.includes(b);
              return (
                <button key={b} onClick={() => setPrefs({ ...prefs, brandstof: tog(prefs.brandstof, b) })}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                    sel ? 'border-smartlease-yellow bg-smartlease-yellow/5 text-smartlease-yellow' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {sel && <Check className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />}{b}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Transmissie</label>
          <div className="flex flex-wrap gap-2">
            {['', 'Automaat', 'Handgeschakeld'].map((t) => (
              <button key={t} onClick={() => setPrefs({ ...prefs, transmissie: t })}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                  prefs.transmissie === t ? 'border-smartlease-yellow bg-smartlease-yellow/5 text-smartlease-yellow' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {t || 'Geen voorkeur'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-gray-700">Minimaal bouwjaar</label>
            <span className="text-sm font-bold text-smartlease-yellow">{prefs.bouwjaarMin}</span>
          </div>
          <input type="range" min={2010} max={2026} step={1} value={prefs.bouwjaarMin}
            onChange={(e) => setPrefs({ ...prefs, bouwjaarMin: +e.target.value })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-smartlease-yellow" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2010</span><span>2026</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Step 4: Must-have opties ─────────────────────────────────────────────

  const stepMustHave = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Welke opties moet de auto hebben?</h2>
      <p className="text-sm text-gray-500 mb-5">Optioneel — selecteer wat belangrijk voor je is</p>
      <div className="space-y-2.5">
        {MUST_HAVE.map((m) => {
          const sel = prefs.mustHave.includes(m.id);
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setPrefs({ ...prefs, mustHave: tog(prefs.mustHave, m.id) })}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 text-left transition-all ${
                sel ? 'border-smartlease-yellow bg-smartlease-yellow/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                sel ? 'bg-smartlease-yellow text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm flex-1">{m.label}</span>
              {sel && <Check className="h-5 w-5 text-smartlease-yellow flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── Step 5: Merken ───────────────────────────────────────────────────────

  const stepMerken = () => (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Heb je voorkeur voor een merk?</h2>
      <p className="text-sm text-gray-500 mb-5">Optioneel</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {BRANDS.map((m) => {
          const sel = prefs.merken.includes(m.name);
          return (
            <button key={m.name} onClick={() => setPrefs({ ...prefs, merken: tog(prefs.merken, m.name) })}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition ${
                sel ? 'border-smartlease-yellow bg-smartlease-yellow/5' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <img src={m.logo} alt={m.name} className="h-8 w-8 sm:h-10 sm:w-10 object-contain mb-1.5" loading="lazy" />
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{m.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── Loading ──────────────────────────────────────────────────────────────

  const stepLoading = () => (
    <div className="text-center py-12">
      <div className="relative inline-block mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-smartlease-yellow to-yellow-400 flex items-center justify-center animate-pulse">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-smartlease-yellow/30 animate-ping" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">We zoeken je perfecte match...</h2>
      <p className="text-sm text-gray-500">Onze AI analyseert 60.000+ auto's</p>
      <div className="mt-6 flex justify-center space-x-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-smartlease-yellow animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  );

  // ─── Results ──────────────────────────────────────────────────────────────

  const stepResults = () => (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          {results.length} matches gevonden!
        </h2>
        <p className="text-sm text-gray-500">Gesorteerd op jouw voorkeuren</p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4 text-sm">Geen auto's gevonden. Pas je criteria aan.</p>
          <button onClick={doReset} className="bg-smartlease-yellow text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            Opnieuw
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((match, idx) => {
            const v = match.vehicle;
            const img = getImg(v);
            const slug = makeSlug(v);
            const isTop = idx === 0 && match.score >= 70;
            const link = `/auto/${v.id}/${slug}`;

            return (
              <div
                key={v.id}
                className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
                  isTop ? 'border-smartlease-yellow shadow-md' : 'border-gray-200'
                }`}
                style={{ opacity: 0, animation: `kfSlide 0.4s ease-out ${idx * 80}ms forwards` }}
              >
                {isTop && (
                  <div className="bg-gradient-to-r from-smartlease-yellow to-yellow-400 text-white text-center py-1.5 text-xs font-bold flex items-center justify-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Beste match voor jou</span>
                  </div>
                )}

                <div className="flex p-3 gap-3">
                  <div className="w-28 sm:w-36 flex-shrink-0">
                    {img ? (
                      <img
                        src={img}
                        alt={`${v.merk} ${v.model}`}
                        className="w-full h-20 sm:h-24 object-cover rounded-lg bg-gray-100"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-20 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">
                        {v.merk} {v.model}
                      </h3>
                      <Ring score={match.score} />
                    </div>
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      {v.bouwjaar_year} · {fmt(v.verkoopprijs || 0)} · {fmtKm(v.kmstand || 0)} km
                    </p>
                    {v.maandprijs > 0 && (
                      <p className="text-base font-bold text-smartlease-yellow mb-1">€ {v.maandprijs} p/m</p>
                    )}
                  </div>
                </div>

                <div className="px-3 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {match.criteria.map((c, i) => (
                      <Badge key={i} c={c} />
                    ))}
                  </div>
                </div>

                <div className="px-3 pb-3">
                  <a
                    href={link}
                    onClick={(e) => { e.preventDefault(); nav(link); }}
                    className="w-full flex items-center justify-center space-x-1.5 bg-gray-50 hover:bg-smartlease-yellow hover:text-white text-gray-700 py-2.5 rounded-lg text-sm font-semibold transition border border-gray-200 hover:border-smartlease-yellow"
                  >
                    <span>Bekijk deze auto</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={goBack}
          className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Pas keuzes aan</span>
        </button>
        <button
          onClick={doReset}
          className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-semibold transition"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // ─── Main Render ───────────────────────────────────────────────────────────

  const stepFunctions = [stepVehicleType, stepBudget, stepType, stepPrefs, stepMustHave, stepMerken];

  const renderContent = () => {
    if (isResults) return loading ? stepLoading() : stepResults();
    return stepFunctions[step]();
  };

  return (
    <div ref={containerRef} className="bg-gray-50 min-h-screen">
      <style>{`@keyframes kfSlide { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 bg-smartlease-yellow/10 text-smartlease-yellow px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-xs">AI Keuzehulp</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vind jouw perfecte auto</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {!isResults && (
            <div className="px-5 pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <button onClick={goPrev} disabled={step === 0}
                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-0 transition">
                  <ArrowLeft className="h-3.5 w-3.5" /><span>Vorige</span>
                </button>
                <span className="text-xs text-gray-400">{step + 1} / {TOTAL}</span>
                <button onClick={doReset}
                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-600 transition">
                  <RotateCcw className="h-3 w-3" /><span>Reset</span>
                </button>
              </div>
              <ProgressBar step={step} total={TOTAL} />
            </div>
          )}
          {isResults && !loading && (
            <div className="px-5 pt-4">
              <ProgressBar step={TOTAL} total={TOTAL} />
            </div>
          )}

          <div className="p-5 sm:p-6">{renderContent()}</div>

          {!isResults && (
            <div className="px-5 pb-5 flex justify-between items-center">
              {step < TOTAL - 1 ? (
                <button onClick={() => {
                  const nextStep = step === 1 && isBedrijf ? 3 : step + 1;
                  setStep(nextStep);
                  scrollTop();
                }}
                  className="text-xs text-gray-400 hover:text-gray-600">
                  Overslaan →
                </button>
              ) : <div />}
              <button
                onClick={goNext}
                disabled={!canProceed}
                className="flex items-center space-x-1.5 bg-smartlease-yellow hover:bg-yellow-600 disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-md disabled:shadow-none"
              >
                <span>{step === TOTAL - 1 ? 'Vind mijn auto' : 'Volgende'}</span>
                {step === TOTAL - 1 ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}