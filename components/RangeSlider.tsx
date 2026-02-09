import React, { useCallback, useEffect, useState, useRef } from 'react';
import Tooltip from './Tooltip';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  unit?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  tooltip?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min,
  max,
  minValue,
  maxValue,
  onChange,
  unit = '',
  leftIcon,
  rightIcon,
  tooltip
}) => {
  const [minVal, setMinVal] = useState(minValue);
  const [maxVal, setMaxVal] = useState(maxValue);
  const minValRef = useRef(minValue);
  const maxValRef = useRef(maxValue);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Sync state with props
  useEffect(() => {
    setMinVal(minValue);
  }, [minValue]);

  useEffect(() => {
    setMaxVal(maxValue);
  }, [maxValue]);

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(event.target.value), maxVal - 1);
    setMinVal(value);
    minValRef.current = value;
    onChange(value, maxVal);
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(event.target.value), minVal + 1);
    setMaxVal(value);
    maxValRef.current = value;
    onChange(minVal, value);
  };

  return (
    <div className="flex flex-col space-y-2 bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          {label}
          {tooltip && <Tooltip content={tooltip} />}
        </label>
        <span className="text-emerald-400 font-bold font-mono bg-gray-900 px-2 py-1 rounded text-sm whitespace-nowrap">
          {minVal} {unit} - {maxVal >= max ? `${maxVal} ${unit}+` : `${maxVal} ${unit}`}
        </span>
      </div>

      <div className="flex items-center space-x-4 px-2">
        {leftIcon && <span className="text-xl opacity-70 flex-shrink-0">{leftIcon}</span>}
        
        <div className="relative flex-grow h-6">
          {/* Inputs */}
          <input
            type="range"
            min={min}
            max={max}
            value={minVal}
            onChange={handleMinChange}
            className="thumb thumb--left pointer-events-none absolute top-1/2 left-0 w-full h-0 -translate-y-1/2 outline-none"
            style={{ zIndex: minVal > max - 10 ? 50 : 30 }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={maxVal}
            onChange={handleMaxChange}
            className="thumb thumb--right pointer-events-none absolute top-1/2 left-0 w-full h-0 -translate-y-1/2 outline-none z-40"
          />

          {/* Track background */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-700 rounded-lg -translate-y-1/2 z-10"></div>
          {/* Track fill */}
          <div
            ref={range}
            className="absolute top-1/2 h-2 bg-emerald-500 rounded-lg -translate-y-1/2 z-20"
          ></div>
        </div>

        {rightIcon && <span className="text-xl opacity-70 flex-shrink-0">{rightIcon}</span>}
      </div>

      <style>{`
        /* Webkit specific styles for dual range slider */
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
          pointer-events: all;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background-color: white;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
          border: 2px solid #10b981; /* emerald-500 */
          cursor: pointer;
          position: relative;
          z-index: 50; /* Ensure thumb is high up in stacking context */
        }

        .thumb::-moz-range-thumb {
          pointer-events: all;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background-color: white;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
          border: 2px solid #10b981;
          cursor: pointer;
          position: relative;
          z-index: 50;
        }
      `}</style>
      
      <div className="flex justify-between w-full px-1 mt-1 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
        <span>Surface</span>
        <span>Profondeur</span>
      </div>
    </div>
  );
};

export default RangeSlider;