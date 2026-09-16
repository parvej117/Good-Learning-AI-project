import React, { useState } from 'react';
import { ProjectWorkflowStep } from '../../types/index.ts';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface WorkflowStepsBarProps {
  steps: ProjectWorkflowStep[];
  projectName: string;
}

export const WorkflowStepsBar: React.FC<WorkflowStepsBarProps> = ({ steps, projectName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                12-Step AI Engineering Pipeline
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                {progressPercent}% Complete
              </span>
            </div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{projectName} Architecture Verified</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 hidden md:block">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
          >
            <span>{isExpanded ? 'Hide Steps' : 'Inspect 12 Steps'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-in fade-in duration-200">
          {steps.map((step) => {
            const isDone = step.status === 'completed';
            return (
              <div
                key={step.step}
                className={`p-2.5 rounded-xl border text-xs transition-colors ${
                  isDone
                    ? 'bg-slate-800/60 border-slate-700/80 text-slate-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[11px] text-slate-200 flex items-center justify-between">
                      <span>
                        Step {step.step}: {step.title}
                      </span>
                    </div>
                    {step.titleBn && (
                      <div className="text-[10px] text-blue-400 font-medium">{step.titleBn}</div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {step.details}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
