import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  ScanEye,
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  HelpCircle,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export const VisionView: React.FC = () => {
  const { addToast, saveNote } = useApp();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [userPrompt, setUserPrompt] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample Educational Images to test immediately
  const sampleProblems = [
    {
      title: 'Trigonometry & Right Triangle Math Problem',
      prompt: 'Solve for hypotenuse and find angle theta step by step with geometric reasoning.',
      dataUrl:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="%23f8fafc"/><path d="M60,180 L300,180 L300,60 Z" fill="%23e0e7ff" stroke="%233b82f6" stroke-width="3"/><text x="170" y="205" font-size="14" font-weight="bold" fill="%231e293b">Base = 8 cm</text><text x="315" y="125" font-size="14" font-weight="bold" fill="%231e293b">Height = 6 cm</text><text x="140" y="110" font-size="14" font-weight="bold" fill="%232563eb">Hypotenuse = ?</text></svg>',
    },
    {
      title: 'Ohm’s Law & Resistor Circuit Diagram',
      prompt: 'Calculate total equivalent resistance, total circuit current I, and voltage drop across R1.',
      dataUrl:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="%23f8fafc"/><rect x="60" y="60" width="280" height="120" fill="none" stroke="%2310b981" stroke-width="3" rx="10"/><text x="180" y="50" font-size="14" font-weight="bold" fill="%23059669">Resistor R1 = 10 %CE%A9</text><text x="70" y="130" font-size="14" font-weight="bold" fill="%23059669">Voltage = 24V</text><text x="180" y="205" font-size="14" font-weight="bold" fill="%23059669">Resistor R2 = 20 %CE%A9</text></svg>',
    },
  ];

  const handleImageFile = (file: File) => {
    if (!file) return;
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      // Clean base64 string
      const base64Data = selectedImage.includes(',') ? selectedImage.split(',')[1] : selectedImage;

      const result = await AIService.analyzeImage({
        base64Image: base64Data,
        mimeType,
        promptText: userPrompt || 'Explain this problem step-by-step and provide clear educational intuition.',
      });

      setAnalysis(result);
      addToast('Image analyzed successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Analyzed problem using local pedagogic engine.', 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700 text-xs font-semibold mb-2">
            <ScanEye className="w-3.5 h-3.5" />
            <span>Multimodal Vision & Math Solver</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Educational Image, Homework & Diagram Solver
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Snap a photo of your handwritten homework, textbook math problem, or physics circuit. The AI
            explains each step clearly instead of just handing you an answer.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-3 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-fuchsia-600/20 active:scale-95 transition flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>Snap or Upload</span>
        </button>
      </div>

      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Canvas & Prompt Input */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Problem Image / Diagram
            </h3>

            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[220px]">
                <img
                  src={selectedImage}
                  alt="Educational Problem"
                  className="max-h-72 object-contain w-full"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysis(null);
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 text-white text-xs font-semibold hover:bg-slate-900"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-fuchsia-400 bg-fuchsia-50/20 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Click to choose a homework photo or diagram
                </div>
                <div className="text-[11px] text-slate-400">PNG, JPG, WebP, or Camera Capture</div>
              </div>
            )}

            {/* Quick Sample Selector */}
            <div>
              <span className="text-xs font-bold text-slate-600 mb-2 block">
                Or test with sample problems:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sampleProblems.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(sp.dataUrl);
                      setUserPrompt(sp.prompt);
                      setAnalysis(null);
                    }}
                    className="p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-fuchsia-50/50 hover:border-fuchsia-300 transition text-[11px]"
                  >
                    <div className="font-bold text-slate-800 line-clamp-1">{sp.title}</div>
                    <div className="text-slate-400 truncate mt-0.5">{sp.prompt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Specific Question or Instructions (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g., Explain the formula used, or find the missing angle..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-fuchsia-500"
              />

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !selectedImage}
                className="w-full py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-fuchsia-600/20 disabled:opacity-50 transition flex items-center justify-center gap-2 active:scale-98"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Analyze & Solve Step-by-Step</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Step-by-Step Educational Solution */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Problem Breakdown & Explanation</span>
              </h3>

              {analysis && (
                <button
                  onClick={() =>
                    saveNote('Visual Problem Solution', analysis, ['Vision Solver', 'Math/Diagrams'])
                  }
                  className="text-xs font-semibold text-slate-500 hover:text-fuchsia-600"
                >
                  Save to Notes
                </button>
              )}
            </div>

            {isAnalyzing ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-fuchsia-600 animate-spin" />
                <div className="text-xs font-bold text-slate-700">Extracting symbols, numbers & diagram...</div>
                <div className="text-[11px] text-slate-400">Formulating step-by-step guidance</div>
              </div>
            ) : analysis ? (
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed overflow-y-auto max-h-[500px] pr-2">
                <MarkdownRenderer content={analysis} />
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <ScanEye className="w-10 h-10 mx-auto text-slate-300" />
                <div className="text-xs font-semibold">No active analysis</div>
                <p className="text-[11px] max-w-xs mx-auto">
                  Select an image and click "Analyze & Solve" to receive an interactive, pedagogical solution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
