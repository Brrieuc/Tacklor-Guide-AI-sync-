import React, { useState, useRef, useEffect } from 'react';

interface DynamicHeaderProps {
  time: number;
  weather: number;
  month: string;
  onOpenSettings: () => void;
  onOpenInfo: () => void;
}

const DynamicHeader: React.FC<DynamicHeaderProps> = ({ time, weather, month, onOpenSettings, onOpenInfo }) => {

  // --- SCROLL LOGIC ---
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Logic: As soon as the user scrolls (> 0), force compact mode.
      // It only goes back to large if strict top (0) is reached.
      setIsCompact(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- TUNA ANIMATION LOGIC (Background decoration only) ---
  const [isTunaAnimating, setIsTunaAnimating] = useState(false);
  const lastTunaTime = useRef<number>(0);

  const handleHeaderHover = () => {
    const now = Date.now();
    if (!isTunaAnimating && (now - lastTunaTime.current > 60000)) {
      setIsTunaAnimating(true);
      lastTunaTime.current = now;
    }
  };

  const handleTunaAnimationEnd = () => {
    setIsTunaAnimating(false);
  };

  // Dimensions based on Compact state
  // Using duration-300 for a snappier "lock" feel
  const containerPadding = isCompact ? "py-2" : "py-6 md:py-8";
  const logoSize = isCompact ? "w-10 h-10" : "w-16 h-16 md:w-20 md:h-20";
  const titleSize = isCompact ? "text-lg md:text-xl" : "text-3xl md:text-4xl";
  
  // Subtitle: Collapse height and fade out to remove it from flow smoothly
  const subtitleClass = isCompact ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100 mt-1"; 
  
  const buttonSize = isCompact ? "w-9 h-9" : "w-12 h-12";
  const iconSize = isCompact ? "text-base" : "text-xl";

  return (
    <header 
      className="sticky top-0 z-50 group border-b border-gray-800 transition-all duration-300 ease-in-out shadow-lg"
      onMouseEnter={handleHeaderHover}
    >
      <div className="absolute inset-0 bg-gray-900/95 shadow-lg"></div>
      
      {/* Fast Passing Tuna Animation */}
      <div className="absolute top-1/2 left-0 w-full pointer-events-none z-0 overflow-hidden h-full">
         <div 
           className={`text-6xl absolute -left-20 transition-opacity duration-300 ${isTunaAnimating ? 'animate-tuna-pass opacity-100' : 'opacity-0'}`} 
           style={{ top: '50%', transform: 'translateY(-50%)' }}
           onAnimationEnd={handleTunaAnimationEnd}
         >
           🐟
         </div>
      </div>

      <div className={`relative max-w-4xl mx-auto px-4 flex items-center justify-between z-10 transition-all duration-300 ease-in-out ${containerPadding}`}>
        
        {/* LEFT: Logo + Title */}
        <div className="flex items-center space-x-3 md:space-x-5 transition-all duration-300">
            {/* Logo Image */}
            <div className={`${logoSize} rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md transition-all duration-300 ease-in-out`}>
               <img 
                 src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjf0c6sngPU7r12lHBOLDW_GTT3bNw5RGjkOFqtjm1U10pJuNRuAUZzIvU7OItNrvcPQcsktR-paApR49z4OKE9lC5YBwMliX_SQCOc4mOCtJTjqY-CVhW2YtqvMPnNRZPubUi-PUzomTJqLzNpntqiQNNIYeJ65wNeLXnwhd55obLyfCV0AT-I8vQl0ZI/w478-h478/Logo%20Tacklor%20AI.png" 
                 alt="Tacklor Logo" 
                 className="w-full h-full object-cover"
               />
            </div>

            {/* Title - Clean & Solid */}
            <div className="flex flex-col justify-center transition-all duration-300">
                <h1 className={`${titleSize} font-bold font-sport uppercase text-white tracking-wide leading-none transition-all duration-300 origin-left`}>
                  Tacklor Guide
                </h1>
                <div className={`transition-all duration-300 ease-in-out ${subtitleClass}`}>
                  <p className="font-sans font-medium text-gray-400 tracking-widest whitespace-nowrap text-xs md:text-sm">
                    OPTIMISEZ VOTRE APPROCHE
                  </p>
                </div>
            </div>
        </div>

        {/* RIGHT: Buttons Group */}
        <div className="flex items-center space-x-3 transition-all duration-300">
            {/* Info Button */}
            <button 
              onClick={onOpenInfo}
              className={`${buttonSize} rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all duration-300 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white`}
              aria-label="Guide d'utilisation"
            >
              <span className={`${iconSize} font-serif font-bold italic transition-all duration-300`}>i</span>
            </button>

            {/* Settings Button */}
            <button 
              onClick={onOpenSettings}
              className={`${buttonSize} rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all duration-300 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white group/btn`}
              aria-label="Paramètres API"
            >
              <span className={`${iconSize} group-hover/btn:rotate-90 transition-all duration-300`}>⚙️</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default DynamicHeader;