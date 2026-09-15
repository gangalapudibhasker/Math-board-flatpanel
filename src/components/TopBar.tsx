import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Copy, 
  RotateCcw, 
  RotateCw, 
  Eraser, 
  Maximize2, 
  Minimize2, 
  Save, 
  FileText, 
  Layers, 
  Compass, 
  Clock, 
  Dices, 
  Eye, 
  EyeOff,
  SlidersHorizontal,
  Grid,
  Square,
  AlignJustify,
  Sun,
  Moon,
  FolderOpen,
  GraduationCap,
  Columns2,
  Box,
  Palette,
  Sparkles,
  LayoutTemplate,
  X
} from 'lucide-react';
import { BackgroundStyle, TeachingWidgetsState } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { APMFLogo } from './APMFLogo';

interface TopBarProps {
  title: string;
  currentPageIndex: number;
  totalPages: number;
  backgroundStyle: BackgroundStyle;
  backgroundColor?: string;
  onSelectBackgroundColor: (color: string) => void;
  widgets: TeachingWidgetsState;
  canUndo: boolean;
  canRedo: boolean;
  isSplitScreen: boolean;
  onToggleSplitScreen: () => void;
  isGraphSheetOpen: boolean;
  onToggleGraphSheet: () => void;
  onOpenSolidsModal: () => void;
  onOpenGeoGebraModal: () => void;
  onOpenFractionsModal?: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
  onSelectBackground: (bg: BackgroundStyle) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearPage: () => void;
  onToggleWidget: (key: keyof TeachingWidgetsState) => void;
  onOpenPdfModal: () => void;
  isPdfViewerOpen?: boolean;
  onOpenSaveModal: () => void;
  onToggleThumbnails: () => void;
  showThumbnails: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  currentPageIndex,
  totalPages,
  backgroundStyle,
  backgroundColor,
  onSelectBackgroundColor,
  widgets,
  canUndo,
  canRedo,
  isSplitScreen,
  onToggleSplitScreen,
  isGraphSheetOpen,
  onToggleGraphSheet,
  onOpenSolidsModal,
  onOpenGeoGebraModal,
  onOpenFractionsModal,
  onPrevPage,
  onNextPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onSelectBackground,
  onUndo,
  onRedo,
  onClearPage,
  onToggleWidget,
  onOpenPdfModal,
  isPdfViewerOpen = false,
  onOpenSaveModal,
  onToggleThumbnails,
  showThumbnails,
}) => {
  const [showBgMenu, setShowBgMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [hideMiddleOptions, setHideMiddleOptions] = useState<boolean>(true);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const bgOptions: { id: BackgroundStyle; label: string; icon: React.ReactNode; isDark: boolean }[] = [
    { id: 'graph-dark', label: 'Dark Graph (X-Y Axes)', icon: <Grid className="w-3.5 h-3.5 text-emerald-400" />, isDark: true },
    { id: 'graph-white', label: 'White Graph (X-Y Axes)', icon: <Grid className="w-3.5 h-3.5 text-emerald-600" />, isDark: false },
    { id: 'grid-dark', label: 'Dark Grid (Squares)', icon: <Grid className="w-3.5 h-3.5" />, isDark: true },
    { id: 'grid-white', label: 'White Grid (Squares)', icon: <Grid className="w-3.5 h-3.5" />, isDark: false },
    { id: 'ruled-dark', label: 'Dark Ruled Lines', icon: <AlignJustify className="w-3.5 h-3.5" />, isDark: true },
    { id: 'ruled-white', label: 'White Ruled Lines', icon: <AlignJustify className="w-3.5 h-3.5" />, isDark: false },
    { id: 'plain-dark', label: 'Blackboard Plain', icon: <Square className="w-3.5 h-3.5 fill-current" />, isDark: true },
    { id: 'plain-white', label: 'Whiteboard Plain', icon: <Square className="w-3.5 h-3.5" />, isDark: false },
  ];

  const colorPresets = [
    { label: 'Chalkboard Green', value: '#154734' },
    { label: 'Dark Slate', value: '#090d16' },
    { label: 'Blackboard Black', value: '#000000' },
    { label: 'Classroom Navy', value: '#0c2340' },
    { label: 'Pure White', value: '#ffffff' },
    { label: 'Warm Cream', value: '#fcfaf2' },
  ];

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-2 sm:px-3 lg:px-4 flex items-center justify-between select-none z-30 relative text-slate-200 gap-2">
      {/* Left: Document Title & Page Sorter Toggle & App Badge */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleThumbnails}
          className={`p-2 rounded-xl transition shrink-0 ${
            showThumbnails ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title="Toggle Page Thumbnails"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSaveModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-left border border-slate-700/80 max-w-[130px] sm:max-w-[170px] transition shrink-0"
          title="Click to rename or manage board document"
        >
          <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-xs font-bold text-white truncate">{title}</span>
        </button>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-sky-950/40 border border-sky-600/40 rounded-xl text-xs shrink-0 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-sky-200">Math white board</span>
        </div>
      </div>

      {/* Center: Math Whiteboard Slides Navigation & Backgrounds */}
      {hideMiddleOptions ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideMiddleOptions(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 transition shadow-xs"
            title="Show middle options (slides navigation & background options)"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px]">Show Slides & Board Setup</span>
          </button>
          
          {/* Keep Undo / Redo accessible even when middle options are hidden */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700/80">
            <button
              disabled={!canUndo}
              onClick={onUndo}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={!canRedo}
              onClick={onRedo}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Clear Screen option when middle options are hidden */}
          <button
            onClick={() => onClearPage()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600/60 text-rose-200 hover:text-white text-xs font-bold transition shadow-md active:scale-95 cursor-pointer"
            title="Clear Screen (Clear all drawings & objects from current page)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Screen</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Page Switcher */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700/80 shadow-xs">
            <button
              disabled={currentPageIndex <= 0}
              onClick={onPrevPage}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-mono font-bold text-sky-300">
              {currentPageIndex + 1} / {totalPages}
            </span>

            <button
              disabled={currentPageIndex >= totalPages - 1}
              onClick={onNextPage}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onAddPage}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 transition"
              title="Add New Slide"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onDuplicatePage}
              className="hidden sm:block p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
              title="Duplicate Current Slide"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeletePage()}
              className={`p-2 rounded-xl transition border ${
                totalPages <= 1
                  ? 'bg-slate-800/90 text-slate-400 hover:text-rose-300 hover:bg-slate-700 border-slate-700/60'
                  : 'bg-slate-800 hover:bg-rose-900/50 text-rose-400 hover:text-rose-200 border-rose-900/40 shadow-xs'
              }`}
              title={totalPages <= 1 ? "Reset & Clear Current Slide" : `Delete Slide ${currentPageIndex + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block mx-0.5" />

          {/* Background Style & Color Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBgMenu(!showBgMenu);
                setShowToolsMenu(false);
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-medium transition ${
                showBgMenu ? 'bg-slate-700 border-sky-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
              }`}
              title="Change Board Grid / Graph Sheet / Background Color"
            >
              {backgroundStyle.includes('dark') ? (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden lg:inline capitalize">
                {backgroundStyle.replace('-', ' ')}
              </span>
            </button>

            {showBgMenu && (
              <div className="absolute top-12 left-0 w-60 bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-3 backdrop-blur-md text-slate-100">
                {/* Background Colors */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Palette className="w-3 h-3 text-sky-400" />
                    <span>Board Background Color</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {colorPresets.map(preset => (
                      <button
                        key={preset.value}
                        onClick={() => onSelectBackgroundColor(preset.value)}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] font-medium transition ${
                          backgroundColor === preset.value
                            ? 'border-sky-400 ring-1 ring-sky-400 bg-slate-800'
                            : 'border-slate-700 hover:border-slate-500 bg-slate-950/60'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: preset.value }}
                        />
                        <span className="truncate">{preset.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Background Grid & Graph Patterns */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Grid className="w-3 h-3 text-emerald-400" />
                    <span>Grid & Coordinate Axes</span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {bgOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          onSelectBackground(opt.id);
                          setShowBgMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          backgroundStyle === opt.id
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <span>{opt.label}</span>
                        </div>
                        {backgroundStyle === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700/80">
            <button
              disabled={!canUndo}
              onClick={onUndo}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              disabled={!canRedo}
              onClick={onRedo}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Dedicated Clear Screen Button */}
          <button
            onClick={() => onClearPage()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-600/60 text-rose-200 hover:text-white text-xs font-bold transition shadow-md active:scale-95 cursor-pointer"
            title="Clear screen (remove all drawings, text, and objects from this page)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Screen</span>
          </button>

          {/* Button to hide middle options */}
          <button
            onClick={() => setHideMiddleOptions(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition ml-0.5"
            title="Hide Middle Options"
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* Right: Split Screen, Graph Sheet, 3D Solids, GeoGebra, PDF, Tools, Save */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Split-Screen Side-by-Side Toggle */}
        <button
          onClick={onToggleSplitScreen}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition ${
            isSplitScreen
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
          }`}
          title="Split Screen View (Compare Problems & Work Side-by-Side)"
        >
          <Columns2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">Split Screen</span>
        </button>

        {/* Resizable Graph Sheet (X-Y Axes) Toggle */}
        <button
          onClick={onToggleGraphSheet}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition ${
            isGraphSheetOpen
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
          }`}
          title="Side-by-Side Coordinate Graph Sheet Panel"
        >
          <Grid className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Graph Sheet</span>
        </button>

        {/* GeoGebra Basic Math Tools Modal Trigger */}
        <button
          onClick={onOpenGeoGebraModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 hover:text-white text-xs font-bold transition shadow-xs"
          title="GeoGebra Classic 5.0 (Dynamic Geometry, Algebra & Full Tools)"
        >
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">GeoGebra</span>
        </button>

        {/* Interactive Fractions Tool Modal Trigger */}
        {onOpenFractionsModal && (
          <button
            onClick={onOpenFractionsModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-950/70 hover:bg-sky-900 border border-sky-500/50 text-sky-200 hover:text-white text-xs font-bold transition shadow-xs cursor-pointer"
            title="Interactive Fractions Tool (Bars, Pie Sectors & Strips)"
          >
            <span className="font-mono text-xs font-bold">½</span>
            <span className="hidden lg:inline">Fractions</span>
          </button>
        )}

        {/* Insert PDF Document / Worksheet Button */}
        <button
          onClick={onOpenPdfModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition active:scale-95 border ${
            isPdfViewerOpen
              ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white border-rose-400/50 shadow-rose-900/40 ring-1 ring-white/30'
              : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white border-sky-400/30 shadow-sky-900/30'
          }`}
          title="Open or View Single PDF Document (Worksheets, Textbooks, Lesson Notes) on Math Board"
        >
          <FileText className="w-4 h-4 text-rose-200" />
          <span className="font-bold">{isPdfViewerOpen ? 'PDF Open' : 'Insert PDF'}</span>
        </button>

        {/* Interactive Classroom Tools Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowToolsMenu(!showToolsMenu);
              setShowBgMenu(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
              showToolsMenu
                ? 'bg-slate-700 border-sky-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
            }`}
            title="Open Teaching Widgets (Ruler, Protractor, Spotlight, Timer)"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Tools</span>
          </button>

          {showToolsMenu && (
            <div className="absolute top-12 right-0 w-60 bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-md text-slate-100">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Math & Classroom Widgets
              </div>
              
              {/* Insert PDF Option in Tools Menu */}
              <button
                onClick={() => {
                  onOpenPdfModal();
                  setShowToolsMenu(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold bg-sky-950/60 hover:bg-sky-900/90 text-sky-200 border border-sky-500/40 transition mb-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Insert PDF / Worksheets</span>
                </div>
                <span className="text-[10px] bg-sky-500/40 px-1.5 py-0.5 rounded font-bold">Open</span>
              </button>
              
              {/* Fractions Tool Trigger */}
              {onOpenFractionsModal && (
                <button
                  onClick={() => {
                    onOpenFractionsModal();
                    setShowToolsMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold bg-sky-950/60 hover:bg-sky-900/90 text-sky-200 border border-sky-500/40 transition mb-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-center font-mono font-bold text-sky-400">½</span>
                    <span>Interactive Fractions</span>
                  </div>
                  <span className="text-[10px] bg-sky-500/40 px-1.5 py-0.5 rounded font-bold">Open</span>
                </button>
              )}

              {/* GeoGebra Basic Math Tools Trigger */}
              <button
                onClick={() => {
                  onOpenGeoGebraModal();
                  setShowToolsMenu(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/90 text-indigo-200 border border-indigo-500/40 transition mb-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>GeoGebra Math Tools</span>
                </div>
                <span className="text-[10px] bg-indigo-500/40 px-1.5 py-0.5 rounded font-bold">Open</span>
              </button>

              <button
                onClick={() => {
                  onToggleWidget('ruler');
                  setShowToolsMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                  widgets.ruler.active ? 'bg-sky-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Virtual Ruler</span>
                </div>
                {widgets.ruler.active && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">ON</span>}
              </button>

              <button
                onClick={() => {
                  onToggleWidget('protractor');
                  setShowToolsMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                  widgets.protractor.active ? 'bg-sky-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>360° Protractor</span>
                </div>
                {widgets.protractor.active && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">ON</span>}
              </button>

              <button
                onClick={() => {
                  onToggleWidget('spotlight');
                  setShowToolsMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                  widgets.spotlight.active ? 'bg-sky-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>Spotlight Focus</span>
                </div>
                {widgets.spotlight.active && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">ON</span>}
              </button>

              <button
                onClick={() => {
                  onToggleWidget('curtain');
                  setShowToolsMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                  widgets.curtain.active ? 'bg-sky-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Square className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Reveal Curtain</span>
                </div>
                {widgets.curtain.active && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">ON</span>}
              </button>

              <button
                onClick={() => {
                  onToggleWidget('timer');
                  setShowToolsMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                  widgets.timer.active ? 'bg-sky-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Timer / Stopwatch</span>
                </div>
                {widgets.timer.active && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">ON</span>}
              </button>

              <button
                onClick={() => {
                  onToggleWidget('dice');
                  setShowToolsMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                  widgets.dice.active ? 'bg-sky-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Dices className="w-3.5 h-3.5 text-violet-400" />
                  <span>Random Dice Picker</span>
                </div>
                {widgets.dice.active && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">ON</span>}
              </button>
            </div>
          )}
        </div>

        {/* Save & Export Modal Trigger */}
        <button
          onClick={onOpenSaveModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition"
          title="Save & Export (Single HTML, PDF, PNG)"
        >
          <Save className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* PWA Install Button (Flat Panel software installation) */}
        <PWAInstallButton compact />

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Toggle Fullscreen Mode (F11)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Divider */}
        <div className="h-7 w-px bg-slate-800 hidden sm:block mx-1" />

        {/* Close Whiteboard Button */}
        <button
          onClick={() => setShowCloseConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition shadow-sm border border-rose-500 cursor-pointer shrink-0 ml-1"
          title="Close Math Whiteboard Session"
        >
          <X className="w-3.5 h-3.5" />
          <span>Close</span>
        </button>
      </div>

      {/* Close Confirmation Dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Close Math Whiteboard?</h3>
                <p className="text-xs text-sky-300 font-medium">
                  Andhra Pradesh Mathematics Forum
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-850 p-3 rounded-xl border border-slate-800">
              Are you sure you want to close this board session? You can save your slides as a standalone HTML file or PDF before closing, or reset to a fresh clean board.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  onOpenSaveModal();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Lesson & Exit</span>
              </button>

              <button
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClearPage();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-850 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/60 text-slate-300 text-xs font-semibold border border-slate-750 transition flex items-center justify-center gap-2"
              >
                <Eraser className="w-4 h-4 text-rose-400" />
                <span>Clear & Reset to New Lesson</span>
              </button>

              <button
                onClick={() => setShowCloseConfirm(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
