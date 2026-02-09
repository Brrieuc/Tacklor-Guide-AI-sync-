import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FishingConditions, WaterType, BottomType, FishingTechnique, GeoZone } from './types';
import { 
  FRESHWATER_OPTIONS, 
  SALTWATER_OPTIONS, 
  BOTTOM_OPTIONS, 
  SPECIES_DB,
  MONTHS, 
  SOLAR_TIMES,
  TECHNIQUE_OPTIONS, 
  formatTime, 
  getWeatherLabel, 
  getClarityLabel,
  getWindLabel,
  getWaterFlowLabel,
  getSurfaceLabel,
  isSaltwater,
  getPressureStatus,
  COASTAL_DEPARTMENTS,
  getZoneFromDepartment
} from './constants';
import Slider from './components/Slider';
import TimeSlider from './components/TimeSlider';
import TideSlider from './components/TideSlider';
import RangeSlider from './components/RangeSlider';
import SelectionButton from './components/SelectionButton';
import WindDirectionSelector from './components/WindDirectionSelector';
import FishingLog from './components/FishingLog';
import DynamicBackground from './components/DynamicBackground';
import DynamicHeader from './components/DynamicHeader';
import FranceMap from './components/FranceMap';
import Tooltip from './components/Tooltip';
import ApiKeyModal from './components/ApiKeyModal';
import InfoModal from './components/InfoModal';
import { generateFishingStrategy, isUsingPersonalKey } from './services/geminiService';
import { fetchLocalWeather } from './services/weatherService';

// Feedback Type
type FeedbackStatus = {
  type: 'loading' | 'success' | 'error';
  message: string;
} | null;

