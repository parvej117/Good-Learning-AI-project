import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  BookOpen,
  Plus,
  Trash2,
  Download,
  Search,
  Tag,
  Pin,
  Sparkles,
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { notes, saveNote, deleteNote, exportSessionData, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || n.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveNote(newTitle.trim(), newContent.trim(), tagsArray);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsCreating(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Personal Knowledge Base & Notes</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Study Notes & Saved AI Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture lesson takeaways, save problem solutions, organize by tags, and export anywhere.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSessionData('markdown')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
            title="Export all notes to Markdown"
          >
            <Download className="w-4 h-4" />
            <span>Export Notes</span>
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Creation Modal / Drawer */}
      {isCreating && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-900">Write New Knowledge Note</h3>
          <form onSubmit={handleCreateNote} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Asynchronous Microtasks vs Macrotasks"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content (Markdown supported)</label>
              <textarea
                rows={6}
                required
                placeholder="Type your notes, code snippets, or key concepts here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. JavaScript, Architecture, Revision"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search notes and tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedTag === null ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({notes.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedTag === tag ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {note.isPinned && <Pin className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />}
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{note.title}</h3>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto pr-1">
                <MarkdownRenderer content={note.content} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              <div className="flex flex-wrap gap-1">
                {note.tags?.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
