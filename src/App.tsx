/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BoardDocument, 
  BoardPage, 
  BoardElement, 
  ToolType, 
  ShapeType, 
  BackgroundStyle,
  TeachingWidgetsState,
  ImageElement,
  StickyNoteElement,
  Solid3DElement,
  PenSensitivityConfig
} from './types';
import { DEFAULT_PEN_SENSITIVITY } from './utils/penStroke';
import { TopBar } from './components/TopBar';
import { ToolPalette } from './components/ToolPalette';
import { WhiteboardCanvas } from './components/WhiteboardCanvas';
import { ThumbnailsDrawer } from './components/ThumbnailsDrawer';
import { PdfModal } from './components/PdfModal';
import { SaveModal } from './components/SaveModal';
import { RulerTool } from './components/tools/RulerTool';
import { ProtractorTool } from './components/tools/ProtractorTool';
import { SpotlightTool } from './components/tools/SpotlightTool';
import { CurtainTool } from './components/tools/CurtainTool';
import { TimerTool } from './components/tools/TimerTool';
import { DiceTool } from './components/tools/DiceTool';
import { Solids3DModal } from './components/tools/Solids3DModal';
import { GeoGebraToolsModal } from './components/tools/GeoGebraToolsModal';
import { TemplatesModal } from './components/tools/TemplatesModal';
import { FractionsTool } from './components/tools/FractionsTool';
import { GraphSheetPanel } from './components/tools/GraphSheetPanel';
import { PdfViewerPanel } from './components/tools/PdfViewerPanel';
import { loadPdfDocument, generateSampleLessonPdf } from './utils/pdf';
import * as pdfjsLib from 'pdfjs-dist';
import { APMFLogo } from './components/APMFLogo';
import { saveBoardToStorage, getSavedBoardsList } from './utils/exporter';
import { 
  Columns2, 
  Edit3, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  RotateCw, 
  PenTool, 
  Eraser, 
  Trash2 
} from 'lucide-react';

const DEFAULT_DOC: BoardDocument = {
  id: 'doc_' + Date.now(),
  title: 'Lesson 1 - Interactive Whiteboard',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  activePageIndex: 0,
  pages: [
    {
      id: 'page_1',
      backgroundStyle: 'grid-dark',
      elements: [
        {
          id: 'welcome_title',
          type: 'text',
          x: 140,
          y: 80,
          width: 600,
          height: 60,
          text: 'Math Whiteboard - Classroom Lesson',
          fontSize: 34,
          color: '#38bdf8',
          fontFamily: 'sans',
          isBold: true,
        },
        {
          id: 'welcome_sub',
          type: 'text',
          x: 140,
          y: 145,
          width: 720,
          height: 40,
          text: 'Tap "PDF & Crop" to load worksheets, or pick a pen / ruler to start teaching!',
          fontSize: 20,
          color: '#94a3b8',
          fontFamily: 'sans',
        },
        {
          id: 'welcome_shape',
          type: 'shape',
          shapeType: 'coordinate',
          x: 140,
          y: 220,
          width: 320,
          height: 240,
          strokeColor: '#38bdf8',
          fillColor: 'transparent',
          strokeWidth: 2,
        },
        {
          id: 'welcome_sticky',
          type: 'sticky',
          x: 520,
          y: 220,
          width: 260,
          height: 180,
          text: '📌 Interactive Flat Panel Features:\n• Fullscreen & Offline PWA Install\n• PDF Cropper for question snips\n• Real-time Protractor & Ruler\n• Fading Magic Laser Pointer\n• Single-File HTML Export',
          color: '#fef08a',
        },
      ],
    },
  ],
};

