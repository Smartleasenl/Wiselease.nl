import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, CheckCircle } from 'lucide-react';

interface KvkBedrijf {
  kvkNummer: string;
  naam: string;
  adres: string;
  plaats: string;
  postcode: string;
  straatnaam: string;
  huisnummer: string;
  rechtsvorm: string;
}

interface KvkSearchProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (bedrijf: KvkBedrijf) => void;
  placeholder?: string;
  className?: string;
  accentColor?: string;
}

// In-memory cache per sessie
const queryCache = new Map<string, KvkBedrijf[]>();

export default function KvkSearch({
  supabaseUrl, supabaseAnonKey, value, onChange, onSelect,
  placeholder = 'Zoek op bedrijfsnaam...', className = '', accentColor = 'emerald',
}: KvkSearchProps) {
  const [results, setResults] = useState<KvkBedrijf[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); setOpen(false); return; }

    // Check cache
    const cacheKey = q.toLowerCase().trim();
    if (queryCache.has(cacheKey)) {
      setResults(queryCache.get(cacheKey)!);
      setOpen(true);
      return;
    }

    // Annuleer vorige request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetch(
        `${supabaseUrl}/functions/v1/kvk-search?q=${encodeURIComponent(q)}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseAnonKey}`, 'apikey': supabaseAnonKey },
          signal: abortRef.current.signal,
        }
      );
      const data = await res.json();
      const bedrijven = data.bedrijven || [];
      queryCache.set(cacheKey, bedrijven);
      setResults(bedrijven);
      setOpen(true);
    } catch (e: any) {
      if (e.name !== 'AbortError') setResults([]);
    } finally {
      setLoading(false);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setSelected(false);
    if (val.length < 3) { setResults([]); setOpen(false); clearTimeout(timer.current); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (bedrijf: KvkBedrijf) => {
    onChange(bedrijf.naam);
    setSelected(true);
    setOpen(false);
    setResults([]);
    onSelect(bedrijf);
  };

  const ring = accentColor === 'yellow'
    ? 'focus:ring-yellow-400/30 focus:border-yellow-400'
    : 'focus:ring-emerald-500/30 focus:border-emerald-500';

  const badge = accentColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-800';

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? <Loader2 size={15} className="animate-spin text-gray-400" />
            : selected ? <CheckCircle size={15} className="text-emerald-500" />
            : <Search size={15} className="text-gray-400" />}
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => value.length >= 3 && results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${ring} ${className}`}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {results.map((b) => (
              <button key={b.kvkNummer} type="button" onClick={() => handleSelect(b)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{b.naam}</p>
                    {b.adres && <p className="text-xs text-gray-500 truncate">{b.adres}</p>}
                  </div>
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${badge}`}>{b.kvkNummer}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">Bron: KVK Handelsregister</p>
          </div>
        </div>
      )}

      {open && !loading && value.length >= 3 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
          <p className="text-sm text-gray-500">Geen bedrijven gevonden voor "{value}"</p>
        </div>
      )}
    </div>
  );
}
