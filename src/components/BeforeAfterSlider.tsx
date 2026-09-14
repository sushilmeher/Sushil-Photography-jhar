import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=70&sat=-50',
  afterImage = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=90',
  beforeLabel = 'Original / Unedited',
  afterLabel = 'Master Retouched (Sushil Studio)',
  title = 'High-End Frequency Separation & Cinematic Color Tone',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percent);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      {title && (
        <div className="flex items-center justify-between mb-3 text-xs sm:text-sm">
          <span className="font-cinzel text-zinc-300 font-semibold tracking-wide flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            {title}
          </span>
          <span className="text-zinc-500 hidden sm:inline">Drag handle left & right to compare</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-[#272732] shadow-2xl bg-black"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background full) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              height: '100%',
              filter: 'grayscale(20%) contrast(90%) brightness(95%)',
            }}
          />
        </div>

        {/* Divider line & handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#d4af37] via-white to-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.8)] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#121216] border-2 border-[#d4af37] shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
            <MoveHorizontal className="w-4 h-4 text-[#d4af37]" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[11px] font-semibold text-zinc-300">
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-md bg-[#121216]/80 backdrop-blur-sm border border-[#d4af37]/40 text-[11px] font-semibold text-[#f5e7b2]">
          {afterLabel}
        </div>

        {/* Bottom subtle hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-zinc-400 pointer-events-none">
          Slide to reveal Sushil Studio Retouching
        </div>
      </div>
    </div>
  );
};
