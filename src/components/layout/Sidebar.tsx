import React from 'react';
import { useApp, AppTab } from '../../context/AppContext.tsx';
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  FileText,
  ScanEye,
  HelpCircle,
  CalendarCheck,
  Layers,
  Code2,
  Mic,
  Search,
  BookOpen,
  FolderKanban,
  BarChart3,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: AppTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  category: 'core' | 'tools' | 'specialized' | 'workspace';
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, activeProject } = useApp();

  const navItems: NavItem[] = [
    // Core
    { id: 'dashboard', label: 'Home Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'core' },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="w-4 h-4" />, badge: 'Bilingual', category: 'core' },
    { id: 'teacher', label: 'AI Teacher Mode', icon: <GraduationCap className="w-4 h-4" />, badge: 'Active', category: 'core' },
    { id: 'teach_me', label: 'Teach Me Step-by-Step', icon: <Sparkles className="w-4 h-4" />, category: 'core' },

    // Tools
    { id: 'documents', label: 'Document & PDF AI', icon: <FileText className="w-4 h-4" />, category: 'tools' },
    { id: 'vision', label: 'Image & Math Solver', icon: <ScanEye className="w-4 h-4" />, category: 'tools' },
    { id: 'quiz', label: 'Quiz & Exam Mode', icon: <HelpCircle className="w-4 h-4" />, category: 'tools' },
    { id: 'study_plan', label: 'Study Planner', icon: <CalendarCheck className="w-4 h-4" />, category: 'tools' },
    { id: 'flashcards', label: 'Flashcards & SRS', icon: <Layers className="w-4 h-4" />, category: 'tools' },

    // Specialized
    { id: 'coding', label: 'Coding Tutor', icon: <Code2 className="w-4 h-4" />, category: 'specialized' },
    { id: 'voice', label: 'Voice Tutor', icon: <Mic className="w-4 h-4" />, category: 'specialized' },
    { id: 'research', label: 'Research Assistant', icon: <Search className="w-4 h-4" />, category: 'specialized' },

    // Workspace
    { id: 'knowledge', label: 'Personal Knowledge', icon: <BookOpen className="w-4 h-4" />, category: 'workspace' },
    { id: 'projects', label: 'Project Workspaces', icon: <FolderKanban className="w-4 h-4" />, category: 'workspace' },
    { id: 'analytics', label: 'Learning Analytics', icon: <BarChart3 className="w-4 h-4" />, category: 'workspace' },
    { id: 'settings', label: 'AI & Account Settings', icon: <Settings className="w-4 h-4" />, category: 'workspace' },
  ];

  const handleSelect = (tab: AppTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const renderSection = (category: NavItem['category'], title: string) => {
    const filtered = navItems.filter((i) => i.category === category);
    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
          {title}
        </div>
        <div className="space-y-0.5">
          {filtered.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold tracking-wide ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3 overflow-y-auto">
      <div>
        {activeProject && (
          <div className="mb-3 p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-xs">
            <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Current Project
            </div>
            <div className="font-bold text-slate-800 truncate mt-0.5">{activeProject.title}</div>
            <div className="text-[11px] text-slate-500">{activeProject.subject}</div>
          </div>
        )}

        {renderSection('core', 'Interactive Learning')}
        {renderSection('tools', 'Study Tools & Exams')}
        {renderSection('specialized', 'Specialized Mentors')}
        {renderSection('workspace', 'Personal Workspace')}
      </div>

      <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-400 px-2 flex items-center justify-between select-none">
        <span>v1.0 • PWA Ready</span>
        <span className="text-emerald-600 font-medium">● Connected</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-53px)] sticky top-[53px] bg-slate-50/70 border-r border-slate-200/80 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Good Learning AI</div>
                  <div className="text-[10px] text-slate-500">Navigation Menu</div>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
