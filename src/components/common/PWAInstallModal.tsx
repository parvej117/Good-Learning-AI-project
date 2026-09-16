import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If running in standalone or already installed, suppress
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          id="pwa-install-header-btn"
          className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 active:scale-95 transition ${
            compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
          }`}
          title="Install Good Learning AI on your device"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSModal(true)}
          id="pwa-ios-guide-btn"
          className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs active:scale-95 transition ${
            compact ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Add to iOS</span>
        </button>
      )}

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <img src="/icon.svg" alt="Good Learning AI" className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Install Good Learning AI</h3>
                <p className="text-xs text-slate-500">Fast, offline-ready Android & iOS PWA</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-blue-100 text-blue-700 mt-0.5">
                  <Share className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Step 1: </span>
                  Tap the <strong className="text-blue-700">Share button</strong> at the bottom of your Safari browser bar.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-blue-100 text-blue-700 mt-0.5">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Step 2: </span>
                  Scroll down the share sheet and tap <strong className="text-blue-700">Add to Home Screen</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <img src="/icon.svg" alt="Good Learning AI" className="w-9 h-9" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Install Good Learning AI</h3>
            <p className="text-xs text-slate-500">Fast, offline-ready Android & Desktop PWA</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="font-bold text-slate-900">App Benefits:</div>
          <ul className="space-y-1 text-slate-600 list-disc list-inside">
            <li>Works 100% offline with locally cached learning materials</li>
            <li>Instant launch from Android home screen or Desktop taskbar</li>
            <li>Optimized for low-bandwidth cellular connections</li>
            <li>Ready for Google Play Store packaging via TWA / Capacitor</li>
          </ul>
        </div>

        {isIOS ? (
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
            <div className="font-bold">iOS Installation Guide:</div>
            <div>
              Tap <Share className="w-3.5 h-3.5 inline mx-1" /> Share in Safari, then select{' '}
              <strong>"Add to Home Screen"</strong>.
            </div>
          </div>
        ) : isInstallable ? (
          <button
            onClick={() => {
              install();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Install Application Now</span>
          </button>
        ) : (
          <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
            App is already installed or your browser supports installing via the browser menu (⋮ &gt; Install App).
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

