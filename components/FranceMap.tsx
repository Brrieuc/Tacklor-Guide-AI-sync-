import React, { useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3-geo';
import { SOLAR_TIMES } from '../constants';

interface FranceMapProps {
  selectedRegion: string | null;
  onSelect: (region: string) => void;
  time: number;
  month: string;
  coordinates?: { lat: number; lon: number };
}

// Configuration: Vertical stack on the FAR left side (x: 5 to 75)
const DROM_CONFIG: Record<string, { name: string, initials: string, box: [[number, number], [number, number]] }> = {
  '971': { name: 'Guadeloupe', initials: 'GP', box: [[5, 20],  [75, 100]] },
  '972': { name: 'Martinique', initials: 'MQ', box: [[5, 120], [75, 200]] },
  '973': { name: 'Guyane',     initials: 'GF', box: [[5, 220], [75, 300]] },
  '974': { name: 'La Réunion', initials: 'RE', box: [[5, 320], [75, 400]] },
  '976': { name: 'Mayotte',    initials: 'YT', box: [[5, 420], [75, 500]] },
};

const DROM_CODES = Object.keys(DROM_CONFIG);

const FranceMap: React.FC<FranceMapProps> = ({ selectedRegion, onSelect, time, month, coordinates }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(err => {
        console.error("Error loading GeoJSON:", err);
        setGeoData({ features: [] });
      });
  }, []);

  // Determine if it is night based on month solar times
  const isNight = useMemo(() => {
    const solar = SOLAR_TIMES[month] || { sunrise: 360, sunset: 1080 };
    return time < solar.sunrise || time > solar.sunset;
  }, [time, month]);

  const highlightColor = useMemo(() => {
    const solar = SOLAR_TIMES[month] || { sunrise: 360, sunset: 1080 };
    // Seasonal color palette logic
    if (time >= solar.sunrise - 60 && time < solar.sunrise + 30) return '#fbbf24'; // Amber (Dawn)
    if (time >= solar.sunrise + 30 && time < solar.sunset - 60) return '#06b6d4'; // Cyan (Day)
    if (time >= solar.sunset - 60 && time < solar.sunset + 60) return '#db2777'; // Pink (Dusk)
    return '#38bdf8'; // Sky Blue (Night default)
  }, [time, month]);

  const mainProjection = useMemo(() => {
    return d3.geoConicConformal()
      .center([2.454071, 46.279229])
      .scale(2800)
      .translate([350, 275]); 
  }, []);

  const mainPathGenerator = useMemo(() => d3.geoPath().projection(mainProjection), [mainProjection]);

  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-800/40 rounded-2xl border border-gray-700/50 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-600 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-gray-400 text-sm animate-pulse">Chargement de la carte...</span>
        </div>
      </div>
    );
  }

  const metropoleFeatures = geoData.features ? geoData.features.filter((f: any) => !DROM_CODES.includes(String(f.properties.code))) : [];
  const dromFeatures = geoData.features ? geoData.features.filter((f: any) => DROM_CODES.includes(String(f.properties.code))) : [];

  return (
    <div className="relative w-full h-[550px] bg-gray-800/50 rounded-2xl border border-gray-600/50 backdrop-blur-md shadow-inner overflow-hidden group">
        
        {/* NIGHT FILTER OVERLAY */}
        {/* Applies a blue multiply blend to simulate night darkness on the map */}
        <div 
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-1000 ease-in-out mix-blend-multiply"
          style={{ 
            backgroundColor: 'rgba(10, 20, 50, 0.4)', // Slightly reduced opacity for brightness
            opacity: isNight ? 1 : 0 
          }}
        ></div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-10"></div>
        
        <svg viewBox="0 0 550 550" className="w-full h-full drop-shadow-2xl relative z-10">
           {/* ... existing SVG content ... */}
           <defs>
             <filter id="glow-pulse" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
             </filter>
           </defs>

           {metropoleFeatures.map((feature: any) => {
             const { nom, code } = feature.properties;
             const isSelected = selectedRegion === nom;
             const isHovered = hoveredDept === nom;
             
             return (
               <g key={code}
                  onMouseEnter={() => setHoveredDept(nom)}
                  onMouseLeave={() => setHoveredDept(null)}
                  onClick={() => onSelect(nom)}
                  className="cursor-pointer"
               >
                 <path
                   d={mainPathGenerator(feature) || undefined}
                   fill={isSelected ? highlightColor : (isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255, 255, 255, 0.05)')}
                   stroke={isSelected || isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                   strokeWidth={isSelected ? 1.5 : 0.6}
                   className={`transition-all duration-300 ease-out ${isSelected ? 'animate-pulse' : ''}`}
                   style={{ filter: isSelected ? `drop-shadow(0 0 10px ${highlightColor})` : 'none' }}
                 />
               </g>
             );
           })}

           {DROM_CODES.map((code) => {
             const feature = dromFeatures.find((f: any) => String(f.properties.code) === code);
             const config = DROM_CONFIG[code];
             if (!config) return null;

             const isSelected = selectedRegion === config.name;
             const isHovered = hoveredDept === config.name;
             const [x0, y0] = config.box[0];
             const [x1, y1] = config.box[1];
             const width = x1 - x0;
             const height = y1 - y0;

             let dAttribute = undefined;
             if (feature) {
                try {
                  const projection = d3.geoMercator()
                    .fitExtent([[x0 + 5, y0 + 10], [x1 - 5, y1 - 15]], feature);
                  dAttribute = d3.geoPath().projection(projection)(feature);
                } catch (e) {
                  console.warn("D3 Projection error for", config.name);
                }
             }

             return (
               <g key={code} 
                  onMouseEnter={() => setHoveredDept(config.name)}
                  onMouseLeave={() => setHoveredDept(null)}
                  onClick={() => onSelect(config.name)}
                  className="cursor-pointer"
               >
                  <rect 
                    x={x0} y={y0} width={width} height={height} rx={8}
                    fill={isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(30, 40, 50, 0.5)'}
                    stroke={isSelected ? highlightColor : "rgba(255,255,255,0.25)"}
                    strokeWidth={isSelected ? 1.5 : 1}
                    className="transition-colors duration-300"
                  />
                  
                  {dAttribute ? (
                    <path 
                      d={dAttribute}
                      fill={isSelected ? highlightColor : (isHovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)')}
                      stroke={isSelected || isHovered ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                      strokeWidth={1.5}
                      style={{ filter: isSelected ? `drop-shadow(0 0 8px ${highlightColor})` : 'none' }}
                    />
                  ) : (
                     <text 
                        x={x0 + width/2} 
                        y={y0 + height/2 + 5} 
                        textAnchor="middle" 
                        fill={isSelected ? highlightColor : "rgba(255,255,255,0.2)"}
                        className="text-2xl font-black font-sport"
                        style={{ fontSize: '24px', opacity: isSelected ? 1 : 0.4 }}
                     >
                       {config.initials}
                     </text>
                  )}

                  <text
                    x={x0 + width / 2}
                    y={y1 - 6}
                    textAnchor="middle"
                    className="text-[9px] uppercase font-mono tracking-wider font-bold"
                    fill={isSelected ? highlightColor : "#d1d5db"}
                    style={{ pointerEvents: 'none' }}
                  >
                    {config.name}
                  </text>
               </g>
             );
           })}
        </svg>

        <div className="absolute bottom-4 right-4 z-30 pointer-events-none">
            <div className={`
              bg-black/80 backdrop-blur-md border border-gray-500 px-4 py-2 rounded-lg text-white transition-opacity duration-300
              ${hoveredDept ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              <span className="text-xs text-gray-400 uppercase tracking-widest block text-right">Département</span>
              <span className="font-bold font-sport text-lg block text-right" style={{ color: highlightColor }}>
                {hoveredDept || "..."}
              </span>
            </div>
        </div>
    </div>
  );
};

export default FranceMap;