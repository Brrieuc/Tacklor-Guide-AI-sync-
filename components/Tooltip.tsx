import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Calculate position relative to the viewport
      setCoords({
        top: rect.top - 8, // Position slightly above the trigger
        left: rect.left + rect.width / 2 // Center horizontally relative to trigger
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <span 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex ml-2 align-middle text-gray-400 cursor-help hover:text-emerald-400 transition-colors text-sm"
      >
        ⓘ
      </span>
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] w-64 p-3 bg-gray-900/95 border border-gray-600/50 text-xs font-sans font-normal normal-case text-gray-300 rounded-lg shadow-xl backdrop-blur-md text-center leading-relaxed pointer-events-none"
          style={{ 
            top: coords.top, 
            left: coords.left,
            transform: 'translate(-50%, -100%)' 
          }}
        >
          {content}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"></div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;