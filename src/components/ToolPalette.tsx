import React, { useState, useRef } from 'react';
import { 
  MousePointer, 
  Hand, 
  PenTool, 
  Highlighter, 
  Eraser, 
  Zap, 
  Shapes, 
  Type, 
  StickyNote, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  GripVertical, 
  Minus, 
  Circle, 
  Square, 
  Triangle, 
  MoveRight, 
  SplitSquareVertical, 
  Star, 
  Plus, 
  Sparkles, 
  Box, 
  Compass, 
  LayoutTemplate, 
  Trash2,
  Activity,
  Palette,
  Check,
  FileText
} from 'lucide-react';
import { 
  ToolType, 
  ShapeType, 
  PenSensitivityConfig, 
  PenProfile, 
  PenNibStyle, 
  Point 
} from '../types';
import { renderStrokeToContext, DEFAULT_PEN_SENSITIVITY } from '../utils/penStroke';

interface StylusTestPadProps {
  penSensitivity: PenSensitivityConfig;
  activeColor: string;
  strokeWidth: number;
}

const StylusTestPad: React.FC<StylusTestPadProps> = ({ penSensitivity, activeColor, strokeWidth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPressure, setCurrentPressure] = useState<number>(0);
  const [pointerType, setPointerType] = useState<string>('Ready');
  const isDrawingRef = useRef(false);
  const strokePointsRef = useRef<Point[]>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setPointerType(e.pointerType);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    setCurrentPressure(pressure);
    const pts: Point[] = [{ x, y, pressure, time: Date.now() }];
    strokePointsRef.current = pts;
    drawLive(pts);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    setPointerType(e.pointerType);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    setCurrentPressure(pressure);
    strokePointsRef.current.push({ x, y, pressure, time: Date.now() });
    drawLive(strokePointsRef.current);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    setCurrentPressure(0);
    drawLive(strokePointsRef.current, false);
  };

  const drawLive = (pts: Point[], isLive = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderStrokeToContext(
      ctx,
      {
        points: pts,
        color: activeColor,
        width: strokeWidth,
        opacity: 1,
        nibStyle: penSensitivity.nibStyle,
        profile: penSensitivity.profile,
      },
      penSensitivity,
      isLive
    );
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    strokePointsRef.current = [];
    setCurrentPressure(0);
  };

  return (
    <div className="space-y-1.5 pt-2 border-t border-slate-750">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-300">Stylus Test Pad</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-750 font-mono">
            {pointerType === 'pen' ? '🖊️ Stylus Pen' : pointerType === 'touch' ? '👆 Touch Screen' : pointerType === 'mouse' ? '🖱️ Mouse' : pointerType}
          </span>
        </div>
        <button
          onClick={clearCanvas}
          type="button"
          className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 transition"
        >
          Clear Pad
        </button>
      </div>

      {/* Live Pressure Bar Meter */}
      <div className="flex items-center gap-2">
        <div className="text-[10px] font-mono text-sky-400 w-11 text-right font-bold">
          {Math.round(currentPressure * 100)}%
        </div>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-750 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-75"
            style={{ width: `${Math.min(100, Math.max(0, currentPressure * 100))}%` }}
          />
        </div>
      </div>

      {/* Scratch canvas */}
      <div className="relative rounded-xl border border-slate-750 bg-slate-950/90 overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={280}
          height={60}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-15 cursor-crosshair block"
        />
        {strokePointsRef.current.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-slate-500 font-mono">
            Draw here with pen to test pressure
          </div>
        )}
      </div>
    </div>
  );
};

interface ToolPaletteProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  activeColor: string;
  onSelectColor: (color: string) => void;
  strokeWidth: number;
  onSelectStrokeWidth: (width: number) => void;
  selectedShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  shapeFillColor?: string;
  onSelectShapeFillColor?: (color: string) => void;
  isStylusOnly: boolean;
  onToggleStylusOnly: () => void;
  onAddStickyNote: () => void;
  onInsertMathSymbol: (symbol: string) => void;
  isAutoShapeEnabled?: boolean;
  onToggleAutoShape?: () => void;
  onOpenSolidsModal?: () => void;
  onOpenGeoGebraModal?: () => void;
  onOpenTemplatesModal?: () => void;
  onOpenFractionsModal?: () => void;
  onOpenPdfModal?: () => void;
  onClearScreen?: () => void;
  isToolsHidden?: boolean;
  onToggleHideTools?: () => void;
  penSensitivity?: PenSensitivityConfig;
  onChangePenSensitivity?: (config: PenSensitivityConfig) => void;
}

