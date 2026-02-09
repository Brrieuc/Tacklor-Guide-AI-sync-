import { WindDirection } from "../types";
import { MONTHS } from "../constants";

const OWM_API_KEY = "997ca92872831e3e603ea067ddfb5dff";

export interface WeatherData {
  weatherScore: number; // 0-100
  windScore: number; // 0-100
  windDirection: WindDirection;
  time: number; // minutes from midnight
  month: string;
  cityName: string;
  pressure: number; // hPa
  region: string | null;
}

// Helper to convert degrees to WindDirection enum
const getWindDirectionFromDegrees = (deg: number): WindDirection => {
  const directions = [
    WindDirection.N, WindDirection.NE, WindDirection.E, WindDirection.SE,
    WindDirection.S, WindDirection.SW, WindDirection.W, WindDirection.NW
  ];
  // Adjust so that 0 is N, etc. Each sector is 45 degrees.
  const index = Math.floor(((deg + 22.5) % 360) / 45);
  return directions[index];
};

// OpenWeatherMap Helpers
const mapOwmConditionToScore = (id: number): number => {
  if (id >= 200 && id < 300) return 10; // Thunderstorm
  if (id >= 300 && id < 400) return 25; // Drizzle
  if (id >= 500 && id < 600) return 20; // Rain
  if (id >= 600 && id < 700) return 35; // Snow
  if (id >= 700 && id < 800) return 40; // Atmosphere
  if (id === 800) return 95; // Clear
  if (id === 801) return 85; // Few clouds
  if (id === 802) return 70; // Scattered
  if (id === 803) return 60; // Broken
  if (id === 804) return 50; // Overcast
  return 50;
};

// Open-Meteo Helpers (WMO Codes) - Fallback
const mapWmoCodeToScore = (code: number): number => {
  if (code === 0) return 95; // Clear sky
  if (code <= 3) return 70; // Mainly clear, partly cloudy, overcast
  if (code <= 48) return 40; // Fog
  if (code <= 67) return 25; // Drizzle/Rain
  if (code <= 77) return 35; // Snow
  if (code <= 82) return 25; // Rain showers
  if (code <= 99) return 10; // Thunderstorm
  return 50;
};

const mapWindSpeedToScore = (speed: number): number => {
  // speed in m/s. 0-20 m/s scale mapped to 0-100.
  const score = speed * 5; 
  return Math.min(Math.max(score, 0), 100);
};

// Fetch Department from French Government API
// We switch from 'region' to 'departement' to match the Map keys (e.g., "Gironde", "Finistère")
const fetchRegionFromGeoGouv = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const response = await fetch(`https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=departement&format=json&geometry=centre`);
    if (response.ok) {
        const data = await response.json();
        // The API returns an array, we take the first matching commune
        if (data && data.length > 0 && data[0].departement) {
            return data[0].departement.nom;
        }
    }
    return null;
  } catch (e) {
    console.warn("GeoGouv API failed:", e);
    return null;
  }
};

export const fetchLocalWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  const now = new Date();
  const time = now.getHours() * 60 + now.getMinutes();
  const month = MONTHS[now.getMonth()];

  let weatherData: Partial<WeatherData> = {
    time,
    month,
  };

  // Parallel fetch for Weather and Region/Department
  const [weatherResponse, deptName] = await Promise.all([
    // 1. Try OpenWeatherMap (Primary)
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=fr`)
      .then(res => res.ok ? res.json() : null)
      .catch(() => null),
    fetchRegionFromGeoGouv(lat, lon)
  ]);

  if (weatherResponse) {
      // OWM Success
      return {
        weatherScore: mapOwmConditionToScore(weatherResponse.weather[0].id),
        windScore: mapWindSpeedToScore(weatherResponse.wind.speed),
        windDirection: getWindDirectionFromDegrees(weatherResponse.wind.deg),
        time,
        month,
        cityName: weatherResponse.name,
        pressure: weatherResponse.main.pressure,
        region: deptName // This is now the Department name (e.g., "Gironde")
      };
  }

  // 2. Fallback to Open-Meteo if OWM fails
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=surface_pressure,weather_code,wind_speed_10m,wind_direction_10m&wind_speed_unit=ms`
    );

    if (!response.ok) {
       throw new Error(`Open-Meteo Error: ${response.statusText}`);
    }

    const data = await response.json();
    const current = data.current;

    return {
      weatherScore: mapWmoCodeToScore(current.weather_code),
      windScore: mapWindSpeedToScore(current.wind_speed_10m),
      windDirection: getWindDirectionFromDegrees(current.wind_direction_10m),
      time,
      month,
      cityName: "Position actuelle", 
      pressure: current.surface_pressure,
      region: deptName
    };

  } catch (error) {
    console.error("All weather services failed:", error);
    throw new Error("Impossible de récupérer la météo (Services indisponibles).");
  }
};