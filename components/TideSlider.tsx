import React from 'react';
import { getTideLabel } from '../constants';

interface TideSliderProps {
  value: number;
  onChange: (val: number) => void;
}

const TideSlider: React.FC<TideSliderProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col space-y-2 bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm relative overflow-hidden">
      <div className="flex justify-between items-center mb-1 z-10 relative">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Niveau de marée</label>
        <span className="text-cyan-400 font-bold font-mono bg-gray-900 px-2 py-1 rounded text-sm">{getTideLabel(value)}</span>
      </div>
      
      <div className="relative h-24 w-full flex items-center justify-center pt-4">
        {/* Curve Background */}
        <svg className="absolute bottom-0 left-0 w-full h-16 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 50">
           {/* Gradient definition */}
           <defs>
             <linearGradient id="waterGradient" x1="0" x2="0" y1="0" y2="1">
               <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
               <stop offset="100%" stopColor="rgba(6, 182, 212, 0.1)" />
             </linearGradient>
           </defs>
           
           {/* The sine wave path: Start Low (0,50), go High (50,0), go Low (100,50) */}
           <path 
             d="M 0 50 Q 25 50 25 50 C 35 50 35 10 50 10 C 65 10 65 50 75 50 Q 100 50 100 50 L 100 50 L 0 50 Z" 
             fill="url(#waterGradient)" 
             stroke="#06b6d4" 
             strokeWidth="0.5"
             className="opacity-50"
           />
           {/* The main curve line */}
           <path 
             d="M 0 50 C 30 50 30 10 50 10 C 70 10 70 50 100 50" 
             fill="none" 
             stroke="#22d3ee" 
             strokeWidth="2"
             strokeLinecap="round"
             vectorEffect="non-scaling-stroke"
           />
        </svg>

        {/* Visual Indicator on the curve */}
        {/* Calculate position based on sine wave logic approximation for visual dot */}
        <div 
            className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] border-2 border-cyan-500 z-0 pointer-events-none transition-all duration-75"
            style={{
                left: `calc(${value}% - 8px)`,
                // Simple approximation of the bell curve for the dot height
                // Input 0 -> Bottom, 50 -> Top, 100 -> Bottom
                bottom: `${(Math.sin((value - 0) * Math.PI / 100) * (value > 0 && value < 100 ? 1 : 0)) * 60 + 10}%`
            }}
        ></div>

        {/* The actual slider input */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute bottom-0 w-full h-full opacity-0 cursor-pointer z-20"
        />

        {/* Labels positioned under the curve */}
        <div className="absolute bottom-1 w-full flex justify-between px-2 text-[10px] font-mono text-gray-500 pointer-events-none">
            <span>Basse</span>
            <span className="-translate-y-6">Haute</span>
            <span>Basse</span>
        </div>
      </div>
    </div>
  );
};

export default TideSlider;