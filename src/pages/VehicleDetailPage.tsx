import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Zap,
  Palette,
  DoorClosed,
  Check,
  Loader2,
  Phone,
  FileText,
  MessageCircle,
  MapPin,
  Building2,
  Shield,
  Tag,
} from 'lucide-react';
import type { VehicleDetail } from '../types/vehicle';
import { LeaseCalculator, type CalculatorState } from '../components/LeaseCalculator';
import { supabase } from '../lib/supabase';

const API_BASE = 'https://jtntbwioxszeocumgvzk.supabase.co/functions/v1/vehicles';
const PROXY = 'https://jtntbwioxszeocumgvzk.supabase.co/functions/v1/image-proxy?url=';
const proxyImg = (url: string) => url ? `${PROXY}${encodeURIComponent(url)}` : '';

function berekenMaandprijs(verkoopprijs: number): number {
  if (!verkoopprijs || verkoopprijs <= 0) return 0;
  const r = 8.99 / 100 / 12;
  const aanbetaling = verkoopprijs * 0.15;
  const slottermijn = verkoopprijs * 0.15;
  const loan = verkoopprijs - aanbetaling;
  const n = 72;
  const pmt = (loan * r * Math.pow(1 + r, n) - slottermijn * r) / (Math.pow(1 + r, n) - 1);
  return Math.round(pmt);
}

