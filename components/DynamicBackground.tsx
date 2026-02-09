import React, { useMemo, useEffect, useState } from 'react';
import { SOLAR_TIMES } from '../constants';

interface DynamicBackgroundProps {
  time: number; // 0 - 1439
  weather: number; // 0 - 100
  month: string;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ time, weather, month }) => {
  const [stars, setStars] = useState<{ top: string; left: string; size: string; opacity: number }[]>([]);

  // Generate stars only once
  useEffect(() => {
    const starCount = 80;
    const newStars = Array.from({ length: starCount }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      opacity: Math.random() * 0.8 + 0.2
    }));
    setStars(newStars);
  }, []);

  // --- SEASONAL SOLAR LOGIC ---
  const { gradient, phase, angle } = useMemo(() => {
    // Get solar times for the selected month (or default)
    const solar = SOLAR_TIMES[month] || { sunrise: 360, sunset: 1080 };
    const { sunrise, sunset } = solar;

    // Define Phases based on dynamic solar times
    const dawnStart = sunrise - 60;
    const dawnEnd = sunrise;
    const duskStart = sunset - 60;
    const duskEnd = sunset + 60; // Twilight extends past sunset

    let colors = [];
    let currentPhase = 'night';
    let currentAngle = 180; // Default Top-to-Bottom for night

    // Calculate dynamic sun angle (Zenith at noon relative to day length)
    // Map time from dawnStart to duskEnd to 90deg -> 270deg
    if (time >= dawnStart && time <= duskEnd) {
       const totalDayLight = duskEnd - dawnStart;
       const progress = (time - dawnStart) / totalDayLight;
       currentAngle = 90 + (progress * 180);
    } else if (time > duskEnd && time < duskEnd + 60) {
       currentAngle = 270;
    }

    // --- PHASE & COLOR LOGIC ---

    if (time < dawnStart) {
      // NIGHT (Before Dawn)
      currentPhase = 'night';
      colors = ['#020617', '#0f172a', '#1e293b']; // Deep Black -> Slate
    } 
    else if (time >= dawnStart && time < dawnEnd) {
      // DAWN (1h before Sunrise) - Transition Black -> Indigo -> Orange
      currentPhase = 'dawn';
      // Calculate progress within dawn for smoother gradient interpolation (simplified here via predefined steps)
      if (time < dawnStart + 30) {
         colors = ['#1e1b4b', '#312e81', '#4c1d95']; // Deep Indigo -> Violet
      } else {
         colors = ['#312e81', '#be185d', '#fbbf24']; // Indigo -> Pink -> Amber (Sunrise approach)
      }
    } 
    else if (time >= dawnEnd && time < duskStart) {
      // DAY (Sunrise to Golden Hour)
      currentPhase = 'day';
      // Check proximity to noon (Zenith)
      const noon = sunrise + (sunset - sunrise) / 2;
      const distFromNoon = Math.abs(time - noon);
      
      if (distFromNoon < 120) {
        // High Noon (Brightest)
        colors = ['#ffffff', '#0ea5e9', '#0284c7']; // White -> Sky Blue
      } else {
        // Standard Day
        colors = ['#fef08a', '#38bdf8', '#0369a1']; // Soft Yellow -> Blue -> Deep Sky
      }
    } 
    else if (time >= duskStart && time <= duskEnd) {
      // DUSK / GOLDEN HOUR (1h before Sunset to 1h after)
      currentPhase = 'dusk';
      if (time < sunset) {
        // Golden Hour
        colors = ['#fb923c', '#f43f5e', '#7c3aed']; // Orange -> Rose -> Purple
      } else {
        // Twilight / Afterglow
        colors = ['#9f1239', '#4c1d95', '#1e1b4b']; // Deep Red -> Purple -> Deep Indigo
      }
    } 
    else {
      // NIGHT (After Dusk)
      currentPhase = 'night';
      colors = ['#0f172a', '#020617', '#000000']; // Slate -> Pitch Black
    }

    const gradientStr = `linear-gradient(${Math.round(currentAngle)}deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;

    return { gradient: gradientStr, phase: currentPhase, angle: currentAngle };
  }, [time, month]);

  // --- WEATHER OVERLAY LOGIC ---
  const weatherOverlayColor = useMemo(() => {
    if (weather < 30) return 'rgba(15, 23, 42, 0.85)'; // Heavy Storm
    if (weather < 60) return 'rgba(71, 85, 105, 0.5)'; // Cloudy
    if (weather < 85) return 'rgba(148, 163, 184, 0.2)'; // Light Cloud
    return 'rgba(255, 255, 255, 0.0)'; // Clear
  }, [weather]);

  // --- SUN/MOON POSITION LOGIC ---
  const celestialBody = useMemo(() => {
    const solar = SOLAR_TIMES[month] || { sunrise: 360, sunset: 1080 };
    const { sunrise, sunset } = solar;
    
    // Day duration
    const dayDuration = sunset - sunrise;
    
    // Is it day?
    const isDay = time >= sunrise && time <= sunset;
    
    let x, y, opacity, display, boxShadow, background;

    if (isDay) {
       // SUN LOGIC
       const progress = (time - sunrise) / dayDuration; // 0 to 1
       x = (progress * 120) - 10; // -10% to 110%
       
       // Arc: sin(0) = 0, sin(PI/2) = 1, sin(PI) = 0
       const heightFactor = Math.sin(progress * Math.PI);
       y = 100 - (heightFactor * 90); // 100% (bottom) to 10% (top)
       
       opacity = weather < 40 ? 0.2 : 1;
       display = 'block';
       background = 'radial-gradient(circle, rgba(255,255,255,1) 15%, rgba(253,224,71,0.6) 45%, rgba(255,255,255,0) 70%)';
       boxShadow = '0 0 100px 50px rgba(255, 255, 200, 0.3)';

    } else {
       // MOON LOGIC (Simpler traverse during night)
       // Normalize night time to 0-1 range roughly
       let nightProgress = 0;
       const nightDuration = 1440 - dayDuration;
       
       if (time > sunset) {
         nightProgress = (time - sunset) / nightDuration;
       } else {
         nightProgress = (time + (1440 - sunset)) / nightDuration;
       }
       
       // Moon moves slower or just hangs high
       x = (nightProgress * 100); 
       y = 20; // Stays high
       
       opacity = weather < 30 ? 0 : 0.8;
       display = 'block';
       background = 'radial-gradient(circle, rgba(255,255,255,0.9) 20%, rgba(200,200,255,0.4) 50%, rgba(255,255,255,0) 70%)';
       boxShadow = '0 0 60px 20px rgba(200, 200, 255, 0.15)'; // Subtle lunar halo
    }

    return { x, y, opacity, display, background, boxShadow };
  }, [time, month, weather]);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-gray-900">
      
      {/* 1. Base Gradient Layer (Time & Angle) */}
      <div 
        className="absolute inset-0 transition-all duration-[1000ms] ease-out will-change-[background]"
        style={{ background: gradient }}
      />

      {/* 2. Stars Layer (Night only) */}
      <div 
        className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
        style={{ opacity: phase === 'night' ? 1 : 0 }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse-slow"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* 3. Celestial Body (Sun/Moon) */}
      <div 
        className="absolute rounded-full filter blur-2xl transition-all duration-[1000ms] ease-linear will-change-transform"
        style={{
          display: celestialBody.display,
          left: `calc(${celestialBody.x}% - 75px)`, 
          top: `calc(${celestialBody.y}% - 75px)`,
          width: '150px',
          height: '150px',
          background: celestialBody.background,
          boxShadow: celestialBody.boxShadow,
          opacity: celestialBody.opacity
        }}
      />

      {/* 4. Weather Overlay Layer */}
      <div 
        className="absolute inset-0 transition-colors duration-[1500ms] ease-in-out"
        style={{ backgroundColor: weatherOverlayColor }}
      />

      {/* 5. Rain/Noise Effect */}
      <div 
        className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out mix-blend-overlay"
        style={{ opacity: weather < 30 ? 0.2 : 0 }}
      >
         <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiAvPgo8L3N2Zz4=')]"></div>
      </div>

    </div>
  );
};

export default DynamicBackground;