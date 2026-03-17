import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import type { FiltersResponse, SearchParams, ModelOption } from '../types/vehicle';
import { vehicleApi } from '../services/api';
import { RangeSlider } from './RangeSlider';
import { MultiSelect } from './MultiSelect';

interface FiltersProps {
  filters: SearchParams;
  onFiltersChange: (filters: SearchParams) => void;
  totalResults?: number;
}

const BUDGET_OPTIONS = [
  { value: '', label: 'Budget' },
  { value: '0-99', label: '€0 - €99 p/m' },
  { value: '100-199', label: '€100 - €199 p/m' },
  { value: '200-299', label: '€200 - €299 p/m' },
  { value: '300-399', label: '€300 - €399 p/m' },
  { value: '400-499', label: '€400 - €499 p/m' },
  { value: '500-699', label: '€500 - €699 p/m' },
  { value: '700-899', label: '€700 - €899 p/m' },
  { value: '800-999', label: '€800 - €999 p/m' },
  { value: '1000-', label: '€1000+ p/m' },
];

const EXTRA_OPTIONS = [
  { label: 'Cruise control', value: 'cruise control' },
  { label: 'Parkeersensor', value: 'parkeersensor' },
  { label: 'Climate control', value: 'automatic climate control' },
  { label: 'Navigatiesysteem', value: 'navigatiesysteem' },
  { label: 'Lichtmetalen velgen', value: 'lichtmetalen velgen' },
  { label: 'Metallic lak', value: 'metallic lak' },
  { label: 'Stoelverwarming', value: 'stoelverwarming' },
  { label: 'Lederen bekleding', value: 'lederen bekleding' },
  { label: 'Trekhaak', value: 'trekhaak' },
  { label: 'Open dak', value: 'open dak (electrisch)' },
  { label: 'Sportstoelen', value: 'sportstoelen' },
  { label: 'Xenon verlichting', value: 'xenon verlichting' },
];

const DEFAULT_RANGES = {
  minJaar: 2019,
  maxJaar: new Date().getFullYear(),
  maxKm: 250000,
  maxVermogen: 500,
};

