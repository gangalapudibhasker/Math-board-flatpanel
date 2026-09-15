import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Monitor, X, CheckCircle2, Laptop, Tablet, Sparkles, ExternalLink, FileCode } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { exportAsSingleHtmlFile, getSavedBoardsList } from '../utils/exporter';
import { BoardDocument } from '../types';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // If already installed in standalone flat panel mode
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-600/50 rounded-xl shadow-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  const handleOfflineDownload = () => {
    try {
      const saved = getSavedBoardsList();
      const docToExport: BoardDocument = saved[0] || {
        id: 'doc_' + Date.now(),
        title: 'Math Whiteboard - Offline App',
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
      exportAsSingleHtmlFile(docToExport);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export offline file:', err);
    }
  };

  return (
    <>
      <button
        onClick={async () => {
          if (isInstallable) {
            const success = await install();
            if (!success) setShowGuide(true);
          } else {
            setShowGuide(true);
          }
        }}
        title="Install Math Whiteboard as native app on this Flat Panel / Computer"
        className={`flex items-center gap-1.5 rounded-xl font-bold transition shadow-md active:scale-95 cursor-pointer ${
          compact
            ? 'px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/30'
            : 'px-3.5 py-1.5 text-xs bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-950/50'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {showGuide &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-750 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">Install Math Whiteboard</h3>
                    <p className="text-xs text-slate-400">For Interactive Flat Panels, Laptops & Desktops</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                  title="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs text-slate-300">
                {/* 1-Click Install Button if browser prompt is ready */}
                {isInstallable ? (
                  <div className="p-4 rounded-xl bg-sky-950/80 border border-sky-600/60 text-sky-100 shadow-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm text-white">Direct Installation Ready!</span>
                    </div>
                    <p className="text-xs text-sky-200/90 mb-3">
                      Your browser supports 1-click native installation. Click below to add Math Whiteboard directly to your desktop or apps menu.
                    </p>
                    <button
                      onClick={async () => {
                        await install();
                        setShowGuide(false);
                      }}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      Install App Now
                    </button>
                  </div>
                ) : (
                  /* Browser-Specific Instructions */
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                      <Laptop className="w-4 h-4" />
                      <span>How to Install on Chrome / Edge / Flat Panel</span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-750 space-y-2">
                      <p className="font-bold text-slate-200">Option 1: Address Bar Icon (Fastest)</p>
                      <p className="text-slate-300">
                        Look at the right side of your browser address bar (where the web address is shown). Click the <strong className="text-sky-300">Install icon (💻 ⬇)</strong> and click <strong className="text-white">Install</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-750 space-y-2">
                      <p className="font-bold text-slate-200">Option 2: Browser Menu</p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300">
                        <li>Click the <strong>three dots (⋮)</strong> menu in the top-right corner of your browser.</li>
                        <li>Click <strong>"Cast, save and share"</strong> or <strong>"Apps"</strong>.</li>
                        <li>Select <strong>"Install Math Whiteboard"</strong> (or <em>"Create Shortcut... &rarr; check Open as Window"</em>).</li>
                      </ol>
                    </div>

                    {isIOS && (
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-750 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <Tablet className="w-3.5 h-3.5" />
                          <span>iPad / Safari:</span>
                        </div>
                        <p className="text-slate-300">
                          Tap the <strong>Share</strong> button in Safari's toolbar &rarr; scroll down &rarr; tap <strong>"Add to Home Screen"</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Offline Standalone File Export */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-600/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <FileCode className="w-4 h-4" />
                    <span>Alternative: Download Standalone Offline File (.html)</span>
                  </div>
                  <p className="text-slate-300">
                    Need to use Math Whiteboard on a flat panel or classroom computer with restricted app permissions or NO internet? Download this single file. You can double-click it anytime from your computer or a USB thumb drive!
                  </p>
                  <button
                    onClick={handleOfflineDownload}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    {downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Downloaded Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Standalone Offline App (.html)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

