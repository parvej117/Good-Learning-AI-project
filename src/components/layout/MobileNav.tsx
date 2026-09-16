import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Home,
  MessageSquare,
  GraduationCap,
  FolderKanban,
  BookMarked,
  User,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      active: activeTab === 'dashboard',
      target: 'dashboard' as const,
    },
    {
      id: 'ai',
      label: 'AI',
      icon: <MessageSquare className="w-5 h-5" />,
      active: activeTab === 'chat' || activeTab === 'vision' || activeTab === 'research',
      target: 'chat' as const,
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: <GraduationCap className="w-5 h-5" />,
      active: activeTab === 'teacher' || activeTab === 'teach_me' || activeTab === 'quiz' || activeTab === 'flashcards' || activeTab === 'coding' || activeTab === 'voice',
      target: 'teacher' as const,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
      active: activeTab === 'projects',
      target: 'projects' as const,
    },
    {
      id: 'library',
      label: 'Library',
      icon: <BookMarked className="w-5 h-5" />,
      active: activeTab === 'documents' || activeTab === 'knowledge' || activeTab === 'study_plan',
      target: 'documents' as const,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      active: activeTab === 'settings' || activeTab === 'analytics',
      target: 'settings' as const,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-bottom">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.target)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
            item.active ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            {item.icon}
            {item.active && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
