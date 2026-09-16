import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  BookOpen,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    activeProject,
    setActiveProject,
    createProject,
    setActiveTab,
    addToast,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [color, setColor] = useState('#2563eb');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createProject(title.trim(), description.trim(), subject.trim(), color);
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Workspace Organization</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Project Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Group your learning sessions, documents, quizzes, and flashcards into isolated subject workspaces.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 active:scale-95 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Create Learning Workspace</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Databases & Consensus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Engineering, Physics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  placeholder="What is the objective of this learning project?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => {
          const isActive = activeProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              className={`bg-white rounded-3xl border p-6 shadow-xs transition flex flex-col justify-between space-y-4 ${
                isActive ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: proj.color || '#2563eb' }}
                    />
                    <h3 className="font-bold text-base text-slate-900">{proj.title}</h3>
                  </div>

                  {isActive && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>
              </div>

              {/* Progress & Quick Links */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{proj.subject}</span>
                  <span className="font-bold text-blue-600">{proj.progressPercent}% Mastered</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setActiveProject(isActive ? null : proj);
                      addToast(isActive ? 'Reset to global workspace' : `Switched to "${proj.title}"`, 'info');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {isActive ? 'Deselect Project' : 'Set as Active Workspace'}
                  </button>

                  <button
                    onClick={() => {
                      setActiveProject(proj);
                      setActiveTab('teacher');
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1"
                  >
                    <span>Start Lesson</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
