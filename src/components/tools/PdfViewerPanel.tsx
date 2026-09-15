import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  X, 
  Minus, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ArrowLeftRight, 
  Scissors, 
  FileText, 
  Upload, 
  Sparkles, 
  Check, 
  Copy,
  Eye,
  EyeOff,
  PenTool,
  Highlighter,
  Eraser,
  Hand,
  Trash2,
  RotateCcw
import { cropPdfRegion } from '../../utils/pdf';

export type PdfToolType = 'pan' | 'pen' | 'highlighter' | 'eraser';

export interface PdfStrokePoint {
  nx: number;
  ny: number;
}

export interface PdfStroke {
  id: string;
  points: PdfStrokePoint[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter';
}

function drawSmoothPdfStroke(
  ctx: CanvasRenderingContext2D,
  points: PdfStrokePoint[],
  color: string,
  width: number,
  isHighlight: boolean,
  canvasW: number,
  canvasH: number
) {
  if (points.length === 0) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.globalAlpha = isHighlight ? 0.45 : 1.0;
  ctx.lineWidth = isHighlight ? width * 2.8 : width;

  if (points.length === 1) {
    const p = points[0];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.nx * canvasW, p.ny * canvasH, Math.max(1, ctx.lineWidth / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  const p0 = points[0];
  ctx.moveTo(p0.nx * canvasW, p0.ny * canvasH);

  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const xc = ((current.nx + next.nx) / 2) * canvasW;
    const yc = ((current.ny + next.ny) / 2) * canvasH;
    ctx.quadraticCurveTo(current.nx * canvasW, current.ny * canvasH, xc, yc);
  }

  const last = points[points.length - 1];
  ctx.lineTo(last.nx * canvasW, last.ny * canvasH);
  ctx.stroke();
  ctx.restore();
}

interface PdfViewerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  filename: string;
  currentPage: number;
  onPageChange: (pageNum: number) => void;
  panelWidthPercent: number;
  onWidthChange: (pct: number) => void;
  dockSide: 'left' | 'right';
  onToggleDockSide: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onInsertSnippetToBoard: (dataUrl: string, width: number, height: number, pageNum: number) => void;
  onInsertPageToBoard: (dataUrl: string, width: number, height: number, pageNum: number) => void;
  onLoadNewPdf: (file: File) => void;
  onLoadSampleLesson: () => void;
  isCleanPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
}

export const PdfViewerPanel: React.FC<PdfViewerPanelProps> = ({
  isOpen,
  onClose,
  pdfDoc,
  filename,
  currentPage,
  onPageChange,
  panelWidthPercent,
  onWidthChange,
  dockSide,
  onToggleDockSide,
  isMinimized,
  onToggleMinimize,
  onInsertSnippetToBoard,
  onInsertPageToBoard,
  onLoadNewPdf,
  onLoadSampleLesson,
  isCleanPresentationMode = false,
  onTogglePresentationMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1.25);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [pageJumpVal, setPageJumpVal] = useState<string>(String(currentPage));

  // PDF Annotation Tooling State
  const [pdfTool, setPdfTool] = useState<PdfToolType>('pen');
  const [penColor, setPenColor] = useState<string>('#ef4444');
  const [penWidth, setPenWidth] = useState<number>(3);
  const [pageAnnotations, setPageAnnotations] = useState<Record<number, PdfStroke[]>>({});
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const activeStrokePointsRef = useRef<PdfStrokePoint[]>([]);

  // Snipping / Cropping state
  const [isSnipMode, setIsSnipMode] = useState<boolean>(false);
  const [cropBox, setCropBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [renderDimensions, setRenderDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Resizing width with drag
  const isResizingRef = useRef(false);

  const totalPages = pdfDoc?.numPages || 1;

  // Sync pageJumpVal with currentPage
  useEffect(() => {
    setPageJumpVal(String(currentPage));
  }, [currentPage]);

  // Redraw all annotations on current page
  const redrawAnnotations = useCallback(() => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const strokes = pageAnnotations[currentPage] || [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    for (const stroke of strokes) {
      drawSmoothPdfStroke(
        ctx,
        stroke.points,
        stroke.color,
        stroke.width * dpr,
        stroke.tool === 'highlighter',
        canvas.width,
        canvas.height
      );
    }
  }, [currentPage, pageAnnotations]);

  useEffect(() => {
    redrawAnnotations();
  }, [pageAnnotations, redrawAnnotations]);

  // Render current PDF page onto canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || currentPage < 1 || currentPage > totalPages) return;
    setIsRendering(true);

    try {
      const page = await pdfDoc.getPage(currentPage);
      // High-DPI rendering for ultra-sharp math formulas on flat panels
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: zoomLevel * dpr });

      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      if (annotationCanvasRef.current) {
        annotationCanvasRef.current.width = viewport.width;
        annotationCanvasRef.current.height = viewport.height;
        annotationCanvasRef.current.style.width = `${viewport.width / dpr}px`;
        annotationCanvasRef.current.style.height = `${viewport.height / dpr}px`;
      }

      setRenderDimensions({
        width: viewport.width / dpr,
        height: viewport.height / dpr,
      });

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      if (annotationCanvasRef.current) {
        annotationCanvasRef.current.width = canvas.width;
        annotationCanvasRef.current.height = canvas.height;
        annotationCanvasRef.current.style.width = canvas.style.width;
        annotationCanvasRef.current.style.height = canvas.style.height;
      }
      redrawAnnotations();
    } catch (err) {
      console.error('Error rendering PDF page in single viewer:', err);
    } finally {
      setIsRendering(false);
    }
  }, [pdfDoc, currentPage, zoomLevel, totalPages, redrawAnnotations]);

  useEffect(() => {
    if (annotationCanvasRef.current && canvasRef.current) {
      if (annotationCanvasRef.current.width !== canvasRef.current.width || annotationCanvasRef.current.height !== canvasRef.current.height) {
        annotationCanvasRef.current.width = canvasRef.current.width;
        annotationCanvasRef.current.height = canvasRef.current.height;
        annotationCanvasRef.current.style.width = canvasRef.current.style.width;
        annotationCanvasRef.current.style.height = canvasRef.current.style.height;
        redrawAnnotations();
      }
    }
  }, [renderDimensions, redrawAnnotations]);

  useEffect(() => {
    if (isOpen && !isMinimized && pdfDoc) {
      renderCurrentPage();
    }
  }, [isOpen, isMinimized, pdfDoc, currentPage, zoomLevel, renderCurrentPage]);

  // Drawing handlers for PDF annotation canvas
  const handlePointerDownAnnotation = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pdfTool === 'pan' || isSnipMode || !annotationCanvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const rect = annotationCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = Math.max(0, Math.min(1, x / (rect.width || 1)));
    const ny = Math.max(0, Math.min(1, y / (rect.height || 1)));

    if (pdfTool === 'eraser') {
      eraseStrokesNear(nx, ny, rect.width, rect.height);
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    activeStrokePointsRef.current = [{ nx, ny }];

    const ctx = annotationCanvasRef.current.getContext('2d');
    if (ctx) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.fillStyle = penColor;
      ctx.globalAlpha = pdfTool === 'highlighter' ? 0.45 : 1.0;
      const r = ((pdfTool === 'highlighter' ? penWidth * 2.8 : penWidth) * dpr) / 2;
      ctx.beginPath();
      ctx.arc(nx * annotationCanvasRef.current.width, ny * annotationCanvasRef.current.height, Math.max(1, r), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const handlePointerMoveAnnotation = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || pdfTool === 'pan' || isSnipMode || !annotationCanvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = annotationCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nx = Math.max(0, Math.min(1, x / (rect.width || 1)));
    const ny = Math.max(0, Math.min(1, y / (rect.height || 1)));

    if (pdfTool === 'eraser') {
      eraseStrokesNear(nx, ny, rect.width, rect.height);
      return;
    }

    const pts = activeStrokePointsRef.current;
    pts.push({ nx, ny });

    const ctx = annotationCanvasRef.current.getContext('2d');
    if (ctx && pts.length >= 2) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvasW = annotationCanvasRef.current.width;
      const canvasH = annotationCanvasRef.current.height;
      const pPrev = pts[pts.length - 2];
      const pCurr = pts[pts.length - 1];

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
      ctx.globalAlpha = pdfTool === 'highlighter' ? 0.45 : 1.0;
      ctx.lineWidth = (pdfTool === 'highlighter' ? penWidth * 2.8 : penWidth) * dpr;

      ctx.beginPath();
      ctx.moveTo(pPrev.nx * canvasW, pPrev.ny * canvasH);
      ctx.lineTo(pCurr.nx * canvasW, pCurr.ny * canvasH);
      ctx.stroke();
      ctx.restore();
    }
  };

  const handlePointerUpAnnotation = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (pdfTool === 'eraser') return;

    const pts = activeStrokePointsRef.current;
    if (pts.length > 0) {
      const newStroke: PdfStroke = {
        id: 'stroke_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        points: [...pts],
        color: penColor,
        width: penWidth,
        tool: pdfTool as 'pen' | 'highlighter',
      };

      setPageAnnotations(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newStroke],
      }));
    }

    activeStrokePointsRef.current = [];
  };

  const eraseStrokesNear = (nx: number, ny: number, rectW: number, rectH: number) => {
    const thresholdPx = 20;
    setPageAnnotations(prev => {
      const currentStrokes = prev[currentPage] || [];
      const remaining = currentStrokes.filter(stroke => {
        return !stroke.points.some(pt => {
          const dx = (pt.nx - nx) * rectW;
          const dy = (pt.ny - ny) * rectH;
          return Math.sqrt(dx * dx + dy * dy) < thresholdPx;
        });
      });
      if (remaining.length === currentStrokes.length) return prev;
      return { ...prev, [currentPage]: remaining };
    });
  };

  const handleUndoAnnotation = () => {
    setPageAnnotations(prev => {
      const currentStrokes = prev[currentPage] || [];
      if (currentStrokes.length === 0) return prev;
      return {
        ...prev,
        [currentPage]: currentStrokes.slice(0, -1),
      };
    });
  };

  const handleClearPageAnnotations = () => {
    setPageAnnotations(prev => ({
      ...prev,
      [currentPage]: [],
    }));
  };

  // Keyboard navigation when panel is open
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        if (currentPage > 1) onPageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        if (currentPage < totalPages) onPageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, currentPage, totalPages, onPageChange]);

  // Handle Resize Divider Drag
  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    isResizingRef.current = true;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isResizingRef.current) return;
      const screenW = window.innerWidth;
      let newPct: number;
      if (dockSide === 'left') {
        newPct = Math.round((moveEvent.clientX / screenW) * 100);
      } else {
        newPct = Math.round(((screenW - moveEvent.clientX) / screenW) * 100);
      }
      const clamped = Math.max(25, Math.min(75, newPct));
      onWidthChange(clamped);
    };

    const handlePointerUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Crop / Snippet selection interactions
  const handlePointerDownCrop = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSnipMode || !canvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setIsDraggingCrop(true);
    setCropBox({ startX: x, startY: y, currentX: x, currentY: y });
  };

  const handlePointerMoveCrop = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrop || !canvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setCropBox(prev => (prev ? { ...prev, currentX: x, currentY: y } : null));
  };

  const handlePointerUpCrop = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDraggingCrop(false);

    setCropBox(prev => {
      if (!prev) return null;
      const w = Math.abs(prev.currentX - prev.startX);
      const h = Math.abs(prev.currentY - prev.startY);
      // Discard accidental clicks / taps less than 15px
      if (w < 15 || h < 15) {
        return null;
      }
      return prev;
    });
  };

  const handlePointerCancelCrop = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDraggingCrop(false);
  };

  // Normalized crop bounds
  const getCropRect = () => {
    if (!cropBox) return null;
    const x = Math.min(cropBox.startX, cropBox.currentX);
    const y = Math.min(cropBox.startY, cropBox.currentY);
    const w = Math.abs(cropBox.currentX - cropBox.startX);
    const h = Math.abs(cropBox.currentY - cropBox.startY);
    return { x, y, width: w, height: h };
  };

  const currentCropRect = getCropRect();
  const hasValidCrop = !!(currentCropRect && currentCropRect.width >= 15 && currentCropRect.height >= 15);

  // Confirm and insert snippet directly from high-res rendered canvas
  const handleApplySnippet = () => {
    if (!cropBox || !canvasRef.current) return;
    const canvas = canvasRef.current;

    const minX = Math.min(cropBox.startX, cropBox.currentX);
    const minY = Math.min(cropBox.startY, cropBox.currentY);
    const boxW = Math.abs(cropBox.currentX - cropBox.startX);
    const boxH = Math.abs(cropBox.currentY - cropBox.startY);

    if (boxW < 15 || boxH < 15) return;

    try {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);

      const cropX = Math.max(0, Math.round(minX * scaleX));
      const cropY = Math.max(0, Math.round(minY * scaleY));
      const cropW = Math.min(canvas.width - cropX, Math.round(boxW * scaleX));
      const cropH = Math.min(canvas.height - cropY, Math.round(boxH * scaleY));

      if (cropW < 10 || cropH < 10) return;

      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = cropW;
      targetCanvas.height = cropH;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cropW, cropH);
      ctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // Composite handwritten annotations onto snippet
      if (annotationCanvasRef.current) {
        ctx.drawImage(annotationCanvasRef.current, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      }

      const dataUrl = targetCanvas.toDataURL('image/png');
      onInsertSnippetToBoard(dataUrl, cropW, cropH, currentPage);

      setIsSnipMode(false);
      setCropBox(null);
    } catch (err) {
      console.error('Error applying PDF snippet:', err);
    }
  };

  // Stamp full page onto active whiteboard slide (with annotations)
  const handleStampPage = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const compCanvas = document.createElement('canvas');
    compCanvas.width = canvas.width;
    compCanvas.height = canvas.height;
    const ctx = compCanvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(canvas, 0, 0);
    if (annotationCanvasRef.current) {
      ctx.drawImage(annotationCanvasRef.current, 0, 0);
    }
    const dataUrl = compCanvas.toDataURL('image/png');
    onInsertPageToBoard(dataUrl, renderDimensions.width, renderDimensions.height, currentPage);
  };

  if (!isOpen) return null;

  // Render minimized floating pill on the board edge
  if (isMinimized) {
    return (
      <aside 
        className={`fixed top-16 ${dockSide === 'left' ? 'left-3' : 'right-3'} z-30 select-none animate-fadeIn`}
      >
        <button
          onClick={onToggleMinimize}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/95 hover:bg-slate-800 border-2 border-rose-500/80 hover:border-rose-400 rounded-2xl shadow-2xl backdrop-blur-md text-slate-100 transition-all hover:scale-105 active:scale-95 group cursor-pointer ring-1 ring-white/10"
          title="Restore Single PDF Document on Math Board"
        >
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 group-hover:bg-rose-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-white max-w-[120px] sm:max-w-[160px] truncate">
              {filename || 'Classroom PDF'}
            </span>
            <span className="text-[10px] text-rose-300 font-mono font-semibold">
              Page {currentPage} of {totalPages} • Click to Show
            </span>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition ml-1" />
        </button>
      </aside>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`fixed top-14 bottom-0 z-20 flex flex-col bg-slate-925 border-slate-750 shadow-2xl transition-[width] duration-150 select-none text-slate-100 ${
        dockSide === 'left' ? 'left-0 border-r-2' : 'right-0 border-l-2'
      }`}
      style={{ width: `${panelWidthPercent}%` }}
    >
      {/* Hidden file input for opening a different PDF */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onLoadNewPdf(file);
            e.target.value = '';
          }
        }}
      />

      {/* Top Header Bar */}
      <div className="h-12 bg-slate-900/95 border-b border-slate-800 px-3 flex items-center justify-between gap-2 shrink-0 backdrop-blur-md">
        {/* Left: Document Badge & Switch */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]" title={filename}>
                {filename || 'Classroom PDF'}
              </h2>
              <span className="text-[9px] bg-rose-950/80 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-semibold hidden md:inline">
                Single PDF
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {totalPages} page{totalPages > 1 ? 's' : ''} in document
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-[11px] text-slate-300 hover:text-white transition shrink-0 cursor-pointer"
            title="Open a different PDF file from your computer"
          >
            <Upload className="w-3 h-3 text-sky-400" />
            <span>Change</span>
          </button>
        </div>

        {/* Right: Window & Dock Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick preset width dropdown / buttons */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-800/90 p-0.5 rounded-lg border border-slate-750 text-[10px] font-bold text-slate-400">
            {[35, 45, 55].map(pct => (
              <button
                key={pct}
                onClick={() => onWidthChange(pct)}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  panelWidthPercent === pct ? 'bg-sky-600 text-white font-bold' : 'hover:text-white'
                }`}
                title={`Set panel width to ${pct}%`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Toggle Dock Side (Left <-> Right) */}
          <button
            onClick={onToggleDockSide}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title={dockSide === 'left' ? 'Dock to Right Side of Board' : 'Dock to Left Side of Board'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Hide Tools / Clean Presentation Mode Toggle */}
          {onTogglePresentationMode && (
            <button
              onClick={onTogglePresentationMode}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isCleanPresentationMode
                  ? 'bg-sky-600 border-sky-400 text-white shadow-xs'
                  : 'hover:bg-slate-800 border-transparent text-slate-300 hover:text-white'
              }`}
              title={isCleanPresentationMode ? "Show all tools (Exit clean mode)" : "Hide all tools for clean full-screen worksheet view"}
            >
              {isCleanPresentationMode ? <Eye className="w-3.5 h-3.5 text-sky-200" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Minimize Button */}
          <button
            onClick={onToggleMinimize}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Minimize to side badge (Use full whiteboard temporarily)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
            title="Close PDF Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar (Page Flipping, Zoom & Snipping) */}
      <div className="h-11 bg-slate-850/90 border-b border-slate-750/80 px-3 flex items-center justify-between gap-2 shrink-0 text-xs">
        {/* Page Flipping Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={`p-1.5 rounded-lg border transition ${
              currentPage <= 1
                ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750 active:scale-95 cursor-pointer'
            }`}
            title="Previous Page (Alt + Left)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded-lg">
            <span className="text-[11px] text-slate-400">Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageJumpVal}
              onChange={(e) => setPageJumpVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt(pageJumpVal, 10);
                  if (!isNaN(val) && val >= 1 && val <= totalPages) {
                    onPageChange(val);
                  } else {
                    setPageJumpVal(String(currentPage));
                  }
                }
              }}
              className="w-8 text-center font-bold font-mono text-xs text-white bg-slate-800 rounded py-0.5 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
            />
            <span className="text-[11px] text-slate-400 font-mono">/ {totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className={`p-1.5 rounded-lg border transition ${
              currentPage >= totalPages
                ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750 active:scale-95 cursor-pointer'
            }`}
            title="Next Page (Alt + Right)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-750">
          <button
            onClick={() => setZoomLevel(z => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-300 w-9 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(z => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1.25)}
            className="px-1.5 py-0.5 text-[9px] text-slate-400 hover:text-white rounded hover:bg-slate-800 transition font-bold"
            title="Reset Zoom to 125%"
          >
            Reset
          </button>
        </div>

        {/* Action: Snip / Stamp to Board */}
        <div className="flex items-center gap-1.5">
          {hasValidCrop ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleApplySnippet}
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer animate-pulse"
                title="Add selected question snippet directly to Math Board"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add to Math Board</span>
              </button>
              <button
                type="button"
                onClick={() => setCropBox(null)}
                className="px-2 py-1 text-slate-400 hover:text-white text-[11px] rounded hover:bg-slate-800 transition cursor-pointer"
                title="Cancel selection"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSnipMode(!isSnipMode);
                setCropBox(null);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer active:scale-95 ${
                isSnipMode
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-750'
              }`}
              title="Drag a box to snip any equation or question directly onto your current whiteboard slide"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSnipMode ? 'Snip Active' : 'Snip to Board'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStampPage}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-500/40 text-sky-200 text-xs font-bold transition cursor-pointer active:scale-95"
            title="Copy this entire page as an image onto your current whiteboard slide"
          >
            <Copy className="w-3 h-3 text-sky-400" />
            <span>Copy Page</span>
          </button>
        </div>
      </div>

      {/* PDF Drawing & Explaining Toolbar */}
      <div className="h-10 bg-slate-900 border-b border-slate-750/90 px-3 flex items-center justify-between gap-2 shrink-0 text-xs shadow-inner select-none">
        {/* Left: Tool Modes (Scroll vs Pen vs Highlighter vs Eraser) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPdfTool('pan');
              setIsSnipMode(false);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition cursor-pointer text-xs font-semibold ${
              pdfTool === 'pan' && !isSnipMode
                ? 'bg-sky-600 border-sky-400 text-white shadow-xs'
                : 'bg-slate-850 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Pan / Scroll Mode (Scroll or swipe through PDF without drawing)"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scroll</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPdfTool('pen');
              setIsSnipMode(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition cursor-pointer text-xs font-bold ${
              pdfTool === 'pen' && !isSnipMode
                ? 'bg-rose-600 border-rose-400 text-white shadow-xs ring-1 ring-white/20'
                : 'bg-slate-850 border-slate-700 text-rose-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Pen Tool (Write equations, draw solutions, and explain directly on PDF with stylus)"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPdfTool('highlighter');
              setIsSnipMode(false);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition cursor-pointer text-xs font-bold ${
              pdfTool === 'highlighter' && !isSnipMode
                ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-xs ring-1 ring-white/20'
                : 'bg-slate-850 border-slate-700 text-amber-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Highlighter Tool (Highlight terms, numbers and questions on PDF)"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlight</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPdfTool('eraser');
              setIsSnipMode(false);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition cursor-pointer text-xs font-semibold ${
              pdfTool === 'eraser' && !isSnipMode
                ? 'bg-rose-700 border-rose-400 text-white shadow-xs'
                : 'bg-slate-850 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Eraser Tool (Touch or drag over notes to erase)"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Middle: Color Swatches & Stroke Width */}
        {(pdfTool === 'pen' || pdfTool === 'highlighter') && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-slate-850 px-1.5 py-0.5 rounded-lg border border-slate-750">
              {[
                { name: 'Red', color: '#ef4444' },
                { name: 'Blue', color: '#2563eb' },
                { name: 'Green', color: '#10b981' },
                { name: 'Yellow', color: '#eab308' },
                { name: 'Purple', color: '#a855f7' },
                { name: 'Dark', color: '#0f172a' },
              ].map(c => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setPenColor(c.color)}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition cursor-pointer ${
                    penColor === c.color ? 'border-white ring-2 ring-sky-400 scale-110' : 'border-black/30 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={`${c.name} Pen`}
                />
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-0.5 bg-slate-850 px-1 py-0.5 rounded-lg border border-slate-750">
              {[
                { label: 'Fine', width: 2 },
                { label: 'Med', width: 4 },
                { label: 'Thick', width: 7 },
              ].map(w => (
                <button
                  key={w.width}
                  type="button"
                  onClick={() => setPenWidth(w.width)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    penWidth === w.width ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title={`${w.label} Pen Thickness`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: Undo & Clear Annotations on Page */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleUndoAnnotation}
            disabled={!pageAnnotations[currentPage] || pageAnnotations[currentPage].length === 0}
            className="p-1 rounded-lg bg-slate-850 border border-slate-750 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-850 transition cursor-pointer"
            title="Undo last writing stroke on PDF"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClearPageAnnotations}
            disabled={!pageAnnotations[currentPage] || pageAnnotations[currentPage].length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-850 hover:bg-rose-950/70 border border-slate-750 hover:border-rose-700/60 text-slate-400 hover:text-rose-200 text-xs font-semibold disabled:opacity-30 transition cursor-pointer"
            title="Clear all drawings and notes on this PDF page"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline text-[11px]">Clear Notes</span>
          </button>
        </div>
      </div>

      {/* Main PDF Page Display Area */}
      <div className="flex-1 relative overflow-auto bg-slate-950 flex items-center justify-center p-3">
        {/* If no PDF is loaded */}
        {!pdfDoc ? (
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No PDF Loaded</h3>
              <p className="text-xs text-slate-400 mt-1">
                Open a classroom PDF file or load the sample lesson to view directly on the Math Board.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-900/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload PDF Document</span>
              </button>

              <button
                onClick={onLoadSampleLesson}
                className="w-full py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Load Sample Math Lesson</span>
              </button>
            </div>
          </div>
        ) : (
          /* PDF Canvas with Snipping & Annotation Overlays */
          <div 
            className="relative shadow-2xl rounded-sm bg-white select-none inline-block overflow-visible"
            style={{ 
              width: renderDimensions.width > 0 ? `${renderDimensions.width}px` : 'auto',
              height: renderDimensions.height > 0 ? `${renderDimensions.height}px` : 'auto',
              maxWidth: '100%',
            }}
          >
            {isRendering && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-10">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-rose-400 shadow-xl flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
                  <span>Rendering Page {currentPage}...</span>
                </div>
              </div>
            )}

            {/* Base PDF Document Canvas */}
            <canvas
              ref={canvasRef}
              className="bg-white shadow-xl rounded-sm block pointer-events-none w-full h-full"
            />

            {/* Interactive Annotation Drawing Layer Canvas */}
            <canvas
              ref={annotationCanvasRef}
              className={`absolute inset-0 z-10 w-full h-full ${
                pdfTool === 'pan' || isSnipMode ? 'pointer-events-none' : 'cursor-crosshair'
              }`}
              style={{ touchAction: pdfTool === 'pan' || isSnipMode ? 'auto' : 'none' }}
              onPointerDown={handlePointerDownAnnotation}
              onPointerMove={handlePointerMoveAnnotation}
              onPointerUp={handlePointerUpAnnotation}
              onPointerCancel={handlePointerUpAnnotation}
            />

            {/* Snipping Overlay Interaction Layer */}
            {isSnipMode && (
              <div
                onPointerDown={handlePointerDownCrop}
                onPointerMove={handlePointerMoveCrop}
                onPointerUp={handlePointerUpCrop}
                onPointerCancel={handlePointerCancelCrop}
                className="absolute inset-0 z-20 cursor-crosshair select-none"
                style={{ touchAction: 'none' }}
              >
                {/* Visual guideline prompt */}
                {!hasValidCrop && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500/95 text-slate-950 text-[11px] font-bold rounded-full shadow-lg pointer-events-none whitespace-nowrap">
                    Drag across any problem, diagram, or formula to snip
                  </div>
                )}

                {/* Live Crop Box Rectangle */}
                {currentCropRect && hasValidCrop && (
                  <>
                    <div
                      className="absolute border-2 border-amber-400 bg-amber-400/20 shadow-2xl pointer-events-none"
                      style={{
                        left: `${currentCropRect.x}px`,
                        top: `${currentCropRect.y}px`,
                        width: `${currentCropRect.width}px`,
                        height: `${currentCropRect.height}px`,
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                      }}
                    >
                      {/* Corner Handles */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs" />

                      {/* Dimensions label */}
                      <div className="absolute -top-7 left-0 px-2 py-0.5 bg-amber-500 text-slate-950 font-mono text-[10px] font-bold rounded shadow whitespace-nowrap">
                        {Math.round(currentCropRect.width)} × {Math.round(currentCropRect.height)}px
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resizing Edge Handle (Draggable Divider) */}
      <div
        onPointerDown={handleResizeStart}
        className={`absolute top-0 bottom-0 w-2.5 z-30 cursor-col-resize flex items-center justify-center group hover:bg-sky-500/20 transition-colors ${
          dockSide === 'left' ? '-right-1.5' : '-left-1.5'
        }`}
        title="Drag left/right to resize PDF viewer width"
      >
        <div className="w-1 h-8 rounded-full bg-slate-600 group-hover:bg-sky-400 transition" />
      </div>
    </div>
  );
};
