import React from 'react';
import Tooltip from './Tooltip';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  valueLabel: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  step?: number;
  scaleLabels?: string[]; // New prop for custom labels
  tooltip?: string;
}

const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  onChange, 
  valueLabel,
  leftIcon,
  rightIcon,
  step = 1,
  scaleLabels,
  tooltip
}) => {
  return (
    <div className="flex flex-col space-y-2 bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center">
          {label}
          {tooltip && <Tooltip content={tooltip} />}
        </label>
        <span className="text-emerald-400 font-bold font-mono bg-gray-900 px-2 py-1 rounded text-sm">{valueLabel}</span>
      </div>
      
      <div className="relative flex items-center space-x-3">
        {leftIcon && <span className="text-xl opacity-70">{leftIcon}</span>}
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
        />
        
        {rightIcon && <span className="text-xl opacity-70">{rightIcon}</span>}
      </div>
      
      {/* Scale Labels */}
      {scaleLabels && scaleLabels.length > 0 && (
        <div className="flex justify-between w-full px-1 mt-1">
          {scaleLabels.map((text, index) => (
            <span 
              key={index} 
              className={`
                text-[10px] text-gray-500 font-medium uppercase tracking-wider
                ${index === 0 ? 'text-left' : ''}
                ${index === scaleLabels.length - 1 ? 'text-right' : ''}
                ${index > 0 && index < scaleLabels.length - 1 ? 'text-center hidden sm:block' : ''} 
                w-full
              `}
            >
              {text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;