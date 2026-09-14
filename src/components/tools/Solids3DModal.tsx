import React, { useState, useRef, useEffect } from 'react';
import { X, Box, RotateCw, Plus, Check, Sparkles, Sliders, Layers, Eye, FoldHorizontal, UnfoldHorizontal, Maximize2 } from 'lucide-react';
import { SolidType, Solid3DElement } from '../../types';
import { SOLIDS_CATALOG, SolidInfo, drawSolid3D } from '../../utils/solids3d';
import { SOLIDS_NETS_CATALOG, drawSolidNetDiagram } from '../../utils/solidsNets';
import { MathView } from '../MathView';

interface Solids3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSolid: (solid: Solid3DElement) => void;
  onInsertMultipleSolids?: (solids: Solid3DElement[]) => void;
  activeColor: string;
}

export const Solids3DModal: React.FC<Solids3DModalProps> = ({
  isOpen,
  onClose,
  onInsertSolid,
  onInsertMultipleSolids,
  activeColor,
}) => {
  const [selectedType, setSelectedType] = useState<SolidType>('dodecahedron');
  const [activeCategory, setActiveCategory] = useState<'all' | 'natural' | 'single' | 'combination'>('natural');
  const [shadingStyle, setShadingStyle] = useState<'natural' | 'wood' | 'sandstone' | 'marble' | 'terracotta' | 'patina' | 'iridescent'>('natural');
  const [viewMode, setViewMode] = useState<'3d' | 'net'>('3d');
  const [netFoldRatio, setNetFoldRatio] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(-22);
  const [yaw, setYaw] = useState<number>(32);
  const [showFormulas, setShowFormulas] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [wireframeOnly, setWireframeOnly] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [explodeRatio, setExplodeRatio] = useState<number>(0);
  const [figureSize, setFigureSize] = useState<number>(280);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const solidInfo: SolidInfo = SOLIDS_CATALOG[selectedType] || SOLIDS_CATALOG['cube'];
  const netInfo = SOLIDS_NETS_CATALOG[selectedType];
  const isCombo = !!solidInfo.isCombination || solidInfo.category === 'combination';

  // Automatically reset or preserve explode state when switching solids
  useEffect(() => {
    if (!isCombo) {
      setIsExploded(false);
    }
  }, [selectedType, isCombo]);

  // Draw preview (3D solid OR 2D Net Diagram)
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (viewMode === 'net') {
      // Render interactive 2D Net Diagram with fold factor
      drawSolidNetDiagram(ctx, selectedType, canvas.width, canvas.height, netFoldRatio, activeColor || '#38bdf8');
    } else {
      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render 3D solid with iridescent metallic lighting & optional explode
      const previewScale = Math.min(1.4, Math.max(0.65, figureSize / 280));
      const previewDim = 210 * previewScale;
      const dummySolid: Solid3DElement = {
        id: 'preview',
        type: 'solid3d',
        solidType: selectedType,
        x: canvas.width / 2 - previewDim / 2,
        y: canvas.height / 2 - previewDim / 2,
        width: previewDim,
        height: previewDim,
        rotationX: pitch,
        rotationY: yaw,
        color: activeColor || '#38bdf8',
        shadingStyle,
        wireframeOnly,
        showFormulas: false,
        showDimensions,
        exploded: isExploded,
        explodeRatio: isExploded ? explodeRatio : 0,
        radius: solidInfo.defaultDimensions.radius,
        height3d: solidInfo.defaultDimensions.height3d,
        length: solidInfo.defaultDimensions.length,
        width3d: solidInfo.defaultDimensions.width3d,
      };

      drawSolid3D(ctx, dummySolid, 1);
    }
  }, [
    isOpen,
    viewMode,
    netFoldRatio,
    selectedType,
    pitch,
    yaw,
    activeColor,
    shadingStyle,
    wireframeOnly,
    showDimensions,
    isExploded,
    explodeRatio,
    figureSize,
    solidInfo,
  ]);

  // Handle interactive 3D rotation dragging on preview canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    if (viewMode === 'net') return;
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || viewMode === 'net') return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setYaw(prev => (prev + dx * 0.8) % 360);
    setPitch(prev => Math.max(-85, Math.min(85, prev - dy * 0.8)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleInsert = (insertAsNet: boolean = viewMode === 'net') => {
    const finalSize = insertAsNet ? Math.max(340, figureSize) : figureSize;
    const newSolid: Solid3DElement = {
      id: 'solid_' + Date.now(),
      type: 'solid3d',
      solidType: selectedType,
      x: window.innerWidth / 2 - finalSize / 2,
      y: window.innerHeight / 2 - finalSize / 2,
      width: finalSize,
      height: finalSize,
      rotationX: pitch,
      rotationY: yaw,
      color: activeColor || '#38bdf8',
      shadingStyle,
      wireframeOnly,
      showFormulas: !insertAsNet && showFormulas,
      showDimensions: !insertAsNet && showDimensions,
      showNet: insertAsNet,
      netFoldRatio: insertAsNet ? netFoldRatio : 0,
      exploded: isCombo ? isExploded : false,
      explodeRatio: isCombo && isExploded ? explodeRatio : 0,
      radius: solidInfo.defaultDimensions.radius,
      height3d: solidInfo.defaultDimensions.height3d,
      length: solidInfo.defaultDimensions.length,
      width3d: solidInfo.defaultDimensions.width3d,
      label: insertAsNet ? `Net of ${solidInfo.name}` : solidInfo.name,
    };

    onInsertSolid(newSolid);
    onClose();
  };

  // Insert Full Studio Scene matching user's photo with natural materials
  const handleInsertStudioScene = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const scene: Solid3DElement[] = [
      // 1. Natural Wood Dodecahedron (Centerpiece)
      {
        id: 'solid_wood_dodeca_' + Date.now(),
        type: 'solid3d',
        solidType: 'dodecahedron',
        x: cx - 115,
        y: cy - 105,
        width: 250,
        height: 250,
        rotationX: -18,
        rotationY: 28,
        color: '#f59e0b',
        shadingStyle: 'wood',
        showDimensions: false,
        showFormulas: false,
        label: 'Natural Wood Dodecahedron',
      },
      // 2. Sandstone Octahedron (Right side, standing upright)
      {
        id: 'solid_sand_octa_' + Date.now() + 1,
        type: 'solid3d',
        solidType: 'octahedron',
        x: cx + 130,
        y: cy - 90,
        width: 220,
        height: 240,
        rotationX: -12,
        rotationY: 35,
        color: '#d97706',
        shadingStyle: 'sandstone',
        showDimensions: false,
        showFormulas: false,
        label: 'Sandstone Octahedron',
      },
      // 3. White Marble Icosahedron (Left side foreground)
      {
        id: 'solid_marble_ico_' + Date.now() + 2,
        type: 'solid3d',
        solidType: 'icosahedron',
        x: cx - 310,
        y: cy - 40,
        width: 210,
        height: 210,
        rotationX: -20,
        rotationY: 42,
        color: '#f8fafc',
        shadingStyle: 'marble',
        showDimensions: false,
        showFormulas: false,
        label: 'White Marble Icosahedron',
      },
      // 4. Terracotta Pedestal Sphere / Pawn (Back-left)
      {
        id: 'solid_pawn_' + Date.now() + 3,
        type: 'solid3d',
        solidType: 'pawn-sphere',
        x: cx - 260,
        y: cy - 250,
        width: 220,
        height: 240,
        rotationX: -15,
        rotationY: 20,
        color: '#ea580c',
        shadingStyle: 'terracotta',
        showDimensions: false,
        showFormulas: false,
        label: 'Terracotta Pedestal Finial',
      },
      // 5. Patina Jade Sphere (Foreground right)
      {
        id: 'solid_patina_sph_' + Date.now() + 4,
        type: 'solid3d',
        solidType: 'sphere',
        x: cx + 45,
        y: cy + 70,
        width: 165,
        height: 165,
        rotationX: 0,
        rotationY: 0,
        color: '#14b8a6',
        shadingStyle: 'patina',
        showDimensions: false,
        showFormulas: false,
        label: 'Jade Patina Sphere',
      },
      // 6. Warm Terracotta Sphere (Foreground center-left)
      {
        id: 'solid_terra_sph_' + Date.now() + 5,
        type: 'solid3d',
        solidType: 'sphere',
        x: cx - 165,
        y: cy + 85,
        width: 155,
        height: 155,
        rotationX: 0,
        rotationY: 0,
        color: '#ea580c',
        shadingStyle: 'terracotta',
        showDimensions: false,
        showFormulas: false,
        label: 'Terracotta Sphere',
      },
    ];

    if (onInsertMultipleSolids) {
      onInsertMultipleSolids(scene);
    } else {
      scene.forEach(s => onInsertSolid(s));
    }
    onClose();
  };

  if (!isOpen) return null;

  const naturalTypes: SolidType[] = [
    'dodecahedron',
    'octahedron',
    'icosahedron',
    'pawn-sphere',
    'faceted-gem',
    'sphere',
    'tetrahedron',
    'hourglass',
  ];

  const filteredSolids = Object.values(SOLIDS_CATALOG).filter(s => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'natural') return naturalTypes.includes(s.type);
    return s.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 select-none">
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-850 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                3D Solids & Combination of Solids
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch: 3D Movable Object vs. 2D Net Diagram */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === '3d'
                  ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>3D Movable Object</span>
            </button>

            <button
              onClick={() => setViewMode('net')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'net'
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UnfoldHorizontal className="w-4 h-4" />
              <span>2D Net Diagram (Unfold)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            {viewMode === 'net' && (
              <span className="text-purple-300">Fold/Unfold Geometry Nets for Surface Area</span>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2 bg-slate-950/70 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('natural')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === 'natural'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Realistic Figures (as in Image)</span>
            </button>
            <button
              onClick={() => setActiveCategory('combination')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeCategory === 'combination'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Combination Solids (with Explode)</span>
            </button>
            <button
              onClick={() => setActiveCategory('single')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCategory === 'single'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Single Polyhedra & Solids
            </button>
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCategory === 'all'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Solids
            </button>
          </div>

          <button
            onClick={handleInsertStudioScene}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-amber-950/40 transition active:scale-95"
            title="Place all natural 3D figures (Dodecahedron, Octahedron, Icosahedron, Pedestal Sphere, etc.) together onto the whiteboard"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Insert Studio Scene (All Figures as in Image)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left: Solid Cards Grid with KaTeX Formulas */}
          <div className="md:col-span-5 p-3 sm:p-4 overflow-y-auto space-y-2 border-r border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Select Solid / Combination:
            </div>
            {filteredSolids.map(solid => {
              const isSelected = selectedType === solid.type;
              return (
                <button
                  key={solid.type}
                  onClick={() => setSelectedType(solid.type)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between ${
                    isSelected
                      ? 'bg-sky-950/70 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                      : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="min-w-0 pr-2 flex-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{solid.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {solid.description}
                    </div>
                    {/* Typeset LaTeX formula in list card */}
                    <div className="mt-1.5 text-xs text-sky-300 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-750">
                      <MathView math={solid.latexV} />
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Interactive 3D Canvas Preview, Explode Control, and KaTeX Formula Cards */}
          <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3.5">
              {/* Interactive 3D Canvas */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950 flex flex-col items-center">
                <canvas
                  ref={previewCanvasRef}
                  width={420}
                  height={240}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="cursor-grab active:cursor-grabbing touch-none w-full max-w-[420px] h-[240px]"
                  title="Click & Drag to Rotate in 3D"
                />

                {/* Drag Tip / Net Info */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none text-[10px] text-slate-300 bg-slate-900/85 px-2.5 py-1 rounded-lg border border-slate-750 backdrop-blur-xs">
                  {viewMode === '3d' ? (
                    <>
                      <span className="flex items-center gap-1 text-sky-300">
                        <RotateCw className="w-3 h-3 animate-spin" />
                        <span>Drag inside canvas to rotate in 3D</span>
                      </span>
                      <span className="font-mono">
                        Pitch: {Math.round(pitch)}° | Yaw: {Math.round(yaw)}°
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1 text-purple-300">
                        <UnfoldHorizontal className="w-3 h-3" />
                        <span>2D Unfolded Surface Net • {netInfo ? `${netInfo.numFaces} Faces` : 'Geometric Net'}</span>
                      </span>
                      <span className="font-mono text-purple-200">
                        Fold: {Math.round(netFoldRatio * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Net Diagram Fold / Unfold Interactive Controls */}
              {viewMode === 'net' && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FoldHorizontal className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Fold / Unfold Net Animation</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setNetFoldRatio(0)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          netFoldRatio === 0 ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                        }`}
                      >
                        0% Flat (2D Net)
                      </button>
                      <button
                        onClick={() => setNetFoldRatio(0.5)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          netFoldRatio === 0.5 ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                        }`}
                      >
                        50% Half-Fold
                      </button>
                      <button
                        onClick={() => setNetFoldRatio(1)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          netFoldRatio === 1 ? 'bg-purple-600 text-white' : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                        }`}
                      >
                        100% Solid
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-slate-400 shrink-0">Fold Progress:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={netFoldRatio}
                      onChange={e => setNetFoldRatio(parseFloat(e.target.value))}
                      className="flex-1 accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-xs text-purple-300 font-bold w-12 text-right">
                      {Math.round(netFoldRatio * 100)}%
                    </span>
                  </div>

                  {netInfo && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-900/40 text-[11px] text-purple-200/90 space-y-1">
                      <div className="font-semibold text-purple-300">
                        {netInfo.name}: {netInfo.description}
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {netInfo.faces.map((f, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700/40 text-[10px] text-purple-200"
                          >
                            {f.label}: {f.shape} ({f.formula})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Natural Material Shading Selector (matching uploaded reference photo) */}
              {viewMode === '3d' && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Material Shading Style (as in Image)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Ray-shaded lighting & textures
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-0.5">
                    {[
                      { id: 'natural', label: 'Natural', desc: 'As in Photo' },
                      { id: 'wood', label: 'Wood', desc: 'Warm Walnut' },
                      { id: 'sandstone', label: 'Sandstone', desc: 'Natural Stone' },
                      { id: 'marble', label: 'Marble', desc: 'White Porcelain' },
                      { id: 'terracotta', label: 'Terracotta', desc: 'Warm Clay' },
                      { id: 'patina', label: 'Patina', desc: 'Jade Teal' },
                      { id: 'iridescent', label: 'Metallic', desc: 'Spectrum Glow' },
                    ].map(mat => (
                      <button
                        key={mat.id}
                        onClick={() => setShadingStyle(mat.id as any)}
                        className={`px-2 py-1.5 rounded-lg text-center transition flex flex-col items-center ${
                          shadingStyle === mat.id
                            ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                            : 'bg-slate-900/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-750'
                        }`}
                      >
                        <span className="text-[11px] font-bold leading-tight">{mat.label}</span>
                        <span className="text-[8px] opacity-75 leading-tight">{mat.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3D Figure Size & Scale Option (Presets + Slider) */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>3D Figure Size & Scale</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                    {figureSize}px × {figureSize}px ({Math.round((figureSize / 280) * 100)}%)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[
                      { label: 'Small', size: 180 },
                      { label: 'Medium', size: 280 },
                      { label: 'Large', size: 380 },
                      { label: 'X-Large', size: 500 },
                    ].map(preset => (
                      <button
                        key={preset.size}
                        type="button"
                        onClick={() => setFigureSize(preset.size)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          figureSize === preset.size
                            ? 'bg-sky-600 text-white shadow-md ring-1 ring-sky-400'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
                        }`}
                      >
                        <span>{preset.label}</span>
                        <span className="text-[9px] opacity-75">({preset.size}px)</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 min-w-[130px] flex items-center gap-2 px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700">
                    <input
                      type="range"
                      min={140}
                      max={580}
                      step={10}
                      value={figureSize}
                      onChange={e => setFigureSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      title="Adjust 3D figure size"
                    />
                  </div>
                </div>
              </div>

              {/* Explode Option for Combination of Solids (3D Mode) */}
              {viewMode === '3d' && isCombo && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsExploded(!isExploded)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          isExploded
                            ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                            : 'bg-slate-800 text-amber-300 hover:bg-slate-750 border border-amber-600/40'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isExploded ? '💥 Disassembled (Exploded)' : '💥 Explode Combination'}</span>
                      </button>
                      <span className="text-[11px] text-slate-400">
                        {isExploded ? 'Showing component separation' : 'Click to separate parts'}
                      </span>
                    </div>

                    {isExploded && (
                      <div className="flex items-center gap-1.5">
                        {[0, 0.25, 0.5, 0.75, 1.0].map(ratio => (
                          <button
                            key={ratio}
                            onClick={() => setExplodeRatio(ratio)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                              Math.abs(explodeRatio - ratio) < 0.05
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/20'
                            }`}
                          >
                            {Math.round(ratio * 100)}%
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isExploded && (
                    <div className="pt-1 flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 shrink-0">
                        Separation Distance ({Math.round(explodeRatio * 100)}%):
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.02"
                        value={explodeRatio}
                        onChange={e => setExplodeRatio(parseFloat(e.target.value))}
                        className="flex-1 accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {solidInfo.explodeDescription && (
                    <div className="text-[11px] text-amber-200/90 leading-snug">
                      {solidInfo.explodeDescription}
                    </div>
                  )}
                </div>
              )}

              {/* Formula & Properties Box with KaTeX Typesetting */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-sky-400" />
                    <span>{solidInfo.name}</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFormulas}
                        onChange={e => setShowFormulas(e.target.checked)}
                        className="rounded-sm accent-sky-500"
                      />
                      <span>Show Formula Box</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDimensions}
                        onChange={e => setShowDimensions(e.target.checked)}
                        className="rounded-sm accent-sky-500"
                      />
                      <span>Dimensions</span>
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wireframeOnly}
                        onChange={e => setWireframeOnly(e.target.checked)}
                        className="rounded-sm accent-sky-500"
                      />
                      <span>Wireframe</span>
                    </label>
                  </div>
                </div>

                {/* Properly typeset LaTeX mathematical expressions (Volume, CSA, TSA) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* Volume (V) */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-750 flex flex-col justify-between">
                    <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                      Volume (V)
                    </div>
                    <div className="py-1 text-sky-200 text-sm overflow-x-auto">
                      <MathView math={solidInfo.latexV} />
                    </div>
                  </div>

                  {/* Curved Surface Area (CSA/LSA) */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-750 flex flex-col justify-between">
                    <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Curved / Lateral Area
                    </div>
                    <div className="py-1 text-amber-200 text-sm overflow-x-auto">
                      <MathView math={solidInfo.latexCSA} />
                    </div>
                  </div>

                  {/* Total Surface Area (TSA) */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-750 flex flex-col justify-between">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Total Surface Area (TSA)
                    </div>
                    <div className="py-1 text-emerald-200 text-sm overflow-x-auto">
                      <MathView math={solidInfo.latexTSA} />
                    </div>
                  </div>
                </div>

                {/* Variables & Dimensions Note */}
                {solidInfo.latexVars && (
                  <div className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-750 flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-semibold shrink-0">Variables:</span>
                    <MathView math={solidInfo.latexVars} className="text-slate-200" />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400">
                {viewMode === 'net' ? 'Insert unfolded 2D surface net diagram' : ''}
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                {viewMode === '3d' && (
                  <button
                    onClick={handleInsertStudioScene}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 transition active:scale-95"
                    title="Insert full studio scene with realistic 3D figures as shown in the photo"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span className="hidden sm:inline">Insert All Figures (as in Photo)</span>
                    <span className="sm:hidden">All Figures</span>
                  </button>
                )}

                {viewMode === 'net' ? (
                  <button
                    onClick={() => handleInsert(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition active:scale-95"
                  >
                    <UnfoldHorizontal className="w-4 h-4" />
                    <span>Insert 2D Net onto Whiteboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleInsert(false)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-900/40 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert 3D Solid</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
