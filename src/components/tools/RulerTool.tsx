import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, X, Move } from 'lucide-react';

interface RulerToolProps {
  onClose: () => void;
}

export const RulerTool: React.FC<RulerToolProps> = ({ onClose }) => {
  const [pos, setPos] = useState({ x: 200, y: 300 });
  const [rotation, setRotation] = useState(0);
  const [length, setLength] = useState(520); // px (resizable / reducible)
  const isDragging = useRef(false);
  const isRotating = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotateStart = useRef({ angle: 0, startRotation: 0 });

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerDownRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    isRotating.current = true;
    const center = { x: pos.x + length / 2, y: pos.y + 35 };
    const currentAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
    rotateStart.current = { angle: currentAngle, startRotation: rotation };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      setPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    } else if (isRotating.current) {
      const center = { x: pos.x + length / 2, y: pos.y + 35 };
      const currentAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
      const delta = currentAngle - rotateStart.current.angle;
      setRotation(Math.round((rotateStart.current.startRotation + delta) % 360));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current || isRotating.current) {
      isDragging.current = false;
      isRotating.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Generate cm and mm marks
  const cmCount = Math.floor(length / 30);
  const marks = [];
  for (let i = 0; i <= cmCount; i++) {
    const x = 30 + i * 26;
    marks.push(
      <g key={`cm-${i}`}>
        <line x1={x} y1="0" x2={x} y2="24" stroke="#0284c7" strokeWidth="2" />
        <text x={x} y="36" fontSize="11" fill="#0369a1" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
          {i}
        </text>
        {/* mm marks */}
        {i < cmCount && (
          <>
            <line x1={x + 5.2} y1="0" x2={x + 5.2} y2="10" stroke="#0ea5e9" strokeWidth="1" />
            <line x1={x + 10.4} y1="0" x2={x + 10.4} y2="10" stroke="#0ea5e9" strokeWidth="1" />
            <line x1={x + 13.0} y1="0" x2={x + 13.0} y2="16" stroke="#0ea5e9" strokeWidth="1.5" />
            <line x1={x + 15.6} y1="0" x2={x + 15.6} y2="10" stroke="#0ea5e9" strokeWidth="1" />
            <line x1={x + 20.8} y1="0" x2={x + 20.8} y2="10" stroke="#0ea5e9" strokeWidth="1" />
          </>
        )}
      </g>
    );
  }

  return (
    <div
      className="absolute z-30 select-none shadow-2xl transition-shadow group"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${length}px`,
        height: '74px',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Acrylic Glass Body */}
      <div 
        onPointerDown={handlePointerDownDrag}
        className="w-full h-full rounded-md border-2 border-sky-400/80 bg-sky-100/40 backdrop-blur-md relative cursor-move flex items-center overflow-hidden"
        style={{
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        }}
      >
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          {marks}
          <text x={length - 45} y="54" fontSize="10" fill="#0369a1" fontWeight="bold">
            cm
          </text>
        </svg>

        {/* Center Grab Handle & Angle Indicator & Size Controls */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-full text-white text-xs backdrop-blur-xs border border-slate-700 shadow-md">
          <Move className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-mono font-bold text-[11px] text-sky-300">
            {rotation > 0 ? `+${rotation}°` : `${rotation}°`}
          </span>

          {/* Reduce size button */}
          <button
            onClick={e => {
              e.stopPropagation();
              setLength(l => Math.max(300, l - 80));
            }}
            className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white text-[11px] font-bold"
            title="Reduce ruler size (-80px)"
          >
            -
          </button>
          <span className="text-[10px] text-slate-400 font-mono">{Math.floor(length / 30)}cm</span>
          {/* Increase size button */}
          <button
            onClick={e => {
              e.stopPropagation();
              setLength(l => Math.min(900, l + 80));
            }}
            className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white text-[11px] font-bold"
            title="Increase ruler size (+80px)"
          >
            +
          </button>

          {/* Rotate trigger */}
          <button
            onPointerDown={handlePointerDownRotate}
            className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white cursor-grab active:cursor-grabbing"
            title="Drag to Rotate Ruler"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          {/* Close button */}
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-rose-500/50 rounded-full text-slate-300 hover:text-rose-200"
            title="Close Ruler"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
