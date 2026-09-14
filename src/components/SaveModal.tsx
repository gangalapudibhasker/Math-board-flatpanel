import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  FileCode, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Upload, 
  Trash2, 
  FolderOpen, 
  Plus, 
  Check, 
  Copy,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { BoardDocument } from '../types';
import { 
  saveBoardToStorage, 
  getSavedBoardsList, 
  deleteBoardFromStorage, 
  exportBoardAsJson,
  exportDocumentAsPdf,
  exportPageAsPng,
  exportAsSingleHtmlFile
} from '../utils/exporter';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDoc: BoardDocument;
  onUpdateTitle: (newTitle: string) => void;
  onLoadDoc: (doc: BoardDocument) => void;
  onNewDoc: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  currentDoc,
  onUpdateTitle,
  onLoadDoc,
  onNewDoc,
}) => {
  const [title, setTitle] = useState(currentDoc.title);
  const [savedList, setSavedList] = useState<BoardDocument[]>([]);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentDoc.title);
      setSavedList(getSavedBoardsList());
      setSaveSuccess(false);
      setConfirmDeleteId(null);
    }
  }, [isOpen, currentDoc]);

  const handleSaveToLibrary = () => {
    const updated = { ...currentDoc, title: title.trim() || 'Untitled Board' };
    onUpdateTitle(updated.title);
    saveBoardToStorage(updated);
    setSavedList(getSavedBoardsList());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBoardFromStorage(id);
    setSavedList(getSavedBoardsList());
    setConfirmDeleteId(null);
  };

  const handleExportHtml = async () => {
    setIsExporting('html');
    try {
      await exportAsSingleHtmlFile({ ...currentDoc, title });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting('pdf');
    try {
      await exportDocumentAsPdf({ ...currentDoc, title });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPng = async () => {
    setIsExporting('png');
    try {
      const activePage = currentDoc.pages[currentDoc.activePageIndex] || currentDoc.pages[0];
      await exportPageAsPng(activePage, `${title}_slide_${currentDoc.activePageIndex + 1}.png`);
    } finally {
      setIsExporting(null);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string) as BoardDocument;
        if (parsed && Array.isArray(parsed.pages)) {
          onLoadDoc(parsed);
          saveBoardToStorage(parsed);
          onClose();
        } else {
          alert('Invalid Math Whiteboard project file.');
        }
      } catch {
        alert('Could not parse project JSON.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <Save className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Save & Export Board Document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Document Title Input & Save Library */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Board Lesson Title:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Grade 10 Math - Lesson 4 Geometry"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
              <button
                onClick={handleSaveToLibrary}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-md transition active:scale-95"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save to Library</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>{currentDoc.pages.length} Slides / Pages in this lesson</span>
              <span className="text-emerald-400 font-medium">Auto-save is active</span>
            </div>
          </div>

          {/* Export Options Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Export Formats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Single HTML File Export (Highlighted feature) */}
              <button
                onClick={handleExportHtml}
                disabled={isExporting !== null}
                className="p-4 rounded-xl bg-linear-to-br from-sky-950/60 to-slate-800 border-2 border-sky-500/50 hover:border-sky-400 text-left transition group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                      <FileCode className="w-5 h-5" />
                      <span>Single HTML File</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Completely self-contained standalone HTML presentation. Opens offline on any Flat Panel, smart display, or USB stick with interactive laser & pen!
                  </p>
                </div>
                <div className="mt-3 text-xs font-semibold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting === 'html' ? 'Building HTML...' : 'Download .html File'}</span>
                </div>
              </button>

              {/* Multi-page PDF Export */}
              <button
                onClick={handleExportPdf}
                disabled={isExporting !== null}
                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-left transition group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <FileText className="w-5 h-5" />
                    <span>Multi-Page PDF</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Generates a printable PDF with all {currentDoc.pages.length} whiteboard slides, annotations, and cropped PDF problems.
                  </p>
                </div>
                <div className="mt-3 text-xs font-semibold text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting === 'pdf' ? 'Generating PDF...' : 'Download .pdf File'}</span>
                </div>
              </button>

              {/* Slide PNG Snapshot */}
              <button
                onClick={handleExportPng}
                disabled={isExporting !== null}
                className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-left transition group shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Current Slide PNG</span>
                    <span className="text-[11px] text-slate-400">High-resolution 1080p image</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
              </button>

              {/* Project JSON backup */}
              <button
                onClick={() => exportBoardAsJson({ ...currentDoc, title })}
                className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-left transition group shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Math Whiteboard Project (.json)</span>
                    <span className="text-[11px] text-slate-400">Full editable vector backup</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
              </button>
            </div>
          </div>

          {/* Saved Documents Manager */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Saved Boards Library
              </h3>
              <div className="flex items-center gap-2">
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
                <button
                  onClick={() => jsonInputRef.current?.click()}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                >
                  <Upload className="w-3 h-3" />
                  Import JSON
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => {
                    onNewDoc();
                    onClose();
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  New Board
                </button>
              </div>
            </div>

            {savedList.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
                No saved boards yet. Click "Save to Library" above to store this lesson!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedList.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onLoadDoc(doc);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      doc.id === currentDoc.id
                        ? 'bg-sky-950/40 border-sky-600/60 text-sky-200'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-750 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">{doc.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{doc.pages.length} pages</span>
                          <span>•</span>
                          <span>{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {doc.id === currentDoc.id && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-600 text-white font-semibold mr-1">
                          Current
                        </span>
                      )}
                      {confirmDeleteId === doc.id ? (
                        <button
                          onClick={e => handleDeleteSaved(doc.id, e)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
                          title="Click again to confirm deletion"
                        >
                          Delete?
                        </button>
                      ) : (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setConfirmDeleteId(doc.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700"
                          title="Delete saved board"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/80 border-t border-slate-700 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
