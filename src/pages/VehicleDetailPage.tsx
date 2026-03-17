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
} from 'lucide-react';
import type { VehicleDetail } from '../types/vehicle';
import { LeaseCalculator, type CalculatorState } from '../components/LeaseCalculator';
import { supabase } from '../lib/supabase';

const proxyImg = (url: string) => {
  if (!url) return '';
  const match = url.match(/nederlandmobiel\.nl\/auto\/(\d+)\/(\d+)\/(\d+)/);
  if (match) return `https://img.wiselease.nl/img.php?id=${match[1]}&s=${match[2]}&n=${match[3]}`;
  return url;
};

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

// ─── Accordion Section ────────────────────────────────────────────────────────
function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-0 py-5 group"
      >
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-smartlease-yellow transition-colors">
          {title}
        </h3>
        <div className={`w-8 h-8 rounded-full bg-gray-100 group-hover:bg-yellow-50 flex items-center justify-center transition-all duration-300 ${open ? 'rotate-180 bg-yellow-50' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'max-h-[2000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
}

// ─── Spec Item ────────────────────────────────────────────────────────────────
function SpecItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-gray-50/70 border border-gray-100/80">
      <div className="text-smartlease-yellow/80 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [calculatorState, setCalculatorState] = useState<CalculatorState | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session?.user);
    });
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

  const thumbImages = useMemo<string[]>(() => images, [images]);

  const preloadImage = useCallback((src: string) => { new Image().src = src; }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    [1, 2, 3, -1].forEach(offset => {
      const idx = (currentImageIndex + offset + images.length) % images.length;
      if (images[idx]) preloadImage(images[idx]);
    });
  }, [currentImageIndex, images, preloadImage]);

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
    window.open(`https://wa.me/31850808777?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <Loader2 className="h-12 w-12 text-smartlease-yellow animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="text-center">
          <p className="text-xl text-gray-600">Voertuig niet gevonden</p>
          <button onClick={() => navigate('/aanbod')} className="mt-4 text-smartlease-yellow hover:underline font-medium">
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  const opties = (vehicle as any).opties as string[] | undefined;
  const omschrijving = (vehicle as any).omschrijving as string | undefined;
  const kenteken = (vehicle as any).kenteken as string | undefined;
  const motorinhoud = (vehicle as any).motorinhoud as number | undefined;
  const nap = (vehicle as any).nap as boolean | undefined;

  return (
    <div className="bg-[#f8f9fb] min-h-screen pb-24 lg:pb-0">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }
      `}</style>

      {/* Sticky breadcrumb */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-500 hover:text-smartlease-yellow transition-colors font-medium text-sm group">
              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-yellow-50 flex items-center justify-center transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline">Terug naar aanbod</span>
            </button>
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <button onClick={() => navigate('/')} className="hover:text-smartlease-yellow transition-colors">Home</button>
              <span>›</span>
              <button onClick={() => navigate('/aanbod')} className="hover:text-smartlease-yellow transition-colors">Aanbod</button>
              <span>›</span>
              <span className="text-gray-700 font-medium">{vehicle.merk} {vehicle.model}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ════════ LEFT COLUMN ════════ */}
          <div className="lg:col-span-8">

            {/* Hero Gallery */}
            <div className="animate-fade-up opacity-0 rounded-2xl overflow-hidden bg-white shadow-sm mb-5">
              <div
                ref={imageContainerRef}
                className="relative bg-gray-900 touch-pan-y"
                style={{ aspectRatio: '4/3' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={`${vehicle.merk} ${vehicle.model}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-70' : 'opacity-100'}`}
                      onLoad={() => setImageLoading(false)}
                      draggable={false}
                    />
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin drop-shadow-lg" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center"><div className="text-6xl mb-4">🚗</div><p className="text-sm">{vehicle.merk} {vehicle.model}</p></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                {vehicle.btw_marge && (
                  <span className="absolute top-4 left-4 bg-smartlease-yellow text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    {vehicle.btw_marge}
                  </span>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 flex items-center justify-center text-white transition-all">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 flex items-center justify-center text-white transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-wide">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              {thumbImages.length > 1 && (
                <div className="p-2.5 overflow-x-auto hide-scrollbar">
                  <div className="flex gap-2">
                    {thumbImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToImage(idx)}
                        className={`relative rounded-xl overflow-hidden flex-shrink-0 w-20 transition-all duration-300 ${currentImageIndex === idx ? 'ring-2 ring-smartlease-yellow ring-offset-2 scale-105' : 'opacity-60 hover:opacity-100'}`}
                        style={{ aspectRatio: '4/3' }}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Title & Price Card */}
            <div className="animate-fade-up opacity-0 delay-1 bg-white rounded-2xl shadow-sm p-5 md:p-7 mb-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                    {vehicle.merk} {vehicle.model}
                  </h1>
                  <p className="text-gray-500 mt-1 text-sm md:text-base">{vehicle.uitvoering}</p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  {vehicle.verkoopprijs > 0 ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-4xl font-bold text-smartlease-yellow">
                          € {(calculatorState ? calculatorState.maandbedrag : berekenMaandprijs(vehicle.verkoopprijs)).toLocaleString('nl-NL')},-
                        </span>
                        <span className="text-sm text-gray-400 font-medium">p/m</span>
                      </div>
                      <span className="text-sm text-gray-400 mt-0.5">{formatPrice(vehicle.verkoopprijs)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-smartlease-blue">{formatPrice(vehicle.verkoopprijs)}</span>
                  )}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { icon: <Calendar className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />, label: 'Bouwjaar', value: String(vehicle.bouwjaar_year) },
                  { icon: <Gauge className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />, label: 'Km-stand', value: formatKm(vehicle.kmstand) },
                  { icon: <Fuel className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />, label: 'Brandstof', value: vehicle.brandstof },
                  { icon: <Zap className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />, label: 'Vermogen', value: `${vehicle.vermogen} PK` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
                    {icon}
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Calculator */}
            {vehicle.verkoopprijs > 0 && (
              <div className="lg:hidden animate-fade-up opacity-0 delay-2 bg-white rounded-2xl shadow-sm p-5 mb-5">
                <LeaseCalculator vehiclePrice={vehicle.verkoopprijs} onChange={setCalculatorState} />
              </div>
            )}

            {/* Mobile CTAs */}
            <div className="lg:hidden animate-fade-up opacity-0 delay-3 space-y-2.5 mb-5">
              <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-green-500/20 text-sm">
                <MessageCircle className="h-5 w-5" /><span>WhatsApp over deze auto</span>
              </button>
              <button onClick={handleOfferteNavigate} className="w-full bg-smartlease-yellow hover:bg-yellow-500 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-yellow-500/20 text-sm">
                <FileText className="h-5 w-5" /><span>Gratis offerte aanvragen</span>
              </button>
              <button onClick={handleBelMijNavigate} className="w-full bg-white hover:bg-gray-50 text-smartlease-blue border-2 border-smartlease-blue py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all text-sm">
                <Phone className="h-5 w-5" /><span>Bel mij over deze auto</span>
              </button>
            </div>

            {/* Accordion Details */}
            <div className="animate-fade-up opacity-0 delay-4 bg-white rounded-2xl shadow-sm px-5 md:px-7">

              <AccordionSection title="Informatie" defaultOpen={true}>
                <div className="grid grid-cols-2 gap-3">
                  <SpecItem icon={<Calendar className="h-[18px] w-[18px]" />} label="Bouwjaar" value={vehicle.bouwjaar_year} />
                  <SpecItem icon={<Gauge className="h-[18px] w-[18px]" />} label="Kilometerstand" value={formatKm(vehicle.kmstand)} />
                  <SpecItem icon={<Fuel className="h-[18px] w-[18px]" />} label="Brandstof" value={vehicle.brandstof} />
                  <SpecItem icon={<Settings className="h-[18px] w-[18px]" />} label="Transmissie" value={vehicle.transmissie} />
                  <SpecItem icon={<Zap className="h-[18px] w-[18px]" />} label="Vermogen" value={`${vehicle.vermogen} PK`} />
                  {motorinhoud && motorinhoud > 0 && (
                    <SpecItem icon={<Settings className="h-[18px] w-[18px]" />} label="Motorinhoud" value={`${motorinhoud} cc`} />
                  )}
                  <SpecItem icon={<Palette className="h-[18px] w-[18px]" />} label="Kleur" value={vehicle.kleur} />
                  <SpecItem icon={<DoorClosed className="h-[18px] w-[18px]" />} label="Deuren" value={vehicle.deuren} />
                  {kenteken && kenteken !== '-' && kenteken !== '' && (
                    <SpecItem icon={<FileText className="h-[18px] w-[18px]" />} label="Kenteken" value={kenteken} />
                  )}
                  {nap && (
                    <SpecItem icon={<Check className="h-[18px] w-[18px]" />} label="NAP" value="Gecertificeerd" />
                  )}
                </div>
              </AccordionSection>

              <AccordionSection title="Opties">
                {opties && opties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opties.map((optie, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 py-1.5">
                        <div className="w-5 h-5 rounded-full bg-yellow-50 flex items-center justify-center text-smartlease-yellow flex-shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-gray-700">{optie}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Geen opties beschikbaar</p>
                )}
              </AccordionSection>

              <AccordionSection title="Omschrijving">
                {omschrijving ? (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{omschrijving}</p>
                ) : (
                  <p className="text-gray-500 text-sm">Geen omschrijving beschikbaar</p>
                )}
              </AccordionSection>

              {isAdmin && (
                <AccordionSection title="Verkoper (admin)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(vehicle as any).aanbieder_naam && (
                      <SpecItem icon={<Building2 className="h-[18px] w-[18px]" />} label="Bedrijfsnaam" value={(vehicle as any).aanbieder_naam} />
                    )}
                    {(vehicle as any).aanbieder_plaats && (
                      <SpecItem icon={<MapPin className="h-[18px] w-[18px]" />} label="Plaats" value={(vehicle as any).aanbieder_plaats} />
                    )}
                    {(vehicle as any).link && (
                      <div className="sm:col-span-2">
                        <a href={(vehicle as any).link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-smartlease-yellow hover:underline font-medium">
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
              <div className="space-y-2.5">
                <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-green-500/20 text-sm">
                  <MessageCircle className="h-5 w-5" /><span>WhatsApp over deze auto</span>
                </button>
                <button onClick={handleOfferteNavigate} className="w-full bg-smartlease-yellow hover:bg-yellow-500 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-yellow-500/20 text-sm">
                  <FileText className="h-5 w-5" /><span>Gratis offerte aanvragen</span>
                </button>
                <button onClick={handleBelMijNavigate} className="w-full bg-white hover:bg-gray-50 text-smartlease-blue border-2 border-smartlease-blue py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all text-sm">
                  <Phone className="h-5 w-5" /><span>Bel mij over deze auto</span>
                </button>
              </div>
              {vehicle.verkoopprijs > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <LeaseCalculator vehiclePrice={vehicle.verkoopprijs} onChange={setCalculatorState} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div>
            {vehicle.verkoopprijs > 0 ? (
              <>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Maandbedrag</p>
                <p className="text-xl font-bold text-smartlease-yellow">
                  € {(calculatorState ? calculatorState.maandbedrag : berekenMaandprijs(vehicle.verkoopprijs)).toLocaleString('nl-NL')} p/m
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Vraagprijs</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(vehicle.verkoopprijs)}</p>
              </>
            )}
          </div>
          <button onClick={handleOfferteNavigate} className="bg-smartlease-yellow hover:bg-yellow-500 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2">
            <FileText className="h-4 w-4" /><span>Gratis offerte</span>
          </button>
        </div>
      </div>
    </div>
  );
}