import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  GripHorizontal, 
  Palette, 
  Sparkles, 
  Eye, 
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface CurtainToolProps {
  onClose: () => void;
}

interface CurtainTheme {
  id: string;
  name: string;
  swatch: string;
  gradient: string;
  pleatColor: string;
  trimColor: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
}

const CURTAIN_THEMES: CurtainTheme[] = [
  {
    id: 'red',
    name: 'Ruby Velvet (Theater Red)',
    swatch: '#dc2626',
    gradient: 'linear-gradient(180deg, #ef4444 0%, #dc2626 40%, #991b1b 85%, #7f1d1d 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.22)',
    trimColor: '#fbbf24',
    borderColor: '#f59e0b',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    textColor: '#ffffff',
  },
  {
    id: 'blue',
    name: 'Royal Sapphire Blue',
    swatch: '#2563eb',
    gradient: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 40%, #1d4ed8 85%, #1e3a8a 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.24)',
    trimColor: '#fbbf24',
    borderColor: '#60a5fa',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    textColor: '#ffffff',
  },
  {
    id: 'green',
    name: 'Emerald Stage Green',
    swatch: '#059669',
    gradient: 'linear-gradient(180deg, #10b981 0%, #059669 40%, #047857 85%, #064e3b 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.22)',
    trimColor: '#fef08a',
    borderColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    textColor: '#ffffff',
  },
  {
    id: 'gold',
    name: 'Sunburst Gold & Amber',
    swatch: '#f59e0b',
    gradient: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 45%, #d97706 85%, #92400e 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.32)',
    trimColor: '#ffffff',
    borderColor: '#fde68a',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    textColor: '#ffffff',
  },
  {
    id: 'purple',
    name: 'Imperial Royal Purple',
    swatch: '#7c3aed',
    gradient: 'linear-gradient(180deg, #9333ea 0%, #7c3aed 45%, #6b21a8 85%, #581c87 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.24)',
    trimColor: '#fde047',
    borderColor: '#c084fc',
    glowColor: 'rgba(147, 51, 234, 0.5)',
    textColor: '#ffffff',
  },
  {
    id: 'cyan',
    name: 'Vibrant Aqua Teal',
    swatch: '#0891b2',
    gradient: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 45%, #0e7490 85%, #155e75 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.26)',
    trimColor: '#fef08a',
    borderColor: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    textColor: '#ffffff',
  },
  {
    id: 'rose',
    name: 'Bright Rose Pink',
    swatch: '#e11d48',
    gradient: 'linear-gradient(180deg, #f43f5e 0%, #e11d48 45%, #be123c 85%, #881337 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.22)',
    trimColor: '#fef08a',
    borderColor: '#fb7185',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    textColor: '#ffffff',
  },
  {
    id: 'orange',
    name: 'Tangerine Orange',
    swatch: '#ea580c',
    gradient: 'linear-gradient(180deg, #f97316 0%, #ea580c 45%, #c2410c 85%, #7c2d12 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.28)',
    trimColor: '#fef3c7',
    borderColor: '#fdba74',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    textColor: '#ffffff',
  },
  {
    id: 'midnight',
    name: 'Midnight Blackout',
    swatch: '#1e293b',
    gradient: 'linear-gradient(180deg, #334155 0%, #1e293b 50%, #0f172a 85%, #020617 100%)',
    pleatColor: 'rgba(255, 255, 255, 0.14)',
    trimColor: '#fbbf24',
    borderColor: '#94a3b8',
    glowColor: 'rgba(30, 41, 59, 0.5)',
    textColor: '#ffffff',
  }
];

