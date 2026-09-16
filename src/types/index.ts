// Good Learning AI - Data Models & Domain Types

export type LanguagePreference = 'auto' | 'en' | 'bn' | 'banglish';
export type TeachingStyle = 'teacher' | 'eli5' | 'socratic' | 'practical' | 'exam-focused' | 'coding';
export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  streakDays: number;
  xpPoints: number;
  level: number;
  preferredLanguage: LanguagePreference;
  teachingStyle: TeachingStyle;
  knowledgeLevel: KnowledgeLevel;
  targetGoals: string[];
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  preferredLanguage: LanguagePreference;
  teachingStyle: TeachingStyle;
  knowledgeLevel: KnowledgeLevel;
  responseLength: 'concise' | 'balanced' | 'detailed';
  voiceEnabled: boolean;
  voiceSpeed: number;
  soundEffects: boolean;
  autoSaveNotes: boolean;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  subject: string;
  color: string;
  icon: string;
  documentIds: string[];
  conversationIds: string[];
  quizIds: string[];
  flashcardDeckIds: string[];
  studyPlanId?: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  languageDetected?: string;
  teacherStep?: {
    stage: 'concept' | 'example' | 'question' | 'evaluation' | 'exercise';
    question?: string;
    expectedConcept?: string;
  };
  attachments?: {
    type: 'image' | 'document' | 'code';
    name: string;
    url?: string;
    preview?: string;
  }[];
  metadata?: {
    model?: string;
    tokens?: number;
    sources?: string[];
    isSavedToKnowledge?: boolean;
    rating?: 'thumbs_up' | 'thumbs_down';
  };
}

export interface Conversation {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  pinned: boolean;
  folder?: string;
  tags: string[];
  mode: 'chat' | 'teacher' | 'teach_me' | 'coding' | 'voice' | 'research' | 'doc_chat';
  language: LanguagePreference;
  messages: ChatMessage[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  index: number;
  content: string;
  tokenCount: number;
}

export interface DocumentItem {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  size: number;
  type: string; // 'pdf' | 'docx' | 'txt' | 'image' | 'note'
  summary?: string;
  keyPoints: string[];
  extractedTopics: string[];
  contentPreview: string;
  fullText?: string;
  createdAt: string;
}

export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'fill_blank' | 'descriptive';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[]; // For MCQ
  correctAnswer: string | number;
  explanation: string;
  topicTag: string;
  difficulty: KnowledgeLevel;
}

export interface Quiz {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  subject: string;
  difficulty: KnowledgeLevel;
  timeLimitMinutes?: number;
  isExamMode: boolean;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: Record<string, string | number>;
  weakTopics: string[];
  strongTopics: string[];
  completedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  tag?: string;
  status: 'new' | 'know' | 'review' | 'difficult';
  reviewCount: number;
  lastReviewedAt?: string;
}

export interface FlashcardDeck {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  subject: string;
  color: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface DailyStudyTask {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  type: 'read' | 'practice' | 'quiz' | 'revision';
}

export interface StudyPlan {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  subject: string;
  goal: string;
  availableHoursPerDay: number;
  targetExamDate: string;
  currentLevel: KnowledgeLevel;
  tasks: DailyStudyTask[];
  weeklyGoals: string[];
  weakTopicsFocus: string[];
  progressPercent: number;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  sourceReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchReport {
  id: string;
  userId: string;
  topic: string;
  summary: string;
  keyFindings: string[];
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  sources: { title: string; url?: string; description: string }[];
  citationDisclaimer: string;
  conclusion: string;
  createdAt: string;
}

export interface AnalyticsStats {
  totalStudyMinutes: number;
  sessionsCompleted: number;
  quizzesTaken: number;
  averageQuizScore: number;
  flashcardsReviewed: number;
  topicsMasteredCount: number;
  streakDays: number;
  weakTopics: { topic: string; errorRate: number }[];
  strongTopics: { topic: string; accuracy: number }[];
  weeklyActivity: { day: string; minutes: number }[];
}

export interface TeacherModeState {
  currentTopic: string;
  level: KnowledgeLevel;
  stepNumber: number;
  totalSteps: number;
  currentConcept: string;
  currentExample: string;
  currentQuestion: string;
  currentMiniExercise?: string;
  feedbackHistory: { studentAnswer: string; teacherFeedback: string; score: number }[];
  isComplete: boolean;
}
