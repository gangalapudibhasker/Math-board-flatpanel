import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  BoardPage, 
  BoardElement, 
  ToolType, 
  ShapeType, 
  StrokeElement, 
  ShapeElement, 
  TextElement, 
  ImageElement, 
  StickyNoteElement,
  Solid3DElement,
  Point,
  PenSensitivityConfig
} from '../types';
import { 
  Trash2, 
  Move, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Box, 
  RotateCw, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Eye, 
  EyeOff,
  X,
  Crop,
  Scissors,
  Zap, 
  Copy, 
  Maximize2,
  Shapes,
  Edit3,
  Type,
  Layers,
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { detectGeometricShape } from '../utils/shapeDetection';
import { drawSolid3D, SOLIDS_CATALOG } from '../utils/solids3d';
import { drawGeometricShape, isPointInPolygon } from '../utils/shapeDrawing';
import { MathView } from './MathView';
import { 
  renderStrokeToContext, 
  smoothStrokePointsWithPressure, 
  calculateStrokeWidths, 
  DEFAULT_PEN_SENSITIVITY 
} from '../utils/penStroke';


interface ImageCropModalProps {
  image: ImageElement;
  onClose: () => void;
  onApplyCrop: (newSrc: string, newAspect: number, newW: number, newH: number) => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ image, onClose, onApplyCrop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [cropBox, setCropBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setIsDragging(true);
    setCropBox({ startX: x, startY: y, currentX: x, currentY: y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !cropBox || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setCropBox(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const getCropRect = () => {
    if (!cropBox || !imgRef.current) return null;
    const rect = imgRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const minX = Math.min(cropBox.startX, cropBox.currentX);
    const minY = Math.min(cropBox.startY, cropBox.currentY);
    const w = Math.abs(cropBox.currentX - cropBox.startX);
    const h = Math.abs(cropBox.currentY - cropBox.startY);
    return {
      relX: minX / rect.width,
      relY: minY / rect.height,
      relW: w / rect.width,
      relH: h / rect.height,
      pixelX: minX,
      pixelY: minY,
      pixelW: w,
      pixelH: h,
    };
  };

  const cropRect = getCropRect();
  const hasValidCrop = !!(cropRect && cropRect.pixelW > 20 && cropRect.pixelH > 20);

  const applyCrop = () => {
    if (!hasValidCrop || !cropRect || !imgRef.current) return;
    const naturalW = imgRef.current.naturalWidth || imgRef.current.width;
    const naturalH = imgRef.current.naturalHeight || imgRef.current.height;

    const cropX = Math.max(0, Math.round(cropRect.relX * naturalW));
    const cropY = Math.max(0, Math.round(cropRect.relY * naturalH));
    const cropW = Math.min(naturalW - cropX, Math.round(cropRect.relW * naturalW));
    const cropH = Math.min(naturalH - cropY, Math.round(cropRect.relH * naturalH));

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(10, cropW);
    canvas.height = Math.max(10, cropH);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(imgRef.current, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const newSrc = canvas.toDataURL('image/png');
    const newAspect = cropW / cropH;
    const newW = image.width;
    const newH = Math.round(newW / newAspect);
    onApplyCrop(newSrc, newAspect, newW, newH);
  };

  const autoTrim = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement('canvas');
    const naturalW = imgRef.current.naturalWidth || imgRef.current.width;
    const naturalH = imgRef.current.naturalHeight || imgRef.current.height;
    canvas.width = naturalW;
    canvas.height = naturalH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(imgRef.current, 0, 0);
    const imgData = ctx.getImageData(0, 0, naturalW, naturalH);
    const d = imgData.data;
    const bgR = d[0], bgG = d[1], bgB = d[2];

    let minX = naturalW, maxX = 0, minY = naturalH, maxY = 0;
    let found = false;

    for (let y = 0; y < naturalH; y += 2) {
      for (let x = 0; x < naturalW; x += 2) {
        const i = (y * naturalW + x) * 4;
        const diff = Math.abs(d[i] - bgR) + Math.abs(d[i+1] - bgG) + Math.abs(d[i+2] - bgB);
        if (d[i+3] > 20 && diff > 25) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) return;
    const pad = 16;
    const domRect = imgRef.current.getBoundingClientRect();
    const sx = domRect.width / naturalW;
    const sy = domRect.height / naturalH;

    const clampedMinX = Math.max(0, minX - pad);
    const clampedMaxX = Math.min(naturalW, maxX + pad);
    const clampedMinY = Math.max(0, minY - pad);
    const clampedMaxY = Math.min(naturalH, maxY + pad);

    setCropBox({
      startX: clampedMinX * sx,
      startY: clampedMinY * sy,
      currentX: clampedMaxX * sx,
      currentY: clampedMaxY * sy,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Crop Whiteboard Image / Template</h3>
            <span className="text-xs text-slate-400">• Drag a rectangular box to crop</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 bg-slate-950 flex items-center justify-center overflow-auto min-h-0">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative cursor-crosshair border border-slate-700 rounded-xl overflow-hidden shadow-2xl touch-none inline-block max-w-full"
          >
            <img
              ref={imgRef}
              src={image.src}
              alt="Crop target"
              className="max-h-[60vh] max-w-full object-contain pointer-events-none select-none block"
            />

            {cropRect && hasValidCrop && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bg-black/65" style={{ top: 0, left: 0, right: 0, height: `${cropRect.pixelY}px` }} />
                <div className="absolute bg-black/65" style={{ top: `${cropRect.pixelY + cropRect.pixelH}px`, left: 0, right: 0, bottom: 0 }} />
                <div className="absolute bg-black/65" style={{ top: `${cropRect.pixelY}px`, left: 0, width: `${cropRect.pixelX}px`, height: `${cropRect.pixelH}px` }} />
                <div className="absolute bg-black/65" style={{ top: `${cropRect.pixelY}px`, left: `${cropRect.pixelX + cropRect.pixelW}px`, right: 0, height: `${cropRect.pixelH}px` }} />

                <div
                  style={{
                    left: `${cropRect.pixelX}px`,
                    top: `${cropRect.pixelY}px`,
                    width: `${cropRect.pixelW}px`,
                    height: `${cropRect.pixelH}px`,
                  }}
                  className="absolute border-2 border-dashed border-sky-400 bg-sky-400/10 shadow-2xl ring-1 ring-white/40"
                >
                  <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-sky-400 border-2 border-white rounded-full shadow" />
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-sky-400 border-2 border-white rounded-full shadow" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-sky-400 border-2 border-white rounded-full shadow" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-sky-400 border-2 border-white rounded-full shadow" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-sky-300 font-mono text-[9px] font-bold border border-sky-500/40">
                    {Math.round(cropRect.pixelW)} × {Math.round(cropRect.pixelH)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={autoTrim}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 hover:text-white transition"
              title="Automatically detect content and crop blank borders"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Trim Margins</span>
            </button>
            {hasValidCrop && (
              <button
                onClick={() => setCropBox(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={applyCrop}
              disabled={!hasValidCrop}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition ${
                hasValidCrop
                  ? 'bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-900/40 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Apply Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface WhiteboardCanvasProps {
  page: BoardPage;
  activeTool: ToolType;
  activeColor: string;
  strokeWidth: number;
  selectedShape: ShapeType;
  shapeFillColor?: string;
  isStylusOnly: boolean;
  isAutoShapeEnabled?: boolean;
  onUpdateElements: (elements: BoardElement[]) => void;
  onAddElement: (element: BoardElement) => void;
  pendingMathSymbol: string | null;
  onClearPendingMathSymbol: () => void;
  penSensitivity?: PenSensitivityConfig;
}

interface LaserTrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  page,
  activeTool,
  activeColor,
  strokeWidth,
  selectedShape,
  shapeFillColor = 'transparent',
  isStylusOnly,
  isAutoShapeEnabled = false,
  onUpdateElements,
  onAddElement,
  pendingMathSymbol,
  onClearPendingMathSymbol,
  penSensitivity = DEFAULT_PEN_SENSITIVITY,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const laserCanvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport transformation (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Drawing state
  const isDrawingRef = useRef(false);
  const currentStrokePoints = useRef<Point[]>([]);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const strokeStartTimeRef = useRef<number>(0);

  // Auto Shape Detection Toast
  const [detectionToast, setDetectionToast] = useState<string | null>(null);

  // Laser Pointer Trail
  const laserTrailsRef = useRef<LaserTrailPoint[]>([]);
  const laserAnimationRef = useRef<number | null>(null);

  // Active On-Canvas Crop Modal
  const [croppingImageId, setCroppingImageId] = useState<string | null>(null);
  const croppingImage = croppingImageId
    ? (page.elements.find(e => e.id === croppingImageId) as ImageElement | undefined)
    : undefined;

  // Selected elements for multi-selection (Lasso / Select / 4-Corner handles)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedId = selectedIds[0] || null;
  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIds(id ? [id] : []);
  }, []);

  const [isSelectionBarCollapsed, setIsSelectionBarCollapsed] = useState<boolean>(false);
  const [showHandleLayerMenu, setShowHandleLayerMenu] = useState<boolean>(false);
  const [showLayersDrawer, setShowLayersDrawer] = useState<boolean>(false);
  const isMovingGroupRef = useRef(false);
  const moveStartWorldRef = useRef<{ x: number; y: number } | null>(null);
  const initialElementsRef = useRef<BoardElement[]>([]);

  // Lasso selection path
  const isLassoingRef = useRef(false);
  const lassoPathRef = useRef<Point[]>([]);

  // Rotation & Scale Transform Handle State
  const isRotatingRef = useRef(false);
  const isResizingRef = useRef(false);
  const transformStartRef = useRef<{
    clientX: number;
    clientY: number;
    worldX: number;
    worldY: number;
    box: { x: number; y: number; width: number; height: number };
    cx: number;
    cy: number;
    startAngle: number;
    initialElements: BoardElement[];
  } | null>(null);

  // In-place text editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Insert math symbol into active text or create new clean glyph element
  useEffect(() => {
    if (!pendingMathSymbol) return;
    if (editingTextId) {
      const el = page.elements.find(e => e.id === editingTextId && e.type === 'text') as TextElement | undefined;
      if (el) {
        const nextText = (el.text || '') + pendingMathSymbol;
        const estWidth = Math.max(140, Math.ceil(nextText.length * el.fontSize * 0.75) + 30);
        const updated = page.elements.map(e => (e.id === el.id ? { ...e, text: nextText, width: Math.max(e.width, estWidth) } : e));
        onUpdateElements(updated);
      }
    } else {
      // Create clean math symbol with small rectangular box (140×48) so user has room to add text beside it
      const fontSize = 36;
      const estWidth = Math.max(140, Math.ceil(pendingMathSymbol.length * fontSize * 0.75) + 30);
      const estHeight = 48;
      const newText: TextElement = {
        id: 'txt_' + Date.now(),
        type: 'text',
        x: (-pan.x + (containerRef.current?.clientWidth || window.innerWidth) / 2) / zoom - estWidth / 2,
        y: (-pan.y + (containerRef.current?.clientHeight || window.innerHeight) / 2) / zoom - estHeight / 2,
        width: estWidth,
        height: estHeight,
        text: pendingMathSymbol,
        fontSize,
        color: activeColor,
        fontFamily: 'sans',
      };
      onAddElement(newText);
      // Select with small rectangular box (handles won't collide and user can tap to add text)
      setSelectedIds([newText.id]);
      setEditingTextId(null);
    }
    onClearPendingMathSymbol();
  }, [pendingMathSymbol]);

  // Convert screen coordinates to canvas world coordinates with container offset
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const offsetX = rect ? rect.left : 0;
    const offsetY = rect ? rect.top : 0;
    return {
      x: (screenX - offsetX - pan.x) / zoom,
      y: (screenY - offsetY - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Bounding box calculation for any element
  const getElementBounds = useCallback((el: BoardElement): { x: number; y: number; width: number; height: number } => {
    if (el.type === 'stroke') {
      if (!el.points || el.points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of el.points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
      const pad = (el.width || 4) / 2;
      return {
        x: minX - pad,
        y: minY - pad,
        width: Math.max(8, maxX - minX + pad * 2),
        height: Math.max(8, maxY - minY + pad * 2),
      };
    }
    if ('x' in el && 'width' in el) {
      if (el.type === 'text') {
        const textLen = Math.max(1, (el.text || '').length);
        const calcWidth = Math.max(140, el.width || 140, Math.ceil(textLen * (el.fontSize || 36) * 0.75) + 30);
        const calcHeight = Math.max(48, el.height || 48, Math.ceil((el.fontSize || 36) * 1.25));
        return {
          x: el.x,
          y: el.y,
          width: calcWidth,
          height: calcHeight,
        };
      }
      return {
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
      };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  }, []);

  // Combined bounding box of all selected elements
  const getSelectionBounds = useCallback(() => {
    if (selectedIds.length === 0) return null;
    const selectedEls = page.elements.filter(e => selectedIds.includes(e.id));
    if (selectedEls.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of selectedEls) {
      const b = getElementBounds(el);
      if (b.width === 0 && b.height === 0) continue;
      if (b.x < minX) minX = b.x;
      if (b.y < minY) minY = b.y;
      if (b.x + b.width > maxX) maxX = b.x + b.width;
      if (b.y + b.height > maxY) maxY = b.y + b.height;
    }

    if (!isFinite(minX) || !isFinite(minY)) return null;

    const pad = 12;
    return {
      x: minX - pad,
      y: minY - pad,
      width: Math.max(24, maxX - minX + pad * 2),
      height: Math.max(24, maxY - minY + pad * 2),
    };
  }, [selectedIds, page.elements, getElementBounds]);

  // Render Background Grid / Canvas
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const isDark = page.backgroundStyle.includes('dark');
    ctx.fillStyle = page.backgroundColor || (isDark ? '#090d16' : '#ffffff');
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    if (page.backgroundStyle.includes('graph')) {
      // Cartesian Coordinate Graph Sheet Paper with X and Y Axes
      const majorSize = 50;
      const minorSize = 10;
      const startX = Math.floor((-pan.x / zoom) / majorSize) * majorSize - majorSize;
      const endX = startX + (width / zoom) + majorSize * 3;
      const startY = Math.floor((-pan.y / zoom) / majorSize) * majorSize - majorSize;
      const endY = startY + (height / zoom) + majorSize * 3;

      // 1. Minor Millimeter Grid Lines
      ctx.strokeStyle = isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.18)';
      ctx.lineWidth = 0.6 / zoom;
      ctx.beginPath();
      const minorStartX = Math.floor((-pan.x / zoom) / minorSize) * minorSize - minorSize;
      const minorEndX = minorStartX + (width / zoom) + minorSize * 3;
      const minorStartY = Math.floor((-pan.y / zoom) / minorSize) * minorSize - minorSize;
      const minorEndY = minorStartY + (height / zoom) + minorSize * 3;
      for (let x = minorStartX; x <= minorEndX; x += minorSize) {
        ctx.moveTo(x, minorStartY);
        ctx.lineTo(x, minorEndY);
      }
      for (let y = minorStartY; y <= minorEndY; y += minorSize) {
        ctx.moveTo(minorStartX, y);
        ctx.lineTo(minorEndX, y);
      }
      ctx.stroke();

      // 2. Major 1cm Grid Lines
      ctx.strokeStyle = isDark ? 'rgba(52, 211, 153, 0.35)' : 'rgba(5, 150, 105, 0.4)';
      ctx.lineWidth = 1.2 / zoom;
      ctx.beginPath();
      for (let x = startX; x <= endX; x += majorSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += majorSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // 3. Primary X and Y Coordinate Axes (Bold)
      ctx.strokeStyle = isDark ? '#34d399' : '#047857';
      ctx.lineWidth = 2.4 / zoom;
      ctx.beginPath();
      // X-Axis
      ctx.moveTo(startX, 0);
      ctx.lineTo(endX, 0);
      // Y-Axis
      ctx.moveTo(0, startY);
      ctx.lineTo(0, endY);
      ctx.stroke();

      // 4. Axis Tick Numbers
      ctx.fillStyle = isDark ? '#a7f3d0' : '#065f46';
      ctx.font = `bold ${10 / zoom}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (let x = startX; x <= endX; x += majorSize) {
        if (Math.abs(x) < 1) continue;
        const val = Math.round(x / majorSize);
        ctx.fillText(val.toString(), x, 4 / zoom);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let y = startY; y <= endY; y += majorSize) {
        if (Math.abs(y) < 1) continue;
        const val = -Math.round(y / majorSize);
        ctx.fillText(val.toString(), -4 / zoom, y);
      }
      ctx.fillText('(0,0)', -4 / zoom, 6 / zoom);
    } else if (page.backgroundStyle.includes('grid')) {
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.45)' : 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1 / zoom;
      const gridSize = 40;
      const startX = Math.floor((-pan.x / zoom) / gridSize) * gridSize;
      const endX = startX + (width / zoom) + gridSize * 2;
      const startY = Math.floor((-pan.y / zoom) / gridSize) * gridSize;
      const endY = startY + (height / zoom) + gridSize * 2;

      ctx.beginPath();
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();
    } else if (page.backgroundStyle.includes('ruled')) {
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.45)' : 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 1 / zoom;
      const lineSpacing = 44;
      const startY = Math.floor((-pan.y / zoom) / lineSpacing) * lineSpacing;
      const endY = startY + (height / zoom) + lineSpacing * 2;
      const startX = -pan.x / zoom;
      const endX = startX + width / zoom;

      ctx.beginPath();
      for (let y = startY; y <= endY; y += lineSpacing) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // Render Elements onto Main Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    for (const el of page.elements) {
      if (el.type === 'solid3d') {
        // Draw 3D Solid element with optional rotation
        if (el.rotation) {
          ctx.save();
          const cx = el.x + el.width / 2;
          const cy = el.y + el.height / 2;
          ctx.translate(cx, cy);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
          drawSolid3D(ctx, el, zoom);
          ctx.restore();
        } else {
          drawSolid3D(ctx, el, zoom);
        }
      } else if (el.type === 'image') {
        const img = new Image();
        img.src = el.src;
        if (img.complete) {
          if (el.rotation) {
            ctx.save();
            const cx = el.x + el.width / 2;
            const cy = el.y + el.height / 2;
            ctx.translate(cx, cy);
            ctx.rotate((el.rotation * Math.PI) / 180);
            ctx.translate(-cx, -cy);
            ctx.drawImage(img, el.x, el.y, el.width, el.height);
            ctx.restore();
          } else {
            ctx.drawImage(img, el.x, el.y, el.width, el.height);
          }
        } else {
          img.onload = () => renderCanvas();
        }
      } else if (el.type === 'shape') {
        drawGeometricShape(
          ctx,
          el.shapeType,
          el.x,
          el.y,
          el.width,
          el.height,
          el.strokeColor,
          el.fillColor,
          el.strokeWidth,
          el.rotation
        );
      } else if (el.type === 'stroke') {
        if (!el.points || el.points.length === 0) continue;
        if (el.rotation) {
          ctx.save();
          const b = getElementBounds(el);
          const cx = b.x + b.width / 2;
          const cy = b.y + b.height / 2;
          ctx.translate(cx, cy);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
          renderStrokeToContext(ctx, el, penSensitivity);
          ctx.restore();
        } else {
          renderStrokeToContext(ctx, el, penSensitivity);
        }
      }
    }

    // Canvas highlight for selected elements
    if (selectedIds.length > 0) {
      const bounds = getSelectionBounds();
      if (bounds) {
        ctx.save();
        ctx.strokeStyle = '#eab308'; // Amber yellow matching screenshot
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([8 / zoom, 6 / zoom]);
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.restore();
      }
    }

    ctx.restore();
  }, [page, pan, zoom, selectedIds, penSensitivity, getSelectionBounds, getElementBounds]);

  // Laser Pointer Trail Animation Loop (runs on dedicated laserCanvasRef to never interfere with inking)
  useEffect(() => {
    const loop = () => {
      const laserCanvas = laserCanvasRef.current;
      if (laserCanvas) {
        const ctx = laserCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);

          if (laserTrailsRef.current.length > 0) {
            const now = Date.now();
            // Remove points older than 1.2 seconds
            laserTrailsRef.current = laserTrailsRef.current.filter(p => now - p.timestamp < 1200);

            if (laserTrailsRef.current.length > 1) {
              ctx.save();
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              for (let i = 1; i < laserTrailsRef.current.length; i++) {
                const p1 = laserTrailsRef.current[i - 1];
                const p2 = laserTrailsRef.current[i];
                const age = now - p2.timestamp;
                const alpha = Math.max(0, 1 - age / 1200);

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(244, 63, 94, ${alpha * 0.85})`;
                ctx.lineWidth = (1 - age / 1200) * 12 + 2;
                ctx.stroke();
              }

              // Bright Glowing Tip
              const tip = laserTrailsRef.current[laserTrailsRef.current.length - 1];
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#f43f5e';
              ctx.beginPath();
              ctx.arc(tip.x, tip.y, 10, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();
            }
          }
        }
      }

      laserAnimationRef.current = requestAnimationFrame(loop);
    };

    laserAnimationRef.current = requestAnimationFrame(loop);
    return () => {
      if (laserAnimationRef.current) cancelAnimationFrame(laserAnimationRef.current);
    };
  }, []);

  // Window & Container resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !overlayCanvasRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      if (canvasRef.current.width !== clientWidth || canvasRef.current.height !== clientHeight) {
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
      }
      if (overlayCanvasRef.current.width !== clientWidth || overlayCanvasRef.current.height !== clientHeight) {
        overlayCanvasRef.current.width = clientWidth;
        overlayCanvasRef.current.height = clientHeight;
      }
      if (laserCanvasRef.current) {
        if (laserCanvasRef.current.width !== clientWidth || laserCanvasRef.current.height !== clientHeight) {
          laserCanvasRef.current.width = clientWidth;
          laserCanvasRef.current.height = clientHeight;
        }
      }
      renderCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => handleResize());
      ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Stylus eraser check: button 32 is standard pen eraser or right click
    const isPenEraser = e.pointerType === 'pen' && (e.buttons === 32 || e.button === 2);
    const effectiveTool = isPenEraser ? 'eraser' : activeTool;

    // Palm rejection check
    if (isStylusOnly && e.pointerType === 'touch' && effectiveTool !== 'hand') {
      // Touch used for panning when palm guard is ON
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    if (effectiveTool === 'hand') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if (effectiveTool === 'laser') {
      const rect = containerRef.current?.getBoundingClientRect();
      const lx = e.clientX - (rect ? rect.left : 0);
      const ly = e.clientY - (rect ? rect.top : 0);
      laserTrailsRef.current = [{ x: lx, y: ly, timestamp: Date.now() }];
      return;
    }

    if (effectiveTool === 'lasso') {
      isLassoingRef.current = true;
      lassoPathRef.current = [{ x, y }];
      if (!e.shiftKey) {
        setSelectedIds([]);
      }
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if (effectiveTool === 'select') {
      // 1. Check if clicked inside existing selection bounding box to start dragging group
      const curBounds = getSelectionBounds();
      if (
        curBounds &&
        x >= curBounds.x &&
        x <= curBounds.x + curBounds.width &&
        y >= curBounds.y &&
        y <= curBounds.y + curBounds.height
      ) {
        isMovingGroupRef.current = true;
        moveStartWorldRef.current = { x, y };
        initialElementsRef.current = JSON.parse(JSON.stringify(page.elements));
        try {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
        return;
      }

      // 2. Find clicked element in reverse order (top to bottom)
      const found = [...page.elements].reverse().find(el => {
        const b = getElementBounds(el);
        return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
      });

      if (found) {
        if (e.shiftKey) {
          setSelectedIds(prev =>
            prev.includes(found.id) ? prev.filter(id => id !== found.id) : [...prev, found.id]
          );
        } else {
          setSelectedIds([found.id]);
        }
        isMovingGroupRef.current = true;
        moveStartWorldRef.current = { x, y };
        initialElementsRef.current = JSON.parse(JSON.stringify(page.elements));
        try {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
      } else {
        if (!e.shiftKey) {
          setSelectedIds([]);
        }
      }
      return;
    }

    if (effectiveTool === 'eraser') {
      // Erase any stroke or element near pointer
      const remaining = page.elements.filter(el => {
        if (el.type === 'stroke') {
          return !el.points.some(p => Math.hypot(p.x - x, p.y - y) < (el.width || 4) + 16);
        } else if ('x' in el && 'width' in el) {
          const inside = x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
          return !inside;
        }
        return true;
      });

      if (remaining.length !== page.elements.length) {
        onUpdateElements(remaining);
      }
      isDrawingRef.current = true;
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if (effectiveTool === 'pen' || effectiveTool === 'highlighter') {
      isDrawingRef.current = true;
      const now = Date.now();
      strokeStartTimeRef.current = now;

      // Flat panel touch & stylus coalesced input collection on start
      const native = e.nativeEvent as any;
      const coalesced = (native && typeof native.getCoalescedEvents === 'function')
        ? native.getCoalescedEvents()
        : null;
      const events: PointerEvent[] = (coalesced && coalesced.length > 0)
        ? coalesced
        : [e.nativeEvent || e];

      const initialPts: Point[] = [];
      for (const ev of events) {
        const pt = screenToWorld(ev.clientX, ev.clientY);
        const pressure = ev.pressure && ev.pressure > 0 ? ev.pressure : 0.5;
        const time = ev.timeStamp ? Math.round(performance.timeOrigin ? performance.timeOrigin + ev.timeStamp : now) : now;
        initialPts.push({ x: pt.x, y: pt.y, pressure, time });
      }
      const pts = initialPts.length > 0 ? initialPts : [{ x, y, pressure: e.pressure || 0.5, time: now }];
      currentStrokePoints.current = pts;

      // Immediately render initial dot/mark on overlay canvas so taps & dots show instantly
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          ctx.save();
          ctx.translate(pan.x, pan.y);
          ctx.scale(zoom, zoom);
          renderStrokeToContext(
            ctx,
            {
              points: pts,
              color: activeColor,
              width: effectiveTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth,
              opacity: effectiveTool === 'highlighter' ? 0.35 : 1,
              isHighlighter: effectiveTool === 'highlighter',
              nibStyle: penSensitivity?.nibStyle,
              profile: penSensitivity?.profile,
            },
            penSensitivity,
            true
          );
          ctx.restore();
        }
      }

      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if (effectiveTool === 'shape') {
      isDrawingRef.current = true;
      shapeStartRef.current = { x, y };
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if (effectiveTool === 'text') {
      const newText: TextElement = {
        id: 'txt_' + Date.now(),
        type: 'text',
        x,
        y,
        width: 180,
        height: 50,
        text: 'Type notes here...',
        fontSize: 24,
        color: activeColor,
        fontFamily: 'sans',
      };
      onAddElement(newText);
      setSelectedIds([]);
      setEditingTextId(newText.id);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const isPenEraser = e.pointerType === 'pen' && (e.buttons === 32 || (e.buttons & 2) === 2);
    const effectiveTool = isPenEraser ? 'eraser' : activeTool;

    if (effectiveTool === 'laser') {
      const rect = containerRef.current?.getBoundingClientRect();
      const lx = e.clientX - (rect ? rect.left : 0);
      const ly = e.clientY - (rect ? rect.top : 0);
      laserTrailsRef.current.push({ x: lx, y: ly, timestamp: Date.now() });
      return;
    }

    const { x, y } = screenToWorld(e.clientX, e.clientY);

    // Group movement for all selected elements
    if (isMovingGroupRef.current && moveStartWorldRef.current) {
      const dx = x - moveStartWorldRef.current.x;
      const dy = y - moveStartWorldRef.current.y;
      const updated = initialElementsRef.current.map(el => {
        if (!selectedIds.includes(el.id)) return el;
        if (el.type === 'stroke') {
          return {
            ...el,
            points: el.points.map(p => ({ ...p, x: p.x + dx, y: p.y + dy })),
          };
        } else if ('x' in el) {
          return {
            ...el,
            x: el.x + dx,
            y: el.y + dy,
          };
        }
        return el;
      });
      onUpdateElements(updated);
      return;
    }

    // Lasso drawing path and live preview
    if (effectiveTool === 'lasso' && isLassoingRef.current) {
      lassoPathRef.current.push({ x, y });
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          ctx.save();
          ctx.translate(pan.x, pan.y);
          ctx.scale(zoom, zoom);

          const pts = lassoPathRef.current;
          if (pts.length > 1) {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2 / zoom;
            ctx.setLineDash([8 / zoom, 6 / zoom]);
            ctx.stroke();

            ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }
      return;
    }

    if (effectiveTool === 'eraser' && isDrawingRef.current) {
      const remaining = page.elements.filter(el => {
        if (el.type === 'stroke') {
          return !el.points.some(p => Math.hypot(p.x - x, p.y - y) < (el.width || 4) + 16);
        }
        return true;
      });
      if (remaining.length !== page.elements.length) {
        onUpdateElements(remaining);
      }
      return;
    }

    if ((effectiveTool === 'pen' || effectiveTool === 'highlighter') && isDrawingRef.current) {
      // Collect coalesced hardware events for high-frequency flat panel stylus response
      const native = e.nativeEvent as any;
      const coalesced = (native && typeof native.getCoalescedEvents === 'function')
        ? native.getCoalescedEvents()
        : null;
      const events: PointerEvent[] = (coalesced && coalesced.length > 0)
        ? coalesced
        : [e.nativeEvent || e];

      const now = Date.now();
      for (const ev of events) {
        const pt = screenToWorld(ev.clientX, ev.clientY);
        const pressure = ev.pressure && ev.pressure > 0 ? ev.pressure : 0.5;
        const time = ev.timeStamp ? Math.round(performance.timeOrigin ? performance.timeOrigin + ev.timeStamp : now) : now;
        const last = currentStrokePoints.current[currentStrokePoints.current.length - 1];
        if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 0.2) {
          currentStrokePoints.current.push({ x: pt.x, y: pt.y, pressure, time });
        }
      }

      // Variable-width live preview on overlay with matching rendering engine
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          ctx.save();
          ctx.translate(pan.x, pan.y);
          ctx.scale(zoom, zoom);
          renderStrokeToContext(
            ctx,
            {
              points: currentStrokePoints.current,
              color: activeColor,
              width: effectiveTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth,
              opacity: effectiveTool === 'highlighter' ? 0.35 : 1,
              isHighlighter: effectiveTool === 'highlighter',
              nibStyle: penSensitivity?.nibStyle,
              profile: penSensitivity?.profile,
            },
            penSensitivity,
            true
          );
          ctx.restore();
        }
      }
      return;
    }

    if (effectiveTool === 'shape' && isDrawingRef.current && shapeStartRef.current) {
      // Live Shape Preview on overlay for all 26 shapes
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          ctx.save();
          ctx.translate(pan.x, pan.y);
          ctx.scale(zoom, zoom);

          const sx = shapeStartRef.current.x;
          const sy = shapeStartRef.current.y;
          const w = x - sx;
          const h = y - sy;

          const isLineLike = ['line', 'dashed-line', 'arrow', 'double-arrow', 'ray'].includes(selectedShape);
          const drawX = isLineLike ? sx : Math.min(sx, x);
          const drawY = isLineLike ? sy : Math.min(sy, y);
          const drawW = isLineLike ? w : Math.abs(w);
          const drawH = isLineLike ? h : Math.abs(h);

          drawGeometricShape(
            ctx,
            selectedShape,
            drawX,
            drawY,
            drawW,
            drawH,
            activeColor,
            shapeFillColor || 'transparent',
            strokeWidth
          );
          ctx.restore();
        }
      }
      return;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      return;
    }

    const isPenEraser = e.pointerType === 'pen' && (e.buttons === 32 || (e.buttons & 2) === 2);
    const effectiveTool = isPenEraser ? 'eraser' : activeTool;

    if (effectiveTool === 'eraser' && isDrawingRef.current) {
      isDrawingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if (isMovingGroupRef.current) {
      isMovingGroupRef.current = false;
      moveStartWorldRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if (effectiveTool === 'lasso' && isLassoingRef.current) {
      isLassoingRef.current = false;
      const poly = lassoPathRef.current;
      lassoPathRef.current = [];

      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        ctx?.clearRect(0, 0, overlay.width, overlay.height);
      }

      if (poly.length >= 3) {
        const matchedIds: string[] = [];
        for (const el of page.elements) {
          if (el.type === 'stroke') {
            const inside = el.points.some(p => isPointInPolygon(p, poly));
            if (inside) matchedIds.push(el.id);
          } else {
            const b = getElementBounds(el);
            const center = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
            const corners = [
              center,
              { x: b.x, y: b.y },
              { x: b.x + b.width, y: b.y },
              { x: b.x, y: b.y + b.height },
              { x: b.x + b.width, y: b.y + b.height },
            ];
            if (corners.some(pt => isPointInPolygon(pt, poly))) {
              matchedIds.push(el.id);
            }
          }
        }

        if (e.shiftKey) {
          setSelectedIds(prev => Array.from(new Set([...prev, ...matchedIds])));
        } else {
          setSelectedIds(matchedIds);
        }
      }
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      return;
    }

    if ((effectiveTool === 'pen' || effectiveTool === 'highlighter') && isDrawingRef.current) {
      isDrawingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}

      const pts = currentStrokePoints.current;
      const durationMs = Date.now() - strokeStartTimeRef.current;

      if (pts.length > 2) {
        let detected = null;
        if (isAutoShapeEnabled && effectiveTool === 'pen') {
          detected = detectGeometricShape(pts, durationMs, 350);
        }

        if (detected) {
          const shapeEl: ShapeElement = {
            id: 'shp_' + Date.now(),
            type: 'shape',
            shapeType: detected.shapeType,
            x: detected.x,
            y: detected.y,
            width: detected.width,
            height: detected.height,
            strokeColor: activeColor,
            fillColor: 'transparent',
            strokeWidth,
          };
          onAddElement(shapeEl);
          setDetectionToast(`Auto-Shape: Perfect ${detected.label}! ✓`);
          setTimeout(() => setDetectionToast(null), 2000);
          const overlay = overlayCanvasRef.current;
          if (overlay) {
            const ctx = overlay.getContext('2d');
            ctx?.clearRect(0, 0, overlay.width, overlay.height);
          }
        } else {
          const effectiveBaseWidth = effectiveTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth;
          const widths = effectiveTool === 'highlighter'
            ? undefined
            : calculateStrokeWidths(pts, effectiveBaseWidth, penSensitivity, false);

          const newStroke: StrokeElement = {
            id: 'str_' + Date.now(),
            type: 'stroke',
            points: [...pts],
            color: activeColor,
            width: effectiveBaseWidth,
            opacity: effectiveTool === 'highlighter' ? 0.4 : 1,
            isHighlighter: effectiveTool === 'highlighter',
            widths,
            nibStyle: penSensitivity?.nibStyle,
            profile: penSensitivity?.profile,
          };

          // INSTANT ZERO-LATENCY COMMIT: Render stroke directly to main canvas immediately
          const mainCanvas = canvasRef.current;
          if (mainCanvas) {
            const mainCtx = mainCanvas.getContext('2d');
            if (mainCtx) {
              mainCtx.save();
              mainCtx.translate(pan.x, pan.y);
              mainCtx.scale(zoom, zoom);
              renderStrokeToContext(mainCtx, newStroke, penSensitivity, false);
              mainCtx.restore();
            }
          }

          // Clear overlay with ZERO flicker because stroke is already on main canvas!
          const overlay = overlayCanvasRef.current;
          if (overlay) {
            const ctx = overlay.getContext('2d');
            ctx?.clearRect(0, 0, overlay.width, overlay.height);
          }

          onAddElement(newStroke);
        }
      } else if (pts.length > 0) {
        const effectiveBaseWidth = effectiveTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth;
        const widths = effectiveTool === 'highlighter'
          ? undefined
          : calculateStrokeWidths(pts, effectiveBaseWidth, penSensitivity, false);

        const newStroke: StrokeElement = {
          id: 'str_' + Date.now(),
          type: 'stroke',
          points: [...pts],
          color: activeColor,
          width: effectiveBaseWidth,
          opacity: effectiveTool === 'highlighter' ? 0.4 : 1,
          isHighlighter: effectiveTool === 'highlighter',
          widths,
          nibStyle: penSensitivity?.nibStyle,
          profile: penSensitivity?.profile,
        };

        const mainCanvas = canvasRef.current;
        if (mainCanvas) {
          const mainCtx = mainCanvas.getContext('2d');
          if (mainCtx) {
            mainCtx.save();
            mainCtx.translate(pan.x, pan.y);
            mainCtx.scale(zoom, zoom);
            renderStrokeToContext(mainCtx, newStroke, penSensitivity, false);
            mainCtx.restore();
          }
        }

        const overlay = overlayCanvasRef.current;
        if (overlay) {
          const ctx = overlay.getContext('2d');
          ctx?.clearRect(0, 0, overlay.width, overlay.height);
        }

        onAddElement(newStroke);
      }
      currentStrokePoints.current = [];
      return;
    }

    if (effectiveTool === 'shape' && isDrawingRef.current && shapeStartRef.current) {
      isDrawingRef.current = false;
      const { x, y } = screenToWorld(e.clientX, e.clientY);
      const sx = shapeStartRef.current.x;
      const sy = shapeStartRef.current.y;
      const w = x - sx;
      const h = y - sy;

      if (Math.hypot(w, h) > 8) {
        const isLineLike = ['line', 'dashed-line', 'arrow', 'double-arrow', 'ray'].includes(selectedShape);
        const newShape: ShapeElement = {
          id: 'shp_' + Date.now(),
          type: 'shape',
          shapeType: selectedShape,
          x: isLineLike ? sx : Math.min(sx, x),
          y: isLineLike ? sy : Math.min(sy, y),
          width: isLineLike ? w : Math.abs(w),
          height: isLineLike ? h : Math.abs(h),
          strokeColor: activeColor,
          fillColor: shapeFillColor || 'transparent',
          strokeWidth,
        };
        onAddElement(newShape);
        setSelectedIds([newShape.id]);
      }
      shapeStartRef.current = null;
      const overlay = overlayCanvasRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        ctx?.clearRect(0, 0, overlay.width, overlay.height);
      }
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      return;
    }

    isDrawingRef.current = false;
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom(z => Math.max(0.3, Math.min(4.0, z * zoomFactor)));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  // Delete selected elements
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    onUpdateElements(page.elements.filter(e => !selectedIds.includes(e.id)));
    setSelectedIds([]);
  }, [selectedIds, page.elements, onUpdateElements]);

  // Duplicate selected elements (matching input_file_1.png)
  const handleDuplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selectedEls = page.elements.filter(e => selectedIds.includes(e.id));
    if (selectedEls.length === 0) return;

    const bounds = getSelectionBounds();
    const offsetX = bounds ? Math.min(Math.max(60, bounds.width + 30), 400) : 60;
    const offsetY = 0;

    const newSelectedIds: string[] = [];
    const duplicatedEls: BoardElement[] = selectedEls.map(el => {
      const newId = el.type + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      newSelectedIds.push(newId);

      if (el.type === 'stroke') {
        return {
          ...el,
          id: newId,
          points: el.points.map(p => ({ ...p, x: p.x + offsetX, y: p.y + offsetY })),
        };
      } else {
        return {
          ...el,
          id: newId,
          x: el.x + offsetX,
          y: el.y + offsetY,
        };
      }
    });

    onUpdateElements([...page.elements, ...duplicatedEls]);
    setSelectedIds(newSelectedIds);
  }, [selectedIds, page.elements, getSelectionBounds, onUpdateElements]);

  // Layer ordering functions for selected elements (Bring to Front, Send to Back, Bring Forward, Send Backward)
  const bringToFront = useCallback(() => {
    if (selectedIds.length === 0) return;
    const nonSelected = page.elements.filter(e => !selectedIds.includes(e.id));
    const selected = page.elements.filter(e => selectedIds.includes(e.id));
    onUpdateElements([...nonSelected, ...selected]);
  }, [page.elements, selectedIds, onUpdateElements]);

  const sendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    const nonSelected = page.elements.filter(e => !selectedIds.includes(e.id));
    const selected = page.elements.filter(e => selectedIds.includes(e.id));
    onUpdateElements([...selected, ...nonSelected]);
  }, [page.elements, selectedIds, onUpdateElements]);

  const bringForward = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newElements = [...page.elements];
    for (let i = newElements.length - 2; i >= 0; i--) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i + 1].id)) {
        const temp = newElements[i];
        newElements[i] = newElements[i + 1];
        newElements[i + 1] = temp;
      }
    }
    onUpdateElements(newElements);
  }, [page.elements, selectedIds, onUpdateElements]);

  const sendBackward = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newElements = [...page.elements];
    for (let i = 1; i < newElements.length; i++) {
      if (selectedIds.includes(newElements[i].id) && !selectedIds.includes(newElements[i - 1].id)) {
        const temp = newElements[i];
        newElements[i] = newElements[i - 1];
        newElements[i - 1] = temp;
      }
    }
    onUpdateElements(newElements);
  }, [page.elements, selectedIds, onUpdateElements]);

  // Specific single-element layer functions (for Layers Manager drawer)
  const moveElementToTop = useCallback((id: string) => {
    const el = page.elements.find(e => e.id === id);
    if (!el) return;
    onUpdateElements([...page.elements.filter(e => e.id !== id), el]);
  }, [page.elements, onUpdateElements]);

  const moveElementToBottom = useCallback((id: string) => {
    const el = page.elements.find(e => e.id === id);
    if (!el) return;
    onUpdateElements([el, ...page.elements.filter(e => e.id !== id)]);
  }, [page.elements, onUpdateElements]);

  const moveElementUp = useCallback((id: string) => {
    const idx = page.elements.findIndex(e => e.id === id);
    if (idx < 0 || idx >= page.elements.length - 1) return;
    const next = [...page.elements];
    const temp = next[idx];
    next[idx] = next[idx + 1];
    next[idx + 1] = temp;
    onUpdateElements(next);
  }, [page.elements, onUpdateElements]);

  const moveElementDown = useCallback((id: string) => {
    const idx = page.elements.findIndex(e => e.id === id);
    if (idx <= 0) return;
    const next = [...page.elements];
    const temp = next[idx];
    next[idx] = next[idx - 1];
    next[idx - 1] = temp;
    onUpdateElements(next);
  }, [page.elements, onUpdateElements]);

  const deleteElementById = useCallback((id: string) => {
    onUpdateElements(page.elements.filter(e => e.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  }, [page.elements, onUpdateElements]);

  // Rotate selected elements around center of selection box
  const handleStartRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const bounds = getSelectionBounds();
    if (!bounds) return;

    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const rect = containerRef.current?.getBoundingClientRect();
    const screenCenter = {
      x: cx * zoom + pan.x + (rect ? rect.left : 0),
      y: cy * zoom + pan.y + (rect ? rect.top : 0),
    };

    const startAngle = Math.atan2(e.clientY - screenCenter.y, e.clientX - screenCenter.x);
    const initialElements = JSON.parse(JSON.stringify(page.elements)) as BoardElement[];

    const onRotateMove = (ev: PointerEvent) => {
      const curAngle = Math.atan2(ev.clientY - screenCenter.y, ev.clientX - screenCenter.x);
      const deltaRad = curAngle - startAngle;
      const deltaDeg = Math.round((deltaRad * 180) / Math.PI);

      const cos = Math.cos(deltaRad);
      const sin = Math.sin(deltaRad);

      const updated = initialElements.map(el => {
        if (!selectedIds.includes(el.id)) return el;

        if (el.type === 'stroke') {
          return {
            ...el,
            points: el.points.map(p => {
              const rx = cx + (p.x - cx) * cos - (p.y - cy) * sin;
              const ry = cy + (p.x - cx) * sin + (p.y - cy) * cos;
              return { ...p, x: rx, y: ry };
            }),
          };
        } else if ('x' in el && 'width' in el) {
          const elCx = el.x + el.width / 2;
          const elCy = el.y + el.height / 2;
          const rx = cx + (elCx - cx) * cos - (elCy - cy) * sin;
          const ry = cy + (elCx - cx) * sin + (elCy - cy) * cos;
          const newRot = (((el as any).rotation || 0) + deltaDeg + 360) % 360;

          return {
            ...el,
            x: rx - el.width / 2,
            y: ry - el.height / 2,
            rotation: newRot,
          };
        }
        return el;
      });

      onUpdateElements(updated);
    };

    const onRotateUp = () => {
      window.removeEventListener('pointermove', onRotateMove);
      window.removeEventListener('pointerup', onRotateUp);
    };

    window.addEventListener('pointermove', onRotateMove);
    window.addEventListener('pointerup', onRotateUp);
  };

  // Resize selected elements from bottom-right handle
  const handleStartResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const bounds = getSelectionBounds();
    if (!bounds) return;

    const anchorX = bounds.x;
    const anchorY = bounds.y;
    const origW = bounds.width;
    const origH = bounds.height;
    const initialElements = JSON.parse(JSON.stringify(page.elements)) as BoardElement[];

    const onResizeMove = (ev: PointerEvent) => {
      const curWorld = screenToWorld(ev.clientX, ev.clientY);
      const newW = curWorld.x - anchorX;
      const newH = curWorld.y - anchorY;

      const scaleX = newW / origW;
      const scaleY = newH / origH;
      const scale = Math.max(0.1, Math.min(10, Math.max(scaleX, scaleY)));

      const updated = initialElements.map(el => {
        if (!selectedIds.includes(el.id)) return el;

        if (el.type === 'stroke') {
          return {
            ...el,
            width: Math.max(1, (el.width || 4) * scale),
            points: el.points.map(p => ({
              ...p,
              x: anchorX + (p.x - anchorX) * scale,
              y: anchorY + (p.y - anchorY) * scale,
            })),
          };
        } else if ('x' in el && 'width' in el) {
          return {
            ...el,
            x: anchorX + (el.x - anchorX) * scale,
            y: anchorY + (el.y - anchorY) * scale,
            width: Math.max(16, Math.round(el.width * scale)),
            height: Math.max(16, Math.round(el.height * scale)),
          };
        }
        return el;
      });

      onUpdateElements(updated);
    };

    const onResizeUp = () => {
      window.removeEventListener('pointermove', onResizeMove);
      window.removeEventListener('pointerup', onResizeUp);
    };

    window.addEventListener('pointermove', onResizeMove);
    window.addEventListener('pointerup', onResizeUp);
  };

  // Move group of selected elements by dragging bounding box body
  const handleStartMoveGroup = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isMovingGroupRef.current = true;
    moveStartWorldRef.current = screenToWorld(e.clientX, e.clientY);
    initialElementsRef.current = JSON.parse(JSON.stringify(page.elements));

    const onMove = (ev: PointerEvent) => {
      if (!isMovingGroupRef.current || !moveStartWorldRef.current) return;
      const curWorld = screenToWorld(ev.clientX, ev.clientY);
      const dx = curWorld.x - moveStartWorldRef.current.x;
      const dy = curWorld.y - moveStartWorldRef.current.y;

      const updated = initialElementsRef.current.map(el => {
        if (!selectedIds.includes(el.id)) return el;
        if (el.type === 'stroke') {
          return {
            ...el,
            points: el.points.map(p => ({ ...p, x: p.x + dx, y: p.y + dy })),
          };
        } else if ('x' in el) {
          return {
            ...el,
            x: el.x + dx,
            y: el.y + dy,
          };
        }
        return el;
      });

      onUpdateElements(updated);
    };

    const onUp = () => {
      isMovingGroupRef.current = false;
      moveStartWorldRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Keyboard shortcuts for Delete and Layer ordering when elements are selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
        return;
      }

      if (selectedIds.length === 0) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }

      // Layer shortcuts: Ctrl+] (Forward), Ctrl+Shift+] (Front), Ctrl+[ (Backward), Ctrl+Shift+[ (Back)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === ']') {
          e.preventDefault();
          if (e.shiftKey) {
            bringToFront();
          } else {
            bringForward();
          }
        } else if (e.key === '[') {
          e.preventDefault();
          if (e.shiftKey) {
            sendToBack();
          } else {
            sendBackward();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, handleDeleteSelected, bringToFront, bringForward, sendBackward, sendToBack]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden select-none touch-none cursor-default"
    >
      {/* Background & Rendered Elements Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block pointer-events-none"
      />

      {/* Interactive Overlay Canvas (Captures Pointers, Inking Live Preview & Shape Preview) */}
      <canvas
        ref={overlayCanvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 block z-10"
        style={{
          cursor:
            activeTool === 'hand'
              ? 'grab'
              : activeTool === 'select'
              ? 'default'
              : activeTool === 'lasso'
              ? 'crosshair'
              : activeTool === 'laser'
              ? 'crosshair'
              : activeTool === 'eraser'
              ? 'cell'
              : 'crosshair',
        }}
      />

      {/* Dedicated Laser Pointer Trail Canvas (never interferes with inking preview) */}
      <canvas
        ref={laserCanvasRef}
        className="absolute inset-0 block pointer-events-none z-15"
      />

      {/* HTML Interactive Objects Layer (Text editing & Sticky notes) */}
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {page.elements.map(el => {
          if (el.type === 'text') {
            const isEditing = editingTextId === el.id;
            const isSelected = selectedIds.includes(el.id);
            const textLen = Math.max(1, (el.text || '').length);
            const estWidth = Math.max(140, el.width || 140, Math.ceil(textLen * el.fontSize * 0.75) + 30);
            const estHeight = Math.max(48, el.height || 48, Math.ceil(el.fontSize * 1.25));
            const allowInteract = activeTool === 'select' || activeTool === 'text' || isEditing || isSelected;

            return (
              <div
                key={el.id}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(el.id);
                }}
                onClick={(e) => {
                  if (activeTool === 'select' || activeTool === 'text') {
                    e.stopPropagation();
                    if (isSelected) {
                      setEditingTextId(el.id);
                    } else {
                      setSelectedIds([el.id]);
                    }
                  }
                }}
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${estWidth}px`,
                  height: `${estHeight}px`,
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  transformOrigin: 'center center',
                  pointerEvents: allowInteract ? 'auto' : 'none',
                }}
                className={`absolute select-none transition-shadow ${
                  isEditing ? 'z-40' : 'z-20'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full h-full bg-slate-900/95 border-2 border-sky-400 rounded-xl px-2.5 py-1 shadow-2xl backdrop-blur-md">
                    <input
                      type="text"
                      autoFocus
                      value={el.text}
                      placeholder="Add text beside symbol..."
                      onChange={e => {
                        const newText = e.target.value;
                        const newLen = Math.max(1, newText.length);
                        const newW = Math.max(140, Math.ceil(newLen * el.fontSize * 0.75) + 30);
                        const updated = page.elements.map(item =>
                          item.id === el.id ? { ...item, text: newText, width: newW } : item
                        );
                        onUpdateElements(updated);
                      }}
                      onBlur={() => setEditingTextId(null)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          setEditingTextId(null);
                        }
                      }}
                      style={{
                        fontSize: `${el.fontSize}px`,
                        color: el.color || '#38bdf8',
                        lineHeight: '1.2',
                      }}
                      className="bg-transparent border-none outline-none ring-0 shadow-none font-sans font-semibold p-0 m-0 w-full text-left"
                    />
                    <button
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setEditingTextId(null);
                      }}
                      className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-[11px] font-bold shrink-0 cursor-pointer shadow-md transition"
                      title="Finish editing"
                    >
                      Done ✓
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: `${el.fontSize}px`,
                      color: el.color,
                      lineHeight: '1.2',
                    }}
                    className="font-sans font-semibold p-0 m-0 w-full h-full flex items-center justify-start cursor-pointer select-none border-none outline-none bg-transparent whitespace-nowrap overflow-visible"
                  >
                    <span>{el.text}</span>
                    {isSelected && (
                      <span className="ml-2 text-[10px] text-sky-400/80 bg-sky-950/60 border border-sky-500/40 rounded px-1.5 py-0.5 pointer-events-none font-normal shrink-0">
                        + Add text
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          } else if (el.type === 'sticky') {
            const isSelected = selectedIds.includes(el.id);
            return (
              <div
                key={el.id}
                onPointerDown={() => setSelectedIds([el.id])}
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  backgroundColor: el.color || '#fef08a',
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  transformOrigin: 'center center',
                }}
                className={`absolute pointer-events-auto rounded-xl p-3 shadow-xl border border-amber-300 text-slate-800 group flex flex-col select-none ${
                  isSelected ? 'ring-2 ring-sky-500' : ''
                }`}
              >
                <textarea
                  value={el.text}
                  onChange={e => {
                    const updated = page.elements.map(item =>
                      item.id === el.id ? { ...item, text: e.target.value } : item
                    );
                    onUpdateElements(updated);
                  }}
                  onFocus={() => setSelectedId(el.id)}
                  className="w-full flex-1 bg-transparent resize-none outline-hidden text-xs font-medium font-sans leading-relaxed select-text"
                  placeholder="Sticky note..."
                />

                {/* Direct Corner Resize Grip Handle on bottom-right of sticky note */}
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedId(el.id);
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const origW = el.width;
                    const origH = el.height;

                    const onMove = (ev: PointerEvent) => {
                      const dx = (ev.clientX - startX) / zoom;
                      const dy = (ev.clientY - startY) / zoom;
                      const newW = Math.max(100, Math.round(origW + dx));
                      const newH = Math.max(80, Math.round(origH + dy));
                      onUpdateElements(
                        page.elements.map(item =>
                          item.id === el.id ? { ...item, width: newW, height: newH } : item
                        )
                      );
                    };

                    const onUp = () => {
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                    };

                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                  }}
                  className="absolute bottom-1.5 right-1.5 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                  title="Drag to resize sticky note"
                >
                  <svg className="w-2.5 h-2.5 text-slate-700/80" viewBox="0 0 6 6" fill="currentColor">
                    <circle cx="5" cy="5" r="0.8" />
                    <circle cx="5" cy="3" r="0.8" />
                    <circle cx="3" cy="5" r="0.8" />
                    <circle cx="1" cy="5" r="0.8" />
                    <circle cx="3" cy="3" r="0.8" />
                    <circle cx="5" cy="1" r="0.8" />
                  </svg>
                </div>
              </div>
            );
          } else if (el.type === 'solid3d' && el.showFormulas) {
            const info = SOLIDS_CATALOG[el.solidType];
            const isSelected = selectedId === el.id;
            return (
              <div
                key={el.id + '_formula'}
                style={{
                  left: `${el.x + el.width + 24}px`,
                  top: `${el.y}px`,
                  width: '270px',
                }}
                className={`absolute pointer-events-auto rounded-xl p-3 bg-slate-900/95 border border-sky-500/60 shadow-2xl backdrop-blur-md text-slate-100 flex flex-col gap-2 transition select-text z-20 ${
                  isSelected ? 'ring-2 ring-sky-400' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-750 pb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Box className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-xs font-bold text-sky-300 truncate">{info?.name || '3D Solid'}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {el.exploded && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        💥 Exploded
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateElements(
                          page.elements.map(item => item.id === el.id ? { ...item, showFormulas: false } : item)
                        );
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      title="Close Formula Card"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mb-0.5">
                      Volume (V):
                    </div>
                    <MathView math={info?.latexV || info?.formulaV || ''} />
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">
                      Curved Surface (CSA):
                    </div>
                    <MathView math={info?.latexCSA || info?.formulaCSA || ''} />
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">
                      Total Surface (TSA):
                    </div>
                    <MathView math={info?.latexTSA || info?.formulaTSA || ''} />
                  </div>

                  {info?.latexVars && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <MathView math={info.latexVars} />
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })}

      </div>

      {/* 4-Corner Selection Handles Box (Yellow Dashed Box, Telugu Badge, Blue Rotate, Red Delete, Purple Duplicate, Green Resize) */}
      {selectedIds.length > 0 && !editingTextId && (() => {
        const bounds = getSelectionBounds();
        if (!bounds) return null;

        const screenX = bounds.x * zoom + pan.x;
        const screenY = bounds.y * zoom + pan.y;
        const screenW = bounds.width * zoom;
        const screenH = bounds.height * zoom;

        return (
          <div
            style={{
              left: `${screenX}px`,
              top: `${screenY}px`,
              width: `${screenW}px`,
              height: `${screenH}px`,
            }}
            className="absolute pointer-events-none border-2 border-dashed border-amber-400 z-30 select-none"
          >
            {/* Draggable Interior to Move Selected Elements */}
            <div
              onPointerDown={handleStartMoveGroup}
              className="absolute inset-0 cursor-move pointer-events-auto bg-amber-400/5 hover:bg-amber-400/10 transition-colors"
              title="Drag to move selected elements"
            />

            {/* Top-Left Sky Blue Layer Handle */}
            <div className="absolute -top-4 -left-4 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHandleLayerMenu(prev => !prev);
                }}
                className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 active:scale-95 text-white shadow-lg flex items-center justify-center cursor-pointer border-2 border-white transition-transform"
                title="Layer Order (Bring to Front, Send to Back)"
              >
                <Layers className="w-4 h-4 stroke-[2.5]" />
              </button>

              {showHandleLayerMenu && (
                <div
                  onPointerDown={e => e.stopPropagation()}
                  className="absolute -top-36 -left-2 w-48 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 text-xs select-none"
                >
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                    <span>Layer Order</span>
                    <button
                      onClick={() => setShowHandleLayerMenu(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      bringToFront();
                      setShowHandleLayerMenu(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-sky-600/30 text-sky-300 hover:text-white transition text-left cursor-pointer font-semibold"
                  >
                    <ChevronsUp className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Bring to Front</span>
                  </button>
                  <button
                    onClick={() => {
                      bringForward();
                      setShowHandleLayerMenu(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition text-left cursor-pointer font-medium"
                  >
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Bring Forward</span>
                  </button>
                  <button
                    onClick={() => {
                      sendBackward();
                      setShowHandleLayerMenu(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition text-left cursor-pointer font-medium"
                  >
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Send Backward</span>
                  </button>
                  <button
                    onClick={() => {
                      sendToBack();
                      setShowHandleLayerMenu(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-600/30 text-amber-300 hover:text-white transition text-left cursor-pointer font-semibold"
                  >
                    <ChevronsDown className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Send to Back</span>
                  </button>
                </div>
              )}
            </div>

            {/* Top-Center Blue Rotate Handle with Vertical Dashed Stem */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-0 h-7 border-l-2 border-dashed border-blue-400 pointer-events-none" />
            <button
              onPointerDown={handleStartRotate}
              className="absolute -top-11 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-white pointer-events-auto transition-transform"
              title="Rotate Selection"
            >
              <RotateCw className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Top-Right Red Delete Handle */}
            <button
              onClick={handleDeleteSelected}
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-lg flex items-center justify-center cursor-pointer border-2 border-white pointer-events-auto transition-transform"
              title="Delete Selected Elements"
            >
              <X className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            {/* Bottom-Left Purple Duplicate Handle */}
            <button
              onClick={handleDuplicateSelected}
              className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-lg flex items-center justify-center cursor-pointer border-2 border-white pointer-events-auto transition-transform"
              title="Duplicate Selected Elements"
            >
              <Copy className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Bottom-Right Green Resize Handle */}
            <button
              onPointerDown={handleStartResize}
              className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-lg flex items-center justify-center cursor-nwse-resize border-2 border-white pointer-events-auto transition-transform"
              title="Resize Selected Elements"
            >
              <Maximize2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        );
      })()}

      {/* Floating Selection Action Toolbar (when an element is selected) */}
      {selectedId && (() => {
        const selectedEl = page.elements.find(e => e.id === selectedId);
        const isSolid = selectedEl?.type === 'solid3d';
        const isImage = selectedEl?.type === 'image';
        const isSticky = selectedEl?.type === 'sticky';
        const isShape = selectedEl?.type === 'shape';
        const isText = selectedEl?.type === 'text';
        const imgEl = isImage ? (selectedEl as ImageElement) : null;
        const stickyEl = isSticky ? (selectedEl as StickyNoteElement) : null;
        const solid = isSolid ? (selectedEl as Solid3DElement) : null;
        const shapeEl = isShape ? (selectedEl as ShapeElement) : null;
        const textEl = isText ? (selectedEl as TextElement) : null;
        const solidInfo = solid ? SOLIDS_CATALOG[solid.solidType] : null;
        const isCombo = !!solidInfo?.isCombination || solidInfo?.category === 'combination';

        const updateShape = (updates: Partial<ShapeElement>) => {
          onUpdateElements(
            page.elements.map(e => {
              if (e.id === selectedId || (selectedIds.includes(e.id) && e.type === 'shape')) {
                return ({ ...e, ...updates } as BoardElement);
              }
              return e;
            })
          );
        };

        const updateSolid = (updates: Partial<Solid3DElement>) => {
          onUpdateElements(
            page.elements.map(e => (e.id === selectedId ? ({ ...e, ...updates } as BoardElement) : e))
          );
        };

        const updateImage = (updates: Partial<ImageElement>) => {
          onUpdateElements(
            page.elements.map(e => (e.id === selectedId ? ({ ...e, ...updates } as BoardElement) : e))
          );
        };

        const updateSticky = (updates: Partial<StickyNoteElement>) => {
          onUpdateElements(
            page.elements.map(e => (e.id === selectedId ? ({ ...e, ...updates } as BoardElement) : e))
          );
        };

        const scaleSolid = (factor: number) => {
          if (!solid) return;
          const newW = Math.max(80, Math.min(1200, Math.round(solid.width * factor)));
          const newH = Math.max(80, Math.min(1200, Math.round(solid.height * factor)));
          updateSolid({ width: newW, height: newH });
        };

        const setSolidDimension = (size: number) => {
          if (!solid) return;
          updateSolid({ width: size, height: size });
        };

        const scaleImage = (factor: number) => {
          if (!imgEl) return;
          const newW = Math.max(80, Math.min(1800, Math.round(imgEl.width * factor)));
          const aspect = imgEl.aspectRatio || (imgEl.width / (imgEl.height || 1));
          const newH = Math.round(newW / aspect);
          updateImage({ width: newW, height: newH });
        };

        const setImageWidth = (w: number) => {
          if (!imgEl) return;
          const aspect = imgEl.aspectRatio || (imgEl.width / (imgEl.height || 1));
          const newW = w;
          const newH = Math.round(w / aspect);
          updateImage({ width: newW, height: newH });
        };

        const scaleSticky = (factor: number) => {
          if (!stickyEl) return;
          const newW = Math.max(100, Math.min(1000, Math.round(stickyEl.width * factor)));
          const newH = Math.max(80, Math.min(800, Math.round(stickyEl.height * factor)));
          updateSticky({ width: newW, height: newH });
        };

        const setStickyDimensions = (w: number, h: number) => {
          if (!stickyEl) return;
          updateSticky({ width: w, height: h });
        };

        if (isSelectionBarCollapsed) {
          return (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-slate-700/90 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs backdrop-blur-md">
              <div className="flex items-center gap-1.5 font-bold text-sky-300">
                {isSolid ? <Box className="w-3.5 h-3.5 text-amber-400" /> : isSticky ? <Sliders className="w-3.5 h-3.5 text-amber-300" /> : isShape ? <Shapes className="w-3.5 h-3.5 text-sky-400" /> : <Move className="w-3.5 h-3.5 text-slate-400" />}
                <span className="text-[11px]">{isSolid ? solidInfo?.name || '3D Solid' : isSticky ? 'Sticky Note' : isShape ? `Shape: ${shapeEl?.shapeType}` : 'Element Selected'}</span>
              </div>
              <button
                onClick={() => setIsSelectionBarCollapsed(false)}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-[10px] font-bold border border-slate-600 transition"
                title="Show full controls toolbar for this element"
              >
                <Eye className="w-3 h-3 text-sky-400" />
                <span>Show Options</span>
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-800 transition"
                title="Deselect element"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        }

        return (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border-2 border-slate-700 px-3.5 py-2 rounded-2xl shadow-2xl flex flex-wrap items-center gap-2 text-xs backdrop-blur-md max-w-[95vw]">
            <div className="flex items-center gap-1.5 font-bold text-white">
              {isSolid ? <Box className="w-4 h-4 text-amber-400" /> : isSticky ? <Sliders className="w-4 h-4 text-amber-300" /> : isShape ? <Shapes className="w-4 h-4 text-sky-400" /> : <Move className="w-4 h-4 text-slate-400" />}
              <span className="capitalize">{isSolid ? solidInfo?.name || '3D Solid' : isSticky ? 'Sticky Note' : isShape ? `Shape: ${shapeEl?.shapeType}` : 'Element Selected'}</span>
            </div>

            {/* Small Hide / Minimize Option for Selected Element Toolbar */}
            <button
              onClick={() => setIsSelectionBarCollapsed(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition text-[11px]"
              title="Hide / Minimize this toolbar to view whiteboard clearly"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide</span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            {/* Universal Layer Stacking Controls (Front, Forward, Backward, Back) */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 px-2 py-1 rounded-xl">
              <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] mr-1">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Layer:</span>
              </div>
              <button
                onClick={bringToFront}
                className="flex items-center gap-1 px-2 py-0.5 bg-sky-600/40 hover:bg-sky-600 text-sky-200 hover:text-white border border-sky-500/50 rounded text-[11px] font-bold transition active:scale-95 cursor-pointer shadow-xs"
                title="Bring to Front (Place on top of all other elements) [Ctrl+Shift+]]"
              >
                <ChevronsUp className="w-3.5 h-3.5" />
                <span>Front</span>
              </button>
              <button
                onClick={bringForward}
                className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded text-[11px] font-semibold transition active:scale-95 cursor-pointer"
                title="Bring Forward (Move 1 layer up) [Ctrl+]]"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Forward</span>
              </button>
              <button
                onClick={sendBackward}
                className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded text-[11px] font-semibold transition active:scale-95 cursor-pointer"
                title="Send Backward (Move 1 layer down) [Ctrl+[]"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Backward</span>
              </button>
              <button
                onClick={sendToBack}
                className="flex items-center gap-1 px-2 py-0.5 bg-amber-600/40 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/50 rounded text-[11px] font-bold transition active:scale-95 cursor-pointer shadow-xs"
                title="Send to Back (Place behind all other elements) [Ctrl+Shift+[]"
              >
                <ChevronsDown className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setShowLayersDrawer(true)}
                className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 rounded text-[11px] font-semibold transition ml-0.5 cursor-pointer"
                title="Open All Canvas Layers List"
              >
                <span>All Layers</span>
              </button>
            </div>

            {isSolid && solid && (
              <>
                <div className="h-4 w-px bg-slate-700 mx-1" />

                {/* 3D Rotation Yaw & Pitch Controls */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Rotate 3D:</span>
                  <button
                    onClick={() => updateSolid({ rotationY: (solid.rotationY - 15) % 360 })}
                    className="p-1 hover:bg-slate-700 text-slate-200 rounded transition"
                    title="Rotate Left (Yaw -15°)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateSolid({ rotationY: (solid.rotationY + 15) % 360 })}
                    className="p-1 hover:bg-slate-700 text-slate-200 rounded transition"
                    title="Rotate Right (Yaw +15°)"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateSolid({ rotationX: Math.min(85, solid.rotationX + 15) })}
                    className="p-1 hover:bg-slate-700 text-slate-200 rounded transition"
                    title="Tilt Up (Pitch +15°)"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateSolid({ rotationX: Math.max(-85, solid.rotationX - 15) })}
                    className="p-1 hover:bg-slate-700 text-slate-200 rounded transition"
                    title="Tilt Down (Pitch -15°)"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Net Diagram Toggle */}
                <button
                  onClick={() => updateSolid({ showNet: !solid.showNet })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition ${
                    solid.showNet
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800 text-purple-300 hover:bg-slate-750'
                  }`}
                  title="Toggle 2D Net Diagram / 3D Solid"
                >
                  <span>{solid.showNet ? '📦 3D Solid' : '📐 2D Net'}</span>
                </button>

                {/* Net Fold Toggle */}
                {solid.showNet && (
                  <button
                    onClick={() => updateSolid({ netFoldRatio: (solid.netFoldRatio || 0) >= 0.5 ? 0 : 0.65 })}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-200 text-[10px] font-bold"
                    title="Toggle Fold State"
                  >
                    <span>{(solid.netFoldRatio || 0) >= 0.5 ? 'Unfold Flat' : 'Fold Net'}</span>
                  </button>
                )}

                {/* Explode Option for Combination of Solids */}
                {isCombo && !solid.showNet && (
                  <button
                    onClick={() =>
                      updateSolid({
                        exploded: !solid.exploded,
                        explodeRatio: !solid.exploded ? 0.75 : 0,
                      })
                    }
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition ${
                      solid.exploded
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                        : 'bg-slate-800 text-amber-300 hover:bg-slate-750 border border-amber-600/40'
                    }`}
                    title="Toggle Explode separation of combination parts"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{solid.exploded ? '💥 Reassemble' : '💥 Explode'}</span>
                  </button>
                )}

                {/* Show/Hide Formulas Box */}
                <button
                  onClick={() => updateSolid({ showFormulas: !solid.showFormulas })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                    solid.showFormulas
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                  title="Toggle KaTeX Formula Panel"
                >
                  <span>f(x) Formulas</span>
                </button>

                {/* 3D Solid Comprehensive Resize Options */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-amber-400 font-bold mr-1">Resize:</span>
                  <button
                    onClick={() => scaleSolid(0.75)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded transition text-[11px]"
                    title="Reduce 3D Solid Size by 25%"
                  >
                    -25%
                  </button>
                  <button
                    onClick={() => scaleSolid(0.5)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-amber-300 font-bold rounded transition text-[11px]"
                    title="Reduce to Half Size (50%)"
                  >
                    ½ Size
                  </button>
                  <button
                    onClick={() => scaleSolid(1.25)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded transition text-[11px]"
                    title="Enlarge 3D Solid Size by 25%"
                  >
                    +25%
                  </button>
                  <button
                    onClick={() => scaleSolid(2)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-sky-300 font-bold rounded transition text-[11px]"
                    title="Double Size (2x)"
                  >
                    2×
                  </button>

                  <div className="h-3 w-px bg-slate-700 mx-1" />

                  <button
                    onClick={() => setSolidDimension(180)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${solid.width <= 210 ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Small Solid (180px)"
                  >
                    Small
                  </button>
                  <button
                    onClick={() => setSolidDimension(280)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${solid.width > 210 && solid.width <= 340 ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Medium Solid (280px)"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setSolidDimension(400)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${solid.width > 340 && solid.width <= 460 ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Large Solid (400px)"
                  >
                    Large
                  </button>
                  <button
                    onClick={() => setSolidDimension(540)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${solid.width > 460 ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Extra Large Solid (540px)"
                  >
                    XL
                  </button>
                </div>
              </>
            )}

            {/* Snippet / Image Size Reduction & Expansion Controls */}
            {isImage && imgEl && (
              <>
                <div className="h-4 w-px bg-slate-700 mx-1" />
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-sky-400 font-bold mr-1">Snippet Size:</span>
                  <button
                    onClick={() => scaleImage(0.75)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded transition text-[11px]"
                    title="Reduce Snippet Size by 25%"
                  >
                    -25%
                  </button>
                  <button
                    onClick={() => scaleImage(0.5)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-sky-300 font-bold rounded transition text-[11px]"
                    title="Reduce to Half Size (50%)"
                  >
                    ½ Size
                  </button>
                  <button
                    onClick={() => scaleImage(1.25)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded transition text-[11px]"
                    title="Enlarge Snippet Size by 25%"
                  >
                    +25%
                  </button>

                  <div className="h-3 w-px bg-slate-700 mx-1" />

                  <button
                    onClick={() => setImageWidth(240)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${imgEl.width <= 280 ? 'bg-sky-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Compact Snippet (240px)"
                  >
                    Small
                  </button>
                  <button
                    onClick={() => setImageWidth(420)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${imgEl.width > 280 && imgEl.width <= 520 ? 'bg-sky-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Standard Snippet (420px)"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setImageWidth(640)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${imgEl.width > 520 ? 'bg-sky-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Large Snippet (640px)"
                  >
                    Large
                  </button>
                </div>

                {/* Crop & Auto-Trim Actions for On-Canvas Templates / Images */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-sky-400 font-bold mr-1">Crop:</span>
                  <button
                    onClick={() => setCroppingImageId(imgEl.id)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded transition text-[11px] shadow-sm active:scale-95"
                    title="Open Crop Tool for this template or image"
                  >
                    <Crop className="w-3.5 h-3.5 text-white" />
                    <span>Crop Tool</span>
                  </button>
                  <button
                    onClick={() => {
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const nw = img.naturalWidth || img.width;
                        const nh = img.naturalHeight || img.height;
                        canvas.width = nw;
                        canvas.height = nh;
                        const ctx = canvas.getContext('2d', { willReadFrequently: true });
                        if (!ctx) return;
                        ctx.drawImage(img, 0, 0);

                        const imgData = ctx.getImageData(0, 0, nw, nh);
                        const d = imgData.data;
                        const bgR = d[0], bgG = d[1], bgB = d[2];
                        let minX = nw, maxX = 0, minY = nh, maxY = 0;
                        let found = false;
                        for (let y = 0; y < nh; y += 2) {
                          for (let x = 0; x < nw; x += 2) {
                            const i = (y * nw + x) * 4;
                            const diff = Math.abs(d[i] - bgR) + Math.abs(d[i+1] - bgG) + Math.abs(d[i+2] - bgB);
                            if (d[i+3] > 20 && diff > 25) {
                              found = true;
                              if (x < minX) minX = x;
                              if (x > maxX) maxX = x;
                              if (y < minY) minY = y;
                              if (y > maxY) maxY = y;
                            }
                          }
                        }
                        if (!found) return;
                        const pad = 12;
                        const cx = Math.max(0, minX - pad);
                        const cy = Math.max(0, minY - pad);
                        const cw = Math.min(nw - cx, (maxX - minX) + pad * 2);
                        const ch = Math.min(nh - cy, (maxY - minY) + pad * 2);
                        const cropped = document.createElement('canvas');
                        cropped.width = cw;
                        cropped.height = ch;
                        const cctx = cropped.getContext('2d');
                        if (!cctx) return;
                        cctx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
                        const newSrc = cropped.toDataURL('image/png');
                        const newAspect = cw / ch;
                        const newHeight = Math.round(imgEl.width / newAspect);
                        updateImage({ src: newSrc, aspectRatio: newAspect, height: newHeight });
                      };
                      img.src = imgEl.src;
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 hover:text-white font-bold rounded transition text-[11px] active:scale-95"
                    title="Auto-detect content and instantly trim all blank margins"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-Trim</span>
                  </button>
                </div>
              </>
            )}

            {/* Sticky Note Quick Resize and Styling Controls */}
            {isSticky && stickyEl && (
              <>
                <div className="h-4 w-px bg-slate-700 mx-1" />
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-amber-400 font-bold mr-1">Resize:</span>
                  <button
                    onClick={() => scaleSticky(0.75)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded transition text-[11px]"
                    title="Reduce Sticky Note Size by 25%"
                  >
                    -25%
                  </button>
                  <button
                    onClick={() => scaleSticky(0.5)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-amber-300 font-bold rounded transition text-[11px]"
                    title="Reduce to Half Size (50%)"
                  >
                    ½ Size
                  </button>
                  <button
                    onClick={() => scaleSticky(1.25)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded transition text-[11px]"
                    title="Enlarge Sticky Note Size by 25%"
                  >
                    +25%
                  </button>
                  <button
                    onClick={() => scaleSticky(1.5)}
                    className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 active:scale-95 text-sky-300 font-bold rounded transition text-[11px]"
                    title="Enlarge to 1.5x"
                  >
                    +50%
                  </button>

                  <div className="h-3 w-px bg-slate-700 mx-1" />

                  <button
                    onClick={() => setStickyDimensions(160, 120)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${stickyEl.width <= 170 ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Small Note (160×120)"
                  >
                    Small
                  </button>
                  <button
                    onClick={() => setStickyDimensions(220, 160)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${stickyEl.width > 170 && stickyEl.width <= 260 ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Medium Note (220×160)"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setStickyDimensions(300, 220)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${stickyEl.width > 260 ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                    title="Large Note (300×220)"
                  >
                    Large
                  </button>
                  <button
                    onClick={() => setStickyDimensions(360, 160)}
                    className="px-1.5 py-0.5 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-700"
                    title="Wide Note (360×160)"
                  >
                    Wide
                  </button>
                </div>

                {/* Sticky Note Color Switcher */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  {[
                    { color: '#fef08a', title: 'Yellow' },
                    { color: '#bbf7d0', title: 'Green' },
                    { color: '#bae6fd', title: 'Blue' },
                    { color: '#fbcfe8', title: 'Pink' },
                    { color: '#e9d5ff', title: 'Purple' },
                    { color: '#fed7aa', title: 'Orange' },
                  ].map(c => (
                    <button
                      key={c.color}
                      onClick={() => updateSticky({ color: c.color })}
                      style={{ backgroundColor: c.color }}
                      className={`w-4 h-4 rounded-full border ${stickyEl.color === c.color ? 'border-white scale-110 ring-1 ring-sky-400' : 'border-black/20 hover:scale-110'} transition-transform`}
                      title={c.title}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Shape Customization: Fill Color, Stroke Color, and Stroke Width */}
            {isShape && shapeEl && (
              <>
                <div className="h-4 w-px bg-slate-700 mx-1" />
                
                {/* Shape Fill Color Controls */}
                <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
                  <span className="text-[10px] text-amber-400 font-bold mr-0.5">Fill:</span>
                  <button
                    onClick={() => updateShape({ fillColor: 'transparent' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                      shapeEl.fillColor === 'transparent'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold shadow-sm'
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-650'
                    }`}
                    title="No Fill (Outline Only)"
                  >
                    🚫 None
                  </button>
                  {[
                    { color: 'rgba(245, 158, 11, 0.4)', name: 'Amber Tint' },
                    { color: 'rgba(56, 189, 248, 0.4)', name: 'Sky Blue Tint' },
                    { color: 'rgba(16, 185, 129, 0.4)', name: 'Green Tint' },
                    { color: 'rgba(239, 68, 68, 0.4)', name: 'Red Tint' },
                    { color: 'rgba(168, 85, 247, 0.4)', name: 'Purple Tint' },
                    { color: 'rgba(249, 115, 22, 0.4)', name: 'Orange Tint' },
                    { color: 'rgba(255, 255, 255, 0.45)', name: 'White Tint' },
                    { color: '#f59e0b', name: 'Solid Amber' },
                    { color: '#38bdf8', name: 'Solid Sky' },
                    { color: '#10b981', name: 'Solid Emerald' },
                    { color: '#ef4444', name: 'Solid Crimson' },
                  ].map(c => (
                    <button
                      key={c.color}
                      onClick={() => updateShape({ fillColor: c.color })}
                      style={{ backgroundColor: c.color }}
                      className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                        shapeEl.fillColor === c.color
                          ? 'border-white scale-125 ring-2 ring-amber-400 shadow-md'
                          : 'border-white/30 hover:scale-110'
                      }`}
                      title={`${c.name} Fill`}
                    />
                  ))}
                </div>

                {/* Shape Outline Stroke Color */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-sky-400 font-bold mr-0.5">Outline:</span>
                  {[
                    { color: '#ffffff', name: 'White' },
                    { color: '#38bdf8', name: 'Sky Blue' },
                    { color: '#f59e0b', name: 'Amber' },
                    { color: '#10b981', name: 'Green' },
                    { color: '#ef4444', name: 'Red' },
                    { color: '#a855f7', name: 'Purple' },
                  ].map(c => (
                    <button
                      key={c.color}
                      onClick={() => updateShape({ strokeColor: c.color })}
                      style={{ backgroundColor: c.color }}
                      className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                        shapeEl.strokeColor === c.color ? 'border-white scale-125 ring-1 ring-sky-400' : 'border-white/30 hover:scale-110'
                      }`}
                      title={`${c.name} Outline`}
                    />
                  ))}
                </div>

                {/* Shape Stroke Width */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold mr-0.5">Width:</span>
                  {[2, 4, 8].map(w => (
                    <button
                      key={w}
                      onClick={() => updateShape({ strokeWidth: w })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                        shapeEl.strokeWidth === w ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={`Stroke Width ${w}px`}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Text & Math Symbol Controls: Add Text / Edit, Size, and Color */}
            {isText && textEl && (
              <>
                <div className="h-4 w-px bg-slate-700 mx-1" />
                <button
                  onClick={() => setEditingTextId(textEl.id)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition active:scale-95 shadow cursor-pointer"
                  title="Add text beside symbol or edit text"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Add Text / Edit</span>
                </button>

                {/* Font Size Controls */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-bold mr-0.5">Size:</span>
                  <button
                    onClick={() => {
                      const nextSize = Math.max(16, (textEl.fontSize || 36) - 6);
                      onUpdateElements(page.elements.map(e => e.id === textEl.id ? { ...e, fontSize: nextSize } : e));
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-700"
                    title="Smaller Text"
                  >
                    A-
                  </button>
                  <span className="text-[11px] font-mono font-bold text-sky-400 px-1">{textEl.fontSize || 36}</span>
                  <button
                    onClick={() => {
                      const nextSize = Math.min(72, (textEl.fontSize || 36) + 6);
                      onUpdateElements(page.elements.map(e => e.id === textEl.id ? { ...e, fontSize: nextSize } : e));
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-700"
                    title="Larger Text"
                  >
                    A+
                  </button>
                </div>

                {/* Quick Color Switcher */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
                  {[
                    { color: '#ffffff', name: 'White' },
                    { color: '#38bdf8', name: 'Sky Blue' },
                    { color: '#f59e0b', name: 'Amber' },
                    { color: '#10b981', name: 'Green' },
                    { color: '#ef4444', name: 'Red' },
                    { color: '#a855f7', name: 'Purple' },
                  ].map(c => (
                    <button
                      key={c.color}
                      onClick={() => onUpdateElements(page.elements.map(e => e.id === textEl.id ? { ...e, color: c.color } : e))}
                      style={{ backgroundColor: c.color }}
                      className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                        textEl.color === c.color ? 'border-white scale-125 ring-1 ring-sky-400' : 'border-white/30 hover:scale-110'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-950/40 transition font-bold"
              title="Delete Element (Delete or Backspace)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        );
      })()}

      {/* Auto-Shape Detection Toast */}
      {detectionToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/95 text-white font-bold text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400 backdrop-blur-md animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{detectionToast}</span>
        </div>
      )}

      {/* Zoom / Pan Controls (Positioned cleanly above Right Bottom Footer) */}
      <div className="fixed bottom-12 sm:bottom-14 right-3 sm:right-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-xl backdrop-blur-xs text-xs">
        <button
          onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 font-mono font-bold text-slate-300 text-[11px]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(3.0, z + 0.15))}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="h-3.5 w-px bg-slate-700 mx-0.5" />
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          title="Reset 100% Zoom & Pan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="h-3.5 w-px bg-slate-700 mx-0.5" />
        <button
          onClick={() => setShowLayersDrawer(prev => !prev)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
            showLayersDrawer
              ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Canvas Layers Drawer"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Layers</span>
          {page.elements.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-300 font-mono border border-slate-700">
              {page.elements.length}
            </span>
          )}
        </button>
      </div>

      {/* Slide-Out Canvas Layers Manager Drawer */}
      {showLayersDrawer && (
        <aside
          aria-label="Canvas Layers"
          className="fixed top-14 bottom-14 right-3 sm:right-4 z-40 w-84 max-w-[92vw] bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden text-xs text-slate-200"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Layers Manager</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                    {page.elements.length}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Top items appear above lower items
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowLayersDrawer(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Close Layers Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Selected Stacking Order Bar */}
          {selectedIds.length > 0 && (
            <div className="px-3 py-2 bg-sky-950/30 border-b border-sky-500/20 flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-sky-300 truncate max-w-[120px]">
                Selected ({selectedIds.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={bringToFront}
                  className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-1"
                  title="Bring Selected to Very Front"
                >
                  <ChevronsUp className="w-3 h-3" />
                  <span>Front</span>
                </button>
                <button
                  onClick={bringForward}
                  className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-medium transition active:scale-95 cursor-pointer"
                  title="Bring Selected Forward 1 Layer"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={sendBackward}
                  className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-medium transition active:scale-95 cursor-pointer"
                  title="Send Selected Backward 1 Layer"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={sendToBack}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-1"
                  title="Send Selected to Very Back"
                >
                  <ChevronsDown className="w-3 h-3" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          )}

          {/* Elements List (Reverse order: top of list = topmost canvas element) */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {page.elements.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <Layers className="w-8 h-8 stroke-1 mb-2 text-slate-600" />
                <p className="font-semibold text-xs text-slate-400">No objects on canvas</p>
                <p className="text-[11px] mt-1 text-slate-500">Draw a shape, write text, or insert an image snippet to see layers.</p>
              </div>
            ) : (
              [...page.elements]
                .map((el, originalIndex) => ({ el, originalIndex }))
                .reverse()
                .map(({ el, originalIndex }) => {
                  const isSelected = selectedIds.includes(el.id);
                  const isTop = originalIndex === page.elements.length - 1;
                  const isBottom = originalIndex === 0;

                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedId(el.id)}
                      className={`group flex items-center justify-between p-2 rounded-xl border transition cursor-pointer select-none ${
                        isSelected
                          ? 'bg-sky-950/50 border-sky-500 shadow-md ring-1 ring-sky-500/50'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      {/* Left: Thumbnail/Icon & Name */}
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                        <span className="text-[9px] font-mono text-slate-500 w-4 text-center">
                          {originalIndex + 1}
                        </span>

                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {el.type === 'image' ? (
                            el.src ? (
                              <img src={el.src} alt="snippet" className="w-full h-full object-cover" />
                            ) : (
                              <Crop className="w-3.5 h-3.5 text-emerald-400" />
                            )
                          ) : el.type === 'shape' ? (
                            <Shapes className="w-3.5 h-3.5 text-sky-400" />
                          ) : el.type === 'solid3d' ? (
                            <Box className="w-3.5 h-3.5 text-amber-400" />
                          ) : el.type === 'text' ? (
                            <Type className="w-3.5 h-3.5 text-purple-400" />
                          ) : el.type === 'sticky' ? (
                            <Sliders className="w-3.5 h-3.5 text-amber-300" />
                          ) : (
                            <Edit3 className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[11px] text-slate-200 truncate">
                            {el.type === 'image'
                              ? 'Image / Snippet'
                              : el.type === 'shape'
                              ? `Shape (${el.shapeType})`
                              : el.type === 'solid3d'
                              ? `3D ${SOLIDS_CATALOG[el.solidType]?.name || el.solidType}`
                              : el.type === 'text'
                              ? el.text || 'Empty Text'
                              : el.type === 'sticky'
                              ? el.text || 'Sticky Note'
                              : `Pen Stroke (${el.points?.length || 0} pts)`}
                          </div>
                          <div className="text-[9px] text-slate-500 capitalize">
                            {el.type}
                            {isTop && ' • (Front)'}
                            {isBottom && ' • (Back)'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Layer Stacking Controls */}
                      <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => moveElementUp(el.id)}
                          disabled={isTop}
                          className={`p-1 rounded transition ${
                            isTop
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95'
                          }`}
                          title="Move Up 1 Layer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveElementDown(el.id)}
                          disabled={isBottom}
                          className={`p-1 rounded transition ${
                            isBottom
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95'
                          }`}
                          title="Move Down 1 Layer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveElementToTop(el.id)}
                          disabled={isTop}
                          className={`p-1 rounded transition ${
                            isTop
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'text-sky-400 hover:text-white hover:bg-sky-700/60 active:scale-95'
                          }`}
                          title="Bring to Very Front"
                        >
                          <ChevronsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveElementToBottom(el.id)}
                          disabled={isBottom}
                          className={`p-1 rounded transition ${
                            isBottom
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'text-amber-400 hover:text-white hover:bg-amber-700/60 active:scale-95'
                          }`}
                          title="Send to Very Back"
                        >
                          <ChevronsDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteElementById(el.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete element"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Drawer Footer Tip */}
          <div className="px-3 py-2 border-t border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Shortcuts:</span>
            <div className="flex items-center gap-1 font-mono text-[9px] text-slate-300">
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700">Ctrl+]</kbd>
              <span>Up</span>
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 ml-1">Ctrl+[</kbd>
              <span>Down</span>
            </div>
          </div>
        </aside>
      )}

      {/* Interactive Crop Modal for On-Canvas Templates / Images */}
      {croppingImage && (
        <ImageCropModal
          image={croppingImage}
          onClose={() => setCroppingImageId(null)}
          onApplyCrop={(newSrc, newAspect, newW, newH) => {
            onUpdateElements(
              page.elements.map(e =>
                e.id === croppingImage.id
                  ? ({ ...e, src: newSrc, aspectRatio: newAspect, width: newW, height: newH } as BoardElement)
                  : e
              )
            );
            setCroppingImageId(null);
          }}
        />
      )}
    </div>
  );
};
