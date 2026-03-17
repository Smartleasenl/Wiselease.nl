import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Building2, Search, MapPin, Car,
  ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Loader2, ExternalLink,
} from 'lucide-react';

interface Dealer {
  naam: string;
  plaats: string;
  postcode: string;
  aantal_autos: number;
  prijs_min: number | null;
  prijs_max: number | null;
  prijs_gem: number | null;
}

type SortField = 'naam' | 'plaats' | 'aantal_autos' | 'prijs_gem';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

const fmt = (n: number | null) => {
  if (!n) return '—';
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
};

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('aantal_autos');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  useEffect(() => { fetchDealers(); }, []);

  const fetchDealers = async () => {
    setLoading(true);
    let allDealers: Dealer[] = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('dealer_overview')
        .select('*')
        .range(from, from + batchSize - 1);

      if (error) { console.error(error); break; }
      if (!data || data.length === 0) break;
      allDealers = [...allDealers, ...data];
      if (data.length < batchSize) break;
      from += batchSize;
    }

    setDealers(allDealers);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let result = dealers;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.naam?.toLowerCase().includes(q) ||
        d.plaats?.toLowerCase().includes(q) ||
        d.postcode?.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [dealers, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir(field === 'naam' || field === 'plaats' ? 'asc' : 'desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />;
    return sortDir === 'asc'
      ? <ArrowUp className="h-3.5 w-3.5 text-smartlease-yellow" />
      : <ArrowDown className="h-3.5 w-3.5 text-smartlease-yellow" />;
  };

  const totalAutos = dealers.reduce((sum, d) => sum + d.aantal_autos, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dealers</h1>
        <p className="text-sm text-gray-500 mt-1">Overzicht van alle dealers uit de voertuig XML feed</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Dealers</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{dealers.length.toLocaleString('nl-NL')}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Voertuigen</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{totalAutos.toLocaleString('nl-NL')}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Car className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Gem. per dealer</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {dealers.length > 0 ? Math.round(totalAutos / dealers.length) : 0}
              </p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek op naam, plaats of postcode..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-smartlease-yellow/20 focus:border-smartlease-yellow transition"
            />
          </div>
          <p className="text-sm text-gray-500 whitespace-nowrap">
            {filtered.length === dealers.length
              ? dealers.length.toLocaleString('nl-NL') + ' dealers'
              : filtered.length.toLocaleString('nl-NL') + ' van ' + dealers.length.toLocaleString('nl-NL')}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-smartlease-yellow animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobiel cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {pageData.map((dealer, idx) => (
                <div key={dealer.naam + idx} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm truncate">{dealer.naam}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
                        {dealer.aantal_autos}
                      </span>
                      <button
                        onClick={() => window.open('/aanbod?q=' + encodeURIComponent(dealer.naam), '_blank')}
                        className="p-1.5 text-gray-400 hover:text-smartlease-yellow transition rounded-lg hover:bg-yellow-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="ml-10 space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" /> {dealer.plaats} {dealer.postcode && '(' + dealer.postcode + ')'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Min: {fmt(dealer.prijs_min)}</span>
                      <span>Gem: <span className="font-semibold text-gray-700">{fmt(dealer.prijs_gem)}</span></span>
                      <span>Max: {fmt(dealer.prijs_max)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {pageData.length === 0 && (
                <div className="p-12 text-center text-gray-400">Geen dealers gevonden</div>
              )}
            </div>

            {/* Desktop tabel */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      <button onClick={() => toggleSort('naam')} className="flex items-center gap-1.5 hover:text-gray-900 transition">
                        Dealer <SortIcon field="naam" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      <button onClick={() => toggleSort('plaats')} className="flex items-center gap-1.5 hover:text-gray-900 transition">
                        Plaats <SortIcon field="plaats" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">
                      <button onClick={() => toggleSort('aantal_autos')} className="flex items-center gap-1.5 hover:text-gray-900 transition mx-auto">
                        Auto's <SortIcon field="aantal_autos" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Prijs (min)</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">
                      <button onClick={() => toggleSort('prijs_gem')} className="flex items-center gap-1.5 hover:text-gray-900 transition ml-auto">
                        Gem. prijs <SortIcon field="prijs_gem" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Prijs (max)</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageData.map((dealer, idx) => (
                    <tr key={dealer.naam + idx} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-[250px]">{dealer.naam}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{dealer.plaats}</span>
                          {dealer.postcode && <span className="text-gray-400 text-xs">({dealer.postcode})</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold">
                          {dealer.aantal_autos}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{fmt(dealer.prijs_min)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(dealer.prijs_gem)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{fmt(dealer.prijs_max)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => window.open('/aanbod?q=' + encodeURIComponent(dealer.naam), '_blank')}
                          className="p-1.5 text-gray-400 hover:text-smartlease-yellow transition rounded-lg hover:bg-yellow-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pageData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">Geen dealers gevonden</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} van {filtered.length.toLocaleString('nl-NL')}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) pageNum = i;
                    else if (page < 3) pageNum = i;
                    else if (page > totalPages - 4) pageNum = totalPages - 7 + i;
                    else pageNum = page - 3 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={'w-8 h-8 rounded-lg text-xs font-semibold transition ' + (page === pageNum ? 'bg-smartlease-yellow text-white' : 'text-gray-500 hover:bg-gray-100')}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}