export const ToolPalette: React.FC<ToolPaletteProps> = ({
  activeTool,
  onSelectTool,
  activeColor,
  onSelectColor,
  strokeWidth,
  onSelectStrokeWidth,
  selectedShape,
  onSelectShape,
  shapeFillColor = 'transparent',
  onSelectShapeFillColor,
  isStylusOnly,
  onToggleStylusOnly,
  onAddStickyNote,
  onInsertMathSymbol,
  isAutoShapeEnabled = false,
  onToggleAutoShape,
  onOpenSolidsModal,
  onOpenGeoGebraModal,
  onOpenTemplatesModal,
  onOpenFractionsModal,
  onOpenPdfModal,
  onClearScreen,
  isToolsHidden: isToolsHiddenProp,
  onToggleHideTools,
  penSensitivity = DEFAULT_PEN_SENSITIVITY,
  onChangePenSensitivity,
}) => {
  const [internalHidden, setInternalHidden] = useState(false);
  const isHidden = isToolsHiddenProp !== undefined ? isToolsHiddenProp : internalHidden;
  const toggleHidden = () => {
    if (onToggleHideTools) {
      onToggleHideTools();
    } else {
      setInternalHidden(h => !h);
    }
  };

  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showSensitivityMenu, setShowSensitivityMenu] = useState(false);
  const [showMathMenu, setShowMathMenu] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Iconic Math Whiteboard Chalk & Pen Colors
  const colors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black/Dark', value: '#0f172a' },
    { name: 'Sky Blue', value: '#38bdf8' },
    { name: 'Emerald Green', value: '#10b981' },
    { name: 'Amber Yellow', value: '#f59e0b' },
    { name: 'Crimson Red', value: '#ef4444' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const strokeSizes = [
    { label: 'Fine', value: 2 },
    { label: 'Medium', value: 4 },
    { label: 'Thick', value: 8 },
    { label: 'Marker', value: 16 },
  ];

  const [fillOpacity, setFillOpacity] = useState<number>(0.35);

  const fillPaletteColors = [
    { name: 'Amber Yellow', hex: '#f59e0b', r: 245, g: 158, b: 11 },
    { name: 'Sky Blue', hex: '#38bdf8', r: 56, g: 189, b: 248 },
    { name: 'Emerald Green', hex: '#10b981', r: 16, g: 185, b: 129 },
    { name: 'Crimson Red', hex: '#ef4444', r: 239, g: 68, b: 68 },
    { name: 'Purple', hex: '#a855f7', r: 168, g: 85, b: 247 },
    { name: 'Orange', hex: '#f97316', r: 249, g: 115, b: 22 },
    { name: 'White', hex: '#ffffff', r: 255, g: 255, b: 255 },
    { name: 'Slate Dark', hex: '#0f172a', r: 15, g: 23, b: 42 },
  ];

  const handleSelectFillColor = (colorObj: typeof fillPaletteColors[0], opacity = fillOpacity) => {
    if (!onSelectShapeFillColor) return;
    if (opacity >= 1.0) {
      onSelectShapeFillColor(colorObj.hex);
    } else {
      onSelectShapeFillColor(`rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${opacity})`);
    }
  };

  const handleSelectFillOpacity = (newOpacity: number) => {
    setFillOpacity(newOpacity);
    if (!onSelectShapeFillColor || shapeFillColor === 'transparent') return;
    const matched = fillPaletteColors.find(
      c => shapeFillColor.includes(`${c.r}, ${c.g}, ${c.b}`) || shapeFillColor.toLowerCase() === c.hex.toLowerCase()
    );
    if (matched) {
      handleSelectFillColor(matched, newOpacity);
    }
  };

  // All 26 Shapes from Classroom Popover (6-Column Grid Layout matching screenshot)
  const shapesList: { type: ShapeType; label: string; icon: React.ReactNode }[] = [
    // Row 1
    {
      type: 'line',
      label: 'Straight Line',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      type: 'dashed-line',
      label: 'Dashed Line',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      type: 'arrow',
      label: 'Directional Arrow',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="11 5 19 5 19 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'double-arrow',
      label: 'Double Arrow',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="11 6 18 6 18 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="13 18 6 18 6 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'ray',
      label: 'Ray (Vector)',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <line x1="6" y1="18" x2="19" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="5" cy="19" r="2.2" fill="currentColor" />
          <polyline points="12 5 19 5 19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'angle',
      label: 'Geometric Angle',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polyline points="20 5 5 19 20 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 11 19 A 6 6 0 0 0 9 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },

    // Row 2
    {
      type: 'rect',
      label: 'Rectangle',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <rect x="3" y="6" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'square',
      label: 'Square',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'circle',
      label: 'Circle',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'ellipse',
      label: 'Ellipse / Oval',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <ellipse cx="12" cy="12" rx="9.5" ry="6" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'triangle',
      label: 'Equilateral Triangle',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="12 4 21 20 3 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'right-triangle',
      label: 'Right Triangle',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="4 4 4 20 20 20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <polyline points="4 14 10 14 10 20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },

    // Row 3
    {
      type: 'scalene-triangle',
      label: 'Scalene Triangle',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="7 4 21 19 3 16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'parallelogram',
      label: 'Parallelogram',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="7 6 21 6 17 18 3 18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'rhombus',
      label: 'Rhombus',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="12 3 21 12 12 21 3 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'trapezoid',
      label: 'Trapezoid',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="7 6 17 6 21 18 3 18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'kite',
      label: 'Kite',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="12 3 20 10 12 21 4 10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'pentagon',
      label: 'Pentagon',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="12 3 21 9.5 17.5 20 6.5 20 3 9.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },

    // Row 4
    {
      type: 'hexagon',
      label: 'Hexagon',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'star',
      label: 'Star',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'semicircle',
      label: 'Semicircle / Arc',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <path d="M 3 17 A 9 9 0 0 1 21 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      type: 'sector',
      label: 'Circular Sector',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <path d="M 12 19 L 5 10 A 10 10 0 0 1 19 10 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'cube',
      label: '3D Cube',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <polygon points="12 3 21 7.5 21 16.5 12 21 3 16.5 3 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <polyline points="3 7.5 12 12 21 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      type: 'cylinder',
      label: '3D Cylinder',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.8" />
          <line x1="5" y1="6" x2="5" y2="18" stroke="currentColor" strokeWidth="1.8" />
          <line x1="19" y1="6" x2="19" y2="18" stroke="currentColor" strokeWidth="1.8" />
          <path d="M 5 18 A 7 3 0 0 0 19 18" stroke="currentColor" strokeWidth="1.8" />
          <path d="M 5 18 A 7 3 0 0 1 19 18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      ),
    },

    // Row 5
    {
      type: 'cone',
      label: '3D Cone',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <line x1="12" y1="3" x2="5" y2="19" stroke="currentColor" strokeWidth="1.8" />
          <line x1="12" y1="3" x2="19" y2="19" stroke="currentColor" strokeWidth="1.8" />
          <path d="M 5 19 A 7 3 0 0 0 19 19" stroke="currentColor" strokeWidth="1.8" />
          <path d="M 5 19 A 7 3 0 0 1 19 19" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      ),
    },
    {
      type: 'sphere',
      label: '3D Sphere',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M 3 12 A 9 3.5 0 0 0 21 12" stroke="currentColor" strokeWidth="1.8" />
          <path d="M 3 12 A 9 3.5 0 0 1 21 12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      ),
    },
  ];

  const mathSymbols = ['π', '√', 'θ', '±', 'α', 'β', '∑', '∫', '²', '³', '≠', '≈', '≤', '≥', '∞', '°', '×', '÷'];

  if (isHidden) {
    return (
      <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 select-none">
        <button
          onClick={toggleHidden}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-sky-400 hover:text-white border-2 border-sky-500/70 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 text-xs font-bold ring-1 ring-white/10 group"
          title="Show bottom tools (Click to unhide toolbar)"
        >
          <PenTool className="w-4 h-4 text-sky-400 group-hover:text-white transition" />
          <span>Show Tools</span>
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 select-none">
      <div className={`flex items-center gap-1 sm:gap-1.5 ${isCompact ? 'p-1 scale-[0.85] origin-bottom shadow-lg' : 'p-1.5'} bg-slate-900/98 backdrop-blur-md rounded-2xl border-2 border-slate-700/90 shadow-2xl text-slate-100 ring-1 ring-white/10 transition-transform duration-150`}>
        
        {/* Selection & Pan Tools */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-750">
          <button
            onClick={() => onSelectTool('select')}
            className={`p-2.5 rounded-xl transition ${
              activeTool === 'select'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Select & Move Objects (V)"
          >
            <MousePointer className="w-4 h-4" />
          </button>

          {/* Lasso Selection Tool (Matching uploaded image) */}
          <button
            onClick={() => onSelectTool('lasso')}
            className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
              activeTool === 'lasso'
                ? 'bg-amber-400 text-purple-700 shadow-md ring-2 ring-amber-300 font-bold'
                : 'text-purple-300 hover:bg-slate-800 hover:text-purple-200'
            }`}
            title="Lasso Selection (Draw a loop around objects to select, group, duplicate, or rotate) (Q)"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M 4 8 C 8 8 10 9 12 12.5 C 14 16 14.5 19 12 19 C 9.5 19 9.5 16 12 12.5 C 14 9 16 8 20 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            onClick={() => onSelectTool('hand')}
            className={`p-2.5 rounded-xl transition ${
              activeTool === 'hand'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Pan Board Canvas (H)"
          >
            <Hand className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Inking Tools */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-750">
          <button
            onClick={() => onSelectTool('pen')}
            className={`p-2.5 rounded-xl transition ${
              activeTool === 'pen'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Stylus Pen (P) - Smooth Chaikin Curves"
          >
            <PenTool className="w-4 h-4" />
          </button>

          {/* Auto-Shape Recognition Switch (300ms window requested by user) */}
          {onToggleAutoShape && (
            <button
              onClick={onToggleAutoShape}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold border ${
                isAutoShapeEnabled
                  ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={
                isAutoShapeEnabled
                  ? 'Auto-Shape is ON: Quick strokes snap to circle, rect, or triangle. Click to turn off.'
                  : 'Auto-Shape is OFF: Freehand handwriting & drawing pen. Click to turn on.'
              }
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAutoShapeEnabled ? 'text-amber-300' : 'text-slate-500'}`} />
              <span className="hidden md:inline text-[10px]">
                {isAutoShapeEnabled ? 'Auto-Shape' : 'Auto-Shape (Off)'}
              </span>
            </button>
          )}

          <button
            onClick={() => onSelectTool('highlighter')}
            className={`p-2.5 rounded-xl transition ${
              activeTool === 'highlighter'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Highlighter (Y)"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <div className="relative group">
            <button
              onClick={() => onSelectTool('eraser')}
              className={`p-2.5 rounded-xl transition ${
                activeTool === 'eraser'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Eraser (E) - Hover for Clear Screen"
            >
              <Eraser className="w-4 h-4" />
            </button>
            {onClearScreen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearScreen();
                }}
                className="hidden group-hover:flex absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-rose-950/95 border border-rose-500/80 rounded-lg text-rose-200 hover:text-white text-[10px] font-bold shadow-2xl whitespace-nowrap items-center gap-1 hover:bg-rose-900 cursor-pointer backdrop-blur-md transition"
                title="Clear entire screen"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Clear Screen</span>
              </button>
            )}
          </div>

          <button
            onClick={() => onSelectTool('laser')}
            className={`p-2.5 rounded-xl transition ${
              activeTool === 'laser'
                ? 'bg-red-500 text-white shadow-md animate-pulse'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Classroom Magic Laser Pointer (L)"
          >
            <Zap className="w-4 h-4 text-rose-400" />
          </button>
        </div>

        {/* Shape & Annotation Elements */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-750">
          {/* Shapes Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowShapesMenu(!showShapesMenu);
                setShowColorMenu(false);
                setShowSizeMenu(false);
                setShowMathMenu(false);
                onSelectTool('shape');
              }}
              className={`flex items-center gap-1 p-2 rounded-xl transition ${
                activeTool === 'shape'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Geometric Shapes (Lines, Triangles, 3D Solids)"
            >
              <div className="relative">
                <Shapes className="w-4 h-4" />
                {shapeFillColor && shapeFillColor !== 'transparent' && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full ring-1 ring-slate-900 shadow-sm"
                    style={{ backgroundColor: shapeFillColor }}
                    title="Shape fill color active"
                  />
                )}
              </div>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showShapesMenu && (
              <div className="absolute bottom-14 left-0 w-[326px] bg-[#0c1e38]/98 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-3 z-50 space-y-2 backdrop-blur-md">
                <div className="text-amber-400 font-extrabold text-[11px] tracking-wider uppercase px-0.5 flex items-center justify-between">
                  <span>SHAPES</span>
                  <span className="text-[9px] text-slate-400 lowercase font-normal">26 types</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {shapesList.map(s => (
                    <button
                      key={s.type}
                      onClick={() => {
                        onSelectShape(s.type);
                        onSelectTool('shape');
                      }}
                      className={`h-10 rounded-xl flex items-center justify-center transition border cursor-pointer ${
                        selectedShape === s.type && activeTool === 'shape'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-bold ring-1 ring-white/50'
                          : 'bg-[#0f2747]/80 hover:bg-[#1a3860] text-white border-sky-950/60 hover:border-sky-700'
                      }`}
                      title={s.label}
                    >
                      {s.icon}
                    </button>
                  ))}
                </div>

                {/* Color Fill Controls for Shapes */}
                <div className="pt-2 border-t border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold px-0.5">
                    <span className="text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      COLOR FILL
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono flex items-center gap-1">
                      {shapeFillColor === 'transparent' ? (
                        <span className="text-slate-400">🚫 Outline Only</span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/60 inline-block shadow-sm"
                            style={{ backgroundColor: shapeFillColor }}
                          />
                          Filled
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Swatches Row */}
                  <div className="flex items-center gap-1.5 flex-wrap px-0.5">
                    {/* No Fill / Transparent Button */}
                    <button
                      type="button"
                      onClick={() => onSelectShapeFillColor && onSelectShapeFillColor('transparent')}
                      className={`h-7 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition cursor-pointer ${
                        shapeFillColor === 'transparent'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-extrabold ring-1 ring-white/40'
                          : 'bg-[#0f2747]/90 text-slate-300 border-sky-950/80 hover:bg-[#1a3860]'
                      }`}
                      title="No Fill - Outline Only"
                    >
                      <span>🚫 None</span>
                    </button>

                    {/* Quick Color Swatches */}
                    {fillPaletteColors.map(c => {
                      const isSelected =
                        shapeFillColor !== 'transparent' &&
                        (shapeFillColor.includes(`${c.r}, ${c.g}, ${c.b}`) ||
                          shapeFillColor.toLowerCase() === c.hex.toLowerCase());
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleSelectFillColor(c)}
                          className={`w-6 h-6 rounded-full border transition transform hover:scale-110 cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'border-white ring-2 ring-amber-400 scale-110 shadow-md'
                              : 'border-white/30 hover:border-white/70'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={`${c.name} Fill`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Fill Opacity / Intensity Modes */}
                  <div className="flex items-center justify-between text-[10px] pt-0.5 px-0.5 text-slate-300">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">Opacity:</span>
                    <div className="flex items-center gap-1 bg-[#09172c] p-0.5 rounded-lg border border-slate-750">
                      {[
                        { label: '35% Tint', value: 0.35 },
                        { label: '65% Med', value: 0.65 },
                        { label: '100% Solid', value: 1.0 },
                      ].map(op => (
                        <button
                          key={op.label}
                          type="button"
                          onClick={() => handleSelectFillOpacity(op.value)}
                          className={`px-2 py-0.5 rounded text-[9px] font-semibold transition cursor-pointer ${
                            fillOpacity === op.value && shapeFillColor !== 'transparent'
                              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {op.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Close / Done Button */}
                  <button
                    type="button"
                    onClick={() => setShowShapesMenu(false)}
                    className="w-full py-1 rounded-lg bg-sky-600/90 hover:bg-sky-500 text-white text-[11px] font-bold transition shadow-sm cursor-pointer mt-1"
                  >
                    ✓ Done / Start Drawing
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Text Tool */}
          <button
            onClick={() => onSelectTool('text')}
            className={`p-2 rounded-xl transition ${
              activeTool === 'text'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Add Text Box (T)"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Sticky Note */}
          <button
            onClick={onAddStickyNote}
            className="p-2 rounded-xl text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition cursor-pointer"
            title="Add Sticky Note"
          >
            <StickyNote className="w-4 h-4" />
          </button>

          {/* Math Whiteboard Templates (As shown in user reference image) */}
          {onOpenTemplatesModal && (
            <div className="relative group flex items-center justify-center">
              {/* Speech Bubble Tooltip matching image */}
              <div className="absolute -top-9.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-slate-800 border border-slate-700/90 text-white text-[10px] font-semibold rounded-md shadow-2xl whitespace-nowrap pointer-events-none z-50 flex flex-col items-center">
                <span>Templates</span>
                {/* Downward triangle arrow pointer */}
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800 -mb-1.5" />
              </div>

              <button
                onClick={onOpenTemplatesModal}
                className="p-2 rounded-xl text-sky-400 hover:bg-slate-800 hover:text-sky-300 transition active:scale-95 cursor-pointer"
                title="Math Whiteboard Templates"
              >
                <LayoutTemplate className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Insert PDF Worksheet / Document Button */}
          {onOpenPdfModal && (
            <div className="relative group flex items-center justify-center">
              <div className="absolute -top-9.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-slate-800 border border-slate-700/90 text-white text-[10px] font-semibold rounded-md shadow-2xl whitespace-nowrap pointer-events-none z-50 flex flex-col items-center">
                <span>Insert PDF</span>
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800 -mb-1.5" />
              </div>

              <button
                type="button"
                onClick={onOpenPdfModal}
                className="p-2 rounded-xl text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition active:scale-95 cursor-pointer flex items-center gap-1"
                title="Insert PDF File or Worksheet into Math Board"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px] font-bold">PDF</span>
              </button>
            </div>
          )}

          {/* Fractions Interactive Tool Shortcut */}
          {onOpenFractionsModal && (
            <button
              onClick={onOpenFractionsModal}
              className="px-2 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-sky-300 hover:text-white transition font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
              title="Interactive Fractions Tool (Bars, Pie Sectors & Strips)"
            >
              <span>½</span>
              <span className="hidden xl:inline text-[10px]">Fractions</span>
            </button>
          )}

          {/* 3D Solids & 2D Nets Shortcut */}
          {onOpenSolidsModal && (
            <button
              onClick={onOpenSolidsModal}
              className="p-2 rounded-xl text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition cursor-pointer"
              title="3D Movable Solids & 2D Nets"
            >
              <Box className="w-4 h-4" />
            </button>
          )}

          {/* GeoGebra Dynamic Math Tools Shortcut */}
          {onOpenGeoGebraModal && (
            <button
              onClick={onOpenGeoGebraModal}
              className="p-2 rounded-xl text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 transition cursor-pointer"
              title="GeoGebra Dynamic Math Tools"
            >
              <Compass className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Inking Settings: Color & Stroke Size */}
        <div className="flex items-center gap-1.5 px-1 border-r border-slate-750">
          {/* Color Picker Swatch */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorMenu(!showColorMenu);
                setShowShapesMenu(false);
                setShowSizeMenu(false);
                setShowSensitivityMenu(false);
                setShowMathMenu(false);
              }}
              className="p-1 rounded-xl hover:bg-slate-800 transition flex items-center gap-1"
              title="Select Pen Color"
            >
              <div
                className="w-5 h-5 rounded-full border-2 border-white/80 shadow-xs"
                style={{ backgroundColor: activeColor }}
              />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showColorMenu && (
              <div className="absolute bottom-14 left-0 w-44 bg-slate-850 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[10px] font-bold text-slate-400 px-1 pb-1.5 uppercase tracking-wider">
                  Chalk & Ink Color
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(c => (
                    <button
                      key={c.value}
                      onClick={() => {
                        onSelectColor(c.value);
                        setShowColorMenu(false);
                      }}
                      className="w-8 h-8 rounded-full border-2 border-slate-600 hover:scale-110 transition relative flex items-center justify-center"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {activeColor === c.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stroke Size Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSizeMenu(!showSizeMenu);
                setShowShapesMenu(false);
                setShowColorMenu(false);
                setShowSensitivityMenu(false);
                setShowMathMenu(false);
              }}
              className="px-2 py-1 rounded-xl hover:bg-slate-800 transition flex items-center gap-1 text-xs text-slate-300"
              title="Pen Line Thickness"
            >
              <div
                className="rounded-full bg-slate-200"
                style={{ width: `${Math.min(12, Math.max(4, strokeWidth))}px`, height: `${Math.min(12, Math.max(4, strokeWidth))}px` }}
              />
              <span className="font-mono text-[11px]">{strokeWidth}px</span>
            </button>

            {showSizeMenu && (
              <div className="absolute bottom-14 left-0 w-36 bg-slate-850 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 px-1 pb-1 uppercase tracking-wider">
                  Thickness
                </div>
                {strokeSizes.map(s => (
                  <button
                    key={s.value}
                    onClick={() => {
                      onSelectStrokeWidth(s.value);
                      setShowSizeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition ${
                      strokeWidth === s.value ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className="font-mono text-[10px] opacity-70">{s.value}px</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pen Sensitivity & Stylus Calibration Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSensitivityMenu(!showSensitivityMenu);
                setShowShapesMenu(false);
                setShowColorMenu(false);
                setShowSizeMenu(false);
                setShowMathMenu(false);
              }}
              className={`px-2 py-1 rounded-xl border transition flex items-center gap-1 text-xs ${
                showSensitivityMenu
                  ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                  : penSensitivity.enabled && penSensitivity.profile !== 'uniform'
                  ? 'bg-sky-950/60 text-sky-300 border-sky-600/70 hover:bg-sky-900/50'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Stylus Pen Sensitivity & Pressure Calibration"
            >
              <Activity className={`w-3.5 h-3.5 ${penSensitivity.enabled ? 'text-sky-400' : 'text-slate-500'}`} />
              <span className="text-[11px] font-medium hidden lg:inline">
                {penSensitivity.enabled ? (
                  penSensitivity.profile === 'soft' ? 'Soft' :
                  penSensitivity.profile === 'medium' ? 'Natural' :
                  penSensitivity.profile === 'firm' ? 'Firm' :
                  penSensitivity.profile === 'velocity' ? 'Speed' : 'Uniform'
                ) : 'Off'}
              </span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {showSensitivityMenu && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 w-[315px] bg-slate-850/98 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2.5 text-slate-200">
                {/* Header & Master Toggle */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-750">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white tracking-wide">Pen Sensitivity</span>
                  </div>
                  <button
                    onClick={() => {
                      if (onChangePenSensitivity) {
                        onChangePenSensitivity({
                          ...penSensitivity,
                          enabled: !penSensitivity.enabled,
                        });
                      }
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                      penSensitivity.enabled
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {penSensitivity.enabled ? 'PRESSURE ON' : 'PRESSURE OFF'}
                  </button>
                </div>

                {/* Sensitivity Profiles */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Sensitivity Profile
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'soft', label: 'Soft Touch', desc: 'Light touch for math notes' },
                      { id: 'medium', label: 'Natural', desc: 'Balanced marker feel' },
                      { id: 'firm', label: 'Firm Press', desc: 'Deliberate hand pressure' },
                      { id: 'velocity', label: 'Speed Dynamic', desc: 'Velocity (IR Flatpanel)' },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (onChangePenSensitivity) {
                            onChangePenSensitivity({
                              ...penSensitivity,
                              enabled: true,
                              profile: p.id as PenProfile,
                            });
                          }
                        }}
                        className={`text-left p-1.5 rounded-xl border transition flex flex-col ${
                          penSensitivity.enabled && penSensitivity.profile === p.id
                            ? 'bg-sky-600/90 border-sky-400 text-white shadow-sm'
                            : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <span className="text-[11px] font-bold">{p.label}</span>
                        <span className="text-[9px] opacity-75 line-clamp-1">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (onChangePenSensitivity) {
                        onChangePenSensitivity({
                          ...penSensitivity,
                          enabled: true,
                          profile: 'uniform',
                        });
                      }
                    }}
                    className={`w-full text-center py-1 rounded-lg border text-[10px] font-medium transition ${
                      penSensitivity.enabled && penSensitivity.profile === 'uniform'
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Uniform Thickness (Fixed CAD line for geometry)
                  </button>
                </div>

                {/* Nib Style */}
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nib Style
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'ballpoint', label: 'Math Pen', sub: 'Crisp precision' },
                      { id: 'marker', label: 'Marker', sub: 'Rich ink' },
                      { id: 'calligraphy', label: 'Chisel', sub: 'Dynamic angle' },
                    ].map(n => (
                      <button
                        key={n.id}
                        onClick={() => {
                          if (onChangePenSensitivity) {
                            onChangePenSensitivity({
                              ...penSensitivity,
                              nibStyle: n.id as PenNibStyle,
                            });
                          }
                        }}
                        className={`text-center p-1.5 rounded-xl border transition ${
                          penSensitivity.nibStyle === n.id
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{n.label}</div>
                        <div className="text-[9px] opacity-70">{n.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Stylus Test Pad */}
                <StylusTestPad
                  penSensitivity={penSensitivity}
                  activeColor={activeColor}
                  strokeWidth={strokeWidth}
                />
              </div>
            )}
          </div>
        </div>

        {/* Math Symbols Helper */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setShowMathMenu(!showMathMenu);
              setShowShapesMenu(false);
              setShowColorMenu(false);
              setShowSizeMenu(false);
            }}
            className={`px-2 py-1.5 rounded-xl border text-xs font-mono font-bold transition ${
              showMathMenu ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-indigo-300'
            }`}
            title="Quick Math Symbols for Whiteboard (π, √, θ, ±)"
          >
            Σ π
          </button>

          {showMathMenu && (
            <div className="absolute bottom-14 right-0 w-52 bg-slate-850 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
              <div className="text-[10px] font-bold text-slate-400 px-1 pb-1.5 uppercase tracking-wider">
                Math & Science Symbols
              </div>
              <div className="grid grid-cols-6 gap-1">
                {mathSymbols.map(sym => (
                  <button
                    key={sym}
                    onClick={() => {
                      onInsertMathSymbol(sym);
                      setShowMathMenu(false);
                    }}
                    className="p-1.5 rounded bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white text-xs font-bold text-center transition"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Palm Rejection Toggle for Flat Panels */}
        <button
          onClick={onToggleStylusOnly}
          className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
            isStylusOnly
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Toggle Palm Rejection (When ON, only stylus draws and touch gestures pan)"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]">{isStylusOnly ? 'Palm Guard ON' : 'Palm Guard'}</span>
        </button>

        {/* Option to Reduce Size of All Tools (Compact Mode) */}
        <button
          onClick={() => setIsCompact(c => !c)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold border transition ${
            isCompact
              ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 hover:bg-amber-500/35 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-750'
          }`}
          title={isCompact ? 'Enlarge tools to standard size' : 'Reduce size of all tools for maximum canvas drawing area'}
        >
          <span className="text-[10px] whitespace-nowrap">{isCompact ? 'Enlarge' : 'Reduce Tools'}</span>
        </button>

        {/* Option to Hide Bottom Tools for Full Canvas */}
        <button
          onClick={toggleHidden}
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-750 transition"
          title="Hide bottom tools for an unobstructed full-screen whiteboard view"
        >
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] whitespace-nowrap">Hide Tools</span>
        </button>

      </div>
    </aside>
  );
};
