import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

// Single-select props
interface SmartSelectSingleProps {
  multi?: false;
  value: string;
  onChange: (value: string) => void;
  values?: never;
  onChangeMulti?: never;
}

// Multi-select props
interface SmartSelectMultiProps {
  multi: true;
  values: string[];
  onChangeMulti: (values: string[]) => void;
  value?: never;
  onChange?: never;
}

type SmartSelectProps = (SmartSelectSingleProps | SmartSelectMultiProps) & {
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  popularValues?: string[];
  searchable?: boolean;
};

export function SmartSelect(props: SmartSelectProps) {
  const {
    options,
    placeholder,
    disabled = false,
    icon,
    popularValues,
    searchable = false,
    multi = false,
  } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Derive current selection
  const singleValue = !multi ? (props.value ?? '') : '';
  const multiValues = multi ? (props.values ?? []) : [];

  const isActive = multi ? multiValues.length > 0 : !!singleValue;

  const emptyOption = options.find((o) => o.value === '');
  const allOptions = options.filter((o) => o.value !== '');

  const filtered = query.trim()
    ? allOptions.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : allOptions;

  const popularOptions =
    popularValues && !query.trim()
      ? allOptions.filter((o) => popularValues.includes(o.value))
      : [];

  const mainOptions =
    popularOptions.length > 0
      ? filtered.filter((o) => !popularValues?.includes(o.value))
      : filtered;

  // Label shown on trigger
  const triggerLabel = (() => {
    if (multi) {
      if (multiValues.length === 0) return '';
      if (multiValues.length === 1) {
        return options.find((o) => o.value === multiValues[0])?.label ?? multiValues[0];
      }
      const label = placeholder.toLowerCase();
return `${multiValues.length} ${label === 'merk' ? 'merken' : label === 'model' ? 'modellen' : label + 'en'}`;
    }
    return options.find((o) => o.value === singleValue)?.label ?? '';
  })();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const panelHeight = Math.min(480, spaceBelow > 300 ? spaceBelow - 16 : spaceAbove - 16);

    setPanelStyle({
      position: 'fixed',
      top: spaceBelow >= 300 ? rect.bottom + 8 : undefined,
      bottom: spaceBelow < 300 ? viewportHeight - rect.top + 8 : undefined,
      left: rect.left,
      width: Math.max(rect.width, 280),
      maxWidth: 360,
      maxHeight: panelHeight,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      if (searchable) setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open, searchable, updatePosition]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = () => updatePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, updatePosition]);

  const handleSelect = (val: string) => {
    if (multi) {
      const current = multiValues;
      if (val === '') {
        props.onChangeMulti([]);
      } else {
        const next = current.includes(val)
          ? current.filter((v) => v !== val)
          : [...current, val];
        props.onChangeMulti(next);
      }
      // Don't close on multi-select, let user pick more
    } else {
      props.onChange(val);
      setOpen(false);
      setQuery('');
    }
  };

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multi) {
      props.onChangeMulti(multiValues.filter((v) => v !== val));
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multi) props.onChangeMulti([]);
    else props.onChange('');
    setOpen(false);
  };

  const OptionRow = ({ opt }: { opt: Option }) => {
    const isSelected = multi
      ? multiValues.includes(opt.value)
      : opt.value === singleValue;

    return (
      <li role="option" aria-selected={isSelected}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleSelect(opt.value)}
          className={[
            'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-100',
            isSelected
              ? 'bg-yellow-50 text-smartlease-yellow font-semibold'
              : 'text-gray-700 hover:bg-gray-50 font-medium',
          ].join(' ')}
        >
          {multi ? (
            <span className="flex items-center gap-2.5">
              <span
                className={[
                  'w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-smartlease-yellow border-smartlease-yellow'
                    : 'border-gray-300',
                ].join(' ')}
              >
                {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
              </span>
              <span>{opt.label}</span>
            </span>
          ) : (
            <span>{opt.label}</span>
          )}
          {!multi && isSelected && (
            <Check className="h-3.5 w-3.5 flex-shrink-0 text-smartlease-yellow" />
          )}
        </button>
      </li>
    );
  };

  // Multi-select: show chips for selected values inside trigger
  const renderTriggerContent = () => {
    if (multi && multiValues.length > 1) {
      // Show count badge
      return (
        <span className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {triggerLabel}
          </span>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={clearAll}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      );
    }
    return (
      <span className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 overflow-hidden">
        <span
          className={[
            'leading-none transition-all duration-200 pointer-events-none whitespace-nowrap',
            isActive || open
              ? 'text-[10px] font-semibold tracking-widest uppercase text-smartlease-yellow'
              : 'text-sm font-medium text-gray-400',
          ].join(' ')}
        >
          {placeholder}
        </span>
        {isActive && (
          <span className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {triggerLabel}
          </span>
        )}
      </span>
    );
  };

  // Footer for multi: "Toepassen" button
  const multiFooter =
    multi && open ? (
      <div className="px-3 py-2.5 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {multiValues.length > 0 ? `${multiValues.length} geselecteerd` : 'Geen selectie'}
        </span>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-white bg-smartlease-yellow hover:bg-yellow-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          Toepassen
        </button>
      </div>
    ) : null;

  const panel =
    open && !disabled ? (
      <div
        ref={panelRef}
        style={{
          ...panelStyle,
          animation: 'smartSelectOpen 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="bg-white rounded-2xl border border-gray-100 shadow-2xl flex flex-col"
      >
        <style>{`
          @keyframes smartSelectOpen {
            from { opacity: 0; transform: translateY(-6px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {searchable && (
          <div className="px-3 pt-3 pb-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder={`Zoek ${placeholder.toLowerCase()}...`}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-smartlease-yellow focus:ring-1 focus:ring-smartlease-yellow/20 placeholder-gray-400 text-gray-800"
              />
            </div>
          </div>
        )}

        <ul className="overflow-y-auto py-1.5 flex-1 min-h-0" role="listbox">
          {emptyOption && !query.trim() && <OptionRow opt={emptyOption} />}

          {popularOptions.length > 0 && (
            <>
              <li className="px-4 pt-2 pb-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                  Populair
                </span>
              </li>
              {popularOptions.map((opt) => (
                <OptionRow key={`popular-${opt.value}`} opt={opt} />
              ))}
              {mainOptions.length > 0 && (
                <li className="px-4 pt-3 pb-1 border-t border-gray-100 mt-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                    Alle merken
                  </span>
                </li>
              )}
            </>
          )}

          {mainOptions.map((opt) => (
            <OptionRow key={opt.value} opt={opt} />
          ))}

          {query.trim() && filtered.length === 0 && (
            <li className="px-4 py-4 text-sm text-gray-400 text-center">
              Geen resultaten voor "{query}"
            </li>
          )}
        </ul>

        {multiFooter}
      </div>
    ) : null;

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-0">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          'w-full flex items-center gap-2.5 px-4 rounded-xl border text-left',
          'transition-all duration-200 outline-none h-[50px]',
          'bg-white',
          disabled
            ? 'opacity-50 cursor-not-allowed border-gray-100'
            : open
            ? 'border-smartlease-yellow ring-2 ring-smartlease-yellow/20 shadow-sm'
            : isActive
            ? 'border-smartlease-yellow/60 shadow-sm hover:border-smartlease-yellow'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
        ].join(' ')}
      >
        {icon && (
          <span
            className={`flex-shrink-0 transition-colors duration-200 ${
              isActive || open ? 'text-smartlease-yellow' : 'text-gray-400'
            }`}
          >
            {icon}
          </span>
        )}

        {renderTriggerContent()}

        {isActive && !multi ? (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={clearAll}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 ml-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown
            className={`flex-shrink-0 h-4 w-4 transition-all duration-300 ${
              open ? 'rotate-180 text-smartlease-yellow' : 'text-gray-400'
            }`}
          />
        )}
      </button>

      {typeof document !== 'undefined' && createPortal(panel, document.body)}
    </div>
  );
}