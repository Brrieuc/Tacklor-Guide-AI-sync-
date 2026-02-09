import React, { useMemo, useState, useRef } from 'react';
import { SOLAR_TIMES } from '../constants';

interface DynamicHeaderProps {
  time: number;
  weather: number;
  month: string;
  onOpenSettings: () => void;
  onOpenInfo: () => void;
}

const DynamicHeader: React.FC<DynamicHeaderProps> = ({ time, weather, month, onOpenSettings, onOpenInfo }) => {

  const styleData = useMemo(() => {
    const solar = SOLAR_TIMES[month] || { sunrise: 360, sunset: 1080 };
    const { sunrise, sunset } = solar;
    
    // Determine Phase based on dynamic solar times
    let phase: 'night' | 'dawn' | 'day' | 'dusk' = 'night';
    
    if (time >= sunrise - 60 && time < sunrise) phase = 'dawn';
    else if (time >= sunrise && time < sunset - 60) phase = 'day';
    else if (time >= sunset - 60 && time < sunset + 60) phase = 'dusk';

    // --- GLOW INTENSITY LOGIC ---
    const noon = sunrise + (sunset - sunrise) / 2;
    const maxDist = (sunset - sunrise) / 2;
    const currentDist = Math.abs(time - noon);
    
    let intensityFactor = 0.5;
    if (phase !== 'night') {
        intensityFactor = Math.min(Math.max(currentDist / maxDist, 0.2), 1);
    } else {
        intensityFactor = 0.8;
    }

    // Palettes (Used for accent and ambient glow)
    const palettes = {
      night: { shadowColor: 'rgba(56, 189, 248, 0.5)', accent: '#38bdf8' },
      dawn:  { shadowColor: 'rgba(251, 146, 60, 0.6)',  accent: '#f97316' },
      day:   { shadowColor: 'rgba(6, 182, 212, 0.4)',   accent: '#06b6d4' },
      dusk:  { shadowColor: 'rgba(232, 121, 249, 0.6)', accent: '#db2777' }
    };

    return palettes[phase];
  }, [time, month]);

  // Simplified Title Style (No Blur, No Transparency)
  const titleStyle = useMemo(() => {
    return {
      color: '#ffffff',
      // Subtle colored shadow adapting to the time of day (luminosity/ambiance)
      textShadow: `0 4px 12px ${styleData.shadowColor}`,
      letterSpacing: '0.05em',
      transition: 'text-shadow 1s ease, color 1s ease'
    };
  }, [styleData]);

  const titleChars = "Tacklor Guide".split("");

  // --- TUNA ANIMATION LOGIC ---
  const [isTunaAnimating, setIsTunaAnimating] = useState(false);
  const lastTunaTime = useRef<number>(0);

  const handleHeaderHover = () => {
    const now = Date.now();
    // Allow animation if not currently running AND at least 60 seconds (60000ms) have passed since last start
    if (!isTunaAnimating && (now - lastTunaTime.current > 60000)) {
      setIsTunaAnimating(true);
      lastTunaTime.current = now;
    }
  };

  const handleTunaAnimationEnd = () => {
    setIsTunaAnimating(false);
  };

  return (
    <header 
      className="sticky top-0 z-50 transition-all duration-700 overflow-hidden group"
      onMouseEnter={handleHeaderHover}
    >
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md border-b border-white/10 shadow-lg"></div>
      
      {/* Fast Passing Tuna Animation */}
      <div className="absolute top-1/2 left-0 w-full pointer-events-none z-0">
         <div 
           className={`text-6xl absolute -left-20 transition-opacity duration-300 ${isTunaAnimating ? 'animate-tuna-pass opacity-100' : 'opacity-0'}`} 
           style={{ top: '-1rem' }}
           onAnimationEnd={handleTunaAnimationEnd}
         >
           🐟
         </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-4 flex items-center justify-between z-10">
        
        {/* Info Button (Left) */}
        <button 
          onClick={onOpenInfo}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/10 group/info"
          aria-label="Guide d'utilisation"
        >
          <span className="text-lg md:text-xl font-serif font-bold italic group-hover/info:scale-110 transition-transform duration-300">i</span>
        </button>

        {/* Title */}
        <div className="text-center cursor-default select-none">
          <h1 
            className="flex justify-center text-3xl md:text-5xl font-bold font-sport uppercase"
          >
            {titleChars.map((char, index) => (
              <span
                key={index}
                className="inline-block transition-transform duration-300 group-hover:animate-wave"
                style={{
                  ...titleStyle,
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          <div className="flex justify-center items-center mt-3 space-x-2 opacity-80">
             <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/50"></div>
             <p 
               className="text-xs md:text-sm font-light tracking-[0.2em] font-sans uppercase transition-colors duration-700"
               style={{ 
                 color: styleData.accent,
                 textShadow: `0 0 10px ${styleData.shadowColor}`,
               }}
             >
               Optimisez votre approche
             </p>
             <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/50"></div>
          </div>
        </div>

        {/* Settings Button (Right) */}
        <button 
          onClick={onOpenSettings}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/10 group/btn"
          aria-label="Paramètres API"
        >
          <span className="text-lg md:text-xl group-hover/btn:rotate-45 transition-transform duration-500">⚙️</span>
        </button>
      </div>
    </header>
  );
};

export default DynamicHeader;