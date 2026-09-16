import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { Quiz, QuizQuestion } from '../../types/index.ts';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const QuizExamView: React.FC = () => {
  const { user, recordQuizAttempt, addToast, setActiveTab } = useApp();

  // Configuration state
  const [topic, setTopic] = useState('Progressive Web Apps and Service Worker Architecture');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isExamMode, setIsExamMode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(300);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());

  // Timer countdown for Exam Mode
  useEffect(() => {
    if (!isExamMode || !activeQuiz || submitted) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamMode, activeQuiz, submitted]);

  const handleGenerateQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const generatedQuestions = await AIService.generateQuiz({
        topic: topic.trim(),
        count: questionCount,
        difficulty,
        questionTypes: ['mcq', 'true_false', 'short_answer'],
      });

      const newQuiz: Quiz = {
        id: `quiz_${Date.now()}`,
        userId: user.id,
        title: `${topic} Assessment`,
        subject: 'Computer Science',
        difficulty,
        timeLimitMinutes: isExamMode ? Math.max(5, questionCount * 2) : undefined,
        isExamMode,
        createdAt: new Date().toISOString(),
        questions: generatedQuestions,
      };

      setActiveQuiz(newQuiz);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setSubmitted(false);
      setTimeRemainingSeconds((newQuiz.timeLimitMinutes || 5) * 60);
      setQuizStartTime(Date.now());
      addToast(`Generated ${newQuiz.questions.length} questions! Quiz started.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Could not generate quiz. Check network/API.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: any) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz || submitted) return;

    setSubmitted(true);
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);

    let correctCount = 0;
    const weakList: string[] = [];
    const strongList: string[] = [];

    activeQuiz.questions.forEach((q) => {
      const studentAns = userAnswers[q.id];
      const isCorrect = String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

      if (isCorrect) {
        correctCount += 1;
        if (q.topicTag) strongList.push(q.topicTag);
      } else {
        if (q.topicTag) weakList.push(q.topicTag);
      }
    });

    const percentage = Math.round((correctCount / activeQuiz.questions.length) * 100);

    recordQuizAttempt({
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      userId: user.id,
      score: correctCount,
      totalQuestions: activeQuiz.questions.length,
      percentage,
      timeSpentSeconds: timeSpent,
      answers: userAnswers,
      weakTopics: Array.from(new Set(weakList)),
      strongTopics: Array.from(new Set(strongList)),
    });
  };

  // Format timer seconds into mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const currentQ: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Active Knowledge Evaluation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Quiz & Exam Simulation Mode
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Test your understanding through AI-generated multiple choice, true/false, and short answer questions
            with diagnostic weak-topic analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExamMode(!isExamMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              isExamMode
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {isExamMode ? '⏱ Exam Mode Active' : 'Practice Mode'}
          </button>
        </div>
      </div>

      {/* Generator Configuration (if no quiz or resetting) */}
      {!activeQuiz && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Create New Assessment</h3>
          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Subject</label>
              <input
                type="text"
                placeholder="e.g., Python Data Structures, Cell Biology, Thermodynamics..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-amber-500"
                >
                  <option value="beginner">Beginner (Foundational)</option>
                  <option value="intermediate">Intermediate (Standard)</option>
                  <option value="advanced">Advanced (Deep Conceptual)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-amber-500"
                >
                  <option value={3}>3 Questions (Quick Sprint)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={10}>10 Questions (Comprehensive Exam)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Personalized Quiz</span>
            </button>
          </form>
        </div>
      )}

      {/* Active Quiz Card */}
      {activeQuiz && (
        <div className="space-y-4">
          {/* Status Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">{activeQuiz.title}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                {activeQuiz.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isExamMode && !submitted && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-xl text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>{formatTime(timeRemainingSeconds)}</span>
                </div>
              )}

              <button
                onClick={() => setActiveQuiz(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Reset / New
              </button>
            </div>
          </div>

          {/* Question Navigator Palette */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1">
            {activeQuiz.questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = userAnswers[q.id] !== undefined;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                      : isAnswered
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          {currentQ && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                </span>
                {currentQ.topicTag && (
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {currentQ.topicTag}
                  </span>
                )}
              </div>

              <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {currentQ.question}
              </div>

              {/* Options */}
              {currentQ.options && currentQ.options.length > 0 ? (
                <div className="space-y-2.5">
                  {currentQ.options.map((option, oIdx) => {
                    const selected = userAnswers[currentQ.id] === oIdx || userAnswers[currentQ.id] === option;
                    const isCorrectAnswer =
                      currentQ.correctAnswer === oIdx ||
                      String(currentQ.correctAnswer).toLowerCase() === option.toLowerCase();

                    let optionStyle = 'bg-slate-50/60 border-slate-200 hover:bg-amber-50/30 text-slate-800';
                    if (selected && !submitted) {
                      optionStyle = 'bg-amber-100/70 border-amber-400 text-amber-950 font-bold';
                    } else if (submitted) {
                      if (isCorrectAnswer) {
                        optionStyle = 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-bold';
                      } else if (selected && !isCorrectAnswer) {
                        optionStyle = 'bg-rose-100/70 border-rose-400 text-rose-950 font-bold';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectAnswer(currentQ.id, oIdx)}
                        disabled={submitted}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center gap-3 ${optionStyle}`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {submitted && isCorrectAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {submitted && selected && !isCorrectAnswer && (
                          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Short answer input */
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Type your answer here..."
                    value={userAnswers[currentQ.id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQ.id, e.target.value)}
                    disabled={submitted}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-amber-500"
                  />
                  {submitted && (
                    <div className="text-xs text-slate-600">
                      <strong>Expected Answer:</strong> {currentQ.correctAnswer}
                    </div>
                  )}
                </div>
              )}

              {/* Immediate Feedback in Practice Mode or After Submission */}
              {(submitted || (!isExamMode && userAnswers[currentQ.id] !== undefined)) && currentQ.explanation && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-blue-950 space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Explanation & Pedagogic Insight</span>
                  </div>
                  <p className="leading-relaxed text-blue-900/90">{currentQ.explanation}</p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  !submitted && (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Quiz for Grading</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Submission Result Diagnostic Card */}
          {submitted && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Diagnostic Performance Report</h3>
                  <p className="text-xs text-slate-500">Comprehensive weak-topic breakdown & recommendations</p>
                </div>
                <button
                  onClick={() => setActiveTab('study_plan')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Generate Targeted Study Plan →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-xs font-semibold text-emerald-700">Accuracy Score</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    {Math.round(
                      (Object.keys(userAnswers).filter(
                        (k) =>
                          String(userAnswers[k]).toLowerCase() ===
                          String(activeQuiz.questions.find((q) => q.id === k)?.correctAnswer).toLowerCase()
                      ).length /
                        activeQuiz.questions.length) *
                        100
                    )}
                    %
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-xs font-semibold text-blue-700">XP Points Earned</div>
                  <div className="text-2xl font-black text-blue-900 mt-1">
                    +{Math.round(activeQuiz.questions.length * 25)} XP
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-xs font-semibold text-amber-700">Study Pace</div>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    {Math.round((Date.now() - quizStartTime) / 1000)}s Total
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
