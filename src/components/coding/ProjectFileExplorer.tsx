import React, { useState } from 'react';
import { GeneratedProjectFile } from '../../types/index.ts';
import {
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  Database,
  Shield,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
  Layers,
  Terminal,
} from 'lucide-react';

interface ProjectFileExplorerProps {
  files: GeneratedProjectFile[];
  activeFile: GeneratedProjectFile | null;
  onSelectFile: (file: GeneratedProjectFile) => void;
}

export const ProjectFileExplorer: React.FC<ProjectFileExplorerProps> = ({
  files,
  activeFile,
  onSelectFile,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>({});

  const handleCopyCode = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleDir = (dir: string) => {
    setCollapsedDirs((prev) => ({ ...prev, [dir]: !prev[dir] }));
  };

  const filteredFiles = files.filter(
    (f) =>
      f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group files by root directory (Laravel-like)
  const groupedFiles: Record<string, GeneratedProjectFile[]> = {};
  filteredFiles.forEach((file) => {
    const parts = file.path.split('/').filter(Boolean);
    const group = parts.length > 1 ? `/${parts[0]}` : '/root';
    if (!groupedFiles[group]) groupedFiles[group] = [];
    groupedFiles[group].push(file);
  });

  const getFileIcon = (file: GeneratedProjectFile) => {
    switch (file.type) {
      case 'route':
        return <Layers className="w-3.5 h-3.5 text-indigo-400" />;
      case 'controller':
        return <Terminal className="w-3.5 h-3.5 text-blue-400" />;
      case 'model':
      case 'migration':
        return <Database className="w-3.5 h-3.5 text-emerald-400" />;
      case 'middleware':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case 'doc':
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
      default:
        return <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[580px]">
      {/* File Tree Sidebar */}
      <div className="w-full md:w-80 bg-slate-950/70 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col">
        {/* Search Header */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search project files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1 font-mono">
            <span>Laravel-like Structure</span>
            <span>{files.length} Files</span>
          </div>
        </div>

        {/* Tree Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {Object.entries(groupedFiles).map(([group, groupFiles]) => {
            const isCollapsed = collapsedDirs[group];
            return (
              <div key={group} className="space-y-0.5">
                <button
                  onClick={() => toggleDir(group)}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-900/60 transition"
                >
                  {isCollapsed ? (
                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="font-mono text-[11px]">{group === '/root' ? '/' : group}</span>
                  <span className="ml-auto text-[10px] text-slate-600 font-mono">({groupFiles.length})</span>
                </button>

                {!isCollapsed && (
                  <div className="pl-4 space-y-0.5 border-l border-slate-800/60 ml-3">
                    {groupFiles.map((f) => {
                      const isSelected = activeFile?.path === f.path;
                      return (
                        <button
                          key={f.path}
                          onClick={() => onSelectFile(f)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-mono transition ${
                            isSelected
                              ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {getFileIcon(f)}
                            <span className="truncate">{f.name}</span>
                          </div>
                          {f.isNew && (
                            <span className="text-[9px] px-1 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                              NEW
                            </span>
                          )}
                          {f.isModified && (
                            <span className="text-[9px] px-1 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                              MOD
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Editor / Viewer */}
      <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
        {/* Code Header */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            {activeFile && getFileIcon(activeFile)}
            <span className="text-xs font-mono font-bold text-slate-200 truncate">
              {activeFile?.path || 'Select a file'}
            </span>
            {activeFile?.description && (
              <span className="hidden lg:inline text-[11px] text-slate-500 truncate">
                — {activeFile.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 uppercase font-mono">
              {activeFile?.language || 'text'}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition"
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              title="Download this file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Code Canvas with Line Numbers */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed select-text">
          {activeFile ? (
            <div className="flex">
              {/* Line Numbers */}
              <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800/80 mr-4 font-mono">
                {activeFile.content.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Code lines */}
              <pre className="flex-1 whitespace-pre overflow-x-auto text-slate-200">
                <code>{activeFile.content}</code>
              </pre>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Select a file from the left sidebar to view code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
