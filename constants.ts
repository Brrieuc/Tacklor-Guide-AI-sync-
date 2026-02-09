
import { BottomType, FishSpeciesOption, FishingTechnique, GeoZone, SelectionOption, WaterType, WindDirection } from "./types";

export const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Average Sunrise and Sunset times in minutes from midnight (Approximate for Western Europe)
export const SOLAR_TIMES: Record<string, { sunrise: number, sunset: number }> = {
  "Janvier":   { sunrise: 8 * 60 + 40, sunset: 17 * 60 + 30 },
  "Février":   { sunrise: 8 * 60 + 0,  sunset: 18 * 60 + 15 },
  "Mars":      { sunrise: 7 * 60 + 10, sunset: 19 * 60 + 0 },
  "Avril":     { sunrise: 7 * 60 + 0,  sunset: 20 * 60 + 45 },
  "Mai":       { sunrise: 6 * 60 + 15, sunset: 21 * 60 + 30 },
  "Juin":      { sunrise: 5 * 60 + 50, sunset: 22 * 60 + 0 },
  "Juillet":   { sunrise: 6 * 60 + 10, sunset: 21 * 60 + 50 },
  "Août":      { sunrise: 6 * 60 + 50, sunset: 21 * 60 + 0 },
  "Septembre": { sunrise: 7 * 60 + 30, sunset: 20 * 60 + 0 },
  "Octobre":   { sunrise: 8 * 60 + 15, sunset: 18 * 60 + 45 },
  "Novembre":  { sunrise: 8 * 60 + 0,  sunset: 17 * 60 + 30 },
  "Décembre":  { sunrise: 8 * 60 + 45, sunset: 17 * 60 + 0 },
};

export const FRESHWATER_OPTIONS: SelectionOption[] = [
  { id: 'riviere', label: 'Rivière', icon: '🏞️', value: WaterType.RIVIERE },
  { id: 'fleuve', label: 'Fleuve', icon: '⛴️', value: WaterType.FLEUVE },
  { id: 'lac', label: 'Lac', icon: '🛶', value: WaterType.LAC },
  { id: 'etang', label: 'Étang', icon: '🐸', value: WaterType.ETANG },
  { id: 'canal', label: 'Canal', icon: '🏗️', value: WaterType.CANAL },
  { id: 'barrage', label: 'Barrage', icon: '🧱', value: WaterType.BARRAGE },
];

export const SALTWATER_OPTIONS: SelectionOption[] = [
  { id: 'mer', label: 'Pleine Mer', icon: '🚤', value: WaterType.MER },
  { id: 'digue', label: 'Digue', icon: '🧱', value: WaterType.DIGUE },
  { id: 'plage', label: 'Plage', icon: '🏖️', value: WaterType.PLAGE },
  { id: 'falaises', label: 'Falaises', icon: '🪨', value: WaterType.FALAISES },
  { id: 'port', label: 'Port', icon: '⚓', value: WaterType.PORT },
  { id: 'estuaire', label: 'Estuaire', icon: '🦅', value: WaterType.ESTUAIRE },
];

export const ALL_WATER_OPTIONS = [...FRESHWATER_OPTIONS, ...SALTWATER_OPTIONS];

export const BOTTOM_OPTIONS: SelectionOption[] = [
  { id: 'vase', label: 'Vase', icon: '☁️', value: BottomType.VASE },
  { id: 'herbiers', label: 'Herbiers', icon: '🌿', value: BottomType.HERBIERS },
  { id: 'roche', label: 'Roche', icon: '🪨', value: BottomType.ROCHE },
  { id: 'sable', label: 'Sable', icon: '⏳', value: BottomType.SABLE },
  { id: 'parcs', label: 'Parcs Ostréicoles', icon: '🦪', value: BottomType.PARCS },
];

export const TECHNIQUE_OPTIONS: SelectionOption[] = [
  { id: 'leurres', label: 'Leurres', icon: '🎣', value: FishingTechnique.LEURRES },
  { id: 'appats', label: 'Appâts Naturels', icon: '🪱', value: FishingTechnique.APPATS_NATURELS },
];

// --- GEOGRAPHIC DATA ---

export const COASTAL_DEPARTMENTS = [
  // North / Channel
  "Nord", "Pas-de-Calais", "Somme", "Seine-Maritime", "Calvados", "Manche", "Ille-et-Vilaine", "Côtes-d'Armor", "Finistère",
  // Atlantic
  "Morbihan", "Loire-Atlantique", "Vendée", "Charente-Maritime", "Gironde", "Landes", "Pyrénées-Atlantiques",
  // Mediterranean
  "Pyrénées-Orientales", "Aude", "Hérault", "Gard", "Bouches-du-Rhône", "Var", "Alpes-Maritimes", "Haute-Corse", "Corse-du-Sud",
  // DROM
  "Guadeloupe", "Martinique", "Guyane", "La Réunion", "Mayotte"
];

