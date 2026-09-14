import React, { useState, useRef } from 'react';
import { RotateCw, X, Move } from 'lucide-react';

interface ProtractorToolProps {
  onClose: () => void;
}

export const ProtractorTool: React.FC<ProtractorToolProps> = ({ onClose }) => {
  const [pos, setPos] = useState({ x: 350, y: 250 });
  const [rotation, setRotation] = useState(0);
  const [armAngle, setArmAngle] = useState(45); // Target angle on protractor
  const [radius, setRadius] = useState(180); // px radius (resizable / reducible)

  const isDragging = useRef(false);
  const isRotatingProtractor = useRef(false);
  const isDraggingArm = useRef(false);
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
    isRotatingProtractor.current = true;
    const center = { x: pos.x + radius, y: pos.y + radius };
    const currentAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
    rotateStart.current = { angle: currentAngle, startRotation: rotation };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerDownArm = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingArm.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      setPos({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    } else if (isRotatingProtractor.current) {
      const center = { x: pos.x + radius, y: pos.y + radius };
      const currentAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
      const delta = currentAngle - rotateStart.current.angle;
      setRotation(Math.round((rotateStart.current.startRotation + delta) % 360));
    } else if (isDraggingArm.current) {
      const center = { x: pos.x + radius, y: pos.y + radius };
      // Arm angle relative to protractor base
      const rawAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
      let relAngle = -(rawAngle - rotation);
      while (relAngle < 0) relAngle += 360;
      relAngle = relAngle % 360;
      if (relAngle <= 180) {
        setArmAngle(Math.round(relAngle));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    isRotatingProtractor.current = false;
    isDraggingArm.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Generate degree ticks for 0..180
  const ticks = [];
  for (let deg = 0; deg <= 180; deg += 5) {
    const rad = (deg * Math.PI) / 180;
    const is10 = deg % 10 === 0;
    const tickLen = is10 ? 14 : 7;
    const r1 = radius - 5;
    const r2 = radius - 5 - tickLen;
    // Note: math coords 0° on right, 180° on left, semi-circle is top half (negative Y)
    const x1 = radius + r1 * Math.cos(Math.PI - rad);
    const y1 = radius - r1 * Math.sin(Math.PI - rad);
    const x2 = radius + r2 * Math.cos(Math.PI - rad);
    const y2 = radius - r2 * Math.sin(Math.PI - rad);

    ticks.push(
      <line
        key={`tick-${deg}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#0284c7"
        strokeWidth={is10 ? '1.5' : '0.8'}
      />
    );

    if (is10 && deg > 0 && deg < 180) {
      const rText = radius - 28;
      const tx = radius + rText * Math.cos(Math.PI - rad);
      const ty = radius - rText * Math.sin(Math.PI - rad) + 4;
      ticks.push(
        <text
          key={`num-${deg}`}
          x={tx}
          y={ty}
          fontSize="9"
          fontWeight="bold"
          fill="#0369a1"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          {deg}°
        </text>
      );
    }
  }

  // Arm calculation
  const armRad = (armAngle * Math.PI) / 180;
  const armEndX = radius + (radius + 15) * Math.cos(Math.PI - armRad);
  const armEndY = radius - (radius + 15) * Math.sin(Math.PI - armRad);

  return (
    <div
      className="absolute z-30 select-none drop-shadow-2xl"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${radius * 2}px`,
        height: `${radius + 30}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: `${radius}px ${radius}px`,
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Semi-circle Acrylic Body */}
      <div 
        onPointerDown={handlePointerDownDrag}
        className="w-full h-full relative cursor-move"
      >
        <svg
          viewBox={`0 0 ${radius * 2} ${radius + 30}`}
          className="w-full h-full filter drop-shadow-lg pointer-events-none"
        >
          {/* Glass fill semi-circle */}
          <path
            d={`M 15 ${radius} A ${radius - 15} ${radius - 15} 0 0 1 ${radius * 2 - 15} ${radius} Z`}
            fill="rgba(224, 242, 254, 0.45)"
            stroke="#38bdf8"
            strokeWidth="3"
          />

          {/* Baseline */}
          <line
            x1="10"
            y1={radius}
            x2={radius * 2 - 10}
            y2={radius}
            stroke="#0284c7"
            strokeWidth="2"
          />

          {/* Pivot Crosshair */}
          <circle cx={radius} cy={radius} r="5" fill="#0284c7" />
          <circle cx={radius} cy={radius} r="18" fill="none" stroke="#0284c7" strokeWidth="1.5" />
          <line x1={radius - 12} y1={radius} x2={radius + 12} y2={radius} stroke="#0284c7" strokeWidth="1.5" />
          <line x1={radius} y1={radius - 12} x2={radius} y2={radius + 12} stroke="#0284c7" strokeWidth="1.5" />

          {/* All degree ticks */}
          {ticks}

          {/* Rotating Measure Arm Ray */}
          <line
            x1={radius}
            y1={radius}
            x2={armEndX}
            y2={armEndY}
            stroke="#e11d48"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
        </svg>

        {/* Rotatable Ray Indicator Knob */}
        <div
          onPointerDown={handlePointerDownArm}
          className="absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full bg-rose-600 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-[9px] font-bold text-white z-40"
          style={{
            left: `${armEndX}px`,
            top: `${armEndY}px`,
          }}
          title="Drag to measure angle"
        >
          {armAngle}°
        </div>

        {/* Center Control Badge & Size Controls */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-full text-white text-xs border border-slate-700 shadow-md">
          <Move className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-mono font-bold text-amber-400 text-xs">{armAngle}°</span>

          {/* Reduce protractor size */}
          <button
            onClick={e => {
              e.stopPropagation();
              setRadius(r => Math.max(120, r - 30));
            }}
            className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white text-[11px] font-bold"
            title="Reduce protractor size"
          >
            -
          </button>
          <span className="text-[10px] text-slate-400 font-mono">{radius * 2}px</span>
          {/* Increase protractor size */}
          <button
            onClick={e => {
              e.stopPropagation();
              setRadius(r => Math.min(280, r + 30));
            }}
            className="px-1.5 py-0.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white text-[11px] font-bold"
            title="Increase protractor size"
          >
            +
          </button>

          <button
            onPointerDown={handlePointerDownRotate}
            className="p-1 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white"
            title="Rotate Protractor Base"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-rose-500/50 rounded-full text-slate-300 hover:text-rose-200"
            title="Close Protractor"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
