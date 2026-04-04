import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calculator, Phone, ChevronRight, Car, CheckCircle } from 'lucide-react';

interface SeoPage {
  merk: string;
  model: string | null;
  seo_title: string;
  seo_description: string;
  h1: string;
  intro_tekst: string;
  body_tekst: string;
  is_published: boolean;
}

interface Vehicle {
  id: string;
  merk: string;
  model: string;
  uitvoering: string;
  bouwjaar: number;
  kmstand: number;
  verkoopprijs: number;
  maandprijs?: number;
  brandstof: string;
  transmissie: string;
  small_picture?: string;
}

const POPULAIRE_MERKEN = [
  'toyota', 'volkswagen', 'bmw', 'mercedes-benz',
  'renault', 'ford', 'audi', 'volvo', 'kia',
  'nissan', 'peugeot', 'hyundai',
];

function formatPrijs(prijs: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(prijs);
}

function formatKm(km: number) {
  return new Intl.NumberFormat('nl-NL').format(km) + ' km';
}

// Bereken maandbedrag op basis van verkoopprijs
// 72 maanden, 15% aanbetaling, 15% slottermijn, 8.99% rente
function berekenMaandprijs(verkoopprijs: number): number {
  const aanbetalingPct = 0.15;
  const slottermijnPct = 0.15;
  const rente = 0.0899;
  const looptijd = 72;

  const aanbetaling = verkoopprijs * aanbetalingPct;
  const slottermijn = verkoopprijs * slottermijnPct;
  const lening = verkoopprijs - aanbetaling;
  const maandRente = rente / 12;

  const maandbedrag =
    ((lening - slottermijn / Math.pow(1 + maandRente, looptijd)) *
      maandRente) /
    (1 - Math.pow(1 + maandRente, -looptijd));

  return Math.ceil(maandbedrag);
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const slug = `${vehicle.merk}-${vehicle.model}`
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const maandprijs = vehicle.maandprijs ?? berekenMaandprijs(vehicle.verkoopprijs);

  return (
    <Link
      to={`/auto/${vehicle.id}/${slug}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group flex flex-col"
    >
      {/* Foto - 4:3 ratio zodat auto's niet worden afgesneden */}
      <div className="relative w-full bg-gray-100 overflow-hidden" style={{ paddingBottom: '75%' }}>
        {vehicle.small_picture ? (
          <img
            src={vehicle.small_picture}
            alt={`${vehicle.merk} ${vehicle.model}`}
            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car size={40} className="text-gray-300" />
          </div>
        )}
        {/* Maandprijs badge */}
        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
          v.a. {formatPrijs(maandprijs)}/mnd
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug">
          {vehicle.merk} {vehicle.model}
        </h3>
        <p className="text-gray-500 text-sm mt-0.5 truncate">{vehicle.uitvoering}</p>

        <div className="flex gap-3 mt-3 text-xs text-gray-500">
          <span>{vehicle.bouwjaar}</span>
          <span>·</span>
          <span>{formatKm(vehicle.kmstand)}</span>
          <span>·</span>
          <span className="capitalize">{vehicle.brandstof?.toLowerCase()}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 mt-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-900 text-base">
              {formatPrijs(vehicle.verkoopprijs)}
            </div>
            <div className="text-blue-600 text-xs font-medium">
              {formatPrijs(maandprijs)}/mnd
            </div>
          </div>
          <span className="text-blue-600 text-sm font-medium group-hover:underline">
            Bekijk →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MerkModelPage() {
  const { merk: merkSlug, model: modelSlug } = useParams<{ merk: string; model?: string }>();

  const [seoPage, setSeoPage] = useState<SeoPage | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleCount, setVehicleCount] = useState(0);

  const merkDisplay = merkSlug
    ? merkSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    : '';
  const modelDisplay = modelSlug
    ? modelSlug.toUpperCase().replace(/-/g, ' ')
    : '';

  useEffect(() => {
    if (!merkSlug) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true);
    Promise.all([loadSeoPage(), loadVehicles()]).finally(() => setLoading(false));
  }, [merkSlug, modelSlug]);

  async function loadSeoPage() {
    let query = supabase
      .from('seo_pages')
      .select('*')
      .eq('slug_merk', merkSlug || '')
      .eq('is_published', true);

    if (modelSlug) {
      query = query.eq('slug_model', modelSlug);
    } else {
      query = query.is('slug_model', null);
    }

    const { data } = await query.maybeSingle();
    setSeoPage(data);
  }

  async function loadVehicles() {
    const merkFilter = `%${(merkSlug || '').replace(/-/g, '%')}%`;
    const modelFilter = modelSlug ? `%${modelSlug.replace(/-/g, '%')}%` : null;

    let q = supabase
      .from('vehicles')
      .select('id, merk, model, uitvoering, bouwjaar, kmstand, verkoopprijs, maandprijs, brandstof, transmissie, small_picture')
      .eq('is_active', true)
      .ilike('merk', merkFilter)
      .order('verkoopprijs', { ascending: true })
      .limit(12);

    if (modelFilter) q = q.ilike('model', modelFilter);

    const { data } = await q;
    setVehicles(data || []);

    // Count
    let cq = supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .ilike('merk', merkFilter);

    if (modelFilter) cq = cq.ilike('model', modelFilter);

    const { count } = await cq;
    setVehicleCount(count || 0);
  }

  const pageTitle = seoPage?.h1 || `${merkDisplay}${modelDisplay ? ' ' + modelDisplay : ''} Financial Lease`;
  const pageIntro = seoPage?.intro_tekst || `Bekijk ons actuele aanbod ${merkDisplay}${modelDisplay ? ' ' + modelDisplay : ''} financial lease occasions. Direct eigenaar, fiscaal voordelig, ook zonder jaarcijfers.`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white pt-10 pb-12 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <nav className="text-blue-300 text-sm mb-5 flex items-center gap-1 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={13} />
            <Link to="/aanbod" className="hover:text-white transition-colors">Aanbod</Link>
            <ChevronRight size={13} />
            {modelSlug ? (
              <>
                <Link to={`/financial-lease/${merkSlug}`} className="hover:text-white transition-colors">
                  {merkDisplay}
                </Link>
                <ChevronRight size={13} />
                <span className="text-white">{modelDisplay}</span>
              </>
            ) : (
              <span className="text-white">{merkDisplay}</span>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                {pageTitle}
              </h1>
              <p className="text-blue-100 text-base md:text-lg max-w-2xl leading-relaxed">
                {pageIntro}
              </p>
            </div>

            {/* Stats blokje */}
            {!loading && vehicleCount > 0 && (
              <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-4 text-center min-w-[140px] shrink-0">
                <div className="text-3xl font-extrabold">{vehicleCount}</div>
                <div className="text-blue-200 text-sm mt-0.5">occasions beschikbaar</div>
              </div>
            )}
          </div>

          {/* USP badges */}
          <div className="flex flex-wrap gap-2 mt-6">
            {['Direct eigenaar', 'Fiscaal voordelig', 'Zonder jaarcijfers', 'Vaste maandprijs'].map((k) => (
              <span key={k} className="flex items-center gap-1.5 bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <CheckCircle size={12} className="text-green-400" />
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Aanbod ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {loading
                ? 'Aanbod laden...'
                : `${vehicleCount} ${merkDisplay}${modelDisplay ? ' ' + modelDisplay : ''} occasions`}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">Gesorteerd op laagste prijs</p>
          </div>
          <Link
            to={`/aanbod?merk=${encodeURIComponent(merkDisplay)}`}
            className="text-blue-600 font-medium text-sm hover:underline flex items-center gap-1"
          >
            Bekijk alle {merkDisplay} <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm h-72 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
            {vehicleCount > 12 && (
              <div className="text-center mt-8">
                <Link
                  to={`/aanbod?merk=${encodeURIComponent(merkDisplay)}${modelSlug ? `&model=${encodeURIComponent(modelDisplay)}` : ''}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-sm"
                >
                  Bekijk alle {vehicleCount} occasions →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <Car size={44} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">
              Momenteel geen {merkDisplay} {modelDisplay} in ons aanbod.
            </p>
            <Link to="/aanbod" className="mt-3 inline-block text-blue-600 hover:underline text-sm font-medium">
              Bekijk ons volledige aanbod →
            </Link>
          </div>
        )}
      </div>

      {/* ── SEO body tekst ── */}
      {seoPage?.body_tekst && (
        <div className="bg-white border-t border-gray-100 py-14">
          <div className="max-w-4xl mx-auto px-4">
            <div className="seo-body" dangerouslySetInnerHTML={{ __html: seoPage.body_tekst }} />
          </div>
        </div>
      )}

      <style>{`
        .seo-body h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
          margin-top: 2.25rem;
          margin-bottom: 0.65rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .seo-body h2:first-child { margin-top: 0; }
        .seo-body p {
          color: #4b5563;
          line-height: 1.8;
          margin-bottom: 1rem;
          font-size: 0.97rem;
        }
        .seo-body ul { list-style: none; padding: 0; margin-bottom: 1rem; }
        .seo-body ul li {
          color: #4b5563;
          padding: 0.3rem 0 0.3rem 1.6rem;
          position: relative;
          line-height: 1.6;
          font-size: 0.97rem;
        }
        .seo-body ul li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #2563eb;
          font-weight: 700;
        }
      `}</style>

      {/* ── CTA ── */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Interesse in een {merkDisplay}{modelDisplay ? ' ' + modelDisplay : ''} lease?
          </h2>
          <p className="text-blue-100 mb-8 text-base max-w-lg mx-auto leading-relaxed">
            Bereken direct jouw maandbedrag of laat ons je terugbellen voor persoonlijk advies. Geen verplichtingen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/offerte"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-7 py-3.5 rounded-lg hover:bg-blue-50 transition-colors shadow"
            >
              <Calculator size={18} />
              Bereken maandbedrag
            </Link>
            <Link
              to="/bel-mij"
              className="inline-flex items-center justify-center gap-2 border-2 border-white border-opacity-60 text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Phone size={18} />
              Laat je terugbellen
            </Link>
          </div>
        </div>
      </div>

      {/* ── Andere populaire merken ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-base font-bold text-gray-700 mb-4 uppercase tracking-wide text-xs">
          Andere populaire merken
        </h2>
        <div className="flex flex-wrap gap-2">
          {POPULAIRE_MERKEN.map((m) => (
            <Link
              key={m}
              to={`/financial-lease/${m}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                m === merkSlug
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {m.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}