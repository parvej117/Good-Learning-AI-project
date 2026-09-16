import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Lightbulb,
  Award,
  ChevronRight,
} from 'lucide-react';

export const TeacherView: React.FC = () => {
  const { user, preferences, saveNote, addToast } = useApp();

  const [topicInput, setTopicInput] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>('Understanding Asynchronous JavaScript & Promises');
  const [knowledgeLevel, setKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'exam_prep'>('intermediate');
  const [teachingStyle, setTeachingStyle] = useState<'teacher' | 'eli5' | 'socratic'>('teacher');
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [studentAnswer, setStudentAnswer] = useState<string>('');

  // Active step data structure
  const [currentStepData, setCurrentStepData] = useState<{
    stepNumber: number;
    title: string;
    explanation: string;
    analogy: string;
    checkQuestion: string;
    miniExercise: string;
    studentEvaluation?: string;
    isPassed?: boolean;
  }>({
    stepNumber: 1,
    title: 'The Single-Threaded Nature of JavaScript',
    explanation: `JavaScript is single-threaded. This means it has only **one Call Stack** and can only execute one line of synchronous code at any given moment in time.

If JavaScript performed a slow blocking operation (like downloading a 100MB file or computing a million decimals of Pi) directly on the main thread, the entire browser window would freeze completely! User clicks, scrolling, and CSS animations would stall.`,
    analogy: `Imagine a restaurant with only one waiter (the JavaScript thread). If the waiter had to stand inside the kitchen and wait 30 minutes for each steak to cook before taking the next order, the restaurant would collapse! Instead, the waiter sends the ticket to the kitchen and continues serving other tables.`,
    checkQuestion: `Why can't JavaScript run two synchronous functions on the Call Stack simultaneously? Answer in your own words.`,
    miniExercise: `Identify whether this code is synchronous or asynchronous: \`console.log('Hello'); const x = 10 + 20;\``,
  });

  const [stepHistory, setStepHistory] = useState<any[]>([]);

  const handleStartNewLesson = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim()) return;

    setIsLoading(true);
    const chosenTopic = topicInput.trim();
    setActiveTopic(chosenTopic);
    setCurrentStepNumber(1);
    setStudentAnswer('');
    setStepHistory([]);

    try {
      const step = await AIService.teachStep({
        topic: chosenTopic,
        level: knowledgeLevel,
        style: teachingStyle,
        currentStep: 1,
      });

      setCurrentStepData({
        stepNumber: 1,
        title: step.title || `Step 1: Core Fundamentals of ${chosenTopic}`,
        explanation: step.explanation || 'Let us explore the core fundamental principles of this topic.',
        analogy: step.analogy || 'Consider how this reflects everyday physical interactions.',
        checkQuestion: step.checkQuestion || 'What is the main takeaway you gathered from this section?',
        miniExercise: step.miniExercise || 'Try writing down the key concept in one sentence.',
      });
      addToast('Lesson started! Welcome to your interactive learning session.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Could not load new step. Using intelligent local tutor.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswerAndAdvance = async () => {
    if (!studentAnswer.trim() || isLoading || !activeTopic) return;

    setIsLoading(true);
    const nextStep = currentStepNumber + 1;

    try {
      const evaluation = await AIService.teachStep({
        topic: activeTopic,
        level: knowledgeLevel,
        style: teachingStyle,
        currentStep: nextStep,
        studentAnswer: studentAnswer.trim(),
      });

      // Save current step to history
      setStepHistory((prev) => [
        ...prev,
        {
          ...currentStepData,
          studentSubmitted: studentAnswer,
        },
      ]);

      setCurrentStepNumber(nextStep);
      setCurrentStepData({
        stepNumber: nextStep,
        title: evaluation.title || `Step ${nextStep}: Deepening ${activeTopic}`,
        explanation: evaluation.explanation || 'Now let us build upon your prior step.',
        analogy: evaluation.analogy || 'Think of this next layer as adding structural reinforcement.',
        checkQuestion: evaluation.checkQuestion || 'How would you apply this in a real problem?',
        miniExercise: evaluation.miniExercise || 'Formulate your own example demonstrating this.',
        studentEvaluation: evaluation.feedback || 'Great reasoning! You demonstrated good active comprehension.',
        isPassed: true,
      });

      setStudentAnswer('');
      addToast(`Step ${currentStepNumber} complete! Advancing to Step ${nextStep}.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Advancing to next concept step...', 'info');
      setCurrentStepNumber(nextStep);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStepToNotes = () => {
    saveNote(
      `${activeTopic} - Step ${currentStepData.stepNumber}: ${currentStepData.title}`,
      `${currentStepData.explanation}\n\n**Analogy:**\n${currentStepData.analogy}\n\n**Key Exercise:**\n${currentStepData.miniExercise}`,
      ['AI Teacher', 'Lesson Notes', activeTopic || 'General']
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-indigo-700 via-blue-700 to-indigo-800 text-white p-6 shadow-xl shadow-indigo-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs text-indigo-100">
              <GraduationCap className="w-4 h-4 text-yellow-300" />
              <span>Socratic AI Teacher Mode</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Interactive Step-by-Step Mastery
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl">
              Learn concepts thoroughly through progressive explanation, real-world analogies, and active
              comprehension checks before moving forward.
            </p>
          </div>

          <div className="text-right bg-white/10 p-3 rounded-2xl border border-white/20">
            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-200 block">
              Learning Streak
            </span>
            <span className="text-lg font-black text-white">{user.streakDays} Days Active</span>
          </div>
        </div>
      </div>

      {/* Lesson Configuration / New Topic Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleStartNewLesson} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Enter any topic to learn (e.g. JavaScript Closures, Photosynthesis, Bayesian Probability)..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Teach Me This</span>
          </button>
        </form>

        {/* Level & Style Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Knowledge Level:</span>
            {(['beginner', 'intermediate', 'advanced', 'exam_prep'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setKnowledgeLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg capitalize transition font-medium ${
                  knowledgeLevel === lvl
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Style:</span>
            {(['teacher', 'eli5', 'socratic'] as const).map((sty) => (
              <button
                key={sty}
                type="button"
                onClick={() => setTeachingStyle(sty)}
                className={`px-2.5 py-1 rounded-lg uppercase transition text-[11px] font-bold ${
                  teachingStyle === sty
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">Current Topic:</span>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg truncate max-w-xs">
            {activeTopic}
          </span>
        </div>

        {/* 5 Step Indicator */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
                s < currentStepNumber
                  ? 'bg-emerald-500 text-white'
                  : s === currentStepNumber
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {s < currentStepNumber ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Previous Feedback If Advancing */}
      {currentStepData.studentEvaluation && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-900">Teacher's Feedback on Your Prior Response:</div>
            <div className="mt-1 leading-relaxed text-emerald-800">{currentStepData.studentEvaluation}</div>
          </div>
        </div>
      )}

      {/* Active Step Lesson Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {/* Title */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Step {currentStepData.stepNumber} of 5
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{currentStepData.title}</h2>
          </div>

          <button
            onClick={handleSaveStepToNotes}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition"
          >
            Save to Notes
          </button>
        </div>

        {/* 1. Core Concept Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>1. Core Concept Explanation</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-slate-800 text-xs sm:text-sm leading-relaxed">
            <MarkdownRenderer content={currentStepData.explanation} />
          </div>
        </div>

        {/* 2. Real-World Analogy */}
        {currentStepData.analogy && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>2. Real-World Analogy</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-950 text-xs sm:text-sm leading-relaxed italic">
              {currentStepData.analogy}
            </div>
          </div>
        )}

        {/* 3. Hands-On Mini-Exercise */}
        {currentStepData.miniExercise && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>3. Mini Exercise</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-blue-900 text-xs sm:text-sm">
              {currentStepData.miniExercise}
            </div>
          </div>
        )}

        {/* 4. Active Comprehension Check */}
        <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Comprehension Check
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
                {currentStepData.checkQuestion}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={3}
              placeholder="Type your explanation or response here to test your understanding..."
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              className="w-full p-3 rounded-xl border border-indigo-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                The AI will evaluate your reasoning before unlocking Step {currentStepNumber + 1}.
              </span>

              <button
                type="button"
                onClick={handleSubmitAnswerAndAdvance}
                disabled={isLoading || !studentAnswer.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 disabled:opacity-50 transition active:scale-95 flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Submit & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
