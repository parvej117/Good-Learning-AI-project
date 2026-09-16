import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserPreferences,
  Project,
  Conversation,
  ChatMessage,
  DocumentItem,
  Quiz,
  QuizAttempt,
  FlashcardDeck,
  StudyPlan,
  NoteItem,
  AnalyticsStats,
} from '../types/index.ts';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type AppTab =
  | 'dashboard'
  | 'chat'
  | 'teacher'
  | 'teach_me'
  | 'documents'
  | 'vision'
  | 'quiz'
  | 'study_plan'
  | 'flashcards'
  | 'coding'
  | 'voice'
  | 'research'
  | 'knowledge'
  | 'projects'
  | 'analytics'
  | 'settings';

interface AppContextType {
  user: UserProfile;
  preferences: UserPreferences;
  projects: Project[];
  activeProject: Project | null;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  documents: DocumentItem[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  flashcards: FlashcardDeck[];
  studyPlans: StudyPlan[];
  notes: NoteItem[];
  analytics: AnalyticsStats;
  activeTab: AppTab;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  toasts: ToastMessage[];
  setActiveTab: (tab: AppTab) => void;
  setActiveProject: (proj: Project | null) => void;
  setActiveConversation: (conv: Conversation | null) => void;
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  syncWithServer: () => Promise<void>;
  createConversation: (title: string, mode?: Conversation['mode'], language?: string) => Conversation;
  deleteConversation: (id: string) => void;
  addMessage: (convId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  createProject: (title: string, description: string, subject: string, color: string) => Project;
  uploadDocument: (name: string, content: string, size: number, type: string, summaryData?: any) => DocumentItem;
  deleteDocument: (id: string) => void;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  addFlashcardDeck: (deck: FlashcardDeck) => void;
  updateFlashcardStatus: (deckId: string, cardId: string, status: 'know' | 'review' | 'difficult') => void;
  saveStudyPlan: (plan: StudyPlan) => void;
  toggleStudyTask: (planId: string, taskId: string) => void;
  saveNote: (title: string, content: string, tags?: string[]) => NoteItem;
  deleteNote: (id: string) => void;
  exportSessionData: (format: 'json' | 'markdown' | 'txt') => void;
}

const AppContext = createContext<AppContextType | null>(null);

const LOCAL_STORAGE_KEY = 'good_learning_ai_sync_cache';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Core Data States with safe fallbacks
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_goodlearning_demo',
    name: 'Learner',
    email: 'masumparvej112p@gmail.com',
    role: 'student',
    streakDays: 7,
    xpPoints: 1420,
    level: 4,
    preferredLanguage: 'auto',
    teachingStyle: 'teacher',
    knowledgeLevel: 'intermediate',
    targetGoals: ['Master AI Concepts', 'Full-Stack Architecture'],
    createdAt: new Date().toISOString(),
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    preferredLanguage: 'auto',
    teachingStyle: 'teacher',
    knowledgeLevel: 'intermediate',
    responseLength: 'balanced',
    voiceEnabled: true,
    voiceSpeed: 1.0,
    soundEffects: true,
    autoSaveNotes: true,
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardDeck[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStats>({
    totalStudyMinutes: 380,
    sessionsCompleted: 14,
    quizzesTaken: 5,
    averageQuizScore: 92,
    flashcardsReviewed: 28,
    topicsMasteredCount: 9,
    streakDays: 7,
    weakTopics: [],
    strongTopics: [],
    weeklyActivity: [],
  });

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('Back online — sync restored', 'success');
      syncWithServer();
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast('Working in offline mode. Changes saved locally.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // Initial Sync on load
  const syncWithServer = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync?userId=${encodeURIComponent(user?.id || 'default_user')}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.user) setUser(d.user);
          if (d.preferences) setPreferences(d.preferences);
          if (d.projects) setProjects(d.projects);
          if (d.conversations) {
            setConversations(d.conversations);
            if (d.conversations.length > 0 && !activeConversation) {
              setActiveConversation(d.conversations[0]);
            }
          }
          if (d.documents) setDocuments(d.documents);
          if (d.quizzes) setQuizzes(d.quizzes);
          if (d.quizAttempts) setQuizAttempts(d.quizAttempts);
          if (d.flashcards) setFlashcards(d.flashcards);
          if (d.studyPlans) setStudyPlans(d.studyPlans);
          if (d.notes) setNotes(d.notes);
          if (d.analytics) setAnalytics(d.analytics);

          setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

          // Cache in localStorage for offline shell
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(d));
        }
      } else {
        loadFromLocalStorage();
      }
    } catch {
      loadFromLocalStorage();
    } finally {
      setIsSyncing(false);
    }
  }, [activeConversation, user?.id]);

  const loadFromLocalStorage = () => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const d = JSON.parse(cached);
        if (d.user) setUser(d.user);
        if (d.preferences) setPreferences(d.preferences);
        if (d.projects) setProjects(d.projects);
        if (d.conversations) setConversations(d.conversations);
        if (d.documents) setDocuments(d.documents);
        if (d.quizzes) setQuizzes(d.quizzes);
        if (d.flashcards) setFlashcards(d.flashcards);
        if (d.studyPlans) setStudyPlans(d.studyPlans);
        if (d.notes) setNotes(d.notes);
        if (d.analytics) setAnalytics(d.analytics);
      } catch (err) {
        console.error('Failed to parse local cache:', err);
      }
    }
  };

  useEffect(() => {
    syncWithServer();
  }, [syncWithServer]);

  // Push local changes to server asynchronously
  const pushStateToServer = (partialData: any) => {
    if (!navigator.onLine) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id || 'default_user', ...partialData }),
    }).catch(() => {});
  };

  const createConversation = (title: string, mode: Conversation['mode'] = 'chat', language = 'auto'): Conversation => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      userId: user.id,
      projectId: activeProject ? activeProject.id : undefined,
      title: title || 'New Learning Session',
      pinned: false,
      tags: [mode],
      mode,
      language: language as any,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversation(newConv);
    pushStateToServer({ conversations: [newConv, ...conversations] });
    return newConv;
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    if (activeConversation?.id === id) {
      setActiveConversation(updated.length > 0 ? updated[0] : null);
    }
    pushStateToServer({ conversations: updated });
    addToast('Conversation removed', 'info');
  };

  const addMessage = (convId: string, messageData: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMsg: ChatMessage = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) => {
      const updated = prev.map((conv) => {
        if (conv.id === convId) {
          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            updatedAt: new Date().toISOString(),
          };
        }
        return conv;
      });
      pushStateToServer({ conversations: updated });
      return updated;
    });

    if (activeConversation?.id === convId) {
      setActiveConversation((prev) => (prev ? { ...prev, messages: [...prev.messages, newMsg] } : null));
    }

    return newMsg;
  };

  const updatePreferences = (partial: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...partial };
      pushStateToServer({ preferences: updated });
      return updated;
    });
    addToast('Preferences saved', 'success');
  };

  const createProject = (title: string, description: string, subject: string, color: string): Project => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      userId: user.id,
      title,
      description,
      subject,
      color: color || '#2563eb',
      icon: 'folder',
      documentIds: [],
      conversationIds: [],
      quizIds: [],
      flashcardDeckIds: [],
      progressPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProject(newProj);
    pushStateToServer({ projects: [newProj, ...projects] });
    addToast(`Project "${title}" created!`, 'success');
    return newProj;
  };

  const uploadDocument = (
    name: string,
    content: string,
    size: number,
    type: string,
    summaryData?: any
  ): DocumentItem => {
    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      userId: user.id,
      projectId: activeProject?.id,
      name,
      size,
      type,
      summary: summaryData?.summary || 'Document uploaded and indexed for AI questions and synthesis.',
      keyPoints: summaryData?.keyPoints || ['Core concept definitions', 'Review highlights'],
      extractedTopics: summaryData?.extractedTopics || ['General Education'],
      contentPreview: content.slice(0, 300) + (content.length > 300 ? '...' : ''),
      fullText: content,
      createdAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    pushStateToServer({ documents: [newDoc, ...documents] });
    addToast(`Document "${name}" added to workspace!`, 'success');
    return newDoc;
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    pushStateToServer({ documents: documents.filter((d) => d.id !== id) });
    addToast('Document deleted', 'info');
  };

  const recordQuizAttempt = (attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    const newAttempt: QuizAttempt = {
      ...attemptData,
      id: `qa_${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setQuizAttempts((prev) => [newAttempt, ...prev]);

    // Update analytics
    setAnalytics((prev) => {
      const newCount = prev.quizzesTaken + 1;
      const newAvg = Math.round((prev.averageQuizScore * prev.quizzesTaken + newAttempt.percentage) / newCount);
      const updated = {
        ...prev,
        quizzesTaken: newCount,
        averageQuizScore: newAvg,
        streakDays: prev.streakDays + 1,
      };
      pushStateToServer({ quizAttempts: [newAttempt, ...quizAttempts], analytics: updated });
      return updated;
    });

    // Reward XP points
    setUser((prev) => ({
      ...prev,
      xpPoints: prev.xpPoints + Math.round(newAttempt.percentage * 1.5),
    }));

    addToast(`Quiz complete! Scored ${newAttempt.percentage}% (+${Math.round(newAttempt.percentage * 1.5)} XP)`, 'success');
  };

  const addFlashcardDeck = (deck: FlashcardDeck) => {
    setFlashcards((prev) => [deck, ...prev]);
    pushStateToServer({ flashcards: [deck, ...flashcards] });
    addToast(`Flashcard deck "${deck.title}" saved!`, 'success');
  };

  const updateFlashcardStatus = (deckId: string, cardId: string, status: 'know' | 'review' | 'difficult') => {
    setFlashcards((prev) =>
      prev.map((deck) => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cards: deck.cards.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    status,
                    reviewCount: c.reviewCount + 1,
                    lastReviewedAt: new Date().toISOString(),
                  }
                : c
            ),
          };
        }
        return deck;
      })
    );

    setAnalytics((prev) => ({
      ...prev,
      flashcardsReviewed: prev.flashcardsReviewed + 1,
    }));
  };

  const saveStudyPlan = (plan: StudyPlan) => {
    setStudyPlans((prev) => {
      const exists = prev.some((p) => p.id === plan.id);
      const updated = exists ? prev.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...prev];
      pushStateToServer({ studyPlans: updated });
      return updated;
    });
    addToast('Study plan updated!', 'success');
  };

  const toggleStudyTask = (planId: string, taskId: string) => {
    setStudyPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const tasks = plan.tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
          const completedCount = tasks.filter((t) => t.isCompleted).length;
          const progress = Math.round((completedCount / tasks.length) * 100);
          return { ...plan, tasks, progressPercent: progress };
        }
        return plan;
      })
    );
  };

  const saveNote = (title: string, content: string, tags: string[] = []): NoteItem => {
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      userId: user.id,
      projectId: activeProject?.id,
      title,
      content,
      tags,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    pushStateToServer({ notes: [newNote, ...notes] });
    addToast('Note saved to Knowledge Base!', 'success');
    return newNote;
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    pushStateToServer({ notes: notes.filter((n) => n.id !== id) });
    addToast('Note deleted', 'info');
  };

  const exportSessionData = (format: 'json' | 'markdown' | 'txt') => {
    let content = '';
    let filename = `good_learning_ai_export_${Date.now()}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify(
        {
          user,
          projects,
          conversations,
          notes,
          quizzes,
          flashcards,
          studyPlans,
        },
        null,
        2
      );
      filename += '.json';
      mimeType = 'application/json';
    } else if (format === 'markdown') {
      filename += '.md';
      content = `# Good Learning AI - Study Export\nGenerated on ${new Date().toLocaleString()}\n\n`;
      content += `## Projects\n${projects.map((p) => `- **${p.title}** (${p.subject}): ${p.description}`).join('\n')}\n\n`;
      content += `## Notes\n${notes.map((n) => `### ${n.title}\n${n.content}`).join('\n\n')}\n\n`;
      content += `## Conversations\n${conversations
        .map(
          (c) =>
            `### ${c.title}\n` +
            c.messages.map((m) => `**${m.sender === 'user' ? 'Student' : 'AI Teacher'}:**\n${m.content}`).join('\n\n')
        )
        .join('\n\n---\n\n')}`;
    } else {
      filename += '.txt';
      content = `Good Learning AI Notes\n\n` + notes.map((n) => `[${n.title}]\n${n.content}\n`).join('\n---\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported as ${format.toUpperCase()}`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        preferences,
        projects,
        activeProject,
        conversations,
        activeConversation,
        documents,
        quizzes,
        quizAttempts,
        flashcards,
        studyPlans,
        notes,
        analytics,
        activeTab,
        isOnline,
        isSyncing,
        lastSyncedAt,
        toasts,
        setActiveTab,
        setActiveProject,
        setActiveConversation,
        addToast,
        syncWithServer,
        createConversation,
        deleteConversation,
        addMessage,
        updatePreferences,
        createProject,
        uploadDocument,
        deleteDocument,
        recordQuizAttempt,
        addFlashcardDeck,
        updateFlashcardStatus,
        saveStudyPlan,
        toggleStudyTask,
        saveNote,
        deleteNote,
        exportSessionData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
