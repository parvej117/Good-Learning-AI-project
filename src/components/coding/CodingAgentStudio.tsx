import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import {
  FullStackProject,
  GeneratedProjectFile,
  CodingAgentMode,
} from '../../types/index.ts';
import { WorkflowStepsBar } from './WorkflowStepsBar.tsx';
import { ProjectFileExplorer } from './ProjectFileExplorer.tsx';
import { ProjectLivePreview } from './ProjectLivePreview.tsx';
import { ProjectDatabaseView } from './ProjectDatabaseView.tsx';
import { ProjectApiView } from './ProjectApiView.tsx';
import { ProjectSecurityAndDeploy } from './ProjectSecurityAndDeploy.tsx';
import { exportProjectAsZip } from './ProjectZipExporter.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  Code2,
  Sparkles,
  Hammer,
  Pencil,
  Bug,
  GraduationCap,
  Download,
  FolderGit2,
  RefreshCw,
  Send,
  Layers,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Server,
  Database,
  ArrowRight,
  Plus,
  Play,
  Copy,
  Check,
} from 'lucide-react';

export const CodingAgentStudio: React.FC = () => {
  const { addToast } = useApp();

  // Primary Agent Mode
  const [agentMode, setAgentMode] = useState<CodingAgentMode>('build');

  // Active Project State
  const [activeProject, setActiveProject] = useState<FullStackProject | null>(null);
  const [activeFile, setActiveFile] = useState<GeneratedProjectFile | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<
    'code' | 'preview' | 'database' | 'apis' | 'security'
  >('code');

  // Build Mode Inputs
  const [buildPrompt, setBuildPrompt] = useState('');
  const [preferredStack, setPreferredStack] = useState('auto');
  const [includeAdmin, setIncludeAdmin] = useState(true);
  const [includeAuth, setIncludeAuth] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('Initializing agent...');

  // Edit Mode Inputs
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Debug Mode Inputs
  const [debugErrorMsg, setDebugErrorMsg] = useState('');
  const [debugStackTrace, setDebugStackTrace] = useState('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  // Tutor Mode State (Retaining legacy tutor capabilities)
  const [tutorLanguage, setTutorLanguage] = useState('javascript');
  const [tutorAction, setTutorAction] = useState<'explain' | 'debug' | 'improve' | 'practice'>('debug');
  const [tutorCode, setTutorCode] = useState(`function calculateAverage(grades) {
  let sum = 0;
  for (let i = 0; i <= grades.length; i++) {
    sum += grades[i];
  }
  return sum / grades.length;
}`);
  const [tutorQuestion, setTutorQuestion] = useState('Why does this function return NaN?');
  const [isTutorProcessing, setIsTutorProcessing] = useState(false);
  const [tutorResult, setTutorResult] = useState<any>(null);

  // Starter Templates
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    // Load starter templates
    AIService.getCodingTemplates().then((tpls) => {
      if (tpls && tpls.length > 0) setTemplates(tpls);
    });

    // Auto-initialize with a default project (Student Management) if none loaded yet
    handleSelectStarterTemplate({
      title: 'Student Management System',
      prompt: 'একটি পূর্ণাঙ্গ স্টুডেন্ট ম্যানেজমেন্ট সিস্টেম বানাও যেখানে ছাত্রছাত্রী ভর্তি, ক্লাসরুম হাজিরা, গ্রেডশীট এবং অ্যাডমিন ড্যাশবোর্ড থাকবে।',
    });
  }, []);

  const handleSelectStarterTemplate = async (template: { prompt: string; title: string }) => {
    setBuildPrompt(template.prompt);
    setIsGenerating(true);
    setGenerationStepText(`Architecting ${template.title}...`);

    try {
      const project = await AIService.generateFullStackProject({
        requirement: template.prompt,
        preferredStack: 'React + Node + Express + PostgreSQL + Tailwind',
        includeAdmin: true,
        includeAuth: true,
      });

      setActiveProject(project);
      if (project.files && project.files.length > 0) {
        setActiveFile(project.files[0]);
      }
      addToast(`Generated full-stack ${project.name} successfully!`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to generate project', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationStepText('Step 1/12: Analyzing requirements & architectural patterns...');

    const interval = setInterval(() => {
      setGenerationStepText((prev) => {
        if (prev.includes('Step 1')) return 'Step 4/12: Synthesizing database schema & migrations...';
        if (prev.includes('Step 4')) return 'Step 6/12: Generating Laravel-like controllers & views...';
        if (prev.includes('Step 6')) return 'Step 9/12: Validating APIs, auth guards & tests...';
        return 'Step 12/12: Finalizing deployment manifests & security audit...';
      });
    }, 1200);

    try {
      const project = await AIService.generateFullStackProject({
        requirement: buildPrompt,
        preferredStack: preferredStack === 'auto' ? undefined : preferredStack,
        includeAdmin,
        includeAuth,
      });

      setActiveProject(project);
      if (project.files && project.files.length > 0) {
        setActiveFile(project.files[0]);
      }
      addToast(`Full-stack project "${project.name}" generated!`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to generate project', 'error');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || !activeProject) return;

    setIsEditing(true);
    try {
      const res = await AIService.editProject({
        requirement: editPrompt,
        currentFiles: activeProject.files,
        currentStack: activeProject.techStack,
      });

      if (res && res.updatedFiles) {
        // Merge or replace updated files
        const newFilesList = [...activeProject.files];
        res.updatedFiles.forEach((upFile: GeneratedProjectFile) => {
          const idx = newFilesList.findIndex((f) => f.path === upFile.path);
          if (idx !== -1) {
            newFilesList[idx] = { ...newFilesList[idx], ...upFile, isModified: true };
          } else {
            newFilesList.push({ ...upFile, isNew: true });
          }
        });

        const updatedProject: FullStackProject = {
          ...activeProject,
          files: newFilesList,
          changeSummary: res.changeSummary || activeProject.changeSummary,
          updatedAt: new Date().toISOString(),
        };

        setActiveProject(updatedProject);
        if (res.updatedFiles.length > 0) {
          setActiveFile(res.updatedFiles[0]);
        }
        setEditPrompt('');
        addToast('Project updated successfully with requested features!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to update project', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDebugError = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debugErrorMsg.trim()) return;

    setIsDebugging(true);
    try {
      const res = await AIService.debugProject({
        errorMessage: debugErrorMsg,
        stackTrace: debugStackTrace,
        currentFiles: activeProject?.files || [],
      });

      setDebugResult(res);
      addToast('Debug analysis & patch synthesized!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to debug error', 'error');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleApplyDebugPatch = () => {
    if (!debugResult || !debugResult.fixedFiles || !activeProject) return;

    const newFilesList = [...activeProject.files];
    debugResult.fixedFiles.forEach((fixedFile: GeneratedProjectFile) => {
      const idx = newFilesList.findIndex((f) => f.path === fixedFile.path);
      if (idx !== -1) {
        newFilesList[idx] = { ...newFilesList[idx], ...fixedFile, isModified: true };
      } else {
        newFilesList.push({ ...fixedFile, isNew: true });
      }
    });

    setActiveProject({ ...activeProject, files: newFilesList });
    setActiveFile(debugResult.fixedFiles[0]);
    setDebugResult(null);
    addToast('Debug patch applied to active project files!', 'success');
  };

  const handleRunTutor = async () => {
    if (!tutorCode.trim()) return;
    setIsTutorProcessing(true);
    try {
      const res = await AIService.codeTutor({
        code: tutorCode,
        language: tutorLanguage,
        action: tutorAction,
        question: tutorQuestion,
      });
      setTutorResult(res);
      addToast('Coding mentor analysis ready!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Tutor analysis completed.', 'info');
    } finally {
      setIsTutorProcessing(false);
    }
  };

  const handleExportZip = async () => {
    if (!activeProject) return;
    try {
      await exportProjectAsZip(activeProject);
      addToast(`Downloaded ${activeProject.name}.zip successfully!`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to export ZIP package', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mb-2 border border-blue-500/30">
              <Code2 className="w-4 h-4" />
              <span>Good Learning AI • Full-Stack AI Coding Agent</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              AI Software Development Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Generate production-ready web apps from natural language (Bengali/English), with Laravel-like
              structured architecture, relational databases, APIs, authentication, admin panels, and live
              sandbox previews.
            </p>
          </div>

          {/* Quick Action Buttons */}
          {activeProject && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportZip}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                title="Download full project as ZIP archive"
              >
                <Download className="w-4 h-4" />
                <span>Export ZIP</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Core Modes Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setAgentMode('build')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              agentMode === 'build'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Hammer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Build Mode</div>
              <div className="text-[10px] opacity-80">Generate new project</div>
            </div>
          </button>

          <button
            onClick={() => setAgentMode('edit')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              agentMode === 'edit'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Edit Mode</div>
              <div className="text-[10px] opacity-80">Add feature to project</div>
            </div>
          </button>

          <button
            onClick={() => setAgentMode('debug')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              agentMode === 'debug'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Debug Mode</div>
              <div className="text-[10px] opacity-80">Analyze error logs</div>
            </div>
          </button>

          <button
            onClick={() => setAgentMode('tutor')}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
              agentMode === 'tutor'
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">Coding Tutor</div>
              <div className="text-[10px] opacity-80">Learn algorithms & Big-O</div>
            </div>
          </button>
        </div>
      </div>

      {/* MODE 1: BUILD MODE CONTROLS */}
      {agentMode === 'build' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Generate Full-Stack Project from Natural Language
              </h2>
            </div>
            <span className="text-xs text-slate-500">Supports Bengali (বাংলা) & English</span>
          </div>

          <form onSubmit={handleGenerateProject} className="space-y-4">
            <div>
              <textarea
                rows={3}
                required
                value={buildPrompt}
                onChange={(e) => setBuildPrompt(e.target.value)}
                placeholder="বাংলা বা ইংরেজিতে আপনার প্রয়োজনীয়তা লিখুন... যেমন: 'একটি অনলাইন কোর্স ওয়েবসাইট বানাও যেখানে স্টুডেন্ট রেজিস্ট্রেশন করবে, কোর্স ভিডিও দেখবে, পেমেন্ট করবে এবং কোর্স শেষ করলে সার্টিফিকেট পাবে।' অথবা 'একটি দোকানের হিসাবের সফটওয়্যার বানাও (POS/ইনভেন্টরি, কাস্টমার বাকি খাতা, লাভ-ক্ষতি হিসাব)'"
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>

            {/* Config Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Tech Stack:</span>
                  <select
                    value={preferredStack}
                    onChange={(e) => setPreferredStack(e.target.value)}
                    className="p-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800"
                  >
                    <option value="auto">✨ Smart Selection (AI Recommended)</option>
                    <option value="React + Node + Express + PostgreSQL + Tailwind">
                      React + Node/Express + PostgreSQL + Tailwind
                    </option>
                    <option value="React + Node + Express + SQLite + Tailwind">
                      React + Node/Express + SQLite (Lightweight)
                    </option>
                    <option value="Next.js + Prisma + PostgreSQL + Tailwind">
                      Next.js + Prisma + PostgreSQL
                    </option>
                    <option value="Laravel + Blade + MySQL + Bootstrap">
                      PHP / Laravel + MySQL
                    </option>
                    <option value="FastAPI + Python + PostgreSQL + Vue">
                      Python FastAPI + PostgreSQL
                    </option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={includeAdmin}
                    onChange={(e) => setIncludeAdmin(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Admin Panel</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={includeAuth}
                    onChange={(e) => setIncludeAuth(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Authentication & RBAC</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !buildPrompt.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{generationStepText}</span>
                  </>
                ) : (
                  <>
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Generate Full-Stack Project</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Starter Project Templates */}
          {templates.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Instant Starter Templates (Click to Load):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectStarterTemplate(tpl)}
                    className="p-3 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/50 text-left transition group space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition">
                        {tpl.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {tpl.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-600 font-medium">{tpl.titleBn}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2">{tpl.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: EDIT MODE CONTROLS */}
      {agentMode === 'edit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Modify or Add Features to Active Project ({activeProject?.name || 'No Project Loaded'})
              </h2>
            </div>
            <span className="text-xs text-slate-500">Surgical code modifications</span>
          </div>

          <form onSubmit={handleEditProject} className="space-y-3">
            <textarea
              rows={2}
              required
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g., 'Add bKash & Nagad payment gateway to checkout', 'Add PDF certificate download button', 'Add dark mode toggle in navbar'..."
              className="w-full p-3 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isEditing || !editPrompt.trim() || !activeProject}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
              >
                {isEditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Applying Modifications...' : 'Apply Feature Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODE 3: DEBUG MODE CONTROLS */}
      {agentMode === 'debug' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Self-Debugging: Analyze Error Logs & Auto-Patch
              </h2>
            </div>
            <span className="text-xs text-slate-500">Root cause detection in English & Bengali</span>
          </div>

          <form onSubmit={handleDebugError} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Error Message / Problem</label>
              <input
                type="text"
                required
                placeholder="e.g. UnhandledPromiseRejection: Cannot read properties of undefined (reading 'body')"
                value={debugErrorMsg}
                onChange={(e) => setDebugErrorMsg(e.target.value)}
                className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Stack Trace / Code Context (Optional)</label>
              <textarea
                rows={3}
                placeholder="Paste terminal stack trace or snippet..."
                value={debugStackTrace}
                onChange={(e) => setDebugStackTrace(e.target.value)}
                className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {/* Quick sample error */}
              <button
                type="button"
                onClick={() => {
                  setDebugErrorMsg('UnhandledPromiseRejection: StudentController.index failed at async query');
                  setDebugStackTrace('TypeError: Cannot read properties of undefined\n  at StudentController.index (/app/controllers/StudentController.ts:24)');
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Insert sample error log
              </button>

              <button
                type="submit"
                disabled={isDebugging || !debugErrorMsg.trim()}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
              >
                {isDebugging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bug className="w-3.5 h-3.5" />}
                <span>{isDebugging ? 'Diagnosing Bug...' : 'Diagnose & Generate Patch'}</span>
              </button>
            </div>
          </form>

          {/* Debug Result Card */}
          {debugResult && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs text-amber-300">
                    Diagnosed in {debugResult.affectedFile}:{debugResult.lineNumber || 1}
                  </span>
                </div>
                <button
                  onClick={handleApplyDebugPatch}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply Patch to Project</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-slate-300">Root Cause:</div>
                <div className="text-slate-400">{debugResult.rootCause}</div>
                {debugResult.rootCauseBn && (
                  <div className="text-blue-400 font-medium">{debugResult.rootCauseBn}</div>
                )}
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <div className="font-semibold text-slate-300">Explanation:</div>
                <div className="text-slate-400 leading-relaxed">{debugResult.explanation}</div>
                {debugResult.explanationBn && (
                  <div className="text-blue-300/90 leading-relaxed">{debugResult.explanationBn}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 4: CODING TUTOR CONTROLS */}
      {agentMode === 'tutor' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Interactive Programming Mentor & Algorithm Tutor
              </h2>
            </div>
            <span className="text-xs text-slate-500">Big-O, Clean Code & Debugging</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Language</label>
              <select
                value={tutorLanguage}
                onChange={(e) => setTutorLanguage(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="python">Python</option>
                <option value="sql">SQL (PostgreSQL / MySQL)</option>
                <option value="php">PHP / Laravel</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Tutoring Goal</label>
              <select
                value={tutorAction}
                onChange={(e) => setTutorAction(e.target.value as any)}
                className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="debug">Find & Fix Bug (Debug)</option>
                <option value="explain">Explain Line-by-Line</option>
                <option value="improve">Optimize Complexity (Big-O)</option>
                <option value="practice">Generate Practice Challenge</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Question (Optional)</label>
              <input
                type="text"
                placeholder="What specifically confuses you?"
                value={tutorQuestion}
                onChange={(e) => setTutorQuestion(e.target.value)}
                className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Code Snippet</label>
            <textarea
              rows={5}
              value={tutorCode}
              onChange={(e) => setTutorCode(e.target.value)}
              className="w-full mt-1 p-3 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunTutor}
              disabled={isTutorProcessing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
            >
              {isTutorProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Ask Programming Mentor</span>
            </button>
          </div>

          {tutorResult && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Tutor Explanation:</h4>
              <div className="text-xs text-slate-300 leading-relaxed">
                <MarkdownRenderer content={tutorResult.analysis} />
              </div>
              {tutorResult.correctedCode && (
                <div className="space-y-1 pt-2">
                  <div className="text-xs font-semibold text-emerald-400">Corrected & Optimal Code:</div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto">
                    <code>{tutorResult.correctedCode}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE PROJECT WORKSPACE */}
      {activeProject && (
        <div className="space-y-5">
          {/* Active Project Title & Metadata Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{activeProject.name}</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
                  {activeProject.architectureType.toUpperCase()} ARCHITECTURE
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                {activeProject.description}
              </p>
              {activeProject.summaryBn && (
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  {activeProject.summaryBn}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono">
                {activeProject.techStack.frontend}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono">
                {activeProject.techStack.backend}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono">
                {activeProject.techStack.database}
              </span>
            </div>
          </div>

          {/* 12-Step Pipeline Progress Indicator */}
          <WorkflowStepsBar
            steps={activeProject.workflowSteps}
            projectName={activeProject.name}
          />

          {/* Sub-view Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveProjectTab('code')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeProjectTab === 'code'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>File Explorer & Code ({activeProject.files.length})</span>
            </button>

            <button
              onClick={() => setActiveProjectTab('preview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeProjectTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Play className="w-4 h-4 text-emerald-500" />
              <span>Live Applet Sandbox Preview</span>
            </button>

            <button
              onClick={() => setActiveProjectTab('database')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeProjectTab === 'database'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database & Migrations</span>
            </button>

            <button
              onClick={() => setActiveProjectTab('apis')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeProjectTab === 'apis'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>REST APIs ({activeProject.apis.length})</span>
            </button>

            <button
              onClick={() => setActiveProjectTab('security')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeProjectTab === 'security'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Security, Tests & Deploy</span>
            </button>
          </div>

          {/* Active Sub-View Panels */}
          {activeProjectTab === 'code' && (
            <ProjectFileExplorer
              files={activeProject.files}
              activeFile={activeFile || activeProject.files[0]}
              onSelectFile={(f) => setActiveFile(f)}
            />
          )}

          {activeProjectTab === 'preview' && (
            <ProjectLivePreview project={activeProject} />
          )}

          {activeProjectTab === 'database' && (
            <ProjectDatabaseView database={activeProject.database} />
          )}

          {activeProjectTab === 'apis' && (
            <ProjectApiView apis={activeProject.apis} />
          )}

          {activeProjectTab === 'security' && (
            <ProjectSecurityAndDeploy project={activeProject} />
          )}
        </div>
      )}
    </div>
  );
};
