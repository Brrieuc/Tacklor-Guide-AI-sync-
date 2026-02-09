import React from 'react';
import { WindDirection } from '../types';
import { getWindDirectionLabel } from '../constants';
import Tooltip from './Tooltip';

interface WindDirectionSelectorProps {
  value: WindDirection | null;
  onChange: (val: WindDirection) => void;
  tooltip?: string;
}

const WindDirectionSelector: React.FC<WindDirectionSelectorProps> = ({ value, onChange, tooltip }) => {
  
  // Helper to render an arrow button
  const renderArrow = (direction: WindDirection, rotation: number, positionClass: string) => {
    const isSelected = value === direction;
    return (
      <button
        onClick={() => onChange(direction)}
        className={`
          absolute w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all duration-300 z-20
          ${positionClass}
          ${isSelected 
            ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] scale-110 border-2 border-white' 
            : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-600'
          }
        `}
        title={getWindDirectionLabel(direction)}
      >
        <span 
          className="text-lg md:text-xl font-bold transform" 
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          ↓
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-3 bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center w-full mb-2">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center">
          Orientation du vent
          {tooltip && <Tooltip content={tooltip} />}
        </label>
        {value && (
          <span className="text-emerald-400 font-bold font-mono bg-gray-900 px-2 py-1 rounded text-xs md:text-sm truncate max-w-[150px]">
            {getWindDirectionLabel(value)}
          </span>
        )}
      </div>

      {/* The Visual Schema Container */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border-4 border-gray-600 overflow-hidden shadow-2xl bg-gray-900 group">
        
        {/* TOP HALF: WATER */}
        {/* Adjusted pt-16 to move text below N arrow */}
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-fishing-blue to-cyan-900/50 flex flex-col items-center justify-start pt-16 transition-colors">
          <span className="text-cyan-200/50 font-sport uppercase tracking-[0.2em] text-sm z-0 pointer-events-none">Plan d'eau</span>
          <div className="absolute top-8 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwIDAgQzUgMCA1IDUgMTAgNSBDMTUgNSAxNSAwIDEwIDBaIiBmaWxsPSIjZmZmIi8+PC9zdmc+')]"></div>
        </div>

        {/* BOTTOM HALF: SHORE */}
        {/* Adjusted pb-16 to move text above S arrow */}
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-stone-800 to-stone-700 flex flex-col items-center justify-end pb-16 border-t border-white/10">
           <span className="text-stone-400/50 font-sport uppercase tracking-[0.2em] text-sm z-0 pointer-events-none">Rivage / Bord</span>
           <div className="absolute bottom-0 w-full h-full opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxIiBmaWxsPSIjZmZmIi8+PC9zdmc+')]"></div>
        </div>

        {/* CENTER POINT: ANGLER */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full z-10 shadow-[0_0_20px_rgba(255,255,255,0.5)] border-2 border-gray-400">
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl">🎣</div>
        </div>

        {/* ARROWS (Wind Sources) pointing TOWARDS center */}
        {/* N (Top) - Face Wind */}
        {renderArrow(WindDirection.N, 0, "top-2 left-1/2 -translate-x-1/2")}
        
        {/* NE */}
        {renderArrow(WindDirection.NE, -45, "top-[15%] right-[15%]")}
        
        {/* E (Right) - Side Wind */}
        {renderArrow(WindDirection.E, -90, "top-1/2 right-2 -translate-y-1/2")}
        
        {/* SE */}
        {renderArrow(WindDirection.SE, -135, "bottom-[15%] right-[15%]")}
        
        {/* S (Bottom) - Back Wind */}
        {renderArrow(WindDirection.S, 180, "bottom-2 left-1/2 -translate-x-1/2")}
        
        {/* SW */}
        {renderArrow(WindDirection.SW, 135, "bottom-[15%] left-[15%]")}
        
        {/* W (Left) - Side Wind */}
        {renderArrow(WindDirection.W, 90, "top-1/2 left-2 -translate-y-1/2")}
        
        {/* NW */}
        {renderArrow(WindDirection.NW, 45, "top-[15%] left-[15%]")}

        {/* Center label hint (only when nothing selected) */}
        {!value && (
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8 text-[10px] text-gray-500 bg-black/50 px-2 rounded backdrop-blur-sm pointer-events-none z-30">
                D'où vient le vent ?
             </div>
        )}

      </div>
    </div>
  );
};

export default WindDirectionSelector;