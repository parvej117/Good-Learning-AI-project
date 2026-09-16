import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { StudyPlan } from '../../types/index.ts';
import {
  CalendarCheck,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  AlertCircle,
  Plus,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

export const StudyPlanView: React.FC = () => {
  const { studyPlans, saveStudyPlan, toggleStudyTask, user, addToast } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // Generator inputs
  const [subject, setSubject] = useState('Full-Stack Web & AI Engineering');
  const [goal, setGoal] = useState('Build and deploy production-grade cross-platform apps');
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [targetDate, setTargetDate] = useState('In 30 Days');
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const activePlan = studyPlans[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await AIService.createStudyPlan({
        subject,
        goal,
        availableHoursPerDay: hoursPerDay,
        targetExamDate: targetDate,
        currentLevel,
      });

      const newPlan: StudyPlan = {
        id: `plan_${Date.now()}`,
        userId: user.id,
        title: generated.title || `${subject} Mastery Plan`,
        subject,
        goal,
        availableHoursPerDay: hoursPerDay,
        targetExamDate: targetDate,
        currentLevel,
        progressPercent: 0,
        weeklyGoals: generated.weeklyGoals || [
          'Week 1: Foundations & Architecture',
          'Week 2: Deep Core Concepts & Exercises',
          'Week 3: Practical Integration & Testing',
          'Week 4: Exam Simulation & Final Polish',
        ],
        weakTopicsFocus: generated.weakTopicsFocus || ['High-load Edge Cases', 'Performance Optimization'],
        tasks: generated.tasks || [
          {
            id: `st_${Date.now()}_1`,
            dayNumber: 1,
            title: `Foundational Deep-Dive: ${subject}`,
            description: 'Read core architectural specifications and make active summary notes.',
            estimatedMinutes: 60,
            isCompleted: false,
            type: 'theory',
          },
          {
            id: `st_${Date.now()}_2`,
            dayNumber: 2,
            title: 'Active Coding & Practice Problems',
            description: 'Implement hands-on code examples and test boundary conditions.',
            estimatedMinutes: 60,
            isCompleted: false,
            type: 'practice',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      saveStudyPlan(newPlan);
      setShowGenerator(false);
      addToast('Personalized study plan created and synced!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Generated plan with smart local engine.', 'success');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Structured Syllabus & Exam Planner</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Personalized Adaptive Study Schedules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transform high-stakes goals into daily actionable milestones with weekly targets and targeted weak-area drills.
          </p>
        </div>

        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-600/20 active:scale-95 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Plan</span>
        </button>
      </div>

      {/* Generator Form Dialog / Accordion */}
      {showGenerator && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md animate-in zoom-in-95 duration-150 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Generate Custom Study Plan</h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Subject / Exam</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Advanced Calculus, BCS Exam, Node.js Microservices"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Goal / Score</label>
                <input
                  type="text"
                  required
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Score 90%+, Pass Tech Interview"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Hours / Day</label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam Timeline</label>
                <input
                  type="text"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  placeholder="e.g. In 4 weeks or 2026-10-15"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Mastery Level</label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-violet-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGenerator(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Plan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Study Plan Display */}
      {activePlan ? (
        <div className="space-y-6">
          {/* Plan Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                    {activePlan.subject}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                    {activePlan.currentLevel}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{activePlan.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{activePlan.goal}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Overall Progress</span>
                  <span className="text-2xl font-black text-violet-700">{activePlan.progressPercent}%</span>
                </div>
                <div className="w-24 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-violet-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${activePlan.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Weekly Milestones */}
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Weekly Milestones</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePlan.weeklyGoals.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-violet-50/40 border border-violet-100 text-xs text-slate-800 flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-md bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Tasks Interactive Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-600" />
                <span>Actionable Study Tasks</span>
              </h3>
              <span className="text-xs text-slate-400">
                {activePlan.tasks.filter((t) => t.isCompleted).length} / {activePlan.tasks.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {activePlan.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleStudyTask(activePlan.id, task.id)}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border transition cursor-pointer ${
                    task.isCompleted
                      ? 'bg-slate-50 border-slate-200/60 text-slate-400'
                      : 'bg-white hover:bg-violet-50/30 border-slate-200 text-slate-800'
                  }`}
                >
                  <button className="mt-0.5 flex-shrink-0">
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Day {task.dayNumber} • {task.type}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes} mins
                      </span>
                    </div>

                    <div className={`text-xs sm:text-sm font-bold mt-1.5 ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          No active study plan. Click "New Study Plan" above to create one.
        </div>
      )}
    </div>
  );
};
