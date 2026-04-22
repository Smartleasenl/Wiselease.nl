import { useState, useEffect } from 'react';
import { Gauge, Fuel, Zap, Settings2 } from 'lucide-react';
import type { Vehicle } from '../types/vehicle';
import { proxyThumb } from '../utils/imageProxy';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

const PLACEHOLDER_W = 946;
const PLACEHOLDER_H = 473;

function isPlaceholderImg(img: HTMLImageElement): boolean {
  return img.naturalWidth === PLACEHOLDER_W && img.naturalHeight === PLACEHOLDER_H;
}

function CarPlaceholder({ merk, model }: { merk: string; model: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 select-none">
      <img
        src="/Wiselease_Logo.png"
        alt="Wiselease.nl"
        className="h-12 w-auto opacity-40 mb-3"
      />
      <p className="text-xs text-gray-400 font-medium">{merk} {model}</p>
    </div>
  );
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);

  const proxyUrl = vehicle.external_id ? proxyThumb(vehicle.external_id, 1280) : null;
  const [imageUrl, setImageUrl] = useState<string | null>(proxyUrl);

  useEffect(() => {
    if (!proxyUrl) {
      setImgError(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (isPlaceholderImg(img)) {
        setImgError(true);
      } else {
        setImageUrl(proxyUrl);
      }
    };
    img.onerror = () => setImgError(true);
    img.src = proxyUrl;
  }, [vehicle.external_id]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Prijs op aanvraag';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency', currency: 'EUR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(price);
  };

  const formatKm = (km: number) => {
    return new Intl.NumberFormat('nl-NL').format(km) + ' km';
  };

  const showPlaceholder = !imageUrl || imgError;
  const maandprijs = vehicle.maandprijs ?? 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/60 cursor-pointer group border border-gray-100 hover:border-yellow-200 transition-all duration-500 ease-out"
    >
      <div className="relative overflow-hidden bg-white" style={{ aspectRatio: '4/3' }}>
        {showPlaceholder ? (
          <CarPlaceholder merk={vehicle.merk} model={vehicle.model} />
        ) : (
          <img
            src={imageUrl!}
            alt={`${vehicle.merk} ${vehicle.model}`}
            className="w-full h-full object-contain object-center transition-transform duration-700 ease-out"
            loading="lazy"
            onError={() => setImgError(true)}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth === 0 || img.naturalWidth < 10 || isPlaceholderImg(img)) {
                setImgError(true);
              }
            }}
          />
        )}

        {vehicle.bouwjaar_year && (
          <span className="absolute top-3 left-3 bg-smartlease-yellow text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-yellow-500/30 tracking-wide">
            {vehicle.bouwjaar_year}
          </span>
        )}

        {/* BTW/Marge verplaatst naar prijs-sectie */}
      </div>

      <div className="p-4 md:p-5">
        <div className="mb-3">
          <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-smartlease-blue transition-colors duration-300">
            {vehicle.merk} {vehicle.model}
          </h3>
          <p className="text-gray-400 text-sm truncate">{vehicle.uitvoering}</p>
        </div>

        <div className="mb-4">
          {maandprijs > 0 ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-500 bg-clip-text text-transparent">
                  € {maandprijs.toLocaleString('nl-NL')},-
                </span>
                <span className="text-sm text-gray-400 font-medium">p/m</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400">
                  {formatPrice(vehicle.verkoopprijs)}
                </span>
                {vehicle.btw_marge && (
                  <span className="relative group/vat" title={vehicle.btw_marge.toLowerCase() === 'btw' ? 'BTW verrekenbaar — je kunt de BTW terugvorderen als ondernemer' : 'Margeauto — geen BTW verrekenbaar, geen BTW op factuur'}>
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-help ${
                      vehicle.btw_marge.toLowerCase() === 'btw' ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-700'
                    }`}>
                      {vehicle.btw_marge.toUpperCase()}
                      <svg className="w-2.5 h-2.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </span>
                    <span className="invisible group-hover/vat:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-stone-900 text-white text-[11px] px-2.5 py-1 rounded shadow-sm whitespace-nowrap z-20 pointer-events-none">
                      {vehicle.btw_marge.toLowerCase() === 'btw' ? 'BTW verrekenbaar voor ondernemers' : 'Geen BTW verrekenbaar'}
                    </span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(vehicle.verkoopprijs)}
              </span>
              {vehicle.btw_marge && (
                <span className="relative group/vat" title={vehicle.btw_marge.toLowerCase() === 'btw' ? 'BTW verrekenbaar — je kunt de BTW terugvorderen als ondernemer' : 'Margeauto — geen BTW verrekenbaar, geen BTW op factuur'}>
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-help ${
                    vehicle.btw_marge.toLowerCase() === 'btw' ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {vehicle.btw_marge.toUpperCase()}
                    <svg className="w-2.5 h-2.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </span>
                  <span className="invisible group-hover/vat:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-stone-900 text-white text-[11px] px-2.5 py-1 rounded shadow-sm whitespace-nowrap z-20 pointer-events-none">
                    {vehicle.btw_marge.toLowerCase() === 'btw' ? 'BTW verrekenbaar voor ondernemers' : 'Geen BTW verrekenbaar'}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-xl">
            <Gauge className="h-3.5 w-3.5 text-smartlease-yellow flex-shrink-0" />
            <span className="text-xs text-gray-600 font-medium truncate">{formatKm(vehicle.kmstand)}</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-xl">
            <Zap className="h-3.5 w-3.5 text-smartlease-yellow flex-shrink-0" />
            <span className="text-xs text-gray-600 font-medium">{vehicle.vermogen} pk</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-xl">
            <Fuel className="h-3.5 w-3.5 text-smartlease-yellow flex-shrink-0" />
            <span className="text-xs text-gray-600 font-medium">{vehicle.brandstof}</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 bg-gray-50 rounded-xl">
            <Settings2 className="h-3.5 w-3.5 text-smartlease-yellow flex-shrink-0" />
            <span className="text-xs text-gray-600 font-medium">{vehicle.transmissie}</span>
          </div>
        </div>
      </div>
    </div>
  );
}