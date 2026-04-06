import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Car, Layers, Euro } from 'lucide-react';
import { vehicleApi } from '../services/api';
import { supabase } from '../lib/supabase';
import type { FiltersResponse, ModelOption } from '../types/vehicle';
import { SmartSelect } from './SmartSelect';

interface SiteSettings {
  [key: string]: string;
}

function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      if (data) {
        const map: SiteSettings = {};
        data.forEach(({ key, value }: { key: string; value: string }) => {
          map[key] = value;
        });
        setSettings(map);
      }
      setLoaded(true);
    });
  }, []);

  return { settings, loaded };
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target <= 0) return;
    hasAnimated.current = true;
    const duration = 2000;
    const steps = 80;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <>{count.toLocaleString('nl-NL')}</>;
}

const popularBrands = [
  { name: 'BMW', logo: '/logos/bmw.png' },
  { name: 'Mercedes-Benz', short: 'Mercedes', logo: '/logos/mercedes.png' },
  { name: 'Audi', logo: '/logos/audi.png' },
  { name: 'Volkswagen', short: 'VW', logo: '/logos/volkswagen.png' },
  { name: 'Toyota', logo: '/logos/toyota.png' },
  { name: 'Volvo', logo: '/logos/volvo.png' },
];

interface Suggestion {
  type: 'merk' | 'model' | 'dealer' | 'kenteken' | 'advertentie';
  merk: string;
  model?: string;
  label: string;
  sublabel?: string;
}

interface DealerOption {
  naam: string;
  count: number;
}

