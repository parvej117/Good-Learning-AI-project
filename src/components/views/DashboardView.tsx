import React from 'react';
import { useApp, AppTab } from '../../context/AppContext.tsx';
import {
  Sparkles,
  GraduationCap,
  MessageSquare,
  FileText,
  HelpCircle,
  CalendarCheck,
  Layers,
  Code2,
  Mic,
  ScanEye,
  Search,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Clock,
  BookOpen,
  FolderKanban,
  Target,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    projects,
    conversations,
    documents,
    studyPlans,
    flashcards,
    analytics,
    setActiveTab,
    setActiveConversation,
    setActiveProject,
    toggleStudyTask,
  } = useApp();

  const activePlan = studyPlans[0];
  const activeDeck = flashcards[0];

  const quickTools: {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    tab: AppTab;
  }[] = [
    {
      label: 'Ask AI',
      description: 'Instant answers & bilingual chat',
      icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200/80',
      tab: 'chat',
    },
    {
      label: 'AI Teacher',
      description: 'Socratic step-by-step mastery',
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200/80',
      tab: 'teacher',
    },
    {
      label: 'Upload Document',
      description: 'Summarize & question PDFs/notes',
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200/80',
      tab: 'documents',
    },
    {
      label: 'Generate Quiz',
      description: 'MCQs, exams & instant grading',
      icon: <HelpCircle className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200/80',
      tab: 'quiz',
    },
    {
      label: 'Study Planner',
      description: 'Adaptive daily syllabus milestones',
      icon: <CalendarCheck className="w-5 h-5 text-violet-600" />,
      color: 'bg-violet-50 border-violet-200/80',
      tab: 'study_plan',
    },
    {
      label: 'Flashcards',
      description: 'Spaced repetition recall system',
      icon: <Layers className="w-5 h-5 text-rose-600" />,
      color: 'bg-rose-50 border-rose-200/80',
      tab: 'flashcards',
    },
    {
      label: 'Coding Tutor',
      description: 'Debug, explain & practice code',
      icon: <Code2 className="w-5 h-5 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-200/80',
      tab: 'coding',
    },
    {
      label: 'Voice Tutor',
      description: 'Pronunciation & verbal practice',
      icon: <Mic className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50 border-teal-200/80',
      tab: 'voice',
    },
    {
      label: 'Visual Solver',
      description: 'Solve diagrams, math & homework',
      icon: <ScanEye className="w-5 h-5 text-fuchsia-600" />,
      color: 'bg-fuchsia-50 border-fuchsia-200/80',
      tab: 'vision',
    },
    {
      label: 'Research Assistant',
      description: 'Synthesize reports & citations',
      icon: <Search className="w-5 h-5 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200/80',
      tab: 'research',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Good Learning AI • Personal Learning Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name}! 🚀
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
              Ready to learn smarter today? Your active learning assistant is prepared to guide you through
              guided lessons, active quizzes, and deep conceptual comprehension.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => setActiveTab('teacher')}
              className="px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 active:scale-95 transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Start AI Teacher</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold active:scale-95 transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Chat</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick AI Tools Bento Grid */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Quick AI Tools</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">10 Specialized Mentors</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickTools.map((tool) => (
            <button
              key={tool.label}
              onClick={() => setActiveTab(tool.tab)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-98 ${tool.color}`}
            >
              <div className="p-2 rounded-xl bg-white w-fit shadow-xs mb-3">{tool.icon}</div>
              <div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">{tool.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{tool.description}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Dashboard 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Study Plan & Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Study Plan Card */}
          {activePlan && (
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{activePlan.title}</h3>
                    <p className="text-xs text-slate-500">
                      Target: {activePlan.targetExamDate} • {activePlan.availableHoursPerDay} hrs/day
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-blue-700">{activePlan.progressPercent}%</span>
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${activePlan.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {activePlan.tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleStudyTask(activePlan.id, task.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      task.isCompleted
                        ? 'bg-slate-50/70 border-slate-100 text-slate-400'
                        : 'bg-white hover:bg-blue-50/30 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <button className="mt-0.5 flex-shrink-0">
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{task.description}</div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {task.estimatedMinutes}m
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {activePlan.tasks.filter((t) => t.isCompleted).length} of {activePlan.tasks.length} tasks completed
                </span>
                <button
                  onClick={() => setActiveTab('study_plan')}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Manage Study Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Continue Learning & Recent Conversations */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Continue Learning</span>
              </h3>
              <button
                onClick={() => setActiveTab('chat')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all chats
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {conversations.slice(0, 4).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv);
                    setActiveTab(conv.mode === 'teacher' ? 'teacher' : 'chat');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {conv.mode}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs line-clamp-1">{conv.title}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {conv.messages[conv.messages.length - 1]?.content.slice(0, 100) || 'No messages yet'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                    <span>Resume session</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Workspace Projects */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                <span>Active Learning Projects</span>
              </h3>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                All Projects
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    setActiveProject(proj);
                    setActiveTab('projects');
                  }}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: proj.color || '#2563eb' }}
                    />
                    <span className="font-bold text-xs text-slate-900 truncate">{proj.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{proj.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>{proj.subject}</span>
                    <span className="text-blue-600 font-bold">{proj.progressPercent}% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Study Metrics, Flashcard Review & Documents */}
        <div className="space-y-6">
          {/* Quick Analytics & Performance Box */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Study Performance</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Study Time</span>
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {Math.round(analytics.totalStudyMinutes / 60)}h {analytics.totalStudyMinutes % 60}m
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>Avg. Quiz</span>
                </div>
                <div className="text-lg font-bold text-emerald-600 mt-1">
                  {analytics.averageQuizScore}%
                </div>
              </div>
            </div>

            {/* Weak & Strong Topics diagnostic */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-700">Top Strengths</div>
              <div className="flex flex-wrap gap-1.5">
                {analytics.strongTopics.map((st) => (
                  <span
                    key={st.topic}
                    className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md"
                  >
                    ✓ {st.topic}
                  </span>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-700 mt-3">Target Revision Topics</div>
              <div className="flex flex-wrap gap-1.5">
                {analytics.weakTopics.map((wt) => (
                  <span
                    key={wt.topic}
                    className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md"
                  >
                    ⚠ {wt.topic}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('analytics')}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              View Detailed Analytics
            </button>
          </div>

          {/* Quick Flashcard Review Card */}
          {activeDeck && (
            <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Flashcard Practice</h3>
                    <p className="text-[11px] text-slate-500">{activeDeck.title}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600">{activeDeck.cards.length} cards</span>
              </div>

              {activeDeck.cards[0] && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 my-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Sample Question
                  </span>
                  <p className="text-xs font-semibold text-slate-900 mt-1">{activeDeck.cards[0].front}</p>
                </div>
              )}

              <button
                onClick={() => setActiveTab('flashcards')}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                Start Spaced Repetition Review
              </button>
            </div>
          )}

          {/* Uploaded Documents Preview */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Uploaded Documents</span>
              </h3>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Upload +
              </button>
            </div>

            <div className="space-y-2">
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveTab('documents')}
                  className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                    {doc.type}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 truncate">{doc.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {Math.round(doc.size / 1024)} KB • {doc.keyPoints.length} key takeaways
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