// Mapping Departments to Ecological Zones
export const getZoneFromDepartment = (deptName: string | null): GeoZone => {
  if (!deptName) return GeoZone.INTERIEUR;

  const med = ["Pyrénées-Orientales", "Aude", "Hérault", "Gard", "Bouches-du-Rhône", "Var", "Alpes-Maritimes", "Haute-Corse", "Corse-du-Sud"];
  const atlantique = ["Nord", "Pas-de-Calais", "Somme", "Seine-Maritime", "Calvados", "Manche", "Ille-et-Vilaine", "Côtes-d'Armor", "Finistère", "Morbihan", "Loire-Atlantique", "Vendée", "Charente-Maritime", "Gironde", "Landes", "Pyrénées-Atlantiques"];
  const guyane = ["Guyane"];
  const tropical = ["Guadeloupe", "Martinique", "La Réunion", "Mayotte"];

  if (med.includes(deptName)) return GeoZone.MEDITERRANEE;
  if (atlantique.includes(deptName)) return GeoZone.ATLANTIQUE_MANCHE;
  if (guyane.includes(deptName)) return GeoZone.GUYANE;
  if (tropical.includes(deptName)) return GeoZone.TROPICAL;

  return GeoZone.INTERIEUR;
};

// --- RICH SPECIES DATA ---

// Zones for Metropole
const METROPOLE_ZONES = [GeoZone.INTERIEUR, GeoZone.ATLANTIQUE_MANCHE, GeoZone.MEDITERRANEE];
// Zones for DROM
const DROM_ZONES = [GeoZone.GUYANE, GeoZone.TROPICAL];

export const SPECIES_DB: FishSpeciesOption[] = [
  // --- FRESHWATER (INLAND) ---
  { id: 'brochet', label: "Brochet", icon: "🦈", type: 'freshwater', priorityZones: [GeoZone.INTERIEUR], restrictedToZones: METROPOLE_ZONES },
  { id: 'sandre', label: "Sandre", icon: "🧛", type: 'freshwater', priorityZones: [GeoZone.INTERIEUR], restrictedToZones: METROPOLE_ZONES },
  { id: 'perche', label: "Perche", icon: "🐟", type: 'freshwater', priorityZones: [GeoZone.INTERIEUR], restrictedToZones: METROPOLE_ZONES },
  { id: 'blackbass', label: "Black-Bass", icon: "🐡", type: 'freshwater', restrictedToZones: METROPOLE_ZONES },
  { id: 'silure', label: "Silure", icon: "🐋", type: 'freshwater', restrictedToZones: METROPOLE_ZONES },
  { id: 'chevesne', label: "Chevesne", icon: "🐟", type: 'freshwater', priorityZones: [GeoZone.INTERIEUR], restrictedToZones: METROPOLE_ZONES },
  { id: 'carpe', label: "Carpe", icon: "🎏", type: 'freshwater', restrictedToZones: METROPOLE_ZONES },
  { id: 'truite', label: "Truite", icon: "🐠", type: 'freshwater', priorityZones: [GeoZone.INTERIEUR, GeoZone.ATLANTIQUE_MANCHE], restrictedToZones: METROPOLE_ZONES },
  
  // --- SALTWATER (METROPOLE) ---
  { id: 'bar', label: "Bar (Loup)", icon: "🐺", type: 'saltwater', priorityZones: [GeoZone.ATLANTIQUE_MANCHE, GeoZone.MEDITERRANEE], restrictedToZones: METROPOLE_ZONES },
  { id: 'daurade', label: "Daurade Royale", icon: "👑", type: 'saltwater', priorityZones: [GeoZone.MEDITERRANEE, GeoZone.ATLANTIQUE_MANCHE], restrictedToZones: METROPOLE_ZONES },
  { id: 'lieu', label: "Lieu Jaune", icon: "🟡", type: 'saltwater', priorityZones: [GeoZone.ATLANTIQUE_MANCHE], restrictedToZones: METROPOLE_ZONES },
  { id: 'vieille', label: "Vieille", icon: "🐲", type: 'saltwater', priorityZones: [GeoZone.ATLANTIQUE_MANCHE], restrictedToZones: METROPOLE_ZONES },
  { id: 'maquereau', label: "Maquereau", icon: "⚡", type: 'saltwater', restrictedToZones: METROPOLE_ZONES },
  { id: 'barracuda', label: "Barracuda", icon: "🦷", type: 'saltwater', priorityZones: [GeoZone.MEDITERRANEE], restrictedToZones: METROPOLE_ZONES },
  { id: 'thon', label: "Thon Rouge", icon: "🍣", type: 'saltwater', priorityZones: [GeoZone.MEDITERRANEE, GeoZone.ATLANTIQUE_MANCHE], restrictedToZones: METROPOLE_ZONES },
  
  // --- CEPHALOPODS (NIGHT PRIORITY) ---
  // Available in Metropole, highlighted at night
  { id: 'calamar', label: "Calamar", icon: "🦑", type: 'saltwater', restrictedToZones: METROPOLE_ZONES },
  { id: 'seiche', label: "Seiche", icon: "🐙", type: 'saltwater', restrictedToZones: METROPOLE_ZONES },

  // --- EXOTIC / DROM (GUYANE, REUNION, ANTILLES) ---
  { id: 'espadon', label: "Espadon", icon: "🗡️", type: 'saltwater', priorityZones: [GeoZone.TROPICAL, GeoZone.GUYANE], restrictedToZones: DROM_ZONES },
  { id: 'wahoo', label: "Thon Wahoo", icon: "🚀", type: 'saltwater', priorityZones: [GeoZone.TROPICAL, GeoZone.GUYANE], restrictedToZones: DROM_ZONES },
  { id: 'coryphene', label: "Daurade Coryphène", icon: "🌈", type: 'saltwater', priorityZones: [GeoZone.TROPICAL, GeoZone.GUYANE], restrictedToZones: DROM_ZONES },
  { id: 'tarpon', label: "Tarpon", icon: "🦾", type: 'saltwater', priorityZones: [GeoZone.GUYANE, GeoZone.TROPICAL], restrictedToZones: DROM_ZONES },
  { id: 'acoupa', label: "Acoupa", icon: "🔊", type: 'saltwater', priorityZones: [GeoZone.GUYANE], restrictedToZones: [GeoZone.GUYANE] },
  { id: 'snook', label: "Snook", icon: "📏", type: 'saltwater', priorityZones: [GeoZone.GUYANE, GeoZone.TROPICAL], restrictedToZones: DROM_ZONES },
  { id: 'carangue', label: "Carangue", icon: "🦍", type: 'saltwater', priorityZones: [GeoZone.TROPICAL, GeoZone.GUYANE], restrictedToZones: DROM_ZONES },
];