export function Hero() {
  const navigate = useNavigate();
  const { settings: siteSettings, loaded: settingsLoaded } = useSiteSettings();

  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [dealers, setDealers] = useState<DealerOption[]>([]);

  // Multi-select: arrays instead of single strings
  const [selectedMerken, setSelectedMerken] = useState<string[]>([]);
  const [selectedModellen, setSelectedModellen] = useState<string[]>([]);

  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const modelCache = useRef<Record<string, ModelOption[]>>({});
  const searchRef = useRef<HTMLDivElement>(null);

  const heroTitle = siteSettings['hero_title'] || 'Waar slim leasen begint!';

  useEffect(() => {
    vehicleApi.getFilters().then(setFilters);
    vehicleApi.search({ per_page: 1 }).then((data) => setTotalCount(data.total));

    // Laad dealernamen
    supabase
      .from('vehicles')
      .select('aanbieder_naam')
      .eq('is_active', true)
      .not('aanbieder_naam', 'is', null)
      .then(({ data }) => {
        if (data) {
          const countMap = new Map<string, number>();
          data.forEach((v: any) => {
            const naam = v.aanbieder_naam;
            if (naam) countMap.set(naam, (countMap.get(naam) || 0) + 1);
          });
          const sorted = Array.from(countMap.entries())
            .map(([naam, count]) => ({ naam, count }))
            .sort((a, b) => b.count - a.count);
          setDealers(sorted);
        }
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadModels = async (merk: string): Promise<ModelOption[]> => {
    if (modelCache.current[merk]) return modelCache.current[merk];
    const result = await vehicleApi.getModels(merk);
    modelCache.current[merk] = result;
    return result;
  };

  // When merken change: load models for all selected merken, reset model selection
  useEffect(() => {
    setSelectedModellen([]);
    if (selectedMerken.length === 0) {
      setModels([]);
      return;
    }
    // Load and merge models for all selected merken
    Promise.all(selectedMerken.map(loadModels)).then((results) => {
      // Merge and deduplicate by model name
      const merged = new Map<string, ModelOption>();
      results.flat().forEach((m) => {
        if (merged.has(m.model)) {
          merged.set(m.model, { ...m, count: (merged.get(m.model)!.count ?? 0) + (m.count ?? 0) });
        } else {
          merged.set(m.model, m);
        }
      });
      setModels(Array.from(merged.values()).sort((a, b) => a.model.localeCompare(b.model)));
    });
  }, [selectedMerken]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || !filters) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const qLower = q.toLowerCase();

    const buildSuggestions = async () => {
      const results: Suggestion[] = [];

      // Kenteken detectie (bijv. XX-XXX-XX)
      const kentekenClean = q.replace(/[-\s]/g, '');
      if (kentekenClean.length >= 5 && kentekenClean.length <= 8 && /^[a-zA-Z0-9]+$/.test(kentekenClean)) {
        results.push({
          type: 'kenteken',
          merk: q.toUpperCase().replace(/\s/g, '-'),
          label: `Kenteken ${q.toUpperCase()}`,
          sublabel: 'Zoek op kenteken',
        });
        setSuggestions(results);
        setShowSuggestions(true);
        setActiveSuggestion(0);
        return;
      }

      // Advertentienummer (alleen cijfers, minimaal 4)
      if (/^\d{4,}$/.test(q)) {
        results.push({
          type: 'advertentie',
          merk: q,
          label: `Advertentie #${q}`,
          sublabel: 'Direct naar auto',
        });
        setSuggestions(results);
        setShowSuggestions(true);
        setActiveSuggestion(0);
        return;
      }

      const sortedMerken = [...filters.merken].sort((a, b) => b.length - a.length);
      let matchedMerk: string | null = null;
      let modelQuery = '';

      for (const merk of sortedMerken) {
        if (qLower.startsWith(merk.toLowerCase())) {
          matchedMerk = merk;
          modelQuery = q.slice(merk.length).trim();
          break;
        }
      }

      if (matchedMerk && modelQuery) {
        const merkModels = await loadModels(matchedMerk);
        const filtered = merkModels.filter((m) =>
          m.model.toLowerCase().includes(modelQuery.toLowerCase())
        );
        filtered.slice(0, 7).forEach((m) => {
          results.push({
            type: 'model',
            merk: matchedMerk!,
            model: m.model,
            label: `${matchedMerk} ${m.model}`,
            sublabel: `${m.count} auto's`,
          });
        });
        if (results.length === 0) {
          results.push({ type: 'merk', merk: matchedMerk, label: matchedMerk, sublabel: 'Alle modellen' });
        }
      } else if (matchedMerk && !modelQuery) {
        results.push({ type: 'merk', merk: matchedMerk, label: matchedMerk, sublabel: 'Alle modellen' });
        const merkModels = await loadModels(matchedMerk);
        merkModels.slice(0, 5).forEach((m) => {
          results.push({
            type: 'model',
            merk: matchedMerk!,
            model: m.model,
            label: `${matchedMerk} ${m.model}`,
            sublabel: `${m.count} auto's`,
          });
        });
      } else {
        // Merken
        const matchedMerken = sortedMerken.filter((m) => m.toLowerCase().includes(qLower));
        matchedMerken.slice(0, 4).forEach((merk) => {
          results.push({ type: 'merk', merk, label: merk, sublabel: 'Alle modellen' });
        });

        // Dealers
        const matchedDealers = dealers.filter((d) => d.naam.toLowerCase().includes(qLower));
        matchedDealers.slice(0, 4).forEach((dealer) => {
          results.push({
            type: 'dealer',
            merk: dealer.naam,
            label: dealer.naam,
            sublabel: `${dealer.count} auto's`,
          });
        });
      }

      setSuggestions(results.slice(0, 8));
      setShowSuggestions(results.length > 0);
      setActiveSuggestion(-1);
    };

    buildSuggestions();
  }, [searchQuery, filters, dealers]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
    setSearchQuery(suggestion.label);

    if (suggestion.type === 'kenteken') {
      navigate(`/aanbod?kenteken=${encodeURIComponent(suggestion.merk)}`);
      return;
    }
    if (suggestion.type === 'advertentie') {
      navigate(`/aanbod/${suggestion.merk}`);
      return;
    }
    if (suggestion.type === 'dealer') {
      navigate(`/aanbod?aanbieder_naam=${encodeURIComponent(suggestion.merk)}`);
      return;
    }
    if (suggestion.type === 'merk') {
      navigate(`/aanbod?merk=${encodeURIComponent(suggestion.merk)}`);
    } else {
      navigate(`/aanbod?merk=${encodeURIComponent(suggestion.merk)}&model=${encodeURIComponent(suggestion.model || '')}`);
    }
  };

  const handleSearch = () => {
    const q = searchQuery.trim();

    // Kenteken
    const kentekenClean2 = q.replace(/[-\s]/g, '');
    if (kentekenClean2.length >= 5 && kentekenClean2.length <= 8 && /^[a-zA-Z0-9]+$/.test(kentekenClean2) && !/^\d+$/.test(kentekenClean2)) {
      navigate(`/aanbod?kenteken=${encodeURIComponent(q.toUpperCase().replace(/\s/g, '-'))}`);
      return;
    }

    // Advertentienummer
    if (/^\d{4,}$/.test(q)) {
      navigate(`/aanbod/${q}`);
      return;
    }

    // Dealer
    const matchedDealer = dealers.find((d) => d.naam.toLowerCase() === q.toLowerCase());
    if (matchedDealer) {
      navigate(`/aanbod?aanbieder_naam=${encodeURIComponent(matchedDealer.naam)}`);
      return;
    }

    const params = new URLSearchParams();

    if (selectedMerken.length > 0) {
      selectedMerken.forEach((m) => params.append('merk', m));
    } else if (q) {
      params.append('q', q);
    }

    if (selectedModellen.length > 0) {
      selectedModellen.forEach((m) => params.append('model', m));
    }

    if (selectedBudget) {
      const [min, max] = selectedBudget.split('-');
      if (min) params.append('budget_min', min);
      if (max) params.append('budget_max', max);
    }

    navigate(`/aanbod?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        handleSuggestionClick(suggestions[activeSuggestion]);
      } else {
        setShowSuggestions(false);
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBrandClick = (brand: string) => {
    navigate(`/aanbod?merk=${encodeURIComponent(brand)}`);
  };

  const POPULAR_MERKEN = ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Volvo'];

  const merkOptions = [
    { value: '', label: 'Alle merken' },
    ...(filters?.merken.map((m) => ({ value: m, label: m })) ?? []),
  ];

  const modelOptions = [
    { value: '', label: 'Alle modellen' },
    ...models.map((m) => ({ value: m.model, label: `${m.model} (${m.count})` })),
  ];

  const budgetOptions = [
    { value: '', label: 'Alle budgetten' },
    { value: '0-99', label: '€0 – €99 / maand' },
    { value: '100-199', label: '€100 – €199 / maand' },
    { value: '200-299', label: '€200 – €299 / maand' },
    { value: '300-399', label: '€300 – €399 / maand' },
    { value: '400-499', label: '€400 – €499 / maand' },
    { value: '500-699', label: '€500 – €699 / maand' },
    { value: '700-899', label: '€700 – €899 / maand' },
    { value: '800-999', label: '€800 – €999 / maand' },
    { value: '1000-', label: '€1000+ / maand' },
  ];

  return (
    <div className="relative bg-gradient-to-b from-[#e8f6f5] via-[#f0faf9] to-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,180,160,0.08)_0%,_transparent_70%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-16">
        <div className="max-w-4xl mx-auto text-center">

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight tracking-tight text-gray-900 transition-opacity duration-200"
            style={{ opacity: settingsLoaded ? 1 : 0 }}
          >
{(<>
  Waar{' '}
  <span className="text-smartlease-yellow">slim</span>{' '}
  {heroTitle.split(' ').slice(2).join(' ')}
</>)}
          </h1>

          <p className="text-base md:text-lg text-gray-500 mt-3 mb-6 max-w-xl mx-auto">
            Slim leasen voor ZZP en MKB — transparant, snel en eerlijk
          </p>

          <p className="text-lg md:text-xl text-gray-500 mb-6 max-w-2xl mx-auto leading-relaxed">
            Zoek in onze{' '}
            <span className="text-smartlease-yellow font-bold tabular-nums">
              {totalCount !== null && totalCount > 0 ? (
                <AnimatedCounter target={totalCount} />
              ) : (
                <span className="animate-pulse text-gray-400">···</span>
              )}
            </span>{' '}
            auto's
          </p>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">9.4 op Google</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
              <div className="flex -space-x-2">
                {['ME','LB','DK'].map((init, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-700">{init}</div>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">Honderden tevreden klanten</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#185fa5" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-sm font-semibold text-gray-700">Binnen 24 uur reactie</span>
            </div>
          </div>

          {/* Search form */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-xl border border-gray-100">

            {/* Zoekbalk */}
            <div className="relative mb-4" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Zoek op merk of model, bijv. Audi Q5..."
                className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 font-medium focus:ring-2 focus:ring-smartlease-yellow focus:border-smartlease-yellow transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden text-left">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0 ${
                        i === activeSuggestion ? 'bg-yellow-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Search className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${i === activeSuggestion ? 'text-smartlease-yellow' : 'text-gray-800'}`}>
                          {suggestion.label}
                        </span>
                      </div>
                      {suggestion.sublabel && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{suggestion.sublabel}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SmartSelect dropdowns */}
            <div className="flex flex-col md:flex-row items-stretch gap-3">

              {/* Merk — multi-select */}
              <SmartSelect
                multi
                values={selectedMerken}
                onChangeMulti={setSelectedMerken}
                options={merkOptions}
                placeholder="Merk"
                icon={<Car className="h-4 w-4" />}
                popularValues={POPULAR_MERKEN}
                searchable
              />

              {/* Model — multi-select, disabled als geen merk geselecteerd */}
              <SmartSelect
                multi
                values={selectedModellen}
                onChangeMulti={setSelectedModellen}
                options={modelOptions}
                placeholder="Model"
                disabled={selectedMerken.length === 0 || models.length === 0}
                icon={<Layers className="h-4 w-4" />}
                searchable
              />

              {/* Budget — blijft single-select */}
              <SmartSelect
                value={selectedBudget}
                onChange={setSelectedBudget}
                options={budgetOptions}
                placeholder="Maandbudget"
                icon={<Euro className="h-4 w-4" />}
              />

              <button
                onClick={handleSearch}
                className="bg-smartlease-yellow hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <Search className="h-5 w-5" />
                <span>Vinden</span>
              </button>
            </div>
          </div>

          {/* Populaire merken */}
          <div className="mt-8">
            <p className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-widest">
              Populaire merken
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularBrands.map((brand) => (
                <button
                  key={brand.name}
                  onClick={() => handleBrandClick(brand.name)}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-500 rounded-full px-3.5 py-1.5 transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-4 w-4 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600 transition-colors tracking-wide">
                    {brand.short || brand.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}