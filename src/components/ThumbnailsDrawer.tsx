import React from 'react';
import { Plus, Trash2, Copy, X, Layers } from 'lucide-react';
import { BoardDocument } from '../types';

interface ThumbnailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: BoardDocument;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
}

export const ThumbnailsDrawer: React.FC<ThumbnailsDrawerProps> = ({
  isOpen,
  onClose,
  document,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 bg-slate-900/95 border-r border-slate-800 backdrop-blur-md z-30 flex flex-col select-none animate-in slide-in-from-left duration-200 shadow-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Pages & Slides ({document.pages.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onAddPage}
            className="p-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
            title="Add Page"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {document.pages.map((page, index) => {
          const isActive = index === document.activePageIndex;
          const isDark = page.backgroundStyle.includes('dark');

          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(index)}
              className={`group p-2 rounded-xl border transition cursor-pointer relative ${
                isActive
                  ? 'bg-sky-950/60 border-sky-500 shadow-md'
                  : 'bg-slate-850/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              {/* Page Number Badge */}
              <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-slate-300">
                <span className={isActive ? 'text-sky-400 font-bold' : ''}>
                  Page {index + 1}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {page.backgroundStyle.replace('-', ' ')}
                </span>
              </div>

              {/* Miniature Thumbnail Preview Canvas representation */}
              <div
                className={`w-full aspect-video rounded-lg border flex items-center justify-center overflow-hidden relative shadow-inner ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
                }`}
              >
                {/* Small indicator of items on the page */}
                <div className="text-[10px] font-mono opacity-60 flex flex-col items-center">
                  <span>{page.elements.length} elements</span>
                  {page.elements.some(e => e.type === 'image') && (
                    <span className="text-[9px] text-sky-400">PDF / Image</span>
                  )}
                </div>
              </div>

              {/* Quick Actions (Duplicate / Delete) */}
              <div className="mt-1.5 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDuplicatePage(index);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                  title="Duplicate Slide"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {document.pages.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeletePage(index);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
