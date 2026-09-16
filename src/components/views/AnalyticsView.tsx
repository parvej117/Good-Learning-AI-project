import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  BarChart3,
  Flame,
  Award,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { analytics, user, quizAttempts } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Learning Intelligence & Progress Tracking</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Student Analytics & Mastery Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track study consistency, quiz retention curves, and pinpoint weak areas for targeted review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{analytics.streakDays} Day Streak</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            <span>{user.xpPoints} Knowledge XP</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Total Study Time</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {Math.round(analytics.totalStudyMinutes / 60)}h {analytics.totalStudyMinutes % 60}m
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">+18% this week</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Average Quiz Accuracy</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {analytics.averageQuizScore}%
          </div>
          <div className="text-[11px] text-slate-400">{analytics.quizzesTaken} evaluations taken</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Topics Mastered</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {analytics.topicsMasteredCount}
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold">Level {user.level} Scholar</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Award className="w-4 h-4 text-rose-600" />
            <span>SRS Cards Reviewed</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {analytics.flashcardsReviewed}
          </div>
          <div className="text-[11px] text-slate-400">Spaced recall cycles</div>
        </div>
      </div>

      {/* Weekly Activity Heatmap / Bar Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Weekly Study Activity</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Daily Active Minutes</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-4">
          {analytics.weeklyActivity.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <div className="w-full bg-slate-100 rounded-xl h-28 flex flex-col justify-end p-1 overflow-hidden">
                <div
                  className="w-full bg-linear-to-t from-blue-600 to-indigo-500 rounded-lg transition-all"
                  style={{ height: `${Math.min(100, (d.minutes / 90) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">{d.day}</span>
              <span className="text-[10px] text-slate-400">{d.minutes}m</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weak vs Strong Area Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Strong Concepts (Mastered)</span>
          </h3>

          <div className="space-y-2">
            {analytics.strongTopics.map((st) => (
              <div
                key={st.topic}
                className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-emerald-950">{st.topic}</span>
                <span className="font-black text-emerald-700">{st.accuracy}% accuracy</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Recommended Revision Areas</span>
          </h3>

          <div className="space-y-2">
            {analytics.weakTopics.map((wt) => (
              <div
                key={wt.topic}
                className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-rose-950">{wt.topic}</span>
                <span className="font-bold text-rose-700">{wt.errorRate}% error rate</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
