
export enum WaterType {
  RIVIERE = 'Rivière',
  FLEUVE = 'Fleuve',
  LAC = 'Lac',
  ETANG = 'Étang',
  CANAL = 'Canal',
  BARRAGE = 'Barrage',
  MER = 'Pleine Mer',
  DIGUE = 'Digue',
  PLAGE = 'Plage',
  FALAISES = 'Falaises',
  PORT = 'Port',
  ESTUAIRE = 'Estuaire'
}

export enum BottomType {
  VASE = 'Vase',
  HERBIERS = 'Herbiers',
  ROCHE = 'Roche',
  SABLE = 'Sable',
  PARCS = 'Parcs Ostréicoles'
}

export enum FishingTechnique {
  LEURRES = 'Leurres',
  APPATS_NATURELS = 'Appâts Naturels'
}

export enum WindDirection {
  N = 'N',   // From Water (Face)
  NE = 'NE',
  E = 'E',   // Side
  SE = 'SE',
  S = 'S',   // From Land (Back)
  SW = 'SW',
  W = 'W',   // Side
  NW = 'NW'
}

export enum GeoZone {
  MEDITERRANEE = 'Méditerranée',
  ATLANTIQUE_MANCHE = 'Atlantique / Manche',
  GUYANE = 'Guyane',
  TROPICAL = 'Tropical (DROM)',
  INTERIEUR = 'Intérieur des terres'
}

export interface SelectionOption {
  id: string;
  label: string;
  icon: string;
  value: string;
}

export interface FishSpeciesOption {
  id: string;
  label: string;
  icon: string; // Emoji or URL
  type: 'freshwater' | 'saltwater' | 'migratory';
  priorityZones?: GeoZone[]; // Zones where this fish is Top Priority
  restrictedToZones?: GeoZone[]; // If present, only visible in these zones
}

export interface FishingConditions {
  month: string;
  weather: number; // 0 (Stormy) to 100 (Full Sun) representing weather spectrum
  time: number; // Minutes from midnight (0 - 1439)
  waterClarity: number; // 0 (Turbid) to 100 (Clear)
  waterType: WaterType | null;
  bottomType: BottomType | null;
  targetFish: string;
  technique: FishingTechnique;
  tideLevel: number; // 0 (Low) -> 50 (High) -> 100 (Low)
  wind: number; // 0 (Calm) to 100 (Stormy)
  waterFlow: number; // 0 (Stagnant) to 100 (Torrent/Strong Current)
  windDirection: WindDirection | null;
  waterSurface: number; // 0 (Mirror) to 100 (Huge Swell)
  pressure: number; // Atmospheric pressure in hPa (default 1013)
  depth: { min: number; max: number }; // Depth range in meters
  region: string | null; // French Region/Dept Name
  coordinates?: { lat: number; lon: number }; // User geolocation
  expertiseLevel: 'beginner' | 'expert'; // New field
}

export interface GeminiResponse {
  strategy: string;
  loading: boolean;
  error: string | null;
}