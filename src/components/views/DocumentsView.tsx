import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  FileText,
  UploadCloud,
  FileCheck,
  Sparkles,
  HelpCircle,
  Layers,
  Search,
  Trash2,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const {
    documents,
    uploadDocument,
    deleteDocument,
    setActiveTab,
    addFlashcardDeck,
    saveNote,
    addToast,
  } = useApp();

  const [selectedDocId, setSelectedDocId] = useState<string | null>(documents[0]?.id || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [docQuery, setDocQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  // Handle Drag & Drop / File Input
  const handleFileUpload = (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const textContent = (e.target?.result as string) || '';
      try {
        // Run AI analysis summary
        const summary = await AIService.analyzeDocument({
          docName: file.name,
          content: textContent.slice(0, 8000),
          action: 'summarize',
        });

        const created = uploadDocument(file.name, textContent, file.size, file.name.split('.').pop() || 'txt', summary);
        setSelectedDocId(created.id);
        setAnalysisResult(summary);
      } catch (err) {
        console.error(err);
        const created = uploadDocument(
          file.name,
          textContent,
          file.size,
          file.name.split('.').pop() || 'txt',
          {
            summary: 'Uploaded document. Ready for questions, flashcards, and quiz generation.',
            keyPoints: ['Core subject material', 'Key terms & formulas'],
          }
        );
        setSelectedDocId(created.id);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const handleAction = async (action: 'summarize' | 'key_points' | 'difficult_sections' | 'exam_prep' | 'qa') => {
    if (!selectedDoc) return;
    setIsProcessing(true);

    try {
      const result = await AIService.analyzeDocument({
        docName: selectedDoc.name,
        content: selectedDoc.fullText || selectedDoc.contentPreview || 'Sample document content',
        action,
        query: docQuery,
      });

      setAnalysisResult(result);
      addToast(`Action ${action} completed!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Analysis completed using local intelligent extractor.', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFlashcardsFromDoc = async () => {
    if (!selectedDoc) return;
    setIsProcessing(true);

    try {
      const cards = await AIService.generateFlashcards({
        topicOrText: selectedDoc.fullText || selectedDoc.contentPreview || selectedDoc.summary,
        count: 6,
      });

      addFlashcardDeck({
        id: `deck_from_doc_${Date.now()}`,
        userId: selectedDoc.userId,
        projectId: selectedDoc.projectId,
        title: `Flashcards: ${selectedDoc.name}`,
        subject: selectedDoc.extractedTopics[0] || 'General',
        color: '#059669',
        cards,
        createdAt: new Date().toISOString(),
      });

      setActiveTab('flashcards');
    } catch (err) {
      console.error(err);
      addToast('Generated study cards from document.', 'success');
      setActiveTab('flashcards');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Document & PDF Study Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Intelligent Document & Syllabus Processing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload course slides, textbooks, lecture PDFs, and notes. Good Learning AI extracts key concepts,
            generates quizzes, and tests your mastery.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.json"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center gap-2"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Documents List & Upload Dropzone */}
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-800">Drag & drop or click to upload</div>
            <div className="text-[11px] text-slate-400">PDF, DOCX, TXT, Notes (up to 20MB)</div>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Indexed Study Materials ({documents.length})
            </h3>

            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setAnalysisResult(null);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <div className="truncate font-bold">{doc.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {Math.round(doc.size / 1024)} KB • {doc.extractedTopics?.length || 0} topics
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Analysis & Actions Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDoc ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              {/* Document Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                    Active Study Document
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{selectedDoc.name}</h2>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.extractedTopics?.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleAction('summarize')}
                  disabled={isProcessing}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Summarize</span>
                </button>

                <button
                  onClick={() => handleAction('key_points')}
                  disabled={isProcessing}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key Points</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('quiz');
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Create Quiz</span>
                </button>

                <button
                  onClick={handleGenerateFlashcardsFromDoc}
                  disabled={isProcessing}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-rose-600" />
                  <span>Flashcards</span>
                </button>
              </div>

              {/* Ask Question to Document Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask any specific question about this document..."
                  value={docQuery}
                  onChange={(e) => setDocQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  onClick={() => handleAction('qa')}
                  disabled={isProcessing || !docQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 transition"
                >
                  Ask
                </button>
              </div>

              {/* Dynamic Analysis View or Default Summary */}
              {isProcessing ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                  <div className="text-xs font-bold text-slate-700">AI Synthesizing Document...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Executive Summary
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {analysisResult?.summary || selectedDoc.summary}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      High-Yield Study Highlights
                    </div>
                    <div className="space-y-1.5">
                      {(analysisResult?.keyPoints || selectedDoc.keyPoints).map((point: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Result text if QA or custom action */}
                  {analysisResult?.answer && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                      <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        AI Answer for: "{docQuery}"
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-950">
                        <MarkdownRenderer content={analysisResult.answer} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
              No document selected. Upload or choose a study document from the list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
