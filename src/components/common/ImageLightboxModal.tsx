import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Image Preview',
}) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = title.replace(/\s+/g, '_') || 'good_learning_ai_image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Controls */}
        <div className="absolute top-[-44px] right-0 flex items-center gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg text-xs">
          <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-xs">{title}</span>
          <div className="h-3 w-px bg-slate-700 mx-1" />
          <button
            onClick={handleZoomOut}
            className="p-1 hover:text-blue-400 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 hover:text-blue-400 transition font-mono text-[10px]"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:text-blue-400 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1 hover:text-emerald-400 transition"
            title="Download Image"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:text-rose-400 transition ml-1"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Display */}
        <div className="overflow-auto max-h-[82vh] max-w-full rounded-2xl bg-black/50 border border-slate-800 flex items-center justify-center p-2">
          <img
            src={imageUrl}
            alt={title}
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease-out' }}
            className="max-h-[78vh] w-auto object-contain rounded-lg select-none"
          />
        </div>
      </div>
    </div>
  );
};
