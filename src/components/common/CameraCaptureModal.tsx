import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontal } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for available devices
  useEffect(() => {
    if (!isOpen) return;
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, [isOpen]);

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedDataUrl(null);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported by your browser or environment.');
        }

        // Stop any previous stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          newStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch(() => {});
        }
        setIsLoading(false);
      } catch (err: any) {
        console.error('Camera access error:', err);
        if (isMounted) {
          setIsLoading(false);
          setErrorMsg(
            err.name === 'NotAllowedError'
              ? 'ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি (Permission denied). ব্রাউজার সেটিংসে গিয়ে ক্যামেরা পারমিশন অনুমোদন করুন।'
              : 'ক্যামেরা চালু করা সম্ভব হয়নি। আপনার ডিভাইসে কোনো ক্যামেরা সংযুক্ত আছে কিনা যাচাই করুন।'
          );
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [isOpen, facingMode]);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image for natural selfie feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
    stopStream();
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    // trigger re-start of camera
    setFacingMode((prev) => prev);
  };

  const handleConfirmPhoto = () => {
    if (!capturedDataUrl) return;

    // Convert dataUrl to File
    const arr = capturedDataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const filename = `camera_photo_${Date.now()}.jpg`;
    const file = new File([u8arr], filename, { type: mime });

    onCapture(file, capturedDataUrl);
    onClose();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-xs sm:text-sm">ক্যামেরা দিয়ে ছবি তুলুন (Camera Capture)</span>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-200 font-medium leading-relaxed">{errorMsg}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-600 transition"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          ) : capturedDataUrl ? (
            <img
              src={capturedDataUrl}
              alt="Captured"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 text-white space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="text-xs font-medium text-slate-300">ক্যামেরা লোড হচ্ছে...</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between gap-3">
          {capturedDataUrl ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>আবার তুলুন (Retake)</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>ছবি যুক্ত করুন (Use Photo)</span>
              </button>
            </>
          ) : (
            <>
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs transition"
                  title="ক্যামেরা পরিবর্তন করুন"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}
              <div className="flex-1 text-center">
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  disabled={isLoading || !!errorMsg}
                  className="w-14 h-14 mx-auto rounded-full border-4 border-white/80 bg-blue-600 hover:bg-blue-500 active:scale-90 transition flex items-center justify-center shadow-lg disabled:opacity-50"
                  title="ছবি তুলুন"
                >
                  <div className="w-9 h-9 rounded-full bg-white/90 pointer-events-none" />
                </button>
              </div>
              <div className="w-9" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
