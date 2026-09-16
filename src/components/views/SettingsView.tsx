import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Settings,
  User,
  GraduationCap,
  Volume2,
  Globe,
  Download,
  Smartphone,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    setUser,
    preferences,
    updatePreferences,
    exportSessionData,
    openPWAInstallModal,
    addToast,
  } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Application & Pedagogic Preferences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Settings & Learning Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tailor the AI teacher style, manage voice synthesis rates, and configure cross-platform offline backups.
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>Learner Identity</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Account</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-xs cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* AI Teacher Pedagogic Configuration */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>AI Teacher Style & Socratic Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Default Teaching Tone</label>
            <select
              value={preferences.teachingStyle}
              onChange={(e) => updatePreferences({ teachingStyle: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="teacher">Structured Teacher (Balanced rigor & clarity)</option>
              <option value="eli5">ELI5 (Explain Like I'm 5 - Simple Analogies)</option>
              <option value="socratic">Socratic (Questions that guide reasoning)</option>
              <option value="expert">Academic Specialist (Dense, formal proofs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Learning Goal</label>
            <select
              value={preferences.learningLevel}
              onChange={(e) => updatePreferences({ learningLevel: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="beginner">Foundational / Beginner</option>
              <option value="intermediate">Intermediate / College</option>
              <option value="advanced">Advanced / Professional</option>
              <option value="exam_prep">High-Stakes Exam Prep</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voice & Speech Synthesis */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-teal-600" />
          <span>Speech & Audio Tutor Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Voice Playback Speed</label>
            <div className="flex items-center gap-2">
              {[0.8, 1.0, 1.25].map((spd) => (
                <button
                  key={spd}
                  onClick={() => updatePreferences({ voiceSpeed: spd })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                    preferences.voiceSpeed === spd
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {spd}x Speed
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Language</label>
            <select
              value={preferences.language}
              onChange={(e) => updatePreferences({ language: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-hidden focus:border-blue-500"
            >
              <option value="en">English (Global)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>
        </div>
      </div>

      {/* PWA & Native Packaging */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-purple-600" />
          <span>Cross-Platform & Native Android</span>
        </h3>

        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-purple-900">Install Good Learning AI as an App</div>
            <p className="text-xs text-purple-700 mt-0.5">
              Installs locally on Android, ChromeOS, or Windows. Works offline with client caching.
            </p>
          </div>

          <button
            onClick={openPWAInstallModal}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs active:scale-95 transition whitespace-nowrap"
          >
            Install / Add to Home
          </button>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-700" />
          <span>Data Portability & Backup</span>
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportSessionData('json')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete State (JSON)</span>
          </button>

          <button
            onClick={() => exportSessionData('markdown')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Study Notes (Markdown)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
