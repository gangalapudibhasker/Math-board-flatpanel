import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Minus, 
  PieChart,
  BarChart2,
  GitCompare,
  Layers
} from 'lucide-react';

interface FractionsToolProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToCanvas: (dataUrl: string, width: number, height: number, label: string) => void;
}

type FractionDisplayMode = 'bar' | 'pie' | 'compare' | 'wall';

export const FractionsTool: React.FC<FractionsToolProps> = ({
  isOpen,
  onClose,
  onInsertToCanvas,
}) => {
  const [mode, setMode] = useState<FractionDisplayMode>('bar');
  
  // Fraction 1
  const [num, setNum] = useState<number>(3);
  const [den, setDen] = useState<number>(4);
  const [color, setColor] = useState<string>('#38bdf8'); // Sky Blue
  const [showLabels] = useState<boolean>(true);
  const [labelFormat] = useState<'fraction' | 'decimal' | 'percent'>('fraction');

  // Interactive slice toggles for Pie/Bar
  const [customShaded, setCustomShaded] = useState<boolean[]>(() => {
    const arr = new Array(4).fill(false);
    for (let i = 0; i < 3; i++) arr[i] = true;
    return arr;
  });

  // Fraction 2 (for Compare mode)
  const [num2, setNum2] = useState<number>(2);
  const [den2, setDen2] = useState<number>(3);
  const [color2] = useState<string>('#10b981'); // Emerald

  if (!isOpen) return null;

  // GCD helper
  const getGcd = (a: number, b: number): number => {
    return b === 0 ? a : getGcd(b, a % b);
  };
  const gcd = getGcd(num, den);
  const simpNum = num / gcd;
  const simpDen = den / gcd;
  const isSimplified = simpNum === num && simpDen === den;

  const decimalVal = den > 0 ? (num / den).toFixed(3).replace(/\.?0+$/, '') : '0';
  const percentVal = den > 0 ? Math.round((num / den) * 100) : 0;

  // Sync custom shaded array when den changes
  const updateDenominator = (newDen: number) => {
    const clamped = Math.max(1, Math.min(16, newDen));
    setDen(clamped);
    const newShaded = new Array(clamped).fill(false);
    const count = Math.min(num, clamped);
    for (let i = 0; i < count; i++) newShaded[i] = true;
    setCustomShaded(newShaded);
  };

  const updateNumerator = (newNum: number) => {
    const clamped = Math.max(0, Math.min(den, newNum));
    setNum(clamped);
    const newShaded = new Array(den).fill(false);
    for (let i = 0; i < clamped; i++) newShaded[i] = true;
    setCustomShaded(newShaded);
  };

  const toggleSegment = (index: number) => {
    const next = [...customShaded];
    next[index] = !next[index];
    setCustomShaded(next);
    setNum(next.filter(Boolean).length);
  };

  const presetColors = [
    { name: 'Sky Blue', hex: '#38bdf8' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose Red', hex: '#f43f5e' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Gold Yellow', hex: '#eab308' },
  ];

  // Render to canvas and insert as image
  const handleInsert = () => {
    const canvas = document.createElement('canvas');
    const scale = 2; // high-res
    let width = 640;
    let height = 360;

    if (mode === 'bar') {
      width = 680;
      height = 260;
    } else if (mode === 'pie') {
      width = 520;
      height = 420;
    } else if (mode === 'compare') {
      width = 720;
      height = 380;
    } else if (mode === 'wall') {
      width = 760;
      height = 480;
    }

    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);

    // Dark rounded background card
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, width - 8, height - 8, 20);
    ctx.fill();
    ctx.stroke();

    if (mode === 'bar') {
      // Header text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Fraction Bar: ${num}/${den}`, 28, 42);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(`= ${decimalVal} (${percentVal}%) ${!isSimplified ? `• Simplified: ${simpNum}/${simpDen}` : ''}`, 28, 68);

      // Bar container
      const barX = 28;
      const barY = 90;
      const barW = width - 56;
      const barH = 75;
      const segW = barW / den;

      for (let i = 0; i < den; i++) {
        const isShaded = customShaded[i];
        ctx.fillStyle = isShaded ? color : 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(barX + i * segW, barY, segW, barH);

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX + i * segW, barY, segW, barH);

        // Labels
        if (showLabels) {
          ctx.fillStyle = isShaded ? '#0f172a' : '#94a3b8';
          ctx.font = 'bold 15px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const lbl = labelFormat === 'fraction' ? `1/${den}` : labelFormat === 'percent' ? `${Math.round(100/den)}%` : (1/den).toFixed(2);
          ctx.fillText(lbl, barX + i * segW + segW / 2, barY + barH / 2);
        }
      }

      // Legend bottom
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Shaded: ${num} of ${den} parts (${percentVal}%)`, 28, 210);

    } else if (mode === 'pie') {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Fraction Circle: ${num}/${den}`, width / 2, 38);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(`= ${decimalVal} (${percentVal}%)`, width / 2, 62);

      const cx = width / 2;
      const cy = 230;
      const r = 135;
      const angleStep = (Math.PI * 2) / den;

      for (let i = 0; i < den; i++) {
        const startA = -Math.PI / 2 + i * angleStep;
        const endA = startA + angleStep;
        const isShaded = customShaded[i];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startA, endA);
        ctx.closePath();

        ctx.fillStyle = isShaded ? color : 'rgba(30, 41, 59, 0.9)';
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (showLabels && den <= 12) {
          const midA = startA + angleStep / 2;
          const labelR = r * 0.65;
          const lx = cx + Math.cos(midA) * labelR;
          const ly = cy + Math.sin(midA) * labelR;
          ctx.fillStyle = isShaded ? '#0f172a' : '#94a3b8';
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`1/${den}`, lx, ly);
        }
      }

      // Center pivot point
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Shaded: ${num} / ${den} sectors (${percentVal}%)`, cx, 395);

    } else if (mode === 'compare') {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Comparing Fractions', 28, 40);

      const val1 = num / den;
      const val2 = num2 / den2;
      const compSym = val1 > val2 ? '>' : val1 < val2 ? '<' : '=';

      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`${num}/${den}  ${compSym}  ${num2}/${den2}`, 28, 75);

      // Bar 1
      const bX = 28;
      const bW = width - 56;
      const bH = 50;

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px system-ui';
      ctx.fillText(`Fraction A: ${num}/${den} (${(val1 * 100).toFixed(1)}%)`, bX, 115);

      const segW1 = bW / den;
      for (let i = 0; i < den; i++) {
        ctx.fillStyle = i < num ? color : 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(bX + i * segW1, 125, segW1, bH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bX + i * segW1, 125, segW1, bH);
      }

      // Bar 2
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px system-ui';
      ctx.fillText(`Fraction B: ${num2}/${den2} (${(val2 * 100).toFixed(1)}%)`, bX, 220);

      const segW2 = bW / den2;
      for (let i = 0; i < den2; i++) {
        ctx.fillStyle = i < num2 ? color2 : 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(bX + i * segW2, 230, segW2, bH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bX + i * segW2, 230, segW2, bH);
      }

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px system-ui';
      ctx.fillText(
        val1 === val2 
          ? `These fractions are equivalent: ${num}/${den} = ${num2}/${den2}`
          : `${num}/${den} is ${val1 > val2 ? 'greater than' : 'less than'} ${num2}/${den2}`,
        bX,
        330
      );

    } else if (mode === 'wall') {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Fraction Wall / Strips Reference', width / 2, 36);

      const wallDens = [1, 2, 3, 4, 5, 6, 8, 10, 12];
      const wallColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
      const startY = 60;
      const stripH = 38;
      const bX = 24;
      const bW = width - 48;

      wallDens.forEach((d, rowIdx) => {
        const y = startY + rowIdx * 43;
        const sW = bW / d;
        const c = wallColors[rowIdx % wallColors.length];

        for (let i = 0; i < d; i++) {
          ctx.fillStyle = c;
          ctx.fillRect(bX + i * sW, y, sW, stripH);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.strokeRect(bX + i * sW, y, sW, stripH);

          ctx.fillStyle = '#0f172a';
          ctx.font = `bold ${d > 8 ? 10 : 12}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(d === 1 ? '1 Whole' : `1/${d}`, bX + i * sW + sW / 2, y + stripH / 2);
        }
      });
    }

    const dataUrl = canvas.toDataURL('image/png');
    onInsertToCanvas(dataUrl, width, height, `Fraction: ${num}/${den}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg font-mono font-bold text-base">
              ½
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Fractions Tool</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  Interactive
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Visual fraction bars, pie sectors, comparison & fraction walls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 bg-slate-900/60 border-b border-slate-800">
          {[
            { id: 'bar', label: 'Fraction Bar', icon: <BarChart2 className="w-4 h-4" /> },
            { id: 'pie', label: 'Fraction Circle (Pie)', icon: <PieChart className="w-4 h-4" /> },
            { id: 'compare', label: 'Compare Fractions', icon: <GitCompare className="w-4 h-4" /> },
            { id: 'wall', label: 'Fraction Wall', icon: <Layers className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as FractionDisplayMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === tab.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {mode !== 'wall' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {/* Math Notation Display */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex flex-col items-center font-bold">
                  <span className="text-3xl font-mono text-sky-400">{num}</span>
                  <div className="w-12 h-1 bg-white my-1 rounded-full" />
                  <span className="text-3xl font-mono text-slate-100">{den}</span>
                </div>
                <div className="mt-2 text-xs text-slate-400 font-mono text-center">
                  <span>= {decimalVal}</span>
                  <span className="mx-1 text-slate-600">•</span>
                  <span className="text-emerald-400 font-bold">{percentVal}%</span>
                </div>
                {!isSimplified && (
                  <div className="mt-1 text-[11px] text-amber-400 font-semibold">
                    Simplified: {simpNum}/{simpDen}
                  </div>
                )}
              </div>

              {/* Numerator & Denominator Steppers */}
              <div className="space-y-3 md:col-span-2">
                {/* Numerator control */}
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Numerator (Shaded):</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateNumerator(num - 1)}
                      disabled={num <= 0}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-base font-bold text-sky-400 w-8 text-center">{num}</span>
                    <button
                      onClick={() => updateNumerator(num + 1)}
                      disabled={num >= den}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Denominator control */}
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Denominator (Total Parts):</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateDenominator(den - 1)}
                      disabled={den <= 1}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-base font-bold text-white w-8 text-center">{den}</span>
                    <button
                      onClick={() => updateDenominator(den + 1)}
                      disabled={den >= 16}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Color and Quick Fractions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Color:</span>
                    {presetColors.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => setColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                          color === c.hex ? 'border-white scale-110 ring-2 ring-sky-400' : 'border-black/30 hover:scale-105'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    {[
                      { n: 1, d: 2 },
                      { n: 1, d: 3 },
                      { n: 3, d: 4 },
                      { n: 4, d: 5 },
                    ].map(p => (
                      <button
                        key={`${p.n}/${p.d}`}
                        onClick={() => {
                          setDen(p.d);
                          setNum(p.n);
                          const arr = new Array(p.d).fill(false);
                          for (let i = 0; i < p.n; i++) arr[i] = true;
                          setCustomShaded(arr);
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-mono font-bold cursor-pointer"
                      >
                        {p.n}/{p.d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Preview Canvas / Visual Model */}
          {mode === 'bar' && (
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-200">Interactive Fraction Strip (Tap any box to toggle shading):</span>
                <span>{num} of {den} shaded</span>
              </div>

              {/* Interactive Bar */}
              <div className="w-full h-16 rounded-xl overflow-hidden border-2 border-slate-400 flex shadow-inner bg-slate-900">
                {Array.from({ length: den }).map((_, idx) => {
                  const isShaded = customShaded[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleSegment(idx)}
                      style={{
                        width: `${100 / den}%`,
                        backgroundColor: isShaded ? color : 'transparent',
                      }}
                      className="h-full border-r border-slate-400 last:border-r-0 flex items-center justify-center transition-colors hover:brightness-110 cursor-pointer active:scale-95 group relative"
                      title={`Tap to shade/unshade part ${idx + 1}`}
                    >
                      <span className={`text-xs font-mono font-bold ${isShaded ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`}>
                        1/{den}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>0</span>
                <span>½ ({den % 2 === 0 ? `${den/2}/${den}` : `${(den/2).toFixed(1)}/${den}`})</span>
                <span>1 Whole ({den}/{den})</span>
              </div>
            </div>
          )}

          {mode === 'pie' && (
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <div className="w-full flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-200">Interactive Circle Sectors (Tap any slice to toggle shading):</span>
                <span>{num} / {den} sectors</span>
              </div>

              {/* Interactive SVG Pie */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg viewBox="-120 -120 240 240" className="w-56 h-56 transform -rotate-90">
                  {Array.from({ length: den }).map((_, idx) => {
                    const angleStep = (Math.PI * 2) / den;
                    const startA = idx * angleStep;
                    const endA = (idx + 1) * angleStep;
                    const r = 105;
                    const x1 = Math.cos(startA) * r;
                    const y1 = Math.sin(startA) * r;
                    const x2 = Math.cos(endA) * r;
                    const y2 = Math.sin(endA) * r;
                    const largeArc = angleStep > Math.PI ? 1 : 0;
                    const pathData = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    const isShaded = customShaded[idx];

                    return (
                      <path
                        key={idx}
                        d={pathData}
                        fill={isShaded ? color : '#1e293b'}
                        stroke="#f8fafc"
                        strokeWidth="2"
                        onClick={() => toggleSegment(idx)}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    );
                  })}
                  <circle cx="0" cy="0" r="4" fill="#ffffff" />
                </svg>
              </div>
            </div>
          )}

          {mode === 'compare' && (
            <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Second Fraction for Comparison:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Fraction B:</span>
                  <button
                    onClick={() => setNum2(Math.max(0, num2 - 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-emerald-400">{num2}</span>
                  <button
                    onClick={() => setNum2(Math.min(den2, num2 + 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-slate-400">/</span>
                  <button
                    onClick={() => setDen2(Math.max(1, den2 - 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-white">{den2}</span>
                  <button
                    onClick={() => setDen2(Math.min(16, den2 + 1))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Visual Side-by-side comparison bars */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-300 font-bold">Fraction A: {num}/{den} ({(num/den*100).toFixed(1)}%)</span>
                </div>
                <div className="w-full h-9 rounded-lg overflow-hidden border border-slate-500 flex bg-slate-900">
                  {Array.from({ length: den }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${100 / den}%`,
                        backgroundColor: idx < num ? color : 'transparent',
                      }}
                      className="h-full border-r border-slate-500 last:border-r-0 flex items-center justify-center"
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-900">1/{den}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-emerald-300 font-bold">Fraction B: {num2}/{den2} ({(num2/den2*100).toFixed(1)}%)</span>
                </div>
                <div className="w-full h-9 rounded-lg overflow-hidden border border-slate-500 flex bg-slate-900">
                  {Array.from({ length: den2 }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${100 / den2}%`,
                        backgroundColor: idx < num2 ? color2 : 'transparent',
                      }}
                      className="h-full border-r border-slate-500 last:border-r-0 flex items-center justify-center"
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-900">1/{den2}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <span className="text-sm font-bold text-white">
                  {num / den > num2 / den2 ? (
                    <span>{num}/{den} <span className="text-amber-400">&gt;</span> {num2}/{den2} ({num}/{den} is Greater)</span>
                  ) : num / den < num2 / den2 ? (
                    <span>{num}/{den} <span className="text-amber-400">&lt;</span> {num2}/{den2} ({num}/{den} is Smaller)</span>
                  ) : (
                    <span className="text-emerald-400">{num}/{den} = {num2}/{den2} (Equivalent Fractions!)</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {mode === 'wall' && (
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-slate-300 mb-2">
                Fraction Wall Chart (Equivalence Table):
              </div>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(d => (
                <div key={d} className="w-full h-7 rounded flex overflow-hidden border border-slate-700 bg-slate-900">
                  {Array.from({ length: d }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${100 / d}%` }}
                      className="h-full border-r border-slate-700 last:border-r-0 flex items-center justify-center bg-indigo-950/40 hover:bg-sky-600/30 transition text-[10px] font-mono font-bold text-slate-200"
                    >
                      {d === 1 ? '1 Whole' : `1/${d}`}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-850">
          <div className="text-xs text-slate-400">
            Click <strong className="text-sky-300">Insert to Whiteboard</strong> to place on canvas
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Insert to Whiteboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
