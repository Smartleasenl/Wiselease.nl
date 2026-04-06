import { useCanonical } from '../hooks/useCanonical';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Filters } from '../components/Filters';
import { VehicleGrid } from '../components/VehicleGrid';
import { vehicleApi } from '../services/api';
import { initScrollReveal } from '../utils/scrollReveal';
import type { SearchParams, SearchResponse, Vehicle } from '../types/vehicle';

function parseURL(search: string) {
  const sp = new URLSearchParams(search);
  const filters: SearchParams = {};
  let page = 1;
  let sort = '';
  
  const skipKeys = new Set(['page', 'sort', 'bodytype', 'fuel', 'type']);
  const arrayKeys = new Set(['model', 'merk', 'brandstof', 'categorie']);

  sp.forEach((value, key) => {
    if (key === 'page') { page = parseInt(value) || 1; return; }
    if (key === 'sort') { sort = value; return; }
    if (skipKeys.has(key)) return;

    if (arrayKeys.has(key)) {
      const existing = filters[key];
      if (existing) {
        filters[key] = Array.isArray(existing)
          ? [...existing, value]
          : [existing as string, value];
      } else {
        filters[key] = value;
      }
    } else {
      filters[key] = value;
    }
  });

  return { filters, page, sort };
}

function buildQS(filters: SearchParams, page: number, sort: string) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, String(v)));
    } else {
      params.append(key, String(value));
    }
  });
  if (page > 1) params.append('page', String(page));
  if (sort) params.append('sort', sort);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function OccasionsPage() {
  useCanonical();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initial = useRef(parseURL(location.search));
  const [filters, setFilters] = useState<SearchParams>(initial.current.filters);
  const [currentPage, setCurrentPage] = useState(initial.current.page);
  const [currentSort, setCurrentSort] = useState(initial.current.sort || 'nieuwste');
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlBodytype = searchParams.get('bodytype');
    const urlFuel = searchParams.get('fuel');
    const urlType = searchParams.get('type');

    if (!urlBodytype && !urlFuel && !urlType) return;

    setCurrentPage(1);

    setFilters(prev => {
      const newFilters = { ...prev };

      if (urlBodytype === 'personenauto') {
        newFilters.categorie = '__PERSONENAUTO__';
      } else if (urlBodytype === 'bedrijfsauto') {
        newFilters.categorie = 'Bedrijfswagen';
      } else if (urlBodytype === 'motor') {
        newFilters.categorie = '__MOTOR__';
      } else if (prev.categorie) {
        delete newFilters.categorie;
      }

      if (urlFuel === 'elektrisch') {
        newFilters.brandstof = 'Electro';
      } else if (prev.brandstof) {
        delete newFilters.brandstof;
      }

      if (urlType === 'marge') {
        newFilters.btw_marge = 'marge';
      } else if (urlType === 'occasion') {
        newFilters.kmstand_min = 1;
      } else {
        if (prev.btw_marge) delete newFilters.btw_marge;
        if (prev.kmstand_min) delete newFilters.kmstand_min;
      }

      return newFilters;
    });
  }, [searchParams.get('bodytype'), searchParams.get('fuel'), searchParams.get('type')]);

  useEffect(() => {
    const handlePopState = () => {
      const { filters: f, page, sort } = parseURL(window.location.search);
      setFilters(f);
      setCurrentPage(page);
      setCurrentSort(sort);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const cleanup = initScrollReveal();
    return cleanup;
  }, [searchData]);

  useEffect(() => {
    setLoading(true);

    const searchFilters = { ...filters };

    if (searchFilters.categorie === '__PERSONENAUTO__') {
      delete searchFilters.categorie;
      searchFilters.categorie_not = 'Bedrijfswagen,Motorscooter,Trike';
    } else if (searchFilters.categorie === '__MOTOR__') {
      delete searchFilters.categorie;
      searchFilters.categorie_in = 'Motorscooter,Trike';
    }

    vehicleApi
      .search({
        ...searchFilters,
        sort: currentSort || undefined,
        page: currentPage,
        per_page: 24,
      })
      .then((data) => {
        setSearchData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters, currentPage, currentSort]);

  const silentUpdateURL = useCallback((f: SearchParams, page: number, sort: string) => {
    const qs = buildQS(f, page, sort);
    window.history.replaceState(null, '', `/aanbod${qs}`);
  }, []);

  const handleFiltersChange = (newFilters: SearchParams) => {
    setFilters(newFilters);
    setCurrentPage(1);
    silentUpdateURL(newFilters, 1, currentSort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    silentUpdateURL(filters, page, currentSort);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sort: string) => {
    setCurrentSort(sort);
    setCurrentPage(1);
    silentUpdateURL(filters, 1, sort);
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    const slug = `${vehicle.merk}-${vehicle.model}-${vehicle.uitvoering}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    navigate(`/auto/${vehicle.id}/${slug}`);
  };

  return (
    <main className="bg-[#f8f9fb] min-h-screen">
      {/* Header with filters */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-5 md:mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">Aanbod</h1>
            <p className="text-gray-400 mt-1 text-sm">Vind je ideale auto met financial lease</p>
          </div>
          <Filters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            totalResults={searchData?.total}
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <VehicleGrid
          data={searchData}
          loading={loading}
          onPageChange={handlePageChange}
          onVehicleClick={handleVehicleClick}
          currentSort={currentSort}
          onSortChange={handleSortChange}
        />
      </div>
    </main>
  );
}