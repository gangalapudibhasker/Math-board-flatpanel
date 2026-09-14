import React, { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Move, EyeOff, Eye } from 'lucide-react';

interface SpotlightToolProps {
  onClose: () => void;
}

export const SpotlightTool: React.FC<SpotlightToolProps> = ({ onClose }) => {
  const [pos, setPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [radius, setRadius] = useState(150);
  const [hideMiddleOptions, setHideMiddleOptions] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* SVG Mask cutting out a transparent hole */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <circle cx={pos.x} cy={pos.y} r={radius} fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10, 15, 30, 0.82)"
          mask="url(#spotlight-mask)"
        />
        {/* Glow border ring around the spotlight */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={radius}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeDasharray="6 3"
          opacity="0.8"
        />
      </svg>

      {/* When middle options are hidden: Allow dragging from the spotlight edge ring */}
      {hideMiddleOptions && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            left: `${pos.x - radius}px`,
            top: `${pos.y - radius}px`,
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
          }}
          className="absolute rounded-full pointer-events-auto cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-sky-400/40 transition"
          title="Drag to move spotlight"
        />
      )}

      {/* Floating Bar when Middle Options are Hidden */}
      {hideMiddleOptions ? (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 bg-slate-900/95 border border-slate-700/90 px-3.5 py-1.5 rounded-full text-xs text-slate-200 shadow-2xl backdrop-blur-md z-50">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-300">Clean Spotlight (Middle options hidden)</span>
          <button
            onClick={() => setHideMiddleOptions(false)}
            className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 rounded-full text-white text-[10px] font-bold shadow-sm transition active:scale-95"
            title="Show middle options handle & controls"
          >
            <Eye className="w-3 h-3" />
            Show Middle Options
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-rose-600 text-rose-300 hover:text-white rounded-full transition"
            title="Close Spotlight"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Draggable Center Disc & Controls (Middle Options) */
        <div
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center justify-center transition-all"
        >
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-14 h-14 rounded-full bg-slate-900/60 hover:bg-slate-900/80 border border-sky-400/50 backdrop-blur-xs flex items-center justify-center text-sky-400 cursor-move shadow-lg active:scale-95 transition"
            title="Drag Spotlight across screen"
          >
            <Move className="w-5 h-5" />
          </div>

          {/* Floating Mini Controls Pill */}
          <div className="mt-2 flex items-center gap-1.5 bg-slate-900/95 px-2.5 py-1 rounded-full border border-slate-700 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setRadius(r => Math.max(70, r - 30))}
              className="p-1 text-slate-300 hover:text-white rounded-full hover:bg-slate-800"
              title="Shrink Spotlight"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-sky-300 px-1">{radius}px</span>
            <button
              onClick={() => setRadius(r => Math.min(350, r + 30))}
              className="p-1 text-slate-300 hover:text-white rounded-full hover:bg-slate-800"
              title="Expand Spotlight"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

            {/* Hide Middle Options Button */}
            <button
              onClick={() => setHideMiddleOptions(true)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 rounded-full text-[10px] font-semibold transition"
              title="Hide middle options for an unobstructed spotlight view"
            >
              <EyeOff className="w-3 h-3" />
              <span>Hide</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-rose-400 hover:text-white rounded-full hover:bg-rose-600/80 ml-0.5 transition"
              title="Close Spotlight"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
