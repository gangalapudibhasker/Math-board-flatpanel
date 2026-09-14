import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Plus, 
  Maximize2, 
  Minimize2, 
  ArrowLeftRight, 
  RotateCcw, 
  Edit3, 
  Check, 
  Trash2,
  Grid,
  Hash
} from 'lucide-react';

interface PointPlot {
  x: number;
  y: number;
  label?: string;
  color: string;
}

interface GraphSheetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  panelWidthPercent: number;
  onWidthChange: (pct: number) => void;
  dockSide: 'left' | 'right';
  onToggleDockSide: () => void;
}

export const GraphSheetPanel: React.FC<GraphSheetPanelProps> = ({
  isOpen,
  onClose,
  panelWidthPercent,
  onWidthChange,
  dockSide,
  onToggleDockSide,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Graph state
  const [scale, setScale] = useState(30); // pixels per unit
  const [originOffset, setOriginOffset] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState<PointPlot[]>([
    { x: 0, y: 0, label: 'Origin (0,0)', color: '#38bdf8' },
    { x: 2, y: 3, label: 'A(2, 3)', color: '#10b981' },
    { x: -3, y: 2, label: 'B(-3, 2)', color: '#ef4444' },
    { x: 4, y: -2, label: 'C(4, -2)', color: '#f59e0b' },
  ]);

  const [equationInput, setEquationInput] = useState('2*x - 1');
  const [showEquation, setShowEquation] = useState(true);
  const [newPtX, setNewPtX] = useState('');
  const [newPtY, setNewPtY] = useState('');

  // Freehand drawing on graph sheet
  const [isDrawing, setIsDrawing] = useState(false);
  const [graphStrokes, setGraphStrokes] = useState<{ points: { x: number; y: number }[]; color: string }[]>([]);
  const currentGraphStroke = useRef<{ x: number; y: number }[]>([]);

  // Panning
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Redraw graph sheet canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // School Graph Sheet paper background (classic green tint or dark grid)
    ctx.fillStyle = '#061712'; // Deep chalkboard graph green
    ctx.fillRect(0, 0, w, h);

    const ox = w / 2 + originOffset.x;
    const oy = h / 2 + originOffset.y;

    // 1. Minor Grid Lines (Millimeter paper: every scale / 5)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 1;
    const minorStep = scale / 5;
    ctx.beginPath();
    for (let x = ox % minorStep; x < w; x += minorStep) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = oy % minorStep; y < h; y += minorStep) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 2. Major Grid Lines (every 1 unit = scale px)
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = ox % scale; x < w; x += scale) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = oy % scale; y < h; y += scale) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 3. X and Y Coordinate Axes (Bold with arrows)
    ctx.strokeStyle = '#34d399'; // Bright emerald green axis
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    // X Axis
    ctx.moveTo(0, oy);
    ctx.lineTo(w, oy);
    // Y Axis
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox, h);
    ctx.stroke();

    // Arrows on X and Y Axes
    ctx.fillStyle = '#34d399';
    // X arrow
    ctx.beginPath();
    ctx.moveTo(w - 2, oy);
    ctx.lineTo(w - 12, oy - 5);
    ctx.lineTo(w - 12, oy + 5);
    ctx.closePath();
    ctx.fill();

    // Y arrow
    ctx.beginPath();
    ctx.moveTo(ox, 2);
    ctx.lineTo(ox - 5, 12);
    ctx.lineTo(ox + 5, 12);
    ctx.closePath();
    ctx.fill();

    // Axis Labels: X, X', Y, Y'
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('X', w - 18, oy - 10);
    ctx.fillText("X'", 8, oy - 10);
    ctx.fillText('Y', ox + 10, 20);
    ctx.fillText("Y'", ox + 10, h - 10);

    // 4. Tick Marks & Numbers on Axes
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X axis ticks
    const minUnitX = Math.floor(-ox / scale);
    const maxUnitX = Math.ceil((w - ox) / scale);
    for (let u = minUnitX; u <= maxUnitX; u++) {
      if (u === 0) continue;
      const px = ox + u * scale;
      ctx.beginPath();
      ctx.moveTo(px, oy - 4);
      ctx.lineTo(px, oy + 4);
      ctx.stroke();
      ctx.fillText(u.toString(), px, oy + 6);
    }

    // Y axis ticks
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const minUnitY = Math.floor((oy - h) / scale);
    const maxUnitY = Math.ceil(oy / scale);
    for (let u = minUnitY; u <= maxUnitY; u++) {
      if (u === 0) continue;
      const py = oy - u * scale;
      ctx.beginPath();
      ctx.moveTo(ox - 4, py);
      ctx.lineTo(ox + 4, py);
      ctx.stroke();
      ctx.fillText(u.toString(), ox - 6, py);
    }

    // Origin (0,0) label
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('O', ox - 6, oy + 6);

    // 5. Plot Equation curve (e.g. y = mx + c or y = ax^2)
    if (showEquation && equationInput.trim()) {
      try {
        ctx.strokeStyle = '#f59e0b'; // Amber equation line
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let started = false;

        for (let px = 0; px <= w; px += 2) {
          const mathX = (px - ox) / scale;
          // evaluate expression safely
          // replace x with number
          const sanitized = equationInput.replace(/x/g, `(${mathX})`);
          // simple eval safe math functions
          const mathY = Function(`"use strict"; return (${sanitized})`)();
          if (typeof mathY === 'number' && !isNaN(mathY) && isFinite(mathY)) {
            const py = oy - mathY * scale;
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          }
        }
        ctx.stroke();
      } catch {
        // invalid syntax ignored safely
      }
    }

    // 6. Plot Points
    for (const pt of points) {
      const px = ox + pt.x * scale;
      const py = oy - pt.y * scale;

      // Outer ring
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(pt.label || `(${pt.x}, ${pt.y})`, px + 8, py - 4);
    }

    // 7. Render Freehand strokes on graph
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const st of graphStrokes) {
      if (st.points.length < 2) continue;
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(st.points[0].x, st.points[0].y);
      for (let i = 1; i < st.points.length; i++) {
        ctx.lineTo(st.points[i].x, st.points[i].y);
      }
      ctx.stroke();
    }
  }, [isOpen, scale, originOffset, points, equationInput, showEquation, graphStrokes, panelWidthPercent]);

  // Pointer interactions on graph canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (e.button === 1 || e.altKey || e.shiftKey) {
      // Pan origin
      isPanningRef.current = true;
      panStartRef.current = { x: clientX - originOffset.x, y: clientY - originOffset.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Draw stroke
    setIsDrawing(true);
    currentGraphStroke.current = [{ x: clientX, y: clientY }];
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isPanningRef.current) {
      setOriginOffset({
        x: clientX - panStartRef.current.x,
        y: clientY - panStartRef.current.y,
      });
      return;
    }

    if (isDrawing) {
      currentGraphStroke.current.push({ x: clientX, y: clientY });
      // update strokes preview
      setGraphStrokes(prev => [
        ...prev.slice(0, prev.length - (currentGraphStroke.current.length > 2 ? 1 : 0)),
        { points: [...currentGraphStroke.current], color: '#38bdf8' }
      ]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      return;
    }
    if (isDrawing) {
      setIsDrawing(false);
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    }
  };

  // Add Point
  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const xVal = parseFloat(newPtX);
    const yVal = parseFloat(newPtY);
    if (!isNaN(xVal) && !isNaN(yVal)) {
      setPoints(prev => [
        ...prev,
        {
          x: xVal,
          y: yVal,
          label: `P(${xVal}, ${yVal})`,
          color: '#38bdf8',
        },
      ]);
      setNewPtX('');
      setNewPtY('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed top-14 bottom-14 z-20 flex flex-col bg-slate-900 border-2 border-emerald-500/60 shadow-2xl transition-all duration-150 select-none ${
        dockSide === 'right' ? 'right-0 border-r-0 rounded-l-2xl' : 'left-0 border-l-0 rounded-r-2xl'
      }`}
      style={{ width: `${panelWidthPercent}%` }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-emerald-500/30 text-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Classroom Graph Sheet</span>
              <span className="text-[10px] font-mono text-emerald-400 font-normal">
                (X-Y Axes)
              </span>
            </div>
          </div>
        </div>

        {/* Width Controls: Reduce / Expand Graph Sheet */}
        <div className="flex items-center gap-1.5 bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-700">
          <span className="text-[10px] text-slate-400 font-semibold">Width:</span>
          {[30, 40, 50, 65].map(pct => (
            <button
              key={pct}
              onClick={() => onWidthChange(pct)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                panelWidthPercent === pct
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={`Set Graph Sheet to ${pct}% screen width`}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Actions: Flip Dock Side, Zoom, Close */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale(s => Math.min(80, s + 5))}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Zoom In Grid"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(15, s - 5))}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Zoom Out Grid"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setOriginOffset({ x: 0, y: 0 }); setScale(30); }}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Reset Origin (0,0)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleDockSide}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title={dockSide === 'right' ? 'Dock to Left' : 'Dock to Right'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-900/50 text-slate-400 hover:text-rose-300"
            title="Close Graph Sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Graph Canvas */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Floating Controls Bar inside graph */}
        <div className="absolute top-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Plot Equation Pill */}
          <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg text-xs backdrop-blur-xs">
            <span className="font-mono text-emerald-400 font-bold">y =</span>
            <input
              type="text"
              value={equationInput}
              onChange={e => setEquationInput(e.target.value)}
              placeholder="e.g. 2*x + 1 or x*x - 4"
              className="w-32 sm:w-44 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-white focus:outline-hidden focus:border-emerald-400"
            />
            <button
              onClick={() => setShowEquation(!showEquation)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                showEquation ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Plot
            </button>
          </div>

          {/* Quick Plot Point & Clear */}
          <div className="pointer-events-auto flex items-center gap-1">
            <form onSubmit={handleAddPoint} className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-900/90 border border-slate-700 shadow-lg backdrop-blur-xs text-xs">
              <span className="text-[10px] text-slate-400">Point:</span>
              <input
                type="number"
                step="any"
                placeholder="X"
                value={newPtX}
                onChange={e => setNewPtX(e.target.value)}
                className="w-10 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-center font-mono text-xs text-white"
              />
              <span className="text-slate-500">,</span>
              <input
                type="number"
                step="any"
                placeholder="Y"
                value={newPtY}
                onChange={e => setNewPtY(e.target.value)}
                className="w-10 px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-center font-mono text-xs text-white"
              />
              <button
                type="submit"
                className="p-1 rounded bg-sky-600 hover:bg-sky-500 text-white"
                title="Add Point"
              >
                <Plus className="w-3 h-3" />
              </button>
            </form>

            <button
              onClick={() => { setPoints([]); setGraphStrokes([]); }}
              className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 shadow-lg backdrop-blur-xs"
              title="Clear Points & Freehand Lines"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legend / Helper Tip */}
        <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-emerald-400/80 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30 backdrop-blur-xs">
          1 Grid Box = 1 Unit | Shift/Alt + Drag to Pan Origin
        </div>
      </div>
    </div>
  );
};
