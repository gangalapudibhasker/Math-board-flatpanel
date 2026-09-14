import React, { useState, useRef } from 'react';
import { X, Dices, RotateCcw } from 'lucide-react';

interface DiceToolProps {
  onClose: () => void;
}

export const DiceTool: React.FC<DiceToolProps> = ({ onClose }) => {
  const [val1, setVal1] = useState(1);
  const [val2, setVal2] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [pos, setPos] = useState({ x: 40, y: 380 });
  const [isCompact, setIsCompact] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const roll = () => {
    if (isRolling) return;
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setVal1(Math.floor(Math.random() * 6) + 1);
      setVal2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 60);
  };

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
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className={`absolute z-40 select-none ${isCompact ? 'w-44' : 'w-56'} rounded-2xl bg-slate-900/95 border border-slate-700/90 shadow-2xl backdrop-blur-md overflow-hidden text-slate-100 transition-all`}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="px-3.5 py-2 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between cursor-move"
      >
        <div className="flex items-center gap-1.5">
          <Dices className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">Random Picker</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 hover:text-white rounded hover:bg-slate-700"
            title={isCompact ? 'Enlarge Dice Picker' : 'Reduce Size (Compact)'}
          >
            {isCompact ? '+' : '-'}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 text-center">
        <div className="flex items-center justify-center gap-3 py-2">
          <div
            className={`w-14 h-14 rounded-xl bg-white text-slate-900 font-bold text-3xl flex items-center justify-center shadow-lg border-2 border-slate-300 transition-transform ${
              isRolling ? 'rotate-180 scale-90' : 'scale-100'
            }`}
          >
            {val1}
          </div>
          <div
            className={`w-14 h-14 rounded-xl bg-white text-slate-900 font-bold text-3xl flex items-center justify-center shadow-lg border-2 border-slate-300 transition-transform ${
              isRolling ? '-rotate-180 scale-90' : 'scale-100'
            }`}
          >
            {val2}
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mb-2 font-mono">
          Total: <span className="text-emerald-400 font-bold">{val1 + val2}</span>
        </div>

        <button
          onClick={roll}
          disabled={isRolling}
          className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>
      </div>
    </div>
  );
};
