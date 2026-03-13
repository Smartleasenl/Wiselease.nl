import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Zap,
  Palette,
  DoorClosed,
  FileText,
  Check,
  Building2,
  MapPin,
  MessageCircle,
  Phone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import type { VehicleDetail } from '../types/vehicle';
import { LeaseCalculator, type CalculatorState } from '../components/LeaseCalculator';

const PROXY = 'https://jtntbwioxszeocumgvzk.supabase.co/functions/v1/image-proxy?url=';
const proxyImg = (url: string) => url ? `${PROXY}${encodeURIComponent(url)}` : '';

export function VehicleDetailPage() {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [calculatorState, setCalculatorState] = useState<CalculatorState | null>(null);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Prijs op aanvraag';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatKm = (km: number) => {
    return new Intl.NumberFormat('nl-NL').format(km) + ' km';
  };

  const berekenMaandprijs = (verkoopprijs: number): number => {
    if (!verkoopprijs || verkoopprijs <= 0) return 0;
    const r = 8.99 / 100 / 12;
    const aanbetaling = verkoopprijs * 0.15;
    const slottermijn = verkoopprijs * 0.15;
    const loan = verkoopprijs - aanbetaling;
    const n = 72;
    const pmt = (loan * r * Math.pow(1 + r, n) - slottermijn * r) / (Math.pow(1 + r, n) - 1);
    return Math.round(pmt);
  };

  const handleWhatsApp = () => {
    if (!vehicle) return;
    const message = `Hallo, ik ben geïnteresseerd in deze ${vehicle.merk} ${vehicle.model}.\n\nKenteken: ${vehicle.kenteken || 'N/A'}`;
    window.open(`https://wa.me/31613669328?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleOfferteNavigate = () => {
    navigate('/offerte', { state: { vehicle } });
  };

  const handleBelMijNavigate = () => {
    navigate('/bel-mij', { state: { vehicle } });
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        navigate('/aanbod');
        return;
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        navigate('/aanbod');
        return;
      }

      setVehicle(data as VehicleDetail);

      const { data: imgData } = await supabase
        .from('vehicle_images')
        .select('url')
        .eq('vehicle_id', id)
        .order('id', { ascending: true });

      if (imgData && imgData.length > 0) {
        setImages(imgData.map((i: any) => i.url));
      } else if (data.afbeelding) {
        setImages([data.afbeelding]);
      } else if (data.large_picture) {
        setImages([data.large_picture]);
      }

      setLoading(false);
      setTimeout(() => setMounted(true), 80);
    };

    fetchVehicle();
  }, [id, navigate]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };
    checkAdmin();
  }, []);

  const AccordionSection = ({
    title,
    defaultOpen = false,
    children,
  }: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors px-5 md:px-7"
        >
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
          )}
        </button>
        {isOpen && <div className="pb-5 px-5 md:px-7 text-gray-700">{children}</div>}
      </div>
    );
  };

  const SpecItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: any;
  }) => (
    <div className="flex items-start gap-3">
      <div className="text-smartlease-yellow flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-smartlease-yellow"></div>
      </div>
    );
  }

  if (!vehicle) return null;

  const currentImage = proxyImg(images[activeImage] || '');

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <button
          onClick={() => navigate('/aanbod')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-smartlease-yellow transition mb-5 lg:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar aanbod
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            <div className="animate-fade-up opacity-0 delay-1 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative bg-gray-100" style={{ aspectRatio: '16/10' }}>
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${vehicle.merk} ${vehicle.model}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">🚗</div>
                      <p className="text-sm font-medium">{vehicle.merk}</p>
                      <p className="text-xs">{vehicle.model}</p>
                    </div>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                    <div className="absolute bottom-3 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {activeImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                  {images.slice(0, 10).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                        activeImage === idx ? 'border-smartlease-yellow' : 'border-transparent'
                      }`}
                    >
                      <img src={proxyImg(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-5 md:p-7">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {vehicle.merk} {vehicle.model}
                </h1>
                <p className="text-gray-500 text-sm">{vehicle.uitvoering}</p>
              </div>
            </div>

            <div className="animate-fade-up opacity-0 delay-2 bg-white rounded-2xl shadow-sm p-5 md:p-7">
              <h2 className="font-semibold text-gray-900 mb-4">Specificaties</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Calendar className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Bouwjaar</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicle.bouwjaar_year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Gauge className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Km-stand</p>
                    <p className="text-sm font-semibold text-gray-900">{formatKm(vehicle.kmstand)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Fuel className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Brandstof</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicle.brandstof}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Zap className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Vermogen</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicle.vermogen} PK</p>
                  </div>
                </div>
              </div>
            </div>

            {vehicle.verkoopprijs > 0 && (
              <div className="lg:hidden animate-fade-up opacity-0 delay-2 bg-white rounded-2xl shadow-sm p-5 mb-5">
                <LeaseCalculator vehiclePrice={vehicle.verkoopprijs} onChange={setCalculatorState} />
              </div>
            )}

            <div className="lg:hidden animate-fade-up opacity-0 delay-3 space-y-2.5 mb-5">
              <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-green-500/20 text-sm">
                <MessageCircle className="h-5 w-5" /><span>WhatsApp over deze auto</span>
              </button>
              <button onClick={handleOfferteNavigate} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-yellow-500/20 text-sm">
                <FileText className="h-5 w-5" /><span>Gratis offerte aanvragen</span>
              </button>
              <button onClick={handleBelMijNavigate} className="w-full bg-white hover:bg-gray-50 text-smartlease-blue border-2 border-smartlease-blue py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all text-sm">
                <Phone className="h-5 w-5" /><span>Bel mij over deze auto</span>
              </button>
            </div>

            <div className="animate-fade-up opacity-0 delay-4 bg-white rounded-2xl shadow-sm px-5 md:px-7">
              <AccordionSection title="Informatie" defaultOpen={true}>
                <div className="grid grid-cols-2 gap-3">
                  <SpecItem icon={<Calendar className="h-[18px] w-[18px]" />} label="Bouwjaar" value={vehicle.bouwjaar_year} />
                  <SpecItem icon={<Gauge className="h-[18px] w-[18px]" />} label="Kilometerstand" value={formatKm(vehicle.kmstand)} />
                  <SpecItem icon={<Fuel className="h-[18px] w-[18px]" />} label="Brandstof" value={vehicle.brandstof} />
                  <SpecItem icon={<Settings className="h-[18px] w-[18px]" />} label="Transmissie" value={vehicle.transmissie} />
                  <SpecItem icon={<Zap className="h-[18px] w-[18px]" />} label="Vermogen" value={`${vehicle.vermogen} PK`} />
                  {vehicle.motorinhoud && (
                    <SpecItem icon={<Settings className="h-[18px] w-[18px]" />} label="Motorinhoud" value={vehicle.motorinhoud} />
                  )}
                  <SpecItem icon={<Palette className="h-[18px] w-[18px]" />} label="Kleur" value={vehicle.kleur} />
                  <SpecItem icon={<DoorClosed className="h-[18px] w-[18px]" />} label="Deuren" value={vehicle.deuren} />
                  {vehicle.kenteken && (
                    <SpecItem icon={<FileText className="h-[18px] w-[18px]" />} label="Kenteken" value={vehicle.kenteken} />
                  )}
                  {vehicle.nap && (
                    <SpecItem icon={<Check className="h-[18px] w-[18px]" />} label="NAP" value={vehicle.nap} />
                  )}
                </div>
              </AccordionSection>

              <AccordionSection title="Opties">
                {vehicle.opties && vehicle.opties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {vehicle.opties.map((optie, idx) => (
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
                {vehicle.omschrijving ? (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{vehicle.omschrijving}</p>
                ) : (
                  <p className="text-gray-500 text-sm">Geen omschrijving beschikbaar</p>
                )}
              </AccordionSection>

              {isAdmin && (
                <AccordionSection title="Verkoper (admin)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicle.aanbieder_naam && (
                      <SpecItem icon={<Building2 className="h-[18px] w-[18px]" />} label="Bedrijfsnaam" value={vehicle.aanbieder_naam} />
                    )}
                    {vehicle.aanbieder_plaats && (
                      <SpecItem icon={<MapPin className="h-[18px] w-[18px]" />} label="Plaats" value={vehicle.aanbieder_plaats} />
                    )}
                    {vehicle.aanbieder_postcode && (
                      <SpecItem icon={<MapPin className="h-[18px] w-[18px]" />} label="Postcode" value={vehicle.aanbieder_postcode} />
                    )}
                    {vehicle.link && (
                      <div className="sm:col-span-2">
                        <a
                          href={vehicle.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-smartlease-yellow hover:underline font-medium"
                        >
                          <ChevronRight className="h-4 w-4" />
                          Bekijk originele advertentie
                        </a>
                      </div>
                    )}
                  </div>
                </AccordionSection>
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="space-y-2.5">
                <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-green-500/20 text-sm">
                  <MessageCircle className="h-5 w-5" /><span>WhatsApp over deze auto</span>
                </button>
                <button onClick={handleOfferteNavigate} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-yellow-500/20 text-sm">
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div>
            {vehicle.verkoopprijs > 0 ? (
              <>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Maandbedrag</p>
                <p className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-500 bg-clip-text text-transparent">
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
          <button onClick={handleOfferteNavigate} className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2">
            <FileText className="h-4 w-4" /><span>Gratis offerte</span>
          </button>
        </div>
      </div>
    </div>
  );
}