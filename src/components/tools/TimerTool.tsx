import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Bell, Flame, Move } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimerToolProps {
  onClose: () => void;
}

export const TimerTool: React.FC<TimerToolProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [seconds, setSeconds] = useState(120); // default 2 minutes
  const [initialSeconds, setInitialSeconds] = useState(120);
  const [isRunning, setIsRunning] = useState(false);
  const [pos, setPos] = useState({ x: 40, y: 120 });
  const [isCompact, setIsCompact] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (mode === 'countdown') {
            if (prev <= 1) {
              setIsRunning(false);
              playBeep();
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

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

  const setPreset = (s: number) => {
    setIsRunning(false);
    setSeconds(s);
    setInitialSeconds(s);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      className={`absolute z-40 select-none ${isCompact ? 'w-56' : 'w-72'} rounded-2xl bg-slate-900/95 border border-slate-700/90 shadow-2xl backdrop-blur-md overflow-hidden text-slate-100 transition-all`}
    >
      {/* Header bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="px-3.5 py-2 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between cursor-move"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold">Classroom Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 hover:text-white rounded hover:bg-slate-700"
            title={isCompact ? 'Enlarge Timer' : 'Reduce Size (Compact)'}
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

      {/* Mode switcher */}
      <div className="p-3">
        <div className="flex rounded-lg bg-slate-800 p-1 mb-3 text-xs">
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('countdown');
              setSeconds(initialSeconds);
            }}
            className={`flex-1 py-1 rounded-md font-medium transition ${
              mode === 'countdown' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Countdown
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('stopwatch');
              setSeconds(0);
            }}
            className={`flex-1 py-1 rounded-md font-medium transition ${
              mode === 'stopwatch' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {/* Large Digital Clock Face */}
        <div className="py-2 text-center">
          <div className="font-mono text-4xl font-black tracking-widest text-sky-300 drop-shadow-sm">
            {formatTime(seconds)}
          </div>
          {mode === 'countdown' && seconds === 0 && (
            <div className="mt-1 text-xs font-bold text-rose-400 animate-bounce">
              Time's up! 🎉
            </div>
          )}
        </div>

        {/* Presets (Countdown only) */}
        {mode === 'countdown' && (
          <div className="grid grid-cols-4 gap-1.5 my-2">
            {[30, 60, 120, 300].map(s => (
              <button
                key={s}
                onClick={() => setPreset(s)}
                className={`py-1 text-[11px] font-semibold rounded-md transition ${
                  initialSeconds === s
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                {s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Start
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setSeconds(mode === 'countdown' ? initialSeconds : 0);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
