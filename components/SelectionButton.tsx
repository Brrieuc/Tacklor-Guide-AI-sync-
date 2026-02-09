import React from 'react';

interface SelectionButtonProps {
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  isTop?: boolean; // New: Top Sector badge
  glowColor?: string; // New: Dynamic glow color based on time
}

const SelectionButton: React.FC<SelectionButtonProps> = ({ label, icon, selected, onClick, isTop = false, glowColor = '#10b981' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 border-2 group
        ${selected 
          ? 'bg-gray-800/80 transform scale-105' 
          : 'bg-gray-800/40 border-gray-700 hover:border-gray-500 hover:bg-gray-700/60 text-gray-400'
        }
      `}
      style={{
        borderColor: selected ? glowColor : '',
        boxShadow: selected ? `0 0 20px ${glowColor}40` : 'none'
      }}
    >
      {/* Top Sector Badge */}
      {isTop && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-10 animate-pulse-slow">
          ⭐ TOP
        </div>
      )}

      <span 
        className={`text-2xl mb-1 filter drop-shadow-md transition-transform duration-300 ${selected ? 'scale-110' : 'group-hover:scale-110'}`}
      >
        {icon}
      </span>
      
      <span className={`text-xs font-semibold text-center leading-tight ${selected ? 'text-white' : 'text-gray-400'}`}>
        {label}
      </span>
    </button>
  );
};

export default SelectionButton;