import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Upload, 
  Crop, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Sparkles, 
  Plus, 
  Check, 
  Scissors,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { 
  loadPdfDocument, 
  renderPdfPageToCanvas, 
  cropPdfRegion, 
  generateSampleLessonPdf, 
  renderAllPdfPages,
  PdfDocumentInfo 
} from '../utils/pdf';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (imageSrc: string, width: number, height: number, meta?: { isCroppedPdf: boolean; pdfName: string; pageNum: number }) => void;
  onInsertAsNewPage: (imageSrc: string, width: number, height: number, meta?: { isCroppedPdf: boolean; pdfName: string; pageNum: number }) => void;
  onInsertAllPages?: (pages: Array<{ dataUrl: string; width: number; height: number; pageNum: number }>, pdfName: string) => void;
  onOpenSinglePdf?: (pdfDoc: any, filename: string, currentPage: number) => void;
  initialFile?: File | null;
}

interface CropBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const PdfModal: React.FC<PdfModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
  onInsertAsNewPage,
  onInsertAllPages,
  onOpenSinglePdf,
  initialFile,
}) => {
  const [pdfInfo, setPdfInfo] = useState<PdfDocumentInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSnipping, setIsSnipping] = useState<boolean>(true);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [processingCrop, setProcessingCrop] = useState<boolean>(false);
  const [importingAll, setImportingAll] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<string | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial file or sample PDF
  useEffect(() => {
    if (isOpen && initialFile) {
      loadFile(initialFile);
    } else if (isOpen && !pdfInfo) {
      loadSample();
    }
  }, [isOpen, initialFile]);

  const loadFile = async (file: File) => {
    setIsLoading(true);
    try {
      const info = await loadPdfDocument(file, file.name);
      setPdfInfo(info);
      setCurrentPage(1);
      setCropBox(null);
    } catch (err) {
      console.error('Error loading PDF file:', err);
      alert('Unable to load PDF. Please make sure the file is a valid PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = async () => {
    setIsLoading(true);
    try {
      const sampleBuffer = generateSampleLessonPdf();
      const info = await loadPdfDocument(sampleBuffer, 'Classroom_Worksheet_Lesson4.pdf');
      setPdfInfo(info);
      setCurrentPage(1);
      setCropBox(null);
    } catch (err) {
      console.error('Error loading sample PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const info = await loadPdfDocument(file, file.name);
      setPdfInfo(info);
      setCurrentPage(1);
      setCropBox(null);
    } catch (err) {
      console.error('Error loading PDF file:', err);
      alert('Unable to load PDF. Please make sure the file is a valid PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render current page onto canvas
  useEffect(() => {
    if (!pdfInfo || !pdfCanvasRef.current) return;

    let isMounted = true;
    const render = async () => {
      setIsLoading(true);
      try {
        const { canvas } = await renderPdfPageToCanvas(pdfInfo.pdfDoc, currentPage, scale);
        if (!isMounted || !pdfCanvasRef.current) return;

        const target = pdfCanvasRef.current;
        target.width = canvas.width;
        target.height = canvas.height;
        const ctx = target.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
        }
      } catch (err) {
        console.error('Failed to render PDF page:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    render();
    return () => {
      isMounted = false;
    };
  }, [pdfInfo, currentPage, scale]);

  // Crop selection mouse/touch events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSnipping || !pdfCanvasRef.current) return;
    const rect = pdfCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setIsDraggingCrop(true);
    setCropBox({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrop || !cropBox || !pdfCanvasRef.current) return;
    const rect = pdfCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setCropBox(prev => (prev ? { ...prev, currentX: x, currentY: y } : null));
  };

  const handlePointerUp = () => {
    setIsDraggingCrop(false);
  };

  // Calculate normalized crop bounds
  const getCropRect = () => {
    if (!cropBox) return null;
    const x = Math.min(cropBox.startX, cropBox.currentX);
    const y = Math.min(cropBox.startY, cropBox.currentY);
    const w = Math.abs(cropBox.currentX - cropBox.startX);
    const h = Math.abs(cropBox.currentY - cropBox.startY);
    return { x, y, width: w, height: h };
  };

  const currentCropRect = getCropRect();
  const hasValidCrop = currentCropRect && currentCropRect.width > 20 && currentCropRect.height > 20;

  // Insert cropped region or full page
  const handleInsertCrop = async (asNewPage: boolean) => {
    if (!pdfInfo || !currentCropRect || !hasValidCrop) return;
    setProcessingCrop(true);
    try {
      const cropped = await cropPdfRegion(
        pdfInfo.pdfDoc,
        currentPage,
        currentCropRect,
        scale,
        2.0
      );

      const meta = {
        isCroppedPdf: true,
        pdfName: pdfInfo.filename,
        pageNum: currentPage,
      };

      if (asNewPage) {
        onInsertAsNewPage(cropped.dataUrl, cropped.width, cropped.height, meta);
      } else {
        onInsertImage(cropped.dataUrl, cropped.width, cropped.height, meta);
      }

      onClose();
    } catch (err) {
      console.error('Failed to crop PDF snippet:', err);
    } finally {
      setProcessingCrop(false);
    }
  };

  const handleInsertEntirePage = async (asNewPage: boolean) => {
    if (!pdfInfo) return;
    setProcessingCrop(true);
    try {
      const { canvas, width, height } = await renderPdfPageToCanvas(pdfInfo.pdfDoc, currentPage, 1.8);
      const dataUrl = canvas.toDataURL('image/png');
      const meta = {
        isCroppedPdf: true,
        pdfName: pdfInfo.filename,
        pageNum: currentPage,
      };

      if (asNewPage) {
        onInsertAsNewPage(dataUrl, width, height, meta);
      } else {
        onInsertImage(dataUrl, width, height, meta);
      }
      onClose();
    } catch (err) {
      console.error('Failed to render entire PDF page:', err);
    } finally {
      setProcessingCrop(false);
    }
  };

  const handleInsertAllPdfPages = async () => {
    if (!pdfInfo) return;
    setImportingAll(true);
    setImportProgress(`Preparing ${pdfInfo.numPages} pages...`);
    try {
      const allPages = await renderAllPdfPages(pdfInfo.pdfDoc, 1.8, (curr, tot) => {
        setImportProgress(`Rendering Page ${curr} of ${tot}...`);
      });

      if (onInsertAllPages) {
        onInsertAllPages(allPages, pdfInfo.filename);
      } else {
        allPages.forEach(p => {
          onInsertAsNewPage(p.dataUrl, p.width, p.height, {
            isCroppedPdf: true,
            pdfName: pdfInfo.filename,
            pageNum: p.pageNum,
          });
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to import all PDF pages:', err);
      alert('Could not render all PDF pages. Please try inserting individual pages.');
    } finally {
      setImportingAll(false);
      setImportProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full h-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">PDF Teaching & Cropping Studio</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                  Flat Panel Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {pdfInfo ? pdfInfo.filename : 'Load or upload classroom PDF materials'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF</span>
            </button>
            <button
              onClick={loadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Lesson</span>
            </button>

            {/* Show Single PDF on Math Board (Recommended) */}
            {pdfInfo && onOpenSinglePdf && (
              <button
                disabled={processingCrop || importingAll}
                onClick={() => onOpenSinglePdf(pdfInfo.pdfDoc, pdfInfo.filename, currentPage)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-rose-900/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
                title="View this PDF as a single document right on your Math Board without splitting into multiple slides"
              >
                <FileText className="w-4 h-4 text-rose-200" />
                <span>Show Single PDF on Math Board</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Page Navigation */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-850 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Page:</span>
            <button
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200 px-1">
              {currentPage} / {pdfInfo?.numPages || 1}
            </span>
            <button
              disabled={!pdfInfo || currentPage >= pdfInfo.numPages || isLoading}
              onClick={() => setCurrentPage(p => Math.min(pdfInfo?.numPages || 1, p + 1))}
              className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-2" />

            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-slate-300 font-mono text-[11px]">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(s => Math.min(2.5, s + 0.2))}
                className="p-1 text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSnipping(!isSnipping)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                isSnipping
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{isSnipping ? 'Crop Tool Active' : 'Enable Crop Tool'}</span>
            </button>

            {hasValidCrop && (
              <button
                onClick={() => setCropBox(null)}
                className="text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Reset Crop
              </button>
            )}
          </div>
        </div>

        {/* Main Work Area: PDF Viewer & Interactive Crop Stage */}
        <div 
          ref={canvasContainerRef}
          className="flex-1 overflow-auto p-6 flex items-start justify-center bg-slate-950/60 relative"
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-sm text-sky-400 font-medium">
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                Rendering PDF Page...
              </div>
            </div>
          )}

          <div 
            className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-700/80 cursor-crosshair inline-block bg-white"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <canvas ref={pdfCanvasRef} className="block pointer-events-none" />

            {/* Instruction Banner when Snipping is active */}
            {isSnipping && !hasValidCrop && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/90 border border-sky-500/50 text-sky-300 text-xs rounded-full shadow-lg pointer-events-none flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-sky-400" />
                <span>Drag to crop any problem, formula, or diagram</span>
              </div>
            )}

            {/* Live Cropping Rectangle Overlay */}
            {currentCropRect && (
              <div
                className="absolute border-2 border-sky-400 bg-sky-500/20 pointer-events-none transition-none"
                style={{
                  left: `${currentCropRect.x}px`,
                  top: `${currentCropRect.y}px`,
                  width: `${currentCropRect.width}px`,
                  height: `${currentCropRect.height}px`,
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
                }}
              >
                {/* Corner Handles */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-sky-500 rounded-xs" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-sky-500 rounded-xs" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-sky-500 rounded-xs" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-sky-500 rounded-xs" />

                <div className="absolute -top-7 left-0 px-2 py-0.5 bg-sky-500 text-white font-mono text-[10px] font-bold rounded shadow">
                  {Math.round(currentCropRect.width)} × {Math.round(currentCropRect.height)}px
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="px-5 py-3.5 bg-slate-800/95 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-300">
            {importProgress ? (
              <span className="text-sky-400 font-semibold flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                {importProgress}
              </span>
            ) : hasValidCrop ? (
              <span className="text-sky-300 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Region selected ({Math.round(currentCropRect.width)}×{Math.round(currentCropRect.height)}px). Choose insertion option:
              </span>
            ) : (
              <div className="flex items-center gap-2 text-slate-300">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>
                  <strong className="text-white">{pdfInfo?.filename || 'Classroom PDF'}</strong> • Page {currentPage} of {pdfInfo?.numPages || 1}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {hasValidCrop ? (
              <>
                <button
                  disabled={processingCrop || importingAll}
                  onClick={() => handleInsertCrop(false)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold shadow transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Insert cropped math snippet onto the currently open slide"
                >
                  <Crop className="w-4 h-4 text-sky-400" />
                  <span>Insert Snippet on Current Slide</span>
                </button>
                <button
                  disabled={processingCrop || importingAll}
                  onClick={() => handleInsertCrop(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Create a new presentation slide with this cropped math snippet"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert Snippet as New Slide</span>
                </button>
              </>
            ) : (
              <>
                {/* 1. Primary Action: Open Single PDF on Board */}
                {pdfInfo && onOpenSinglePdf && (
                  <button
                    disabled={processingCrop || importingAll || !pdfInfo}
                    onClick={() => onOpenSinglePdf(pdfInfo.pdfDoc, pdfInfo.filename, currentPage)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-rose-900/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    title="Display the single PDF document directly on your Math Board with page turn controls"
                  >
                    <FileText className="w-4 h-4 text-rose-200" />
                    <span>View Single PDF on Math Board</span>
                  </button>
                )}

                {/* 2. Insert Page on Current Slide (Does not create new slide) */}
                <button
                  disabled={processingCrop || importingAll || !pdfInfo}
                  onClick={() => handleInsertEntirePage(false)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition cursor-pointer disabled:opacity-50"
                  title="Place this PDF page onto the currently open slide"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  <span>Insert on Current Slide</span>
                </button>

                {/* 3. Insert Page as New Slide */}
                <button
                  disabled={processingCrop || importingAll || !pdfInfo}
                  onClick={() => handleInsertEntirePage(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95 cursor-pointer disabled:opacity-50 text-[11px]"
                  title="Insert current PDF page as a new slide in Math Board"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Insert Page {currentPage} as New Slide</span>
                </button>

                {/* 4. Split all pages (Clarified label) */}
                {pdfInfo && pdfInfo.numPages > 1 && (
                  <button
                    disabled={processingCrop || importingAll || !pdfInfo}
                    onClick={handleInsertAllPdfPages}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-750 text-[10px] font-medium transition active:scale-95 cursor-pointer disabled:opacity-50"
                    title={`Split all ${pdfInfo.numPages} pages into separate slides`}
                  >
                    <span>Split into {pdfInfo.numPages} slides</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