export const FRESHWATER_SPECIES = SPECIES_DB.filter(s => s.type === 'freshwater').map(s => s.label);
export const SALTWATER_SPECIES = SPECIES_DB.filter(s => s.type === 'saltwater').map(s => s.label);
export const FISH_SPECIES = SPECIES_DB.map(s => s.label);

// --- HELPERS ---

export const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const getWeatherLabel = (val: number): string => {
  if (val < 16) return "Orageux";
  if (val < 32) return "Pluie";
  if (val < 48) return "Temps gris";
  if (val < 64) return "Nuageux";
  if (val < 80) return "Éclaircies";
  return "Plein Soleil";
};

export const getClarityLabel = (val: number): string => {
  if (val < 20) return "Boueuse";
  if (val < 40) return "Trouble";
  if (val < 60) return "Teintée";
  if (val < 80) return "Claire";
  return "Cristalline";
};

export const getTideLabel = (val: number): string => {
  if (val <= 15) return "Basse mer (étale)";
  if (val < 45) return "Montante";
  if (val <= 55) return "Pleine mer (étale)";
  if (val < 85) return "Descendante";
  return "Basse mer (étale)";
};

export const getWindLabel = (val: number): string => {
  if (val < 20) return "Calme plat";
  if (val < 40) return "Brise légère";
  if (val < 60) return "Vent modéré";
  if (val < 80) return "Vent soutenu";
  return "Tempête / Rafales";
};

export const getWaterFlowLabel = (val: number): string => {
  if (val < 20) return "Nul / Stagnant";
  if (val < 40) return "Lent / Faible";
  if (val < 60) return "Moyen";
  if (val < 80) return "Soutenu";
  return "Puissant / Fort";
};

export const getSurfaceLabel = (val: number): string => {
  if (val < 10) return "Miroir / Calme plat";
  if (val < 30) return "Petites rides";
  if (val < 50) return "Vaguelettes / Clapot";
  if (val < 70) return "Vagues modérées";
  if (val < 90) return "Houle prononcée";
  return "Démontée / Écume";
};

export const getWindDirectionLabel = (dir: WindDirection | null): string => {
  switch (dir) {
    case WindDirection.N: return "De face (Venant du large)";
    case WindDirection.NE: return "3/4 Face (Gauche)";
    case WindDirection.E: return "Latéral (Venant de gauche)";
    case WindDirection.SE: return "3/4 Dos (Gauche)";
    case WindDirection.S: return "De dos (Venant de terre)";
    case WindDirection.SW: return "3/4 Dos (Droite)";
    case WindDirection.W: return "Latéral (Venant de droite)";
    case WindDirection.NW: return "3/4 Face (Droite)";
    default: return "Non renseigné";
  }
};

export const getPressureStatus = (val: number): string => {
  if (val < 1005) return "🔴 Basse pression - Poissons potentiellement apathiques ou en profondeur.";
  if (val <= 1015) return "🟡 Pression stable - Conditions normales.";
  return "🟢 Haute pression - Activité de surface possible.";
};

export const isSaltwater = (type: WaterType | null): boolean => {
  if (!type) return false;
  return SALTWATER_OPTIONS.some(opt => opt.value === type);
};
