import React, { useRef, useState, useEffect } from 'react';

interface SliderProps {
  value: number; // 0 to 100
  onChange: (value: number) => void;
  className?: string;
  barColor?: string;
}

export const Slider: React.FC<SliderProps> = ({ value, onChange, className = '', barColor = 'bg-primary' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e.clientX);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    updateValue(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateValue(e.touches[0].clientX);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    updateValue(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  };

  const updateValue = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setLocalValue(percentage);
      onChange(percentage);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer group touch-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Filled Bar */}
      <div 
        className={`absolute top-0 left-0 h-full rounded-full ${barColor} group-hover:brightness-110 shadow-[0_0_8px_rgba(168,85,247,0.3)]
        ${isDragging ? 'transition-none' : 'transition-all duration-500 cubic-bezier(0.25, 0.8, 0.25, 1)'}`}
        style={{ width: `${localValue}%` }}
      />
      
      {/* Handle */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.6)] transform 
          ${isDragging ? 'transition-none scale-125 opacity-100' : 'transition-all duration-300 ease-out scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}
        style={{ left: `${localValue}%`, marginLeft: '-7px' }}
      />
    </div>
  );
};