// ─── Accordion ───────────────────────────────────────────────────────────────
function AccordionSection({ title, defaultOpen = false, children, count }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode; count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 group">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-[#f5a623] transition-colors">{title}</h3>
          {count !== undefined && count > 0 && (
            <span className="bg-[#f5a623]/10 text-[#f5a623] text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        <div className={`w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300 group-hover:border-[#f5a623] group-hover:text-[#f5a623] ${open ? 'rotate-180 border-[#f5a623] text-[#f5a623]' : 'text-gray-400'}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'max-h-[3000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

// ─── Spec Item ───────────────────────────────────────────────────────────────
function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="group flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-[#f5a623]/5 border border-transparent hover:border-[#f5a623]/20 transition-all duration-200">
      <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[#f5a623] group-hover:shadow-md transition-shadow">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [calculatorState, setCalculatorState] = useState<CalculatorState | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [thumbsVisible, setThumbsVisible] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session?.user));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setCurrentImageIndex(0);
    fetch(`${API_BASE}/detail?id=${id}`)
      .then(r => r.json())
      .then(data => { setVehicle(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const images = useMemo<string[]>(() => {
    if (!vehicle) return [];
    const imgs = (vehicle as any).images as string[] | undefined;
    if (imgs && imgs.length > 0) return imgs.map(proxyImg);
    if ((vehicle as any).afbeelding) return [proxyImg((vehicle as any).afbeelding)];
    if (vehicle.small_picture) return [proxyImg(vehicle.small_picture)];
    return [];
  }, [vehicle]);

  const preloadImage = useCallback((src: string) => { new Image().src = src; }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    [1, 2, 3, -1].forEach(offset => {
      const idx = (currentImageIndex + offset + images.length) % images.length;
      if (images[idx]) preloadImage(images[idx]);
    });
  }, [currentImageIndex, images, preloadImage]);

  // Scroll active thumb into view
  useEffect(() => {
    if (thumbsRef.current) {
      const btn = thumbsRef.current.children[currentImageIndex] as HTMLElement;
      if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentImageIndex]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Prijs op aanvraag';
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  };
  const formatKm = (km: number) => new Intl.NumberFormat('nl-NL').format(km) + ' km';

  const goToImage = useCallback((index: number) => { setImageLoading(true); setCurrentImageIndex(index); }, []);
  const nextImage = useCallback(() => { if (images.length > 1) goToImage((currentImageIndex + 1) % images.length); }, [currentImageIndex, images.length, goToImage]);
  const prevImage = useCallback(() => { if (images.length > 1) goToImage((currentImageIndex - 1 + images.length) % images.length); }, [currentImageIndex, images.length, goToImage]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const diffX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (diffX > diffY && diffX > 10) isSwiping.current = true;
    touchEndX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { if (diff > 0) nextImage(); else prevImage(); }
    isSwiping.current = false;
  }, [nextImage, prevImage]);

  const handleWhatsApp = () => {
    if (!vehicle) return;
    const maandbedrag = calculatorState ? calculatorState.maandbedrag : berekenMaandprijs(vehicle.verkoopprijs);
    const aanbetaling = calculatorState ? calculatorState.aanbetaling : vehicle.verkoopprijs * 0.15;
    const slottermijn = calculatorState ? calculatorState.slottermijn : vehicle.verkoopprijs * 0.15;
    const financieringsbedrag = calculatorState?.financieringsbedrag ?? (vehicle.verkoopprijs - aanbetaling);
    const looptijd = calculatorState ? calculatorState.looptijd : 72;
    const slug = `${vehicle.merk}-${vehicle.model}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const autoUrl = `https://wiselease.nl/auto/${vehicle.id}/${encodeURIComponent(slug)}`;
    const lines = [
      'Hallo, ik heb interesse in de volgende auto:',
      '',
      `🚗 ${vehicle.merk} ${vehicle.model}${vehicle.uitvoering ? ' ' + vehicle.uitvoering : ''}`,
      `📅 Bouwjaar: ${vehicle.bouwjaar_year}`,
      `📍 Kilometerstand: ${formatKm(vehicle.kmstand)}`,
      `⛽ Brandstof: ${vehicle.brandstof}`,
      '',
      `💰 Aankoopprijs: ${formatPrice(vehicle.verkoopprijs)}`,
      `   └ Aanbetaling: ${formatPrice(aanbetaling)}`,
      `   └ Financieringsbedrag: ${formatPrice(financieringsbedrag)}`,
      `   └ Looptijd: ${looptijd} maanden`,
      `   └ Slottermijn: ${formatPrice(slottermijn)}`,
      ...(maandbedrag > 0 ? [`📆 Maandbedrag: €${maandbedrag.toLocaleString('nl-NL')}/mnd`] : []),
      '',
      `🔗 ${autoUrl}`,
      '',
      'Kunnen jullie mij meer informatie geven?',
    ];
    window.open(`https://wa.me/31850808600?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  const buildVehicleState = () => ({
    id: vehicle!.id, merk: vehicle!.merk, model: vehicle!.model, uitvoering: vehicle!.uitvoering,
    bouwjaar: vehicle!.bouwjaar_year, verkoopprijs: vehicle!.verkoopprijs, brandstof: vehicle!.brandstof,
    transmissie: vehicle!.transmissie, kmstand: vehicle!.kmstand, small_picture: vehicle!.small_picture,
  });
  const getCachedImageUrl = () => images[0] || vehicle?.small_picture || null;
  const handleOfferteNavigate = () => {
    if (!vehicle) return;
    navigate('/offerte', { state: { vehicle: buildVehicleState(), calculator: calculatorState, cachedImageUrl: getCachedImageUrl() } });
  };
  const handleBelMijNavigate = () => {
    if (!vehicle) return;
    navigate('/bel-mij', { state: { vehicle: buildVehicleState(), calculator: calculatorState, cachedImageUrl: getCachedImageUrl() } });
  };
  const handleBack = () => {
    if (window.history.length > 1) { navigate(-1); setTimeout(() => window.scrollTo(0, 0), 50); }
    else navigate('/aanbod');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-[#f5a623] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Voertuig laden...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Voertuig niet gevonden</p>
          <button onClick={() => navigate('/aanbod')} className="text-[#f5a623] hover:underline font-semibold">Terug naar aanbod</button>
        </div>
      </div>
    );
  }

  const opties = (vehicle as any).opties as string[] | undefined;
  const omschrijving = (vehicle as any).omschrijving as string | undefined;
  const kenteken = (vehicle as any).kenteken as string | undefined;
  const motorinhoud = (vehicle as any).motorinhoud as number | undefined;
  const nap = (vehicle as any).nap as boolean | undefined;
  const maandbedrag = calculatorState ? calculatorState.maandbedrag : berekenMaandprijs(vehicle.verkoopprijs);

  return (
    <div className="bg-gray-50 min-h-screen pb-28 lg:pb-0">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .anim-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .anim-2 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.12s both; }
        .anim-3 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.19s both; }
        .anim-4 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.26s both; }
        .thumb-btn { transition: all 0.2s ease; }
        .thumb-btn:hover { transform: scale(1.05); }
        .image-fade { transition: opacity 0.25s ease; }
      `}</style>

      {/* ── Sticky Nav ── */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2.5 text-gray-600 hover:text-[#f5a623] transition-colors text-sm font-semibold group">
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#f5a623]/10 flex items-center justify-center transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">Terug naar aanbod</span>
          </button>
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-[#f5a623] transition-colors">Home</button>
            <span className="text-gray-200">›</span>
            <button onClick={() => navigate('/aanbod')} className="hover:text-[#f5a623] transition-colors">Aanbod</button>
            <span className="text-gray-200">›</span>
            <span className="text-gray-700 font-semibold">{vehicle.merk} {vehicle.model}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ════════ LEFT COLUMN ════════ */}
          <div className="lg:col-span-8 space-y-5">

            {/* ── Gallery ── */}
            <div className="anim-1 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
              <div
                ref={imageContainerRef}
                className="relative bg-gray-900 touch-pan-y select-none"
                style={{ aspectRatio: '16/10' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={`${vehicle.merk} ${vehicle.model}`}
                    className={`w-full h-full object-cover image-fade ${imageLoading ? 'opacity-60' : 'opacity-100'}`}
                    onLoad={() => setImageLoading(false)}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-3">
                    <div className="text-5xl">🚗</div>
                    <p className="text-sm font-medium">{vehicle.merk} {vehicle.model}</p>
                  </div>
                )}

                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Loader2 className="h-7 w-7 text-white animate-spin drop-shadow-lg" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {vehicle.btw_marge && (
                    <span className="bg-[#f5a623] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                      {vehicle.btw_marge}
                    </span>
                  )}
                  {nap && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <Shield className="h-3 w-3" /> NAP
                    </span>
                  )}
                </div>

                {/* Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/35 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/35 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="bg-gray-50 border-t border-gray-100 p-2.5">
                  <div ref={thumbsRef} className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToImage(idx)}
                        className={`thumb-btn relative rounded-lg overflow-hidden flex-shrink-0 w-[72px] ${currentImageIndex === idx ? 'ring-2 ring-[#f5a623] ring-offset-1 scale-105' : 'opacity-55 hover:opacity-90'}`}
                        style={{ aspectRatio: '16/10' }}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Title & Quick Specs Card ── */}
            <div className="anim-2 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
              {/* Header */}
              <div className="p-6 md:p-7 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {vehicle.categorie && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#f5a623] bg-[#f5a623]/10 px-2.5 py-1 rounded-full">
                          {vehicle.categorie}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {vehicle.merk} {vehicle.model}
                    </h1>
                    <p className="text-gray-500 mt-1.5 text-sm leading-relaxed line-clamp-2">{vehicle.uitvoering}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                    {vehicle.verkoopprijs > 0 ? (
                      <>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold text-right mb-0.5">v.a. p/maand</p>
                          <p className="text-3xl md:text-4xl font-black text-[#f5a623] leading-none">
                            €{maandbedrag.toLocaleString('nl-NL')}
                          </p>
                        </div>
                        <div className="sm:mt-2 text-right">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Aankoopprijs</p>
                          <p className="text-sm font-bold text-gray-700">{formatPrice(vehicle.verkoopprijs)}</p>
                        </div>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-gray-900">Prijs op aanvraag</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick spec pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
                {[
                  { icon: <Calendar className="h-4 w-4" />, label: 'Bouwjaar', value: String(vehicle.bouwjaar_year) },
                  { icon: <Gauge className="h-4 w-4" />, label: 'Km-stand', value: formatKm(vehicle.kmstand) },
                  { icon: <Fuel className="h-4 w-4" />, label: 'Brandstof', value: vehicle.brandstof },
                  { icon: <Zap className="h-4 w-4" />, label: 'Vermogen', value: `${vehicle.vermogen} PK` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center justify-center py-4 px-3 gap-1.5 bg-white hover:bg-gray-50 transition-colors">
                    <div className="text-[#f5a623]">{icon}</div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{label}</p>
                    <p className="text-sm font-bold text-gray-900 text-center leading-tight">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Mobile Calculator ── */}
            {vehicle.verkoopprijs > 0 && (
              <div className="lg:hidden anim-3 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
                <LeaseCalculator vehiclePrice={vehicle.verkoopprijs} onChange={setCalculatorState} />
              </div>
            )}

            {/* ── Mobile CTAs ── */}
            <div className="lg:hidden anim-3 space-y-2.5">
              <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-green-500/20 text-sm active:scale-[0.98]">
                <MessageCircle className="h-5 w-5" /><span>WhatsApp over deze auto</span>
              </button>
              <button onClick={handleOfferteNavigate} className="w-full bg-[#f5a623] hover:bg-[#e09518] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-yellow-500/20 text-sm active:scale-[0.98]">
                <FileText className="h-5 w-5" /><span>Gratis offerte aanvragen</span>
              </button>
              <button onClick={handleBelMijNavigate} className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all text-sm active:scale-[0.98]">
                <Phone className="h-5 w-5" /><span>Bel mij over deze auto</span>
              </button>
            </div>

            {/* ── Details Accordion Card ── */}
            <div className="anim-4 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 px-6 md:px-7">

              <AccordionSection title="Specificaties" defaultOpen={true}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <SpecItem icon={<Calendar className="h-4 w-4" />} label="Bouwjaar" value={vehicle.bouwjaar_year} />
                  <SpecItem icon={<Gauge className="h-4 w-4" />} label="Kilometerstand" value={formatKm(vehicle.kmstand)} />
                  <SpecItem icon={<Fuel className="h-4 w-4" />} label="Brandstof" value={vehicle.brandstof} />
                  <SpecItem icon={<Settings className="h-4 w-4" />} label="Transmissie" value={vehicle.transmissie} />
                  <SpecItem icon={<Zap className="h-4 w-4" />} label="Vermogen" value={`${vehicle.vermogen} PK`} />
                  {motorinhoud && motorinhoud > 0 && (
                    <SpecItem icon={<Settings className="h-4 w-4" />} label="Cilinderinhoud" value={`${motorinhoud} cc`} />
                  )}
                  <SpecItem icon={<Palette className="h-4 w-4" />} label="Kleur" value={vehicle.kleur} />
                  <SpecItem icon={<DoorClosed className="h-4 w-4" />} label="Deuren" value={vehicle.deuren} />
                  {kenteken && kenteken !== '-' && kenteken !== '' && (
                    <SpecItem icon={<Tag className="h-4 w-4" />} label="Kenteken" value={kenteken} />
                  )}
                  {nap && (
                    <SpecItem icon={<Shield className="h-4 w-4" />} label="NAP" value="Gecertificeerd" />
                  )}
                </div>
              </AccordionSection>

              {opties && opties.length > 0 && (
                <AccordionSection title="Opties & uitrusting" count={opties.length}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {opties.map((optie, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="w-5 h-5 rounded-full bg-[#f5a623]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#f5a623]/20 transition-colors">
                          <Check className="h-3 w-3 text-[#f5a623]" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{optie}</span>
                      </div>
                    ))}
                  </div>
                </AccordionSection>
              )}

              {!opties || opties.length === 0 ? (
                <AccordionSection title="Opties & uitrusting">
                  <p className="text-sm text-gray-400 italic">Geen opties beschikbaar voor dit voertuig</p>
                </AccordionSection>
              ) : null}

              <AccordionSection title="Omschrijving">
                {omschrijving ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{omschrijving}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Geen omschrijving beschikbaar voor dit voertuig</p>
                )}
              </AccordionSection>

              {isAdmin && (
                <AccordionSection title="Verkoper (admin)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(vehicle as any).aanbieder_naam && (
                      <SpecItem icon={<Building2 className="h-4 w-4" />} label="Bedrijfsnaam" value={(vehicle as any).aanbieder_naam} />
                    )}
                    {(vehicle as any).aanbieder_plaats && (
                      <SpecItem icon={<MapPin className="h-4 w-4" />} label="Plaats" value={(vehicle as any).aanbieder_plaats} />
                    )}
                    {(vehicle as any).link && (
                      <div className="sm:col-span-2 mt-2">
                        <a href={(vehicle as any).link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#f5a623] hover:underline font-semibold">
                          <FileText className="h-4 w-4" />Bekijk originele advertentie
                        </a>
                      </div>
                    )}
                  </div>
                </AccordionSection>
              )}
            </div>
          </div>

          {/* ════════ RIGHT SIDEBAR ════════ */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20 space-y-4">

              {/* Price card */}
              {vehicle.verkoopprijs > 0 && (
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
                  <div className="bg-gradient-to-br from-[#1a2744] to-[#243461] p-5 text-white">
                    <p className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-1">v.a. per maand</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-[#f5a623]">€{maandbedrag.toLocaleString('nl-NL')}</span>
                      <span className="text-white/60 text-sm font-medium">p/m</span>
                    </div>
                    <p className="text-white/50 text-xs mt-2">Aankoopprijs: {formatPrice(vehicle.verkoopprijs)}</p>
                    <p className="text-white/30 text-[10px] mt-1">Indicatief · 72 mnd · 15% aanbetaling · 8.99%</p>
                  </div>
                  <div className="p-4">
                    <LeaseCalculator vehiclePrice={vehicle.verkoopprijs} onChange={setCalculatorState} />
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="space-y-2.5">
                <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-md shadow-green-500/20 text-sm active:scale-[0.98]">
                  <MessageCircle className="h-5 w-5" /><span>WhatsApp over deze auto</span>
                </button>
                <button onClick={handleOfferteNavigate} className="w-full bg-[#f5a623] hover:bg-[#e09518] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-md shadow-yellow-500/20 text-sm active:scale-[0.98]">
                  <FileText className="h-5 w-5" /><span>Gratis offerte aanvragen</span>
                </button>
                <button onClick={handleBelMijNavigate} className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all text-sm active:scale-[0.98]">
                  <Phone className="h-5 w-5" /><span>Bel mij over deze auto</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-2xl ring-1 ring-black/5 p-4">
                <div className="space-y-3">
                  {[
                    { icon: '✅', text: 'Gratis en vrijblijvende offerte' },
                    { icon: '🔒', text: 'Veilig financial lease afsluiten' },
                    { icon: '⚡', text: 'Snel antwoord via WhatsApp' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="text-base">{icon}</span>
                      <span className="font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Mobile Footer ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto gap-4">
          <div>
            {vehicle.verkoopprijs > 0 ? (
              <>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">v.a. per maand</p>
                <p className="text-2xl font-black text-[#f5a623] leading-tight">
                  €{maandbedrag.toLocaleString('nl-NL')}
                </p>
              </>
            ) : (
              <p className="text-base font-bold text-gray-900">Prijs op aanvraag</p>
            )}
          </div>
          <button onClick={handleOfferteNavigate} className="flex-1 max-w-[200px] bg-[#f5a623] hover:bg-[#e09518] text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 active:scale-[0.97]">
            <FileText className="h-4 w-4" /><span>Offerte aanvragen</span>
          </button>
        </div>
      </div>
    </div>
  );
}