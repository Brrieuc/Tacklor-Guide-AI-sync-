import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { SOLAR_TIMES } from '../constants';

interface FranceMapProps {
  selectedRegion: string | null;
  onSelect: (region: string) => void;
  time: number;
  month: string;
  coordinates?: { lat: number; lon: number };
}

// List of DROM codes to filter out from main map
const DROM_CODES = ['971', '972', '973', '974', '976'];

// Helper to generate DROM configuration based on layout mode
const getDromConfig = (isMobile: boolean) => {
  if (isMobile) {
    // MOBILE: Horizontal row at the bottom
    // SVG ViewBox width is 550. Height is 450.
    // We center the 5 boxes at the bottom.
    const boxSize = 60; // Slightly smaller to fit nicely
    const gap = 12;
    const totalWidth = (boxSize * 5) + (gap * 4);
    const startX = (550 - totalWidth) / 2;
    const startY = 390; // Positioned at the very bottom (450 - 60)

    return {
      '971': { name: 'Guadeloupe', initials: 'GP', box: [[startX, startY], [startX + boxSize, startY + boxSize]] },
      '972': { name: 'Martinique', initials: 'MQ', box: [[startX + 1*(boxSize+gap), startY], [startX + 1*(boxSize+gap) + boxSize, startY + boxSize]] },
      '973': { name: 'Guyane',     initials: 'GF', box: [[startX + 2*(boxSize+gap), startY], [startX + 2*(boxSize+gap) + boxSize, startY + boxSize]] },
      '974': { name: 'La Réunion', initials: 'RE', box: [[startX + 3*(boxSize+gap), startY], [startX + 3*(boxSize+gap) + boxSize, startY + boxSize]] },
      '976': { name: 'Mayotte',    initials: 'YT', box: [[startX + 4*(boxSize+gap), startY], [startX + 4*(boxSize+gap) + boxSize, startY + boxSize]] },
    } as const;
  } else {
    // DESKTOP: Vertical column on the left (Original Layout)
    // SVG ViewBox is 550x550
    return {
      '971': { name: 'Guadeloupe', initials: 'GP', box: [[5, 20],  [75, 100]] },
      '972': { name: 'Martinique', initials: 'MQ', box: [[5, 120], [75, 200]] },
      '973': { name: 'Guyane',     initials: 'GF', box: [[5, 220], [75, 300]] },
      '974': { name: 'La Réunion', initials: 'RE', box: [[5, 320], [75, 400]] },
      '976': { name: 'Mayotte',    initials: 'YT', box: [[5, 420], [75, 500]] },
    } as const;
  }
};

