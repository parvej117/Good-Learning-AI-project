import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { PWAInstallButton } from '../common/PWAInstallModal.tsx';
import {
  Sparkles,
  Flame,
  Award,
  RefreshCw,
  Wifi,
  WifiOff,
  FolderKanban,
  Volume2,
  VolumeX,
  Menu,
  ChevronDown,
  Plus,
} from 'lucide-react';

export const Header: React.FC<{ onToggleMobileSidebar: () => void }> = ({ onToggleMobileSidebar }) => {
  const {
    user,
    preferences,
    updatePreferences,
    projects,
    activeProject,
    setActiveProject,
    createProject,
    isOnline,
    isSyncing,
    syncWithServer,
    setActiveTab,
  } = useApp();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjSubject, setNewProjSubject] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    createProject(newProjTitle.trim(), '', newProjSubject.trim() || 'General', '#2563eb');
    setNewProjTitle('');
    setNewProjSubject('');
    setShowProjectModal(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 flex items-center justify-between">
      {/* Brand & Left Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 -ml-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 active:scale-95 transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-1.5">
              Good Learning AI
              <span className="hidden sm:inline-block px-1.5 py-0.2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-[10px] font-semibold tracking-wide">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-500 hidden md:inline font-medium">
              Learn Smarter. Understand Deeper. Achieve More.
            </span>
          </div>
        </div>

        {/* Project Context Badge */}
        <div className="relative hidden sm:block ml-2">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
          >
            <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
            <span className="max-w-[120px] truncate">
              {activeProject ? activeProject.title : 'All Projects'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showProjectDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Workspace Projects
              </div>
              <button
                onClick={() => {
                  setActiveProject(null);
                  setShowProjectDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                  !activeProject ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>🌐 All Workspace Items</span>
              </button>

              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProject(p);
                    setShowProjectDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                    activeProject?.id === p.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{p.title}</span>
                  <span className="text-[10px] text-slate-400">{p.subject}</span>
                </button>
              ))}

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowProjectDropdown(false);
                    setShowProjectModal(true);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Project</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls & Stats */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak & XP Gamification */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/80 text-xs">
          <div className="flex items-center gap-1 text-amber-600 font-semibold" title="Daily Learning Streak">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{user.streakDays}d</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-blue-700 font-semibold" title="Knowledge XP Points">
            <Award className="w-4 h-4 text-blue-600" />
            <span>{user.xpPoints} XP</span>
          </div>
        </div>

        {/* Sync & Connectivity status */}
        <button
          onClick={() => syncWithServer()}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          title={isOnline ? 'Synchronized with Cloud' : 'Offline'}
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          ) : isOnline ? (
            <Wifi className="w-4 h-4 text-emerald-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Voice Toggle */}
        <button
          onClick={() => updatePreferences({ voiceEnabled: !preferences.voiceEnabled })}
          className={`p-1.5 rounded-xl transition ${
            preferences.voiceEnabled
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          title={preferences.voiceEnabled ? 'AI Voice Response Enabled' : 'AI Voice Muted'}
        >
          {preferences.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* PWA In-App Install Button */}
        <PWAInstallButton compact />

        {/* User Profile Avatar Trigger */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition"
          title="Account & AI Personalization Settings"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
            {user.name.charAt(0)}
          </div>
        </button>
      </div>

      {/* New Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Learning Project</h3>
            <p className="text-xs text-slate-500 mb-4">
              Group your chats, documents, flashcards, and quizzes under one focused workspace.
            </p>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Python for Data Science or Calculus I"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Domain</label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science, Mathematics, Language"
                  value={newProjSubject}
                  onChange={(e) => setNewProjSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