export default function App() {
  // Document State
  const [documentState, setDocumentState] = useState<BoardDocument>(() => {
    const list = getSavedBoardsList();
    if (list && list.length > 0) {
      return list[0];
    }
    return DEFAULT_DOC;
  });

  // Active Tooling State
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [activeColor, setActiveColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rect');
  const [shapeFillColor, setShapeFillColor] = useState<string>('transparent');
  const [isStylusOnly, setIsStylusOnly] = useState<boolean>(false);
  const [pendingMathSymbol, setPendingMathSymbol] = useState<string | null>(null);
  const [penSensitivity, setPenSensitivity] = useState<PenSensitivityConfig>(() => {
    try {
      const saved = localStorage.getItem('mathboard_pen_sensitivity_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_PEN_SENSITIVITY, ...parsed };
        }
      }
    } catch {}
    return DEFAULT_PEN_SENSITIVITY;
  });

  const handleUpdatePenSensitivity = (newConfig: PenSensitivityConfig) => {
    setPenSensitivity(newConfig);
    try {
      localStorage.setItem('mathboard_pen_sensitivity_v1', JSON.stringify(newConfig));
    } catch {}
  };

  // Teaching Widgets State
  const [widgets, setWidgets] = useState<TeachingWidgetsState>({
    ruler: { active: false, x: 200, y: 300, length: 600, rotation: 0 },
    protractor: { active: false, x: 350, y: 250, radius: 200, rotation: 0 },
    spotlight: { active: false, x: 600, y: 400, radius: 150 },
    curtain: { active: false, revealRatio: 0.5 },
    timer: { active: false, mode: 'countdown', secondsRemaining: 120, initialSeconds: 120, isRunning: false },
    dice: { active: false, value: 6, isRolling: false },
  });

  // UI Modals & Drawers
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [droppedPdfFile, setDroppedPdfFile] = useState<File | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);

  // Single PDF Document Viewer on Math Board
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState<boolean>(false);
  const [pdfViewerDoc, setPdfViewerDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfViewerFilename, setPdfViewerFilename] = useState<string>('document.pdf');
  const [pdfViewerCurrentPage, setPdfViewerCurrentPage] = useState<number>(1);
  const [pdfViewerWidthPercent, setPdfViewerWidthPercent] = useState<number>(45);
  const [pdfViewerDockSide, setPdfViewerDockSide] = useState<'left' | 'right'>('left');
  const [isPdfViewerMinimized, setIsPdfViewerMinimized] = useState<boolean>(false);

  // Split Screen & Specialized Classroom Panes
  const [isSplitScreen, setIsSplitScreen] = useState<boolean>(false);
  const [isGraphSheetOpen, setIsGraphSheetOpen] = useState<boolean>(false);
  const [graphWidthPercent, setGraphWidthPercent] = useState<number>(45);
  const [graphDockSide, setGraphDockSide] = useState<'left' | 'right'>('right');
  const [isSolidsModalOpen, setIsSolidsModalOpen] = useState<boolean>(false);
  const [isGeoGebraModalOpen, setIsGeoGebraModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isFractionsModalOpen, setIsFractionsModalOpen] = useState<boolean>(false);
  const [isAutoShapeEnabled, setIsAutoShapeEnabled] = useState<boolean>(false);
  const [isCleanPresentationMode, setIsCleanPresentationMode] = useState<boolean>(false);

  // Undo / Redo history stacks per page
  const [undoStack, setUndoStack] = useState<BoardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<BoardElement[][]>([]);

  // Interactive feedback toast for Clear/Delete actions
  const [toast, setToast] = useState<{
    id: number;
    text: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Current Active Page
  const activePageIndex = Math.max(0, Math.min(documentState.pages.length - 1, documentState.activePageIndex));
  const currentPage = documentState.pages[activePageIndex] || documentState.pages[0];

  // Auto-save to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveBoardToStorage(documentState);
    }, 800);
    return () => clearTimeout(timeout);
  }, [documentState]);

  // Push element update with undo history
  const handleUpdateElements = useCallback((newElements: BoardElement[]) => {
    setUndoStack(prev => [...prev, currentPage.elements]);
    setRedoStack([]); // Clear redo
    setDocumentState(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[activePageIndex] = {
        ...updatedPages[activePageIndex],
        elements: newElements,
      };
      return {
        ...prev,
        updatedAt: Date.now(),
        pages: updatedPages,
      };
    });
  }, [activePageIndex, currentPage.elements]);

  const handleAddElement = useCallback((newElement: BoardElement) => {
    setUndoStack(prev => [...prev, currentPage.elements]);
    setRedoStack([]);
    setDocumentState(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[activePageIndex] = {
        ...updatedPages[activePageIndex],
        elements: [...updatedPages[activePageIndex].elements, newElement],
      };
      return {
        ...prev,
        updatedAt: Date.now(),
        pages: updatedPages,
      };
    });
  }, [activePageIndex, currentPage.elements]);

  // Undo & Redo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, currentPage.elements]);
    setUndoStack(prev => prev.slice(0, prev.length - 1));

    setDocumentState(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[activePageIndex] = {
        ...updatedPages[activePageIndex],
        elements: previous,
      };
      return { ...prev, pages: updatedPages };
    });
  }, [undoStack, currentPage.elements, activePageIndex]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, currentPage.elements]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));

    setDocumentState(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[activePageIndex] = {
        ...updatedPages[activePageIndex],
        elements: next,
      };
      return { ...prev, pages: updatedPages };
    });
  }, [redoStack, currentPage.elements, activePageIndex]);

  // Clear Page
  const handleClearPage = useCallback(() => {
    if (currentPage.elements.length === 0) {
      setToast({
        id: Date.now(),
        text: 'Board is already empty',
      });
      return;
    }

    const previousElements = [...currentPage.elements];
    setUndoStack(prev => [...prev, previousElements]);
    setRedoStack([]);

    setDocumentState(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[activePageIndex] = {
        ...updatedPages[activePageIndex],
        elements: [],
      };
      return {
        ...prev,
        updatedAt: Date.now(),
        pages: updatedPages,
      };
    });

    setToast({
      id: Date.now(),
      text: `Cleared all ${previousElements.length} object${previousElements.length > 1 ? 's' : ''}`,
      action: {
        label: 'Undo',
        onClick: () => {
          handleUndo();
        },
      },
    });
  }, [currentPage.elements, activePageIndex, handleUndo]);

  // Page Operations
  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setDocumentState(prev => ({ ...prev, activePageIndex: activePageIndex - 1 }));
      setUndoStack([]);
      setRedoStack([]);
    }
  };

  const handleNextPage = () => {
    if (activePageIndex < documentState.pages.length - 1) {
      setDocumentState(prev => ({ ...prev, activePageIndex: activePageIndex + 1 }));
      setUndoStack([]);
      setRedoStack([]);
    }
  };

  const handleAddPage = () => {
    const newPage: BoardPage = {
      id: 'page_' + Date.now(),
      backgroundStyle: currentPage.backgroundStyle,
      elements: [],
    };
    setDocumentState(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
      activePageIndex: prev.pages.length,
    }));
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleDuplicatePage = (targetIdx = activePageIndex) => {
    const target = documentState.pages[targetIdx];
    const duplicated: BoardPage = {
      ...target,
      id: 'page_' + Date.now(),
      elements: JSON.parse(JSON.stringify(target.elements)),
    };
    const newPages = [...documentState.pages];
    newPages.splice(targetIdx + 1, 0, duplicated);
    setDocumentState(prev => ({
      ...prev,
      pages: newPages,
      activePageIndex: targetIdx + 1,
    }));
  };

  const handleDeletePage = useCallback((targetIdx?: number | unknown) => {
    const pageIdx = typeof targetIdx === 'number' ? targetIdx : activePageIndex;

    if (documentState.pages.length <= 1) {
      // If only 1 page remains, clear it so it resets
      if (currentPage.elements.length > 0) {
        const previousElements = [...currentPage.elements];
        setUndoStack(prev => [...prev, previousElements]);
        setRedoStack([]);
        setDocumentState(prev => {
          const updatedPages = [...prev.pages];
          updatedPages[0] = {
            ...updatedPages[0],
            elements: [],
          };
          return { ...prev, pages: updatedPages };
        });
        setToast({
          id: Date.now(),
          text: 'Reset slide to blank',
          action: {
            label: 'Undo',
            onClick: () => handleUndo(),
          },
        });
      } else {
        setToast({
          id: Date.now(),
          text: 'Cannot delete the only remaining slide',
        });
      }
      return;
    }

    const deletedPage = documentState.pages[pageIdx] || currentPage;
    const newPages = documentState.pages.filter((_, i) => i !== pageIdx);
    const newIndex = Math.max(0, Math.min(newPages.length - 1, pageIdx >= newPages.length ? newPages.length - 1 : pageIdx));

    setDocumentState(prev => ({
      ...prev,
      pages: newPages,
      activePageIndex: newIndex,
    }));
    setUndoStack([]);
    setRedoStack([]);

    setToast({
      id: Date.now(),
      text: `Slide ${pageIdx + 1} deleted`,
      action: {
        label: 'Undo',
        onClick: () => {
          setDocumentState(prev => {
            const restoredPages = [...prev.pages];
            restoredPages.splice(pageIdx, 0, deletedPage);
            return {
              ...prev,
              pages: restoredPages,
              activePageIndex: pageIdx,
            };
          });
        },
      },
    });
  }, [documentState.pages, activePageIndex, currentPage, handleUndo]);

  const handleSelectBackground = (bg: BackgroundStyle) => {
    setDocumentState(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[activePageIndex] = {
        ...updatedPages[activePageIndex],
        backgroundStyle: bg,
      };
      return { ...prev, pages: updatedPages };
    });
  };

  const handleSelectBackgroundColor = (color: string) => {
    setDocumentState(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[activePageIndex] = {
        ...updatedPages[activePageIndex],
        backgroundColor: color,
      };
      return { ...prev, pages: updatedPages };
    });
  };

  const handleInsertSolid = (solid: Solid3DElement) => {
    handleAddElement(solid);
    setIsSolidsModalOpen(false);
    setActiveTool('select');
  };

  const handleInsertMultipleSolids = (solids: Solid3DElement[]) => {
    solids.forEach(solid => handleAddElement(solid));
    setIsSolidsModalOpen(false);
    setActiveTool('select');
  };

  // Toggle Teaching Widgets
  const handleToggleWidget = (key: keyof TeachingWidgetsState) => {
    setWidgets(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        active: !prev[key].active,
      },
    }));
  };

  // Insert Image or Cropped PDF Snippet onto board
  const handleInsertImage = (
    imageSrc: string,
    width: number,
    height: number,
    meta?: { isCroppedPdf: boolean; pdfName: string; pageNum: number }
  ) => {
    const isPortraitPage = height > width && height > 600;
    const maxH = isPortraitPage ? 880 : 680;
    const ratio = width / (height || 1);
    const targetH = Math.min(height, maxH);
    const targetW = targetH * ratio;

    const imageElement: ImageElement = {
      id: 'img_' + Date.now(),
      type: 'image',
      x: isPortraitPage ? 80 : 180,
      y: isPortraitPage ? 60 : 120,
      width: targetW,
      height: targetH,
      src: imageSrc,
      aspectRatio: ratio,
      isCroppedPdf: meta?.isCroppedPdf,
      pdfOriginalName: meta?.pdfName,
      pdfPageNum: meta?.pageNum,
    };
    handleAddElement(imageElement);
    setActiveTool('select');
    setToast({
      id: Date.now(),
      text: meta?.pageNum ? `Inserted PDF Page ${meta.pageNum} on current slide` : 'Inserted image onto slide',
    });
  };

  // Insert Cropped Snippet or PDF as brand new slide
  const handleInsertAsNewPage = (
    imageSrc: string,
    width: number,
    height: number,
    meta?: { isCroppedPdf: boolean; pdfName: string; pageNum: number }
  ) => {
    const isPortraitPage = height > width && height > 600;
    const maxH = isPortraitPage ? 920 : 760;
    const ratio = width / (height || 1);
    const targetH = Math.min(height, maxH);
    const targetW = targetH * ratio;

    const newPage: BoardPage = {
      id: 'page_' + Date.now(),
      backgroundStyle: 'grid-dark',
      elements: [
        {
          id: 'img_' + Date.now(),
          type: 'image',
          x: isPortraitPage ? 80 : 160,
          y: isPortraitPage ? 60 : 90,
          width: targetW,
          height: targetH,
          src: imageSrc,
          aspectRatio: ratio,
          isCroppedPdf: meta?.isCroppedPdf,
          pdfOriginalName: meta?.pdfName,
          pdfPageNum: meta?.pageNum,
        },
      ],
    };

    setDocumentState(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
      activePageIndex: prev.pages.length,
    }));
    setActiveTool('pen');
    setToast({
      id: Date.now(),
      text: meta?.pageNum ? `Inserted PDF Page ${meta.pageNum} into Math Board!` : 'Inserted into Math Board!',
    });
  };

  // Insert All PDF Pages as sequential slides in Math Board
  const handleInsertAllPages = (
    pages: Array<{ dataUrl: string; width: number; height: number; pageNum: number }>,
    pdfName: string
  ) => {
    if (!pages || pages.length === 0) return;

    const newPages: BoardPage[] = pages.map((page, idx) => {
      const isPortrait = page.height > page.width;
      const targetH = isPortrait ? 920 : 680;
      const ratio = page.width / (page.height || 1);
      const targetW = targetH * ratio;

      return {
        id: 'page_' + (Date.now() + idx),
        backgroundStyle: 'grid-dark',
        elements: [
          {
            id: 'img_' + (Date.now() + idx),
            type: 'image' as const,
            x: isPortrait ? 80 : 160,
            y: isPortrait ? 60 : 90,
            width: targetW,
            height: targetH,
            src: page.dataUrl,
            aspectRatio: ratio,
            isCroppedPdf: true,
            pdfOriginalName: pdfName,
            pdfPageNum: page.pageNum,
          },
        ],
      };
    });

    setDocumentState(prev => ({
      ...prev,
      pages: [...prev.pages, ...newPages],
      activePageIndex: prev.pages.length,
    }));

    setActiveTool('pen');
    setToast({
      id: Date.now(),
      text: `Inserted all ${pages.length} PDF pages into Math Board!`,
    });
  };

  // Open Single PDF Document directly on Math Board (Keeps single presentation slide)
  const handleOpenSinglePdf = (
    doc: any,
    filename: string,
    page: number = 1
  ) => {
    setPdfViewerDoc(doc);
    setPdfViewerFilename(filename);
    setPdfViewerCurrentPage(page);
    setIsPdfViewerOpen(true);
    setIsPdfViewerMinimized(false);
    setIsPdfModalOpen(false);
    setToast({
      id: Date.now(),
      text: `Viewing "${filename}" as single PDF on Math Board!`,
    });
  };

  const handleOpenPdfClick = () => {
    if (pdfViewerDoc) {
      if (!isPdfViewerOpen) {
        setIsPdfViewerOpen(true);
        setIsPdfViewerMinimized(false);
      } else if (isPdfViewerMinimized) {
        setIsPdfViewerMinimized(false);
      } else {
        setIsPdfModalOpen(true);
      }
    } else {
      setIsPdfModalOpen(true);
    }
  };

  // Add Sticky Note
  const handleAddStickyNote = () => {
    const newSticky: StickyNoteElement = {
      id: 'stk_' + Date.now(),
      type: 'sticky',
      x: 240,
      y: 180,
      width: 220,
      height: 160,
      text: 'Note:',
      color: '#fef08a',
    };
    handleAddElement(newSticky);
    setActiveTool('select');
  };

  // Insert GeoGebra graphic / concept illustration to whiteboard canvas
  const handleInsertGeoGebraGraphic = (dataUrl: string, width: number, height: number, label: string) => {
    const finalWidth = Math.min(width, 720);
    const finalHeight = Math.min(height, 500);
    const newImage: ImageElement = {
      id: 'geogebra_' + Date.now(),
      type: 'image',
      x: 140,
      y: 100,
      width: finalWidth,
      height: finalHeight,
      src: dataUrl,
      aspectRatio: width > 0 && height > 0 ? width / height : 1.33,
    };
    handleAddElement(newImage);
    setActiveTool('select');
    setToast({
      id: Date.now(),
      text: `Inserted GeoGebra: ${label}`,
    });
  };

  // Insert Math Template graphic to whiteboard canvas
  const handleInsertTemplateGraphic = (dataUrl: string, width: number, height: number, label: string) => {
    const finalWidth = Math.min(width, 760);
    const finalHeight = Math.min(height, 520);
    const newImage: ImageElement = {
      id: 'template_' + Date.now(),
      type: 'image',
      x: 120,
      y: 90,
      width: finalWidth,
      height: finalHeight,
      src: dataUrl,
      aspectRatio: width > 0 && height > 0 ? width / height : 1.5,
    };
    handleAddElement(newImage);
    setActiveTool('select');
    setToast({
      id: Date.now(),
      text: `Inserted ${label}`,
    });
  };

  // Insert Fraction graphic to whiteboard canvas
  const handleInsertFractionGraphic = (dataUrl: string, width: number, height: number, label: string) => {
    const finalWidth = Math.min(width, 740);
    const finalHeight = Math.min(height, 500);
    const newImage: ImageElement = {
      id: 'fraction_' + Date.now(),
      type: 'image',
      x: 140,
      y: 110,
      width: finalWidth,
      height: finalHeight,
      src: dataUrl,
      aspectRatio: width > 0 && height > 0 ? width / height : 1.5,
    };
    handleAddElement(newImage);
    setActiveTool('select');
    setToast({
      id: Date.now(),
      text: `Inserted ${label}`,
    });
  };

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, tool hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveTool('pen');
      } else if (e.key === 'q' || e.key === 'Q') {
        setActiveTool('lasso');
      } else if (e.key === 'e' || e.key === 'E') {
        setActiveTool('eraser');
      } else if (e.key === 'y' || e.key === 'Y') {
        setActiveTool('highlighter');
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveTool('laser');
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('hand');
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape' && isCleanPresentationMode) {
        setIsCleanPresentationMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleNextPage, handlePrevPage, isCleanPresentationMode]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans select-none">
      {/* Top Math Whiteboard Navigation Bar (Hidden in Clean Presentation Mode) */}
      {!isCleanPresentationMode && (
        <TopBar
          title={documentState.title}
          currentPageIndex={activePageIndex}
          totalPages={documentState.pages.length}
          backgroundStyle={currentPage.backgroundStyle}
          backgroundColor={currentPage.backgroundColor}
          onSelectBackgroundColor={handleSelectBackgroundColor}
          widgets={widgets}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          isSplitScreen={isSplitScreen}
          onToggleSplitScreen={() => setIsSplitScreen(prev => !prev)}
          isGraphSheetOpen={isGraphSheetOpen}
          onToggleGraphSheet={() => setIsGraphSheetOpen(prev => !prev)}
          onOpenSolidsModal={() => setIsSolidsModalOpen(true)}
          onOpenGeoGebraModal={() => setIsGeoGebraModalOpen(true)}
          onOpenFractionsModal={() => setIsFractionsModalOpen(true)}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onSelectBackground={handleSelectBackground}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClearPage={handleClearPage}
          onToggleWidget={handleToggleWidget}
          onOpenPdfModal={handleOpenPdfClick}
          isPdfViewerOpen={isPdfViewerOpen && !isPdfViewerMinimized}
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
          onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
          showThumbnails={showThumbnails}
          isCleanPresentationMode={isCleanPresentationMode}
          onTogglePresentationMode={() => setIsCleanPresentationMode(prev => !prev)}
        />
      )}

      {/* Interactive Action Toast with Instant Undo */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-slate-900/95 border border-slate-650 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-xs font-semibold text-slate-100">{toast.text}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                setToast(null);
              }}
              className="px-2.5 py-0.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-full transition active:scale-95 shadow-xs cursor-pointer"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}

      {/* Main Canvas Workspace with Split Screen Support & Direct PDF Drag-Drop */}
      <main 
        className="flex-1 relative overflow-hidden flex flex-row"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (!file) return;
          if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            loadPdfDocument(file, file.name)
              .then(info => {
                handleOpenSinglePdf(info.pdfDoc, info.filename, 1);
              })
              .catch(err => {
                console.error('Failed to load dropped PDF directly:', err);
                setDroppedPdfFile(file);
                setIsPdfModalOpen(true);
              });
          } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const src = evt.target?.result as string;
              if (src) {
                const img = new Image();
                img.onload = () => {
                  handleInsertImage(src, img.naturalWidth, img.naturalHeight);
                };
                img.src = src;
              }
            };
            reader.readAsDataURL(file);
          }
        }}
      >
        {/* Slides Thumbnails Drawer */}
        <ThumbnailsDrawer
          isOpen={showThumbnails}
          onClose={() => setShowThumbnails(false)}
          document={documentState}
          onSelectPage={idx => setDocumentState(prev => ({ ...prev, activePageIndex: idx }))}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
        />

        {/* Split Screen Left Pane (Problem / Reference Slide) */}
        {isSplitScreen && (
          <div className="w-1/2 h-full border-r-2 border-slate-750 relative bg-slate-950 flex flex-col z-10 shadow-xl">
            <div className="h-9 bg-slate-850/90 border-b border-slate-700/80 px-3 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5 text-sky-400">
                <Columns2 className="w-3.5 h-3.5" /> Problem / Question Reference
              </span>
              <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                Page {activePageIndex + 1}
              </span>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <WhiteboardCanvas
                page={currentPage}
                activeTool="hand"
                activeColor={activeColor}
                strokeWidth={strokeWidth}
                selectedShape={selectedShape}
                shapeFillColor={shapeFillColor}
                isStylusOnly={false}
                isAutoShapeEnabled={false}
                penSensitivity={penSensitivity}
                onUpdateElements={() => {}}
                onAddElement={() => {}}
                pendingMathSymbol={null}
                onClearPendingMathSymbol={() => {}}
              />
            </div>
          </div>
        )}

        {/* Primary Interactive Whiteboard Stage */}
        <div className={`${isSplitScreen ? 'w-1/2' : 'w-full'} h-full relative overflow-hidden flex flex-col`}>
          {isSplitScreen && (
            <div className="h-9 bg-slate-850/90 border-b border-slate-700/80 px-3 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Edit3 className="w-3.5 h-3.5" /> Active Solution & Whiteboard
              </span>
              <span className="text-[11px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                Interactive
              </span>
            </div>
          )}
          <div className="flex-1 relative overflow-hidden">
            <WhiteboardCanvas
              page={currentPage}
              activeTool={activeTool}
              activeColor={activeColor}
              strokeWidth={strokeWidth}
              selectedShape={selectedShape}
              shapeFillColor={shapeFillColor}
              isStylusOnly={isStylusOnly}
              isAutoShapeEnabled={isAutoShapeEnabled}
              penSensitivity={penSensitivity}
              onUpdateElements={handleUpdateElements}
              onAddElement={handleAddElement}
              pendingMathSymbol={pendingMathSymbol}
              onClearPendingMathSymbol={() => setPendingMathSymbol(null)}
            />
          </div>
        </div>

        {/* Resizable Side-by-Side Graph Sheet Panel */}
        {isGraphSheetOpen && (
          <GraphSheetPanel
            isOpen={isGraphSheetOpen}
            onClose={() => setIsGraphSheetOpen(false)}
            panelWidthPercent={graphWidthPercent}
            onWidthChange={setGraphWidthPercent}
            dockSide={graphDockSide}
            onToggleDockSide={() => setGraphDockSide(s => (s === 'left' ? 'right' : 'left'))}
          />
        )}

        {/* Single PDF Document Viewer directly on Math Board */}
        {isPdfViewerOpen && (
          <PdfViewerPanel
            isOpen={isPdfViewerOpen}
            onClose={() => setIsPdfViewerOpen(false)}
            pdfDoc={pdfViewerDoc}
            filename={pdfViewerFilename}
            currentPage={pdfViewerCurrentPage}
            onPageChange={setPdfViewerCurrentPage}
            panelWidthPercent={pdfViewerWidthPercent}
            onWidthChange={setPdfViewerWidthPercent}
            dockSide={pdfViewerDockSide}
            onToggleDockSide={() => setPdfViewerDockSide(s => (s === 'left' ? 'right' : 'left'))}
            isMinimized={isPdfViewerMinimized}
            onToggleMinimize={() => setIsPdfViewerMinimized(m => !m)}
            onInsertSnippetToBoard={(dataUrl, width, height, pageNum) => {
              handleInsertImage(dataUrl, width, height, {
                isCroppedPdf: true,
                pdfName: pdfViewerFilename,
                pageNum,
              });
              setToast({
                id: Date.now(),
                text: `Snippet from ${pdfViewerFilename} (P. ${pageNum}) added to current slide!`,
              });
            }}
            onInsertPageToBoard={(dataUrl, width, height, pageNum) => {
              handleInsertImage(dataUrl, width, height, {
                isCroppedPdf: false,
                pdfName: pdfViewerFilename,
                pageNum,
              });
              setToast({
                id: Date.now(),
                text: `Page ${pageNum} copied onto current slide!`,
              });
            }}
            onLoadNewPdf={(file) => {
              loadPdfDocument(file, file.name).then(info => {
                setPdfViewerDoc(info.pdfDoc);
                setPdfViewerFilename(info.filename);
                setPdfViewerCurrentPage(1);
                setToast({
                  id: Date.now(),
                  text: `Loaded ${file.name} on Math Board!`,
                });
              }).catch(err => {
                console.error('Failed to load new PDF:', err);
              });
            }}
            onLoadSampleLesson={async () => {
              try {
                const samplePdfBytes = generateSampleLessonPdf();
                const info = await loadPdfDocument(samplePdfBytes, 'Classroom_Worksheet_Lesson4.pdf');
                setPdfViewerDoc(info.pdfDoc);
                setPdfViewerFilename(info.filename);
                setPdfViewerCurrentPage(1);
                setToast({
                  id: Date.now(),
                  text: 'Loaded Sample Math Lesson on Math Board!',
                });
              } catch (err) {
                console.error('Failed to load sample PDF:', err);
              }
            }}
            isCleanPresentationMode={isCleanPresentationMode}
            onTogglePresentationMode={() => setIsCleanPresentationMode(prev => !prev)}
          />
        )}

        {/* Interactive Classroom Teaching Widgets */}
        {widgets.ruler.active && (
          <RulerTool onClose={() => handleToggleWidget('ruler')} />
        )}

        {widgets.protractor.active && (
          <ProtractorTool onClose={() => handleToggleWidget('protractor')} />
        )}

        {widgets.spotlight.active && (
          <SpotlightTool onClose={() => handleToggleWidget('spotlight')} />
        )}

        {widgets.curtain.active && (
          <CurtainTool onClose={() => handleToggleWidget('curtain')} />
        )}

        {widgets.timer.active && (
          <TimerTool onClose={() => handleToggleWidget('timer')} />
        )}

        {widgets.dice.active && (
          <DiceTool onClose={() => handleToggleWidget('dice')} />
        )}
      </main>

      {/* Dockable Stylus & Tool Palette (Fixed at bottom) */}
      <ToolPalette
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        activeColor={activeColor}
        onSelectColor={setActiveColor}
        strokeWidth={strokeWidth}
        onSelectStrokeWidth={setStrokeWidth}
        selectedShape={selectedShape}
        onSelectShape={setSelectedShape}
        shapeFillColor={shapeFillColor}
        onSelectShapeFillColor={setShapeFillColor}
        isStylusOnly={isStylusOnly}
        onToggleStylusOnly={() => setIsStylusOnly(!isStylusOnly)}
        isAutoShapeEnabled={isAutoShapeEnabled}
        onToggleAutoShape={() => setIsAutoShapeEnabled(!isAutoShapeEnabled)}
        onAddStickyNote={handleAddStickyNote}
        onInsertMathSymbol={sym => setPendingMathSymbol(sym)}
        onOpenSolidsModal={() => setIsSolidsModalOpen(true)}
        onOpenGeoGebraModal={() => setIsGeoGebraModalOpen(true)}
        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
        onOpenFractionsModal={() => setIsFractionsModalOpen(true)}
        onOpenPdfModal={handleOpenPdfClick}
        onClearScreen={handleClearPage}
        isToolsHidden={isCleanPresentationMode}
        onToggleHideTools={() => setIsCleanPresentationMode(prev => !prev)}
        penSensitivity={penSensitivity}
        onChangePenSensitivity={handleUpdatePenSensitivity}
      />

      {/* 3D Movable Solids & Combination of Solids Modal */}
      <Solids3DModal
        isOpen={isSolidsModalOpen}
        onClose={() => setIsSolidsModalOpen(false)}
        onInsertSolid={handleInsertSolid}
        onInsertMultipleSolids={handleInsertMultipleSolids}
        activeColor={activeColor}
      />

      {/* GeoGebra Dynamic Mathematics Construction & Concept Modal */}
      <GeoGebraToolsModal
        isOpen={isGeoGebraModalOpen}
        onClose={() => setIsGeoGebraModalOpen(false)}
        onInsertToWhiteboard={handleInsertGeoGebraGraphic}
      />

      {/* Interactive Classroom Fractions Tool Modal */}
      <FractionsTool
        isOpen={isFractionsModalOpen}
        onClose={() => setIsFractionsModalOpen(false)}
        onInsertToCanvas={handleInsertFractionGraphic}
      />

      {/* Math Whiteboard Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onApplyBackground={handleSelectBackground}
        onInsertGraphic={handleInsertTemplateGraphic}
      />

      {/* Andhra Pradesh Mathematics Forum Official Logo & Title at Left Side Bottom Corner (Hidden in Clean Presentation Mode) */}
      {!isCleanPresentationMode && (
        <footer className="fixed bottom-3 left-3 sm:left-4 z-20 pointer-events-none flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-full shadow-2xl select-none">
          <APMFLogo className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] font-black text-white tracking-tight leading-tight whitespace-nowrap">
              Andhra Pradesh Mathematics Forum
            </span>
            <span className="text-[9px] text-sky-400 font-semibold leading-none">
              Math white board
            </span>
          </div>
        </footer>
      )}

      {/* Right Side Bottom: Gangalapudi.Bhaskar Reddy, 8555079452 (Hidden in Clean Presentation Mode) */}
      {!isCleanPresentationMode && (
        <footer className="fixed bottom-3 right-3 sm:right-4 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-full shadow-2xl select-none">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-white tracking-tight text-[11px] whitespace-nowrap">
              Gangalapudi.Bhaskar Reddy
            </span>
            <span className="text-slate-500 text-[10px]">,</span>
            <span className="font-mono text-emerald-400 font-semibold text-[11px] whitespace-nowrap">
              8555079452
            </span>
          </div>
        </footer>
      )}

      {/* Clean Presentation Mode: Floating Quick Teaching Controls Bar */}
      {isCleanPresentationMode && (
        <div className="fixed top-3 right-4 z-50 flex items-center gap-1.5 p-1.5 bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-sky-500/80 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Slide Navigator */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700/80">
            <button
              disabled={activePageIndex <= 0}
              onClick={handlePrevPage}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              title="Previous Slide (PageUp / Left)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-sky-300">
              {activePageIndex + 1} / {documentState.pages.length}
            </span>
            <button
              disabled={activePageIndex >= documentState.pages.length - 1}
              onClick={handleNextPage}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              title="Next Slide (PageDown / Right)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700/80">
            <button
              disabled={undoStack.length === 0}
              onClick={handleUndo}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Pen / Eraser toggle */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700/80">
            <button
              onClick={() => setActiveTool('pen')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                activeTool === 'pen' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-750'
              }`}
              title="Pen Tool (P)"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTool('eraser')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                activeTool === 'eraser' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-750'
              }`}
              title="Eraser Tool (E)"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Clear Page */}
          <button
            onClick={handleClearPage}
            className="p-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600/60 text-rose-300 hover:text-white transition cursor-pointer"
            title="Clear Current Screen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Exit Clean Presentation Mode / Show All Tools */}
          <button
            onClick={() => setIsCleanPresentationMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-bold transition shadow-md cursor-pointer ml-0.5"
            title="Show All Tools & Top Bar (or press ESC)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Tools</span>
            <span className="text-[10px] bg-sky-700/80 px-1 py-0.2 rounded font-mono">ESC</span>
          </button>
        </div>
      )}

      {/* PDF & Cropped PDF Modal */}
      <PdfModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setDroppedPdfFile(null);
        }}
        onInsertImage={handleInsertImage}
        onInsertAsNewPage={handleInsertAsNewPage}
        onInsertAllPages={handleInsertAllPages}
        onOpenSinglePdf={handleOpenSinglePdf}
        initialFile={droppedPdfFile}
      />

      {/* Save & Document Manager Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentDoc={documentState}
        onUpdateTitle={newTitle => setDocumentState(prev => ({ ...prev, title: newTitle }))}
        onLoadDoc={doc => setDocumentState(doc)}
        onNewDoc={() => {
          const freshDoc: BoardDocument = {
            id: 'doc_' + Date.now(),
            title: 'New Whiteboard Lesson',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            activePageIndex: 0,
            pages: [
              {
                id: 'page_1',
                backgroundStyle: 'grid-dark',
                elements: [],
              },
            ],
          };
          setDocumentState(freshDoc);
          saveBoardToStorage(freshDoc);
        }}
      />
    </div>
  );
}