export const CurtainTool: React.FC<CurtainToolProps> = ({ onClose }) => {
  const [curtainHeight, setCurtainHeight] = useState(() => {
    return Math.round(window.innerHeight * 0.48);
  });

  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem('math_curtain_theme') || 'red';
  });

  const [hasPleats, setHasPleats] = useState<boolean>(true);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [showColorMenu, setShowColorMenu] = useState<boolean>(false);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const currentTheme = CURTAIN_THEMES.find(t => t.id === selectedThemeId) || CURTAIN_THEMES[0];

  useEffect(() => {
    localStorage.setItem('math_curtain_theme', selectedThemeId);
  }, [selectedThemeId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    startY.current = e.clientY;
    startH.current = curtainHeight;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientY - startY.current;
    const newH = Math.max(50, Math.min(window.innerHeight - 70, startH.current + delta));
    setCurtainHeight(newH);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePreset = (fraction: number) => {
    const targetH = Math.round((window.innerHeight - 80) * fraction);
    setCurtainHeight(Math.max(50, targetH));
  };

  return (
    <div className="fixed inset-x-0 top-0 z-40 pointer-events-none select-none">
      {/* Bright Shaded Curtain Surface */}
      <div
        style={{
          height: `${curtainHeight}px`,
          background: currentTheme.gradient,
          opacity: isPeeking ? 0.88 : 1.0,
          boxShadow: `0 24px 48px -12px ${currentTheme.glowColor}, 0 12px 24px -8px rgba(0,0,0,0.5)`,
        }}
        className="w-full relative pointer-events-auto flex flex-col justify-between transition-[opacity] duration-200 overflow-hidden"
      >
        {/* Top Gold / Brass Hanging Pelmet Header Rod */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 shadow-md z-10 opacity-90" />

        {/* Realistic Vertical Curtain Fabric Drapes / Pleats */}
        {hasPleats && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.22) 0px,
                rgba(255, 255, 255, 0.08) 18px,
                rgba(0, 0, 0, 0.16) 36px,
                rgba(0, 0, 0, 0.32) 54px,
                rgba(255, 255, 255, 0.22) 72px
              )`,
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Soft Ambient Inner Glow and Radial Highlights */}
        <div className="absolute inset-0 bg-radial-[circle_at_50%_15%_rgba(255,255,255,0.22),transparent_70%] pointer-events-none" />

        {/* Top Control Bar */}
        <div className="relative z-20 flex items-center justify-between px-5 pt-3.5 pb-2">
          <div className="flex items-center gap-2.5">
            {/* Title Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white font-bold text-xs shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Classroom Reveal Curtain</span>
              <span className="text-[10px] text-amber-300 font-mono font-normal">
                ({Math.round(curtainHeight)}px)
              </span>
            </div>

            {/* Quick Color Swatches in Top Bar */}
            <div className="hidden sm:flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <Palette className="w-3.5 h-3.5 text-white/80 mr-0.5" />
              {CURTAIN_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedThemeId(t.id)}
                  style={{ backgroundColor: t.swatch }}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    selectedThemeId === t.id
                      ? 'border-white scale-125 shadow-md ring-2 ring-white/60'
                      : 'border-black/30 hover:scale-110 opacity-85 hover:opacity-100'
                  }`}
                  title={t.name}
                />
              ))}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5">
            {/* Pleats Toggle */}
            <button
              onClick={() => setHasPleats(!hasPleats)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 backdrop-blur-md border ${
                hasPleats
                  ? 'bg-black/40 text-amber-200 border-amber-400/40'
                  : 'bg-black/30 text-white/70 border-white/20 hover:text-white'
              }`}
              title="Toggle Theater Drapes / Flat Blind"
            >
              <span>{hasPleats ? '✨ Drapes' : '⬛ Flat'}</span>
            </button>

            {/* Peek / Transparency Toggle */}
            <button
              onClick={() => setIsPeeking(!isPeeking)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 backdrop-blur-md border ${
                isPeeking
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-md'
                  : 'bg-black/40 text-white/90 border-white/20 hover:text-white'
              }`}
              title="Toggle Slight Peek Transparency"
            >
              {isPeeking ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isPeeking ? 'Peeking (88%)' : 'Opaque (100%)'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white bg-black/40 hover:bg-rose-600 rounded-full transition backdrop-blur-md border border-white/20 shadow-md"
              title="Close Reveal Curtain"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Center Prompt / Peek Area (Optional Helper Text) */}
        <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
          <div className="text-center">
            <p className="text-white font-black text-sm tracking-widest uppercase drop-shadow-md">
              🔒 Content Hidden
            </p>
            <p className="text-white/80 text-xs tracking-wider">
              Pull handle below to reveal step-by-step
            </p>
          </div>
        </div>

        {/* Bottom Weighted Brass / Gold Trim Bar & Pull Controls */}
        <div className="relative z-30 flex flex-col">
          {/* Gold / Metallic Fringe Fringe Line */}
          <div 
            style={{ backgroundColor: currentTheme.trimColor }}
            className="w-full h-1.5 shadow-sm opacity-90"
          />

          {/* Bottom Pull Grip Bar */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full py-2.5 px-4 bg-slate-950/90 hover:bg-slate-950 text-white cursor-ns-resize border-b-4 border-amber-500 flex flex-wrap items-center justify-between gap-3 shadow-2xl transition touch-none"
            title="Drag up or down to reveal board content"
          >
            {/* Left: Drag Handle and Label */}
            <div className="flex items-center gap-2 min-w-0">
              <GripHorizontal className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-amber-300 drop-shadow-xs truncate">
                Pull to Reveal Answers / Content
              </span>
            </div>

            {/* Middle: Color Palette Swatches (Always accessible on flat panel touch screens) */}
            <div className="flex items-center gap-1.5 bg-slate-900/95 border border-slate-700 px-2.5 py-1 rounded-xl shadow-inner">
              <span className="text-[11px] text-amber-400 font-bold hidden md:inline mr-1">
                Curtain Color:
              </span>
              {CURTAIN_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedThemeId(t.id);
                  }}
                  style={{ backgroundColor: t.swatch }}
                  className={`w-5 h-5 rounded-full border-2 transition-transform shrink-0 ${
                    selectedThemeId === t.id
                      ? 'border-white scale-125 ring-2 ring-amber-400 shadow-lg'
                      : 'border-black/30 hover:scale-115 opacity-80 hover:opacity-100'
                  }`}
                  title={t.name}
                />
              ))}
            </div>

            {/* Right: Height Presets & Step Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Presets */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 p-0.5 rounded-lg text-xs font-bold">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreset(0.25);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Cover Top 25%"
                >
                  ¼
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreset(0.5);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Cover Half 50%"
                >
                  ½
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreset(0.75);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="Cover 75%"
                >
                  ¾
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreset(0.96);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] text-amber-300 hover:text-white hover:bg-amber-600/30 transition"
                  title="Full Board Cover"
                >
                  Cover All
                </button>
              </div>

              {/* Step Up / Down Buttons */}
              <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-700 p-0.5 rounded-lg">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setCurtainHeight(h => Math.max(50, h - 80));
                  }}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                  title="Reveal More (Pull Up)"
                >
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setCurtainHeight(h => Math.min(window.innerHeight - 70, h + 80));
                  }}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                  title="Cover More (Pull Down)"
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