const App: React.FC = () => {
  // State
  const [conditions, setConditions] = useState<FishingConditions>({
    month: MONTHS[new Date().getMonth()], // Default to current month
    weather: 50, // Default to Grey/Cloudy
    time: 720, // 12:00 PM
    waterClarity: 50,
    waterType: null,
    bottomType: null,
    targetFish: SPECIES_DB[0].label, // Default to first species
    technique: FishingTechnique.LEURRES, // Default technique
    tideLevel: 50, // Default High Tide
    wind: 20, // Default Light Breeze
    waterFlow: 30, // Default Low Flow
    windDirection: null, // Default null
    waterSurface: 10, // Default Calm/Ripples
    pressure: 1013, // Default Standard Pressure
    depth: { min: 0, max: 10 }, // Default depth range 0-10m
    region: null, // Selected Department
    coordinates: undefined,
    expertiseLevel: 'beginner' // Default to beginner
  });

  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  
  // Settings & Info Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [keyStatusMessage, setKeyStatusMessage] = useState<string>("");
  
  // Geolocation Feedback State
  const [geoStatus, setGeoStatus] = useState<FeedbackStatus>(null);

  // Logic to determine if Expert Mode can be activated
  // Requires: Region, Water Type, Bottom Type, and Wind Direction (Advanced Param)
  const canActivateExpert = useMemo(() => {
    return (
      conditions.region !== null &&
      conditions.waterType !== null &&
      conditions.bottomType !== null &&
      conditions.windDirection !== null
    );
  }, [conditions.region, conditions.waterType, conditions.bottomType, conditions.windDirection]);

  // Auto-downgrade if conditions are cleared while in expert mode
  useEffect(() => {
    if (conditions.expertiseLevel === 'expert' && !canActivateExpert) {
        setConditions(prev => ({ ...prev, expertiseLevel: 'beginner' }));
    }
  }, [canActivateExpert, conditions.expertiseLevel]);

  // Auto-dismiss feedback logic
  useEffect(() => {
    if (geoStatus?.type === 'success' || geoStatus?.type === 'error') {
      const timer = setTimeout(() => {
        setGeoStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [geoStatus]);

  // Handler for Geolocation
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus({ type: 'error', message: "⚠️ La géolocalisation n'est pas supportée." });
      return;
    }

    setGeoStatus({ type: 'loading', message: "🛰️ Connexion aux satellites..." });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const weatherData = await fetchLocalWeather(latitude, longitude);

          setConditions(prev => ({
            ...prev,
            weather: weatherData.weatherScore,
            wind: weatherData.windScore,
            windDirection: weatherData.windDirection,
            time: weatherData.time,
            month: weatherData.month,
            pressure: weatherData.pressure ? Math.round(weatherData.pressure) : 1013,
            region: weatherData.region || prev.region, 
            coordinates: { lat: latitude, lon: longitude }
          }));

          const locationMsg = weatherData.region 
            ? `${weatherData.cityName} (${weatherData.region})` 
            : weatherData.cityName;

          setGeoStatus({ type: 'success', message: `✅ Météo synchronisée pour ${locationMsg} !` });
        } catch (err) {
          console.error(err);
          setGeoStatus({ type: 'error', message: "⚠️ Impossible de récupérer la météo." });
        }
      },
      (err) => {
        if (geoStatus?.type === 'loading') {
             setGeoStatus({ type: 'error', message: "⚠️ Impossible de vous localiser." });
        }
      }
    );
  }, []);

  // Auto-detect location on mount if permission granted
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          handleGeolocation();
        }
      });
    }
  }, [handleGeolocation]);

  // --- GEOGRAPHIC & TIME INTELLIGENCE ---

  const currentZone = useMemo(() => getZoneFromDepartment(conditions.region), [conditions.region]);
  
  const isCoastalRegion = useMemo(() => {
    if (!conditions.region) return true; // Default to allow all if no region selected
    return COASTAL_DEPARTMENTS.includes(conditions.region);
  }, [conditions.region]);

  // Check for Night Phase based on DYNAMIC Solar Times for the selected Month
  const isNight = useMemo(() => {
    const solar = SOLAR_TIMES[conditions.month] || { sunrise: 360, sunset: 1080 };
    return conditions.time >= (solar.sunset + 60) || conditions.time < solar.sunrise;
  }, [conditions.time, conditions.month]);

  // Filter Water Options based on Coastal Status
  const availableSaltwaterOptions = useMemo(() => {
    if (!conditions.region) return SALTWATER_OPTIONS;
    if (isCoastalRegion) return SALTWATER_OPTIONS;
    return [];
  }, [isCoastalRegion, conditions.region]);

  // --- ADVANCED SPECIES SORTING & FILTERING ---
  
  const { nightSuggestions, localSuggestions, otherSuggestions } = useMemo(() => {
    let species = [...SPECIES_DB];

    if (!isCoastalRegion) {
      species = species.filter(s => s.type !== 'saltwater');
    }

    species = species.filter(s => {
      if (!s.restrictedToZones) return true;
      return s.restrictedToZones.includes(currentZone);
    });

    const nightList: typeof species = [];
    const localList: typeof species = [];
    const otherList: typeof species = [];

    species.forEach(s => {
      if (isNight && isCoastalRegion && ['calamar', 'seiche'].includes(s.id)) {
        nightList.push(s);
        return;
      }
      if (s.priorityZones?.includes(currentZone)) {
        localList.push(s);
        return;
      }
      otherList.push(s);
    });

    nightList.sort((a, b) => a.label.localeCompare(b.label));
    localList.sort((a, b) => a.label.localeCompare(b.label));
    otherList.sort((a, b) => a.label.localeCompare(b.label));

    return { nightSuggestions: nightList, localSuggestions: localList, otherSuggestions: otherList };
  }, [currentZone, isCoastalRegion, isNight]);

  useEffect(() => {
    const allVisible = [...nightSuggestions, ...localSuggestions, ...otherSuggestions];
    if (allVisible.length === 0) return;

    const currentIsValid = allVisible.some(s => s.label === conditions.targetFish);

    if (!currentIsValid) {
      if (nightSuggestions.length > 0) {
        setConditions(prev => ({ ...prev, targetFish: nightSuggestions[0].label }));
      } else if (localSuggestions.length > 0) {
        setConditions(prev => ({ ...prev, targetFish: localSuggestions[0].label }));
      } else {
         setConditions(prev => ({ ...prev, targetFish: allVisible[0].label }));
      }
    }
  }, [nightSuggestions, localSuggestions, otherSuggestions, conditions.targetFish]);


  // --- DYNAMIC VISUALS ---

  const dynamicGlowColor = useMemo(() => {
    const t = conditions.time;
    const solar = SOLAR_TIMES[conditions.month] || { sunrise: 360, sunset: 1080 };
    
    if (t >= solar.sunrise - 60 && t < solar.sunrise + 30) return '#fbbf24'; 
    if (t >= solar.sunrise + 30 && t < solar.sunset - 60) return '#06b6d4'; 
    if (t >= solar.sunset - 60 && t < solar.sunset + 60) return '#db2777'; 
    return '#38bdf8'; 
  }, [conditions.time, conditions.month]);

  const isCurrentSaltwater = isSaltwater(conditions.waterType);
  
  const showFlowSlider = useMemo(() => {
    if (!conditions.waterType) return false;
    if (isCurrentSaltwater) return true;
    return [
      WaterType.RIVIERE, 
      WaterType.FLEUVE, 
      WaterType.CANAL, 
      WaterType.BARRAGE
    ].includes(conditions.waterType);
  }, [conditions.waterType, isCurrentSaltwater]);

  const handleWaterTypeSelect = (type: WaterType) => {
    setConditions(prev => ({
      ...prev,
      waterType: type
    }));
  };

  const updateCondition = (key: keyof FishingConditions, value: any) => {
    if (geoStatus?.type === 'error') setGeoStatus(null);
    setConditions(prev => ({...prev, [key]: value}));
  };

  const handleDepthChange = (min: number, max: number) => {
     setConditions(prev => ({...prev, depth: { min, max }}));
  };

  const handleGenerate = useCallback(async () => {
    if (!conditions.waterType || !conditions.bottomType) {
      setError("Veuillez sélectionner un type d'eau et de fond.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult("");
    
    const usingPersonal = isUsingPersonalKey();
    setKeyStatusMessage(usingPersonal ? "Utilisation de votre clé personnelle" : "Utilisation de la clé par défaut");

    // Force validation of Expert Mode logic
    // Even if UI was somehow bypassed, we downgrade payload if criteria aren't met
    let submissionConditions = { ...conditions };
    if (submissionConditions.expertiseLevel === 'expert' && !canActivateExpert) {
        submissionConditions.expertiseLevel = 'beginner';
    }

    try {
      const strategy = await generateFishingStrategy(submissionConditions);
      setResult(strategy);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
      setKeyStatusMessage("");
    }
  }, [conditions, canActivateExpert]);

  return (
    <div className="relative min-h-screen pb-6 overflow-hidden">
      
      <DynamicBackground 
        time={conditions.time} 
        weather={conditions.weather} 
        month={conditions.month} 
      />
      <DynamicHeader 
        time={conditions.time} 
        weather={conditions.weather} 
        month={conditions.month}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      <ApiKeyModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <InfoModal 
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-8 space-y-8">

        {/* Geolocation Section */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <button 
            onClick={handleGeolocation}
            className="flex items-center space-x-2 bg-sky-600/90 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-sky-900/50 transition-all transform hover:scale-105 active:scale-95 border border-sky-400/30 backdrop-blur-sm"
          >
            <span className="text-xl animate-pulse-slow">🌐</span>
            <span>Utiliser ma position</span>
          </button>
          
          {geoStatus && (
            <div className={`
              text-sm font-medium px-4 py-2 rounded-lg shadow-lg border backdrop-blur-md animate-fade-in-down transition-all duration-300
              ${geoStatus.type === 'loading' ? 'bg-blue-900/60 border-blue-500/50 text-blue-200' : ''}
              ${geoStatus.type === 'success' ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-200' : ''}
              ${geoStatus.type === 'error' ? 'bg-red-900/60 border-red-500/50 text-red-200' : ''}
            `}>
              {geoStatus.type === 'loading' && <span className="inline-block mr-2 animate-spin">⏳</span>}
              {geoStatus.message}
            </div>
          )}
        </div>
        
        {/* Environmental Conditions Section */}
        <section className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700/50 shadow-xl backdrop-blur-md">
          <h2 className="text-xl font-semibold text-emerald-400 mb-6 flex items-center font-sport tracking-wide text-shadow-sm">
            <span className="bg-emerald-900/50 p-2 rounded-lg mr-3">🌤️</span> 
            CONDITIONS MÉTÉO
          </h2>
          
          <div className="space-y-6">
            
            {/* France Map */}
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                 <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center">
                   Sélectionnez votre département
                   <Tooltip content="Détermine les espèces présentes localement et les réglementations spécifiques." />
                 </label>
                 {conditions.region && (
                   <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                     Zone: {currentZone} {isCoastalRegion ? '(Littoral)' : '(Intérieur)'}
                   </span>
                 )}
               </div>
               <FranceMap 
                 selectedRegion={conditions.region} 
                 onSelect={(region) => updateCondition('region', region)}
                 time={conditions.time}
                 month={conditions.month}
                 coordinates={conditions.coordinates}
               />
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm flex flex-col space-y-2">
               <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex justify-between items-center">
                 <div className="flex items-center">
                    <span>Période de l'année</span>
                    <Tooltip content="Crucial pour les cycles de reproduction et les migrations saisonnières." />
                 </div>
                 <span className="text-emerald-400 font-mono text-sm">📅</span>
               </label>
               <select 
                  value={conditions.month}
                  onChange={(e) => updateCondition('month', e.target.value)}
                  className="w-full bg-gray-700 border-none text-white text-lg rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
            </div>

            <Slider 
              label="Météo" 
              min={0} 
              max={100} 
              value={conditions.weather} 
              valueLabel={getWeatherLabel(conditions.weather)}
              onChange={(v) => updateCondition('weather', v)}
              leftIcon="⛈️"
              rightIcon="☀️"
              scaleLabels={["Orage", "Pluie", "Gris", "Nuages", "Soleil"]}
              tooltip="La couverture nuageuse influence la méfiance des poissons et la visibilité."
            />

            <TimeSlider 
              label="Heure de la journée" 
              value={conditions.time} 
              month={conditions.month}
              valueLabel={formatTime(conditions.time)}
              onChange={(v) => updateCondition('time', v)}
              tooltip="Détermine les pics d'activité alimentaire et la position des poissons dans l'eau."
            />

            <Slider 
              label="Clarté de l'eau" 
              min={0} 
              max={100} 
              value={conditions.waterClarity} 
              valueLabel={getClarityLabel(conditions.waterClarity)}
              onChange={(v) => updateCondition('waterClarity', v)}
              leftIcon="🟤"
              rightIcon="💎"
              scaleLabels={["Boue", "Trouble", "Teintée", "Claire", "Pure"]}
              tooltip="Aide à choisir la couleur du leurre : flashy en eaux troubles, naturel en eaux claires."
            />
          </div>
        </section>

        {/* Spot Details */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Water Type */}
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700/50 shadow-xl backdrop-blur-md">
             <h2 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center font-sport tracking-wide text-shadow-sm">
              <span className="bg-cyan-900/50 p-2 rounded-lg mr-3">🗺️</span> 
              PLAN D'EAU
              <Tooltip content="Chaque milieu possède ses propres courants et structures de chasse." />
            </h2>
            
            <div className="space-y-4 mb-4">
              {/* Freshwater (Always visible) */}
              <div>
                <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Eau Douce</h3>
                <div className="grid grid-cols-3 gap-2">
                  {FRESHWATER_OPTIONS.map((opt) => (
                    <SelectionButton
                      key={opt.id}
                      label={opt.label}
                      icon={opt.icon}
                      selected={conditions.waterType === opt.value}
                      onClick={() => handleWaterTypeSelect(opt.value as WaterType)}
                      glowColor={dynamicGlowColor}
                    />
                  ))}
                </div>
              </div>

              {/* Saltwater (Filtered or Hidden) */}
              {availableSaltwaterOptions.length > 0 && (
                <div className="transition-all duration-500 ease-out animate-fade-in-up">
                  <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold flex justify-between">
                    Milieu Marin
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSaltwaterOptions.map((opt) => (
                      <SelectionButton
                        key={opt.id}
                        label={opt.label}
                        icon={opt.icon}
                        selected={conditions.waterType === opt.value}
                        onClick={() => handleWaterTypeSelect(opt.value as WaterType)}
                        glowColor={dynamicGlowColor}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isCurrentSaltwater && (
              <div className="animate-fade-in-up mt-6 border-t border-gray-700/50 pt-4">
                <TideSlider 
                  value={conditions.tideLevel}
                  onChange={(v) => updateCondition('tideLevel', v)}
                />
              </div>
            )}
          </div>

          {/* Bottom Type */}
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700/50 shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center font-sport tracking-wide text-shadow-sm">
              <span className="bg-amber-900/50 p-2 rounded-lg mr-3">🌱</span> 
              TYPE DE FOND
              <Tooltip content="Sable, roche ou herbiers ? Détermine où le poisson se cache et évite les accrocs." />
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {BOTTOM_OPTIONS.map((opt) => (
                <SelectionButton
                  key={opt.id}
                  label={opt.label}
                  icon={opt.icon}
                  selected={conditions.bottomType === opt.value}
                  onClick={() => updateCondition('bottomType', opt.value as BottomType)}
                  glowColor={dynamicGlowColor}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Options */}
        <section className="bg-gray-900/60 rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden transition-all duration-300 backdrop-blur-md">
           <button 
             onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
             className="w-full flex items-center justify-between p-6 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
           >
              <div className="flex items-center">
                <span className="bg-gray-700 p-2 rounded-lg mr-3 text-xl">⚙️</span>
                <h2 className="text-lg font-semibold text-gray-300 font-sport tracking-wide text-shadow-sm">
                  OPTIONS AVANCÉES
                </h2>
              </div>
              <span className={`transform transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''} text-gray-400`}>
                ▼
              </span>
           </button>
           
           <div className={`
             transition-all duration-500 ease-in-out overflow-hidden
             ${isAdvancedOpen ? 'max-h-[1000px] opacity-100 p-6 pt-0' : 'max-h-0 opacity-0 p-0'}
           `}>
             <div className="space-y-6 pt-4 border-t border-gray-700/50">
               
               <RangeSlider 
                  label="Profondeur du spot (Zone pêchée)"
                  min={0}
                  max={50}
                  minValue={conditions.depth.min}
                  maxValue={conditions.depth.max}
                  onChange={handleDepthChange}
                  unit="m"
                  leftIcon="🛶"
                  rightIcon="⚓"
                  tooltip="Permet de choisir le grammage du lest et la couche d'eau à prospecter."
               />

               <div className="flex flex-col space-y-2">
                 <Slider 
                    label="Pression Atmosphérique" 
                    min={980} 
                    max={1040} 
                    value={conditions.pressure} 
                    valueLabel={`${conditions.pressure} hPa`}
                    onChange={(v) => updateCondition('pressure', v)}
                    leftIcon="📉"
                    rightIcon="📈"
                    tooltip="Une chute de pression annonce souvent une frénésie alimentaire."
                  />
                  <div className="px-1 text-xs md:text-sm font-medium animate-fade-in-up">
                    <span className="text-gray-400">Tendance : </span>
                    <span className="text-white drop-shadow-md">{getPressureStatus(conditions.pressure)}</span>
                  </div>
               </div>

               <Slider 
                  label="Vent" 
                  min={0} 
                  max={100} 
                  value={conditions.wind} 
                  valueLabel={getWindLabel(conditions.wind)}
                  onChange={(v) => updateCondition('wind', v)}
                  leftIcon="🍃"
                  rightIcon="💨"
                  scaleLabels={["Calme", "Brise", "Moyen", "Fort", "Tempête"]}
                  tooltip="Le vent déplace la nourriture ; l'orientation détermine l'état de la mer."
                />

                <WindDirectionSelector 
                  value={conditions.windDirection}
                  onChange={(dir) => updateCondition('windDirection', dir)}
                  tooltip="Le vent déplace la nourriture ; l'orientation détermine l'état de la mer."
                />

                <Slider 
                  label="Agitation de la surface" 
                  min={0} 
                  max={100} 
                  value={conditions.waterSurface} 
                  valueLabel={getSurfaceLabel(conditions.waterSurface)}
                  onChange={(v) => updateCondition('waterSurface', v)}
                  leftIcon="🪞"
                  rightIcon="🌊"
                  scaleLabels={["Miroir", "Rides", "Clapot", "Vagues", "Houle"]}
                  tooltip="L'écume oxygène l'eau et masque votre présence, rendant les prédateurs agressifs."
                />

                {showFlowSlider && (
                  <Slider 
                    label={isCurrentSaltwater ? "Courant Marin" : "Débit d'eau"} 
                    min={0} 
                    max={100} 
                    value={conditions.waterFlow} 
                    valueLabel={getWaterFlowLabel(conditions.waterFlow)}
                    onChange={(v) => updateCondition('waterFlow', v)}
                    leftIcon="🛁"
                    rightIcon="🌊"
                    scaleLabels={["Nul", "Faible", "Moyen", "Soutenu", "Fort"]}
                  />
                )}
             </div>
           </div>
        </section>

        {/* Target Fish Section - Dropdown Select */}
        <section className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700/50 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center">
                <span className="bg-rose-900/50 p-3 rounded-lg mr-4 text-2xl">🎯</span>
                <div>
                    <h2 className="text-xl font-semibold text-rose-400 font-sport tracking-wide text-shadow-sm flex items-center">
                      CIBLE
                      <Tooltip content="Donnée centrale pour adapter la technique à la physiologie du poisson." />
                    </h2>
                    <p className="text-sm text-gray-300">Espèce recherchée</p>
                </div>
             </div>
             
             <div className="w-full md:w-1/2 relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400 animate-pulse">
                  ▼
                </div>
                <select 
                  value={conditions.targetFish}
                  onChange={(e) => updateCondition('targetFish', e.target.value)}
                  className="w-full appearance-none bg-gray-800/80 border border-gray-600 text-white text-lg rounded-xl p-4 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-sport tracking-wide shadow-inner cursor-pointer"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                >
                   {/* GROUP 1: NIGHT SUGGESTIONS (Conditional) */}
                   {nightSuggestions.length > 0 && (
                     <optgroup label="🌙 Suggestions Nocturnes (Prioritaires)">
                       {nightSuggestions.map(s => (
                         <option key={s.id} value={s.label}>{s.label}</option>
                       ))}
                     </optgroup>
                   )}

                   {/* GROUP 2: LOCAL PRIORITY */}
                   {localSuggestions.length > 0 && (
                     <optgroup label={`⭐ Suggestions Locales (${currentZone})`}>
                       {localSuggestions.map(s => (
                         <option key={s.id} value={s.label}>{s.label}</option>
                       ))}
                     </optgroup>
                   )}

                   {/* GROUP 3: ALL OTHERS */}
                   {otherSuggestions.length > 0 && (
                     <optgroup label="🐟 Toutes les espèces">
                       {otherSuggestions.map(s => (
                         <option key={s.id} value={s.label}>{s.label}</option>
                       ))}
                     </optgroup>
                   )}
                </select>
             </div>
          </div>
        </section>

        {/* Technique */}
        <section className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700/50 shadow-xl backdrop-blur-md">
           <h2 className="text-xl font-semibold text-purple-400 mb-6 flex items-center font-sport tracking-wide text-shadow-sm">
            <span className="bg-purple-900/50 p-2 rounded-lg mr-3">🎣</span> 
            TECHNIQUE
            <Tooltip content="Définit votre style de pêche pour une animation personnalisée." />
          </h2>
           <div className="grid grid-cols-2 gap-4">
              {TECHNIQUE_OPTIONS.map((opt) => (
                <SelectionButton
                  key={opt.id}
                  label={opt.label}
                  icon={opt.icon}
                  selected={conditions.technique === opt.value}
                  onClick={() => updateCondition('technique', opt.value as FishingTechnique)}
                  glowColor={dynamicGlowColor}
                />
              ))}
            </div>
        </section>

        {/* Action Button & Expert Switch */}
        <div className="flex flex-col items-center pt-4">
          
          {/* EXPERT MODE TOGGLE */}
          <div className="flex flex-col items-center mb-6 w-full">
            <div 
              className="bg-gray-900/40 border border-gray-700/50 backdrop-blur-md rounded-full px-6 py-2 flex items-center space-x-4 shadow-lg transition-all duration-300"
            >
               <span className={`text-xs font-bold tracking-wider transition-colors duration-300 ${conditions.expertiseLevel !== 'expert' ? 'text-emerald-400' : 'text-gray-500'}`}>
                 SIMPLE
               </span>
               
               <button 
                 onClick={() => {
                   if (!canActivateExpert && conditions.expertiseLevel !== 'expert') return;
                   updateCondition('expertiseLevel', conditions.expertiseLevel === 'expert' ? 'beginner' : 'expert');
                 }}
                 disabled={!canActivateExpert && conditions.expertiseLevel !== 'expert'}
                 className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none flex items-center ${conditions.expertiseLevel === 'expert' ? 'bg-emerald-600' : 'bg-gray-600'} ${!canActivateExpert ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                 aria-label="Toggle Expert Mode"
               >
                  <div 
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${conditions.expertiseLevel === 'expert' ? 'translate-x-6' : 'translate-x-0'}`}
                  />
               </button>
               
               <div className="flex items-center space-x-2">
                   <span className={`text-xs font-bold tracking-wider transition-colors duration-300 ${conditions.expertiseLevel === 'expert' ? 'text-emerald-400' : 'text-gray-500'} ${!canActivateExpert ? 'opacity-50' : ''}`}>
                     EXPERT
                   </span>
                   {!canActivateExpert && (
                     <span title="Mode verrouillé : Paramètres incomplets">🔒</span>
                   )}
               </div>
            </div>

            {/* Warning Message if locked */}
            {!canActivateExpert && (
              <div className="mt-2 text-[10px] md:text-xs text-amber-400/90 bg-amber-900/30 px-3 py-1.5 rounded border border-amber-600/30 animate-fade-in-up text-center max-w-sm">
                 ⚠️ Le mode Expert nécessite de renseigner tous les paramètres avancés pour une analyse précise.
              </div>
            )}
          </div>
          
          {/* Key Status Message (During Loading) */}
          {loading && keyStatusMessage && (
            <div className="mb-3 text-xs font-mono text-cyan-300/80 animate-pulse">
               ⚡ {keyStatusMessage}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`
              relative overflow-hidden group w-full md:w-2/3 py-4 rounded-xl text-xl font-bold tracking-wide shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] font-sport uppercase
              ${loading 
                ? 'bg-gray-600 cursor-not-allowed opacity-80' 
                : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white ring-1 ring-white/20'
              }
            `}
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? 'ANALYSE EN COURS...' : 'OPTIMISER MON APPROCHE'}
            </span>
            {!loading && (
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
          </button>
          
          {error && (
            <div className="mt-4 flex items-center justify-center">
              <p className="text-red-300 bg-red-900/60 px-6 py-3 rounded-lg border border-red-800/50 backdrop-blur-sm text-sm text-center shadow-lg">
                {error}
                {/* Suggest opening settings if key error */}
                {(error.toLowerCase().includes('clé') || error.toLowerCase().includes('quota')) && (
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="block mt-2 mx-auto text-xs underline text-white hover:text-red-200"
                  >
                    Ouvrir les paramètres
                  </button>
                )}
              </p>
            </div>
          )}
        </div>

        <FishingLog strategy={result} loading={loading} />

        {/* Credits Footer */}
        <footer className="py-6 text-center text-xs text-gray-500 font-mono tracking-wider opacity-60 hover:opacity-100 transition-opacity">
          © By Brieuc Pecqueraux, Techstronauts and Tacklor
        </footer>

      </main>
    </div>
  );
};

export default App;