export function Filters({ filters, onFiltersChange, totalResults }: FiltersProps) {
  const [availableFilters, setAvailableFilters] = useState<FiltersResponse | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showExtraOptions, setShowExtraOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    filters.opties
      ? typeof filters.opties === 'string'
        ? (filters.opties as string).split(',')
        : filters.opties
      : []
  );
  const [ranges, setRanges] = useState(DEFAULT_RANGES);

  const selectedMerken = filters.merk
    ? Array.isArray(filters.merk) ? filters.merk : (filters.merk as string).split(',')
    : [];
  const selectedModellen = filters.model
    ? Array.isArray(filters.model) ? filters.model : (filters.model as string).split(',')
    : [];
  const selectedCategorieen = filters.categorie
    ? (filters.categorie as string).split(',')
    : [];
  const selectedBrandstoffen = filters.brandstof
    ? (filters.brandstof as string).split(',')
    : [];
  const selectedTransmissies = filters.transmissie
    ? (filters.transmissie as string).split(',')
    : [];
  const selectedKleuren = filters.kleur
    ? (filters.kleur as string).split(',')
    : [];
  const selectedBtwMarge = filters.btw_marge
    ? (filters.btw_marge as string).split(',').map(v => v.charAt(0).toUpperCase() + v.slice(1))
    : [];

  const searchQuery = (filters.zoek as string) || '';

  useEffect(() => {
    vehicleApi.getFilters().then((data) => {
      setAvailableFilters(data);
      if (data.ranges) {
        setRanges({
          minJaar: data.ranges.minJaar || DEFAULT_RANGES.minJaar,
          maxJaar: data.ranges.maxJaar || DEFAULT_RANGES.maxJaar,
          maxKm: data.ranges.maxKm || DEFAULT_RANGES.maxKm,
          maxVermogen: data.ranges.maxVermogen || DEFAULT_RANGES.maxVermogen,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (selectedMerken.length > 0) {
      vehicleApi.getModelsMulti(selectedMerken).then(setModels);
    } else {
      setModels([]);
    }
  }, [filters.merk]);

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showMobileFilters]);

  const handleFilterChange = (key: keyof SearchParams, value: string | number | string[]) => {
    const newFilters = { ...filters, [key]: value || undefined };
    if (key === 'merk') {
      newFilters.model = undefined;
    }
    onFiltersChange(newFilters);
  };

  const handleMerkenChange = (merken: string[]) => {
    const newFilters = { ...filters };
    newFilters.merk = merken.length > 0 ? merken.join(',') : undefined;
    newFilters.model = undefined;
    onFiltersChange(newFilters);
  };

  const handleModellenChange = (modellen: string[]) => {
    const newFilters = { ...filters };
    newFilters.model = modellen.length > 0 ? modellen.join(',') : undefined;
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters };
    newFilters.zoek = value || undefined;
    onFiltersChange(newFilters);
  };

  const handleBudgetChange = (budgetRange: string) => {
    if (!budgetRange) {
      const newFilters = { ...filters };
      delete newFilters.budget_min;
      delete newFilters.budget_max;
      onFiltersChange(newFilters);
      return;
    }
    const [min, max] = budgetRange.split('-');
    const newFilters = { ...filters };
    newFilters.budget_min = min ? Number(min) : undefined;
    newFilters.budget_max = max ? Number(max) : undefined;
    onFiltersChange(newFilters);
  };

  const handleMultiChange = (key: keyof SearchParams, vals: string[], lowercase = false) => {
    const newFilters = { ...filters };
    if (vals.length > 0) {
      newFilters[key] = lowercase ? vals.map(v => v.toLowerCase()).join(',') : vals.join(',') as any;
    } else {
      delete newFilters[key];
    }
    onFiltersChange(newFilters);
  };

  const handleRangeChange = (key: 'jaar' | 'kmstand' | 'vermogen', value: [number, number]) => {
    const newFilters = { ...filters };
    if (key === 'jaar') {
      newFilters.jaar_min = value[0] > ranges.minJaar ? value[0] : undefined;
      newFilters.jaar_max = value[1] < ranges.maxJaar ? value[1] : undefined;
    } else if (key === 'kmstand') {
      newFilters.kmstand_min = value[0] > 0 ? value[0] : undefined;
      newFilters.kmstand_max = value[1] < ranges.maxKm ? value[1] : undefined;
    } else if (key === 'vermogen') {
      newFilters.vermogen_min = value[0] > 0 ? value[0] : undefined;
      newFilters.vermogen_max = value[1] < ranges.maxVermogen ? value[1] : undefined;
    }
    onFiltersChange(newFilters);
  };

  const handleOptionToggle = (option: string) => {
    const newOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];
    setSelectedOptions(newOptions);
    handleFilterChange('opties', newOptions.length > 0 ? newOptions.join(',') : '');
  };

  const clearFilters = () => {
    setSelectedOptions([]);
    setShowExtraOptions(false);
    onFiltersChange({});
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'budget') {
      delete newFilters.budget_min;
      delete newFilters.budget_max;
    } else if (key === 'opties') {
      setSelectedOptions([]);
      delete newFilters.opties;
    } else if (key === 'zoek') {
      delete newFilters.zoek;
    } else {
      delete (newFilters as any)[key];
    }
    onFiltersChange(newFilters);
  };

  const getActiveChips = () => {
    const chips: { key: string; label: string }[] = [];
    if (searchQuery) chips.push({ key: 'zoek', label: `"${searchQuery}"` });
    if (selectedMerken.length > 0) {
      chips.push({ key: 'merk', label: selectedMerken.length === 1 ? selectedMerken[0] : `${selectedMerken.length} merken` });
    }
    if (selectedModellen.length > 0) {
      chips.push({ key: 'model', label: selectedModellen.length === 1 ? selectedModellen[0] : `${selectedModellen.length} modellen` });
    }
    if (filters.budget_min || filters.budget_max) {
      const min = filters.budget_min || 0;
      const max = filters.budget_max;
      chips.push({ key: 'budget', label: max ? `€${min}-€${max} p/m` : `€${min}+ p/m` });
    }
    if (selectedCategorieen.length > 0) {
      chips.push({ key: 'categorie', label: selectedCategorieen.length === 1 ? selectedCategorieen[0] : `${selectedCategorieen.length} categorieën` });
    }
    if (selectedBrandstoffen.length > 0) {
      chips.push({ key: 'brandstof', label: selectedBrandstoffen.length === 1 ? selectedBrandstoffen[0] : `${selectedBrandstoffen.length} brandstoffen` });
    }
    if (selectedTransmissies.length > 0) {
      chips.push({ key: 'transmissie', label: selectedTransmissies.length === 1 ? selectedTransmissies[0] : `${selectedTransmissies.length} transmissies` });
    }
    if (selectedKleuren.length > 0) {
      chips.push({ key: 'kleur', label: selectedKleuren.length === 1 ? selectedKleuren[0] : `${selectedKleuren.length} kleuren` });
    }
    if (selectedBtwMarge.length > 0) {
      chips.push({ key: 'btw_marge', label: selectedBtwMarge.join(', ') });
    }
    if (selectedOptions.length > 0) {
      chips.push({ key: 'opties', label: `${selectedOptions.length} opties` });
    }
    return chips;
  };

  const activeChips = getActiveChips();
  const activeFilterCount = activeChips.length;

  const merkenOptions = (availableFilters?.merken ?? []).map((m) => ({ label: m }));
  const modelOptions = models.map((m) => ({ label: m.model, count: m.count }));
  const categorieen = availableFilters?.categorieen ?? [];
  const brandstoffen = availableFilters?.brandstoffen ?? [];
  const transmissies = availableFilters?.transmissies ?? [];
  const kleuren = availableFilters?.kleuren ?? [];

  const getCurrentBudgetValue = () => {
    if (filters.budget_min !== undefined || filters.budget_max !== undefined) {
      const min = filters.budget_min || 0;
      const max = filters.budget_max || '';
      return `${min}-${max}`;
    }
    return '';
  };

  const selectClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-smartlease-yellow focus:border-smartlease-yellow transition-all bg-white hover:border-gray-300 appearance-none cursor-pointer';
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  const filterContent = (
    <div>
      {/* Zoekbalk */}
      <div className="mb-4">
        <label className={labelClass}>Zoeken</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Bijv. S-Line, R-Line, M-Sport..."
            className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-smartlease-yellow focus:border-smartlease-yellow transition-all bg-white hover:border-gray-300"
          />
          {searchQuery && (
            <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Primaire filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div>
          <label className={labelClass}>Merk</label>
          <MultiSelect options={merkenOptions} selected={selectedMerken} onChange={handleMerkenChange} placeholder="Alle merken" searchable />
        </div>
        <div>
          <label className={labelClass}>Model</label>
          <MultiSelect options={modelOptions} selected={selectedModellen} onChange={handleModellenChange} placeholder="Alle modellen" searchable disabled={selectedMerken.length === 0} />
        </div>
        <div>
          <label className={labelClass}>Maandbudget</label>
          <select value={getCurrentBudgetValue()} onChange={(e) => handleBudgetChange(e.target.value)} className={selectClass}>
            {BUDGET_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Categorie</label>
          <MultiSelect
            options={categorieen.map(c => ({ label: c }))}
            selected={selectedCategorieen}
            onChange={(vals) => handleMultiChange('categorie', vals)}
            placeholder="Alle categorieën"
          />
        </div>
        <div>
          <label className={labelClass}>Brandstof</label>
          <MultiSelect
            options={brandstoffen.map(b => ({ label: b }))}
            selected={selectedBrandstoffen}
            onChange={(vals) => handleMultiChange('brandstof', vals)}
            placeholder="Alle brandstoffen"
          />
        </div>
        <div>
          <label className={labelClass}>Transmissie</label>
          <MultiSelect
            options={transmissies.map(t => ({ label: t }))}
            selected={selectedTransmissies}
            onChange={(vals) => handleMultiChange('transmissie', vals)}
            placeholder="Alle transmissies"
          />
        </div>
        <div>
          <label className={labelClass}>Kleur</label>
          <MultiSelect
            options={kleuren.map(k => ({ label: k }))}
            selected={selectedKleuren}
            onChange={(vals) => handleMultiChange('kleur', vals)}
            placeholder="Alle kleuren"
          />
        </div>
<div>
  <label className={labelClass}>BTW/Marge</label>
  <MultiSelect
    options={[{ label: 'btw' }, { label: 'marge' }]}
    selected={filters.btw_marge ? (filters.btw_marge as string).split(',') : []}
    onChange={(vals) => handleMultiChange('btw_marge', vals)}
    placeholder="Alle"
  />
</div>

      {/* Range sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <RangeSlider
          label="Bouwjaar"
          min={ranges.minJaar}
          max={ranges.maxJaar}
          step={1}
          value={[filters.jaar_min || ranges.minJaar, filters.jaar_max || ranges.maxJaar]}
          onChange={(v) => handleRangeChange('jaar', v)}
        />
        <RangeSlider
          label="Kilometerstand"
          min={0}
          max={ranges.maxKm}
          step={5000}
          value={[filters.kmstand_min || 0, filters.kmstand_max || ranges.maxKm]}
          onChange={(v) => handleRangeChange('kmstand', v)}
          formatValue={(v) => `${v.toLocaleString('nl-NL')} km`}
        />
        <RangeSlider
          label="Vermogen (pk)"
          min={0}
          max={ranges.maxVermogen}
          step={10}
          value={[filters.vermogen_min || 0, filters.vermogen_max || ranges.maxVermogen]}
          onChange={(v) => handleRangeChange('vermogen', v)}
          formatValue={(v) => `${v} pk`}
        />
      </div>

      {/* Extra opties */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <button
          onClick={() => setShowExtraOptions(!showExtraOptions)}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-smartlease-yellow transition"
        >
          <span>Extra opties</span>
          {selectedOptions.length > 0 && (
            <span className="bg-smartlease-yellow/10 text-smartlease-yellow text-xs px-2 py-0.5 rounded-full font-bold">
              {selectedOptions.length}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showExtraOptions ? 'rotate-180' : ''}`} />
        </button>
        {showExtraOptions && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 mt-3">
            {EXTRA_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm border ${
                  selectedOptions.includes(option.value)
                    ? 'bg-smartlease-yellow/10 border-smartlease-yellow/30 text-smartlease-yellow font-medium'
                    : 'border-transparent hover:bg-gray-50 text-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.value)}
                  onChange={() => handleOptionToggle(option.value)}
                  className="w-4 h-4 text-smartlease-yellow border-gray-300 rounded focus:ring-smartlease-yellow"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* MOBILE */}
      <div className="md:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center space-x-2.5">
            <SlidersHorizontal className="h-5 w-5 text-smartlease-yellow" />
            <span className="font-bold text-gray-900">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-smartlease-yellow text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </button>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeChips.map((chip) => (
              <button key={chip.key} onClick={() => removeFilter(chip.key)} className="flex items-center space-x-1.5 bg-smartlease-yellow/10 text-smartlease-yellow pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold hover:bg-smartlease-yellow/20 transition">
                <span>{chip.label}</span><X className="h-3 w-3" />
              </button>
            ))}
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition font-medium">Wis alles</button>
          </div>
        )}

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-white">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-5 w-5 text-smartlease-yellow" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 transition">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5 overscroll-contain">
              {filterContent}
            </div>
            <div className="border-t border-gray-100 px-4 py-3 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center space-x-3">
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="px-4 py-3 text-sm font-semibold text-gray-500 hover:text-gray-900 transition whitespace-nowrap">Wis alles</button>
              )}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-smartlease-yellow hover:bg-yellow-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg active:scale-[0.98]"
              >
                <Search className="h-4 w-4" />
                <span>{totalResults !== undefined ? `Toon ${totalResults.toLocaleString('nl-NL')} auto's` : 'Toon resultaten'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <SlidersHorizontal className="h-5 w-5 text-smartlease-yellow" />
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-smartlease-yellow text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center space-x-1.5 text-sm text-gray-400 hover:text-smartlease-yellow transition font-medium">
              <X className="h-4 w-4" /><span>Wis alle filters</span>
            </button>
          )}
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-gray-100">
            {activeChips.map((chip) => (
              <button key={chip.key} onClick={() => removeFilter(chip.key)} className="flex items-center space-x-1.5 bg-smartlease-yellow/10 text-smartlease-yellow pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold hover:bg-smartlease-yellow/20 transition group">
                <span>{chip.label}</span>
                <X className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        )}

        {filterContent}
      </div>
    </div>
  );
}