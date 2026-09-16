import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { PWAInstallModal } from './components/common/PWAInstallModal.tsx';

// Views
import { DashboardView } from './components/views/DashboardView.tsx';
import { ChatView } from './components/views/ChatView.tsx';
import { TeacherView } from './components/views/TeacherView.tsx';
import { DocumentsView } from './components/views/DocumentsView.tsx';
import { QuizExamView } from './components/views/QuizExamView.tsx';
import { StudyPlanView } from './components/views/StudyPlanView.tsx';
import { FlashcardsView } from './components/views/FlashcardsView.tsx';
import { CodingTutorView } from './components/views/CodingTutorView.tsx';
import { VoiceTutorView } from './components/views/VoiceTutorView.tsx';
import { ResearchView } from './components/views/ResearchView.tsx';
import { KnowledgeBaseView } from './components/views/KnowledgeBaseView.tsx';
import { ProjectsView } from './components/views/ProjectsView.tsx';
import { AnalyticsView } from './components/views/AnalyticsView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { VisionView } from './components/views/VisionView.tsx';

const AppContent: React.FC = () => {
  const { activeTab, isPWAInstallOpen, closePWAInstallModal } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'chat':
        return <ChatView />;
      case 'teacher':
        return <TeacherView />;
      case 'documents':
        return <DocumentsView />;
      case 'quiz':
        return <QuizExamView />;
      case 'study_plan':
        return <StudyPlanView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'coding':
        return <CodingTutorView />;
      case 'voice':
        return <VoiceTutorView />;
      case 'research':
        return <ResearchView />;
      case 'notes':
        return <KnowledgeBaseView />;
      case 'projects':
        return <ProjectsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'vision':
        return <VisionView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <Sidebar />

      {/* Main App Workspace */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable Main Content Container */}
        <main
          id="main-learning-workspace"
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 max-w-7xl w-full mx-auto pb-24 md:pb-8"
        >
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Navigation (Visible on mobile/tablet screens) */}
        <MobileNav />
      </div>

      {/* Modals & Notifications */}
      <ToastContainer />
      <PWAInstallModal isOpen={isPWAInstallOpen} onClose={closePWAInstallModal} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