const FranceMap: React.FC<FranceMapProps> = ({ selectedRegion, onSelect, time, month, coordinates }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for Zoom logic
  const svgRef = useRef<SVGSVGElement>(null);
  const contentGroupRef = useRef<SVGGElement>(null);
  // Store zoom behavior instance to call it programmatically
  const zoomBehaviorRef = useRef<any>(null);

  // Responsive Check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize Zoom
  useEffect(() => {
    if (!svgRef.current || !contentGroupRef.current) return;

    const svg = select(svgRef.current);
    const content = select(contentGroupRef.current);

    const z = zoom()
      .scaleExtent([1, 8]) // Zoom limit: 1x to 8x
      .translateExtent([[0, 0], [550, isMobile ? 450 : 550]]) // Pan limits match ViewBox
      .on("zoom", (event) => {
        content.attr("transform", event.transform);
      });
    
    // Disable scroll zoom on desktop to prevent trapping the page scroll
    // but keep it on mobile (pinch) or if Ctrl is pressed
    z.filter((event) => {
       // Allow touch, click, drag
       if (event.type === 'touchstart' || event.type === 'mousedown') return true;
       // Allow wheel only if Ctrl is pressed (standard accessibility pattern)
       if (event.type === 'wheel' && event.ctrlKey) return true;
       return false; 
    });

    zoomBehaviorRef.current = z;
    svg.call(z as any);

    // Reset zoom when switching devices/orientation to avoid weird offsets
    svg.call(z.transform as any, zoomIdentity);

  }, [isMobile]);

  // Zoom Control Handlers
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.66);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (svgRef.current && zoomBehaviorRef.current) {
      select(svgRef.current).transition().duration(500).call(zoomBehaviorRef.current.transform, zoomIdentity);
    }
  };

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
    if (time >= solar.sunrise - 60 && time < solar.sunrise + 30) return '#fbbf24'; 
    if (time >= solar.sunrise + 30 && time < solar.sunset - 60) return '#06b6d4'; 
    if (time >= solar.sunset - 60 && time < solar.sunset + 60) return '#db2777'; 
    return '#38bdf8'; 
  }, [time, month]);

  // Dynamic Projection
  const mainProjection = useMemo(() => {
    return d3.geoConicConformal()
      .center([2.454071, 46.279229])
      .scale(isMobile ? 2900 : 2800) 
      .translate(isMobile ? [275, 170] : [350, 275]); 
  }, [isMobile]);

  const mainPathGenerator = useMemo(() => d3.geoPath().projection(mainProjection), [mainProjection]);
  const dromConfig = useMemo(() => getDromConfig(isMobile), [isMobile]);

  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-[450px] md:h-[550px] bg-gray-800/40 rounded-2xl border border-gray-700/50 backdrop-blur-md">
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
    <div className="relative w-full h-[450px] md:h-[550px] bg-gray-800/50 rounded-2xl border border-gray-600/50 backdrop-blur-md shadow-inner overflow-hidden group transition-all duration-300">
        
        {/* NIGHT FILTER OVERLAY */}
        <div 
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-1000 ease-in-out mix-blend-multiply"
          style={{ 
            backgroundColor: 'rgba(10, 20, 50, 0.4)', 
            opacity: isNight ? 1 : 0 
          }}
        ></div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-10"></div>
        
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-40 flex flex-col space-y-2">
            <button 
                onClick={handleZoomIn}
                className="w-8 h-8 flex items-center justify-center bg-gray-800/80 hover:bg-emerald-600/80 backdrop-blur-md border border-gray-600 rounded-lg text-white font-bold transition-all shadow-lg active:scale-95"
                title="Zoomer"
            >
                +
            </button>
            <button 
                onClick={handleZoomOut}
                className="w-8 h-8 flex items-center justify-center bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-md border border-gray-600 rounded-lg text-white font-bold transition-all shadow-lg active:scale-95"
                title="Dézoomer"
            >
                -
            </button>
            <button 
                onClick={handleReset}
                className="w-8 h-8 flex items-center justify-center bg-gray-800/80 hover:bg-cyan-600/80 backdrop-blur-md border border-gray-600 rounded-lg text-white text-xs font-bold transition-all shadow-lg active:scale-95"
                title="Réinitialiser"
            >
                ⟲
            </button>
        </div>

        <svg 
          ref={svgRef}
          viewBox={isMobile ? "0 0 550 450" : "0 0 550 550"} 
          className="w-full h-full drop-shadow-2xl relative z-10 cursor-move"
          style={{ touchAction: 'none' }} // Prevents browser scroll on touch drag
        >
           <defs>
             <filter id="glow-pulse" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
             </filter>
           </defs>

           {/* CONTENT GROUP (Zoom Target) */}
           <g ref={contentGroupRef}>
               {/* METROPOLE MAP */}
               {metropoleFeatures.map((feature: any) => {
                 const { nom, code } = feature.properties;
                 const isSelected = selectedRegion === nom;
                 const isHovered = hoveredDept === nom;
                 
                 return (
                   <g key={code}
                      onMouseEnter={() => setHoveredDept(nom)}
                      onMouseLeave={() => setHoveredDept(null)}
                      onClick={(e) => {
                          e.stopPropagation(); // Avoid triggering zoom events on click if needed
                          onSelect(nom);
                      }}
                      className="cursor-pointer"
                   >
                     <path
                       d={mainPathGenerator(feature) || undefined}
                       fill={isSelected ? highlightColor : (isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255, 255, 255, 0.05)')}
                       stroke={isSelected || isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                       strokeWidth={isSelected ? 1.5 : 0.6}
                       vectorEffect="non-scaling-stroke" // Keeps stroke width constant during zoom
                       className={`transition-colors duration-300 ease-out`}
                       style={{ filter: isSelected ? `drop-shadow(0 0 10px ${highlightColor})` : 'none' }}
                     />
                   </g>
                 );
               })}

               {/* DROM MAPS (Included in zoom to keep layout consistency) */}
               {DROM_CODES.map((code) => {
                 const feature = dromFeatures.find((f: any) => String(f.properties.code) === code);
                 const config = dromConfig[code as keyof typeof dromConfig];
                 if (!config) return null;

                 const isSelected = selectedRegion === config.name;
                 const isHovered = hoveredDept === config.name;
                 const box = config.box as [[number, number], [number, number]];
                 const [x0, y0] = box[0];
                 const [x1, y1] = box[1];
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
                      onClick={(e) => {
                          e.stopPropagation();
                          onSelect(config.name);
                      }}
                      className="cursor-pointer"
                   >
                      <rect 
                        x={x0} y={y0} width={width} height={height} rx={8}
                        fill={isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(30, 40, 50, 0.5)'}
                        stroke={isSelected ? highlightColor : "rgba(255,255,255,0.25)"}
                        strokeWidth={isSelected ? 1.5 : 1}
                        vectorEffect="non-scaling-stroke"
                        className="transition-colors duration-300"
                      />
                      
                      {dAttribute ? (
                        <path 
                          d={dAttribute}
                          fill={isSelected ? highlightColor : (isHovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)')}
                          stroke={isSelected || isHovered ? '#ffffff' : 'rgba(255,255,255,0.6)'}
                          strokeWidth={1.5}
                          vectorEffect="non-scaling-stroke"
                          style={{ filter: isSelected ? `drop-shadow(0 0 8px ${highlightColor})` : 'none' }}
                        />
                      ) : (
                         <text 
                            x={x0 + width/2} 
                            y={y0 + height/2 + 5} 
                            textAnchor="middle" 
                            fill={isSelected ? highlightColor : "rgba(255,255,255,0.2)"}
                            className="font-black font-sport"
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
           </g>
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