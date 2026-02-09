import React, { useMemo } from 'react';
import { SOLAR_TIMES, formatTime } from '../constants';
import Tooltip from './Tooltip';

interface TimeSliderProps {
  label: string;
  value: number;
  month: string;
  onChange: (val: number) => void;
  valueLabel: string;
  tooltip?: string;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ 
  label, 
  value, 
  month,
  onChange, 
  valueLabel,
  tooltip
}) => {
  const max = 1439; // 23:59 in minutes

  // Get Solar Data for the month
  const solarData = useMemo(() => {
    return SOLAR_TIMES[month] || { sunrise: 360, sunset: 1080 }; // Default 6am-6pm if not found
  }, [month]);

  const sunrisePercent = (solarData.sunrise / max) * 100;
  const sunsetPercent = (solarData.sunset / max) * 100;
  const noonPercent = 50;

  return (
    <div className="flex flex-col space-y-2 bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center">
          {label}
          {tooltip && <Tooltip content={tooltip} />}
        </label>
        <span className="text-emerald-400 font-bold font-mono bg-gray-900 px-2 py-1 rounded text-sm">{valueLabel}</span>
      </div>
      
      <div className="relative pt-6 pb-2">
        {/* Track Decoration Layer */}
        <div className="absolute top-[28px] left-0 right-0 h-2 rounded-lg pointer-events-none overflow-hidden">
           {/* Night gradient left */}
           <div className="absolute left-0 h-full bg-indigo-950/50" style={{ width: `${sunrisePercent}%` }}></div>
           {/* Day center */}
           <div className="absolute h-full bg-yellow-500/10" style={{ left: `${sunrisePercent}%`, width: `${sunsetPercent - sunrisePercent}%` }}></div>
           {/* Night gradient right */}
           <div className="absolute right-0 h-full bg-indigo-950/50" style={{ width: `${100 - sunsetPercent}%` }}></div>
        </div>

        {/* Markers (Above Track) */}
        
        {/* Sunrise Marker */}
        <div 
            className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center group cursor-help transition-all duration-500"
            style={{ left: `${sunrisePercent}%` }}
        >
            <span className="text-lg drop-shadow-lg filter">🌅</span>
            <div className="h-2 w-0.5 bg-orange-400/50 mt-1"></div>
            <span className="absolute -top-6 text-[10px] bg-gray-900 text-orange-300 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-orange-500/30">
               Lever: {formatTime(solarData.sunrise)}
            </span>
        </div>

        {/* Noon Marker */}
        <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        >
             <div className="h-2 w-0.5 bg-yellow-400/30 mt-[26px]"></div>
        </div>

        {/* Sunset Marker */}
        <div 
            className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center group cursor-help transition-all duration-500"
            style={{ left: `${sunsetPercent}%` }}
        >
            <span className="text-lg drop-shadow-lg filter">🌇</span>
            <div className="h-2 w-0.5 bg-purple-400/50 mt-1"></div>
             <span className="absolute -top-6 text-[10px] bg-gray-900 text-purple-300 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-purple-500/30">
               Coucher: {formatTime(solarData.sunset)}
            </span>
        </div>

        {/* The Input Slider */}
        <input
          type="range"
          min={0}
          max={max}
          step={15}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer z-10 
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] 
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500"
        />
        
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500 font-medium font-sport uppercase tracking-wider pt-1">
        <span className="text-indigo-400">Nuit</span>
        <span className="text-yellow-500/70">Midi</span>
        <span className="text-indigo-400">Nuit</span>
      </div>
    </div>
  );
};

export default TimeSlider;