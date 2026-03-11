import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface MultiSelectProps {
  options: { label: string; count?: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  searchable?: boolean;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  searchable = false,
  disabled = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggleOption = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((s) => s !== label));
    } else {
      onChange([...selected, label]);
    }
  };

  const removeOption = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== label));
  };

  const displayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return selected[0];
    return `${selected.length} geselecteerd`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm text-left transition-all flex items-center justify-between ${
          disabled
            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            : isOpen
            ? 'border-smartlease-teal ring-2 ring-smartlease-teal bg-white'
            : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
        }`}
      >
        <span className={`truncate ${selected.length === 0 ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
          {displayText()}
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 ml-2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected chips below button */}
      {selected.length > 1 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center bg-smartlease-teal/10 text-smartlease-teal text-xs font-medium pl-2 pr-1 py-0.5 rounded-full"
            >
              {item}
              <button onClick={(e) => removeOption(item, e)} className="ml-0.5 p-0.5 hover:bg-smartlease-teal/20 rounded-full">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-hidden flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Zoeken..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-smartlease-teal focus:border-smartlease-teal outline-none"
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">Geen resultaten</div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option.label}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.label)}
                    onChange={() => toggleOption(option.label)}
                    className="w-4 h-4 text-smartlease-teal border-gray-300 rounded focus:ring-smartlease-teal flex-shrink-0"
                  />
                  <span className="ml-2.5 text-sm text-gray-700 truncate">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">({option.count})</span>
                  )}
                </label>
              ))
            )}
          </div>

          {selected.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button
                onClick={() => { onChange([]); setSearch(''); }}
                className="text-xs text-gray-400 hover:text-smartlease-teal transition font-medium"
              >
                Selectie wissen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}