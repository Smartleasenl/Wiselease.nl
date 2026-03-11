import { useState, useEffect, useCallback, useRef } from 'react';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
}

export function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  formatValue = (v) => v.toString(),
}: RangeSliderProps) {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1]);
  }, [value]);

  const debouncedOnChange = useCallback(
    (newMin: number, newMax: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange([newMin, newMax]);
      }, 300);
    },
    [onChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (newMin <= localMax) {
      setLocalMin(newMin);
      debouncedOnChange(newMin, localMax);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (newMax >= localMin) {
      setLocalMax(newMax);
      debouncedOnChange(localMin, newMax);
    }
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative pt-6 pb-2">
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-smartlease-yellow rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          className="range-slider-thumb absolute w-full h-2 appearance-none bg-transparent pointer-events-none top-6"
          style={{
            zIndex: localMin > max - (max - min) / 4 ? 5 : 3,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          className="range-slider-thumb absolute w-full h-2 appearance-none bg-transparent pointer-events-none top-6"
          style={{
            zIndex: 4,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{formatValue(localMin)}</span>
        <span className="text-gray-400">–</span>
        <span className="text-gray-600 font-medium">{formatValue(localMax)}</span>
      </div>
    </div>
  );
}