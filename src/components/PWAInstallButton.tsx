import React, { useState } from 'react';
import { Download, Monitor, HelpCircle, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed in standalone flat panel mode
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

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
        title="Install Math Whiteboard into this Flat Panel / Computer"
        className={`flex items-center gap-1.5 rounded-lg font-medium transition active:scale-95 ${
          compact
            ? 'px-2.5 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
            : 'px-3 py-1.5 text-xs bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="font-semibold">Install App</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold">Install into Interactive Flat Panel</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p className="text-slate-200 font-medium">
                You can install Math Board directly as native software onto Interactive Flat Panels (Samsung, ViewSonic, Acer, SMART board, BenQ, Newline, Promethean).
              </p>

              {isInstallable ? (
                <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800/80 text-sky-200">
                  <p className="font-medium">Direct One-Click Install Ready!</p>
                  <button
                    onClick={() => {
                      install();
                      setShowGuide(false);
                    }}
                    className="mt-2.5 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Trigger System Install Prompt
                  </button>
                </div>
              ) : isIOS ? (
                <div className="space-y-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                  <p className="font-semibold text-slate-200">For iPad / Safari:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>Tap the <strong>Share</strong> button in Safari's toolbar</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                    <li>Launch Math Whiteboard fullscreen from your home screen</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                  <p className="font-semibold text-slate-200">For Flat Panel Browsers (Chrome / Edge / Chromium):</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>Look at the top URL address bar on the right side</li>
                    <li>Click the <strong>Install Math Whiteboard</strong> icon (computer with down arrow)</li>
                    <li>Click <strong>Install</strong> to add it to your Flat Panel apps launcher</li>
                  </ol>
                </div>
              )}

              <div className="pt-2 text-xs text-slate-400">
                Tip: You can also use the <strong>"Export as Single HTML File"</strong> button in the Save menu to save a single offline executable file onto a USB thumb drive!
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-700 hover:bg-slate-600 py-2.5 text-xs font-semibold text-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
