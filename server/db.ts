import {
  UserProfile,
  UserPreferences,
  Project,
  Conversation,
  DocumentItem,
  Quiz,
  QuizAttempt,
  FlashcardDeck,
  StudyPlan,
  NoteItem,
  ResearchReport,
  AnalyticsStats,
} from '../src/types/index.ts';

// In-memory persistent database store supporting cross-platform sync
interface DatabaseSchema {
  users: Record<string, UserProfile>;
  preferences: Record<string, UserPreferences>;
  projects: Record<string, Project[]>;
  conversations: Record<string, Conversation[]>;
  documents: Record<string, DocumentItem[]>;
  quizzes: Record<string, Quiz[]>;
  quizAttempts: Record<string, QuizAttempt[]>;
  flashcards: Record<string, FlashcardDeck[]>;
  studyPlans: Record<string, StudyPlan[]>;
  notes: Record<string, NoteItem[]>;
  researchReports: Record<string, ResearchReport[]>;
  analytics: Record<string, AnalyticsStats>;
}

// Seed Demo User ID
export const DEFAULT_USER_ID = 'usr_goodlearning_demo';

// Initial Seed Data
const initialUserProfile: UserProfile = {
  id: DEFAULT_USER_ID,
  name: 'Masum Parvej',
  email: 'masumparvej112p@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'student',
  streakDays: 7,
  xpPoints: 1420,
  level: 4,
  preferredLanguage: 'auto',
  teachingStyle: 'teacher',
  knowledgeLevel: 'intermediate',
  targetGoals: ['Master Full-Stack & AI', 'Pass Tech Lead Exam', 'Bengali-English Fluency'],
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
};

const initialPreferences: UserPreferences = {
  theme: 'light',
  preferredLanguage: 'auto',
  teachingStyle: 'teacher',
  knowledgeLevel: 'intermediate',
  responseLength: 'balanced',
  voiceEnabled: true,
  voiceSpeed: 1.0,
  soundEffects: true,
  autoSaveNotes: true,
};

const initialProjects: Project[] = [
  {
    id: 'proj_web_ai',
    userId: DEFAULT_USER_ID,
    title: 'Modern AI & Web Architecture',
    description: 'Mastering responsive cross-platform architectures, PWA, and Gemini model pipelines.',
    subject: 'Computer Science',
    color: '#2563eb',
    icon: 'code',
    documentIds: ['doc_pwa_guide'],
    conversationIds: ['conv_1'],
    quizIds: ['quiz_1'],
    flashcardDeckIds: ['deck_1'],
    studyPlanId: 'plan_1',
    progressPercent: 68,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_bangla_lang',
    userId: DEFAULT_USER_ID,
    title: 'Bilingual AI & Language Arts',
    description: 'Exploring natural language understanding across Bengali, English, and regional dialects.',
    subject: 'Linguistics',
    color: '#059669',
    icon: 'book-open',
    documentIds: [],
    conversationIds: ['conv_2'],
    quizIds: [],
    flashcardDeckIds: [],
    progressPercent: 40,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialConversations: Conversation[] = [
  {
    id: 'conv_1',
    userId: DEFAULT_USER_ID,
    projectId: 'proj_web_ai',
    title: 'Understanding Asynchronous Event Loops',
    pinned: true,
    tags: ['JavaScript', 'Concurrency', 'Architecture'],
    mode: 'teacher',
    language: 'auto',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'm1',
        conversationId: 'conv_1',
        sender: 'user',
        content: 'Explain how the JavaScript Event Loop handles Microtasks vs Macrotasks.',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'm2',
        conversationId: 'conv_1',
        sender: 'ai',
        content: `### Understanding the JavaScript Event Loop 🔄

Think of the JavaScript Runtime like a busy chef in a single-stove kitchen:

1. **Call Stack**: The frying pan right in front of the chef. Only one synchronous task cooks at a time.
2. **Microtask Queue (VIP lane)**: Promises (\`Promise.then\`), \`queueMicrotask\`, and \`MutationObserver\`. 
3. **Macrotask Queue (Standard lane)**: \`setTimeout\`, \`setInterval\`, \`setImmediate\`, and UI events.

> **Golden Rule**: After the current Call Stack empties, the engine **exhausts ALL microtasks** before picking the single next macrotask!

\`\`\`javascript
console.log('1. Call Stack');

setTimeout(() => {
  console.log('4. Macrotask');
}, 0);

Promise.resolve().then(() => {
  console.log('2. Microtask 1');
}).then(() => {
  console.log('3. Microtask 2');
});
\`\`\`

**Comprehension Question:**
If you schedule a \`Promise.then()\` inside a \`setTimeout()\`, when does that promise callback run? Try answering in your own words!`,
        timestamp: new Date(Date.now() - 2 * 86400000 + 3000).toISOString(),
      },
    ],
  },
  {
    id: 'conv_2',
    userId: DEFAULT_USER_ID,
    projectId: 'proj_bangla_lang',
    title: 'বাংলা ও ইংরেজি দ্বৈত ভাষা শিক্ষণ',
    pinned: false,
    tags: ['Bangla', 'Bilingual'],
    mode: 'chat',
    language: 'bn',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'm3',
        conversationId: 'conv_2',
        sender: 'user',
        content: 'বাংলায় প্রোগ্রামিং অ্যালগরিদম কীভাবে সহজে বোঝা যায়?',
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'm4',
        conversationId: 'conv_2',
        sender: 'ai',
        content: `### অ্যালগরিদম সহজে বোঝার কৌশল 🎯

অ্যালগরিদম হলো কোনো সমস্যা সমাধানের সুনির্দিষ্ট ধাপ। এটিকে দৈনন্দিন জীবনের সাথে তুলনা করলে পানির মতো সহজ মনে হবে:

1. **বাস্তব উদাহরণ (Real-world Analogy)**: 
   - চা বানানোর রেসিপি হলো একটি অ্যালগরিদম (পানি ফুটানো -> চা পাতা দেওয়া -> দুধ-চিনি মেশানো -> পরিবেশন)।
2. **বাইনারি সার্চ (Binary Search)**:
   - বাংলায় যেমন আমরা ডিকশনারিতে শব্দ খুঁজি — বইয়ের মাঝামাঝি পৃষ্ঠা খুলে দেখি শব্দটি আগে নাকি পরে আছে। অর্ধেক পাতা এক নিমেষেই বাদ!

আপনি কি কোনো নির্দিষ্ট অ্যালগরিদম (যেমন: বাবল সর্ট বা রিকার্শন) প্র্যাকটিস করতে চান?`,
        timestamp: new Date(Date.now() - 4 * 86400000 + 2000).toISOString(),
      },
    ],
  },
];

const initialDocuments: DocumentItem[] = [
  {
    id: 'doc_pwa_guide',
    userId: DEFAULT_USER_ID,
    projectId: 'proj_web_ai',
    name: 'Modern_Progressive_Web_Apps_Architecture.pdf',
    size: 2458000,
    type: 'pdf',
    summary:
      'Comprehensive architectural blueprint for modern high-performance Progressive Web Applications. Details Service Worker lifecycle, stale-while-revalidate caching strategies, web app manifest compliance, touch responsiveness, and native Android packaging paths.',
    keyPoints: [
      'Service workers run on a separate background thread without DOM access.',
      'Pre-caching the core app shell guarantees instant 300ms startup even on spotty 3G mobile networks.',
      'Maskable icons require 10-15% safe zone padding to prevent clipping on Android adaptive launchers.',
      'Web-to-native bridges like Capacitor or TWA (Trusted Web Activity) allow single-codebase Google Play publishing.',
    ],
    extractedTopics: ['Service Workers', 'Cache Storage API', 'PWA Manifest', 'Android APK Readiness'],
    contentPreview:
      'Progressive Web Applications (PWAs) bridge the gap between traditional web experiences and native mobile performance...',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'doc_physics_notes',
    userId: DEFAULT_USER_ID,
    name: 'Quantum_Mechanics_and_Wave_Functions.docx',
    size: 1120000,
    type: 'docx',
    summary:
      'Introductory study guide covering wave-particle duality, De Broglie wavelength, Schrödinger wave equation, and probabilistic electron cloud distributions.',
    keyPoints: [
      'Particles exhibit wave-like characteristics governed by lambda = h / p.',
      'The wave function squared represents probability density in 3D space.',
      'Heisenberg uncertainty principle sets a fundamental limit on position and momentum measurement precision.',
    ],
    extractedTopics: ['Wave-Particle Duality', 'Schrodinger Equation', 'Quantum Numbers'],
    contentPreview: 'Quantum mechanics describes physical phenomena at macroscopic and microscopic subatomic scales...',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const initialQuizzes: Quiz[] = [
  {
    id: 'quiz_1',
    userId: DEFAULT_USER_ID,
    projectId: 'proj_web_ai',
    title: 'Cross-Platform Web & PWA Architecture Assessment',
    subject: 'Computer Science',
    difficulty: 'intermediate',
    timeLimitMinutes: 10,
    isExamMode: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    questions: [
      {
        id: 'q1',
        question: 'Which lifecycle event in a Service Worker allows it to take immediate control of clients without waiting for page reload?',
        type: 'mcq',
        options: ['self.skipWaiting() and clients.claim()', 'window.location.reload()', 'navigator.serviceWorker.register()', 'caches.delete()'],
        correctAnswer: 0,
        explanation: 'Calling self.skipWaiting() in the install step forces activation, and self.clients.claim() ensures newly activated worker controls open pages immediately.',
        topicTag: 'Service Worker Lifecycle',
        difficulty: 'intermediate',
      },
      {
        id: 'q2',
        question: 'True or False: A maskable icon should contain critical logos in the outer 10% edge of the canvas.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Maskable icons on Android get cropped into circles or rounded squircles; critical content must remain inside the central 80% safe zone.',
        topicTag: 'PWA Manifest',
        difficulty: 'beginner',
      },
      {
        id: 'q3',
        question: 'What is the primary advantage of the Stale-While-Revalidate caching strategy?',
        type: 'mcq',
        options: [
          'It returns cached content instantly while updating the cache in the background',
          'It completely disables network requests forever',
          'It forces the user to wait for slow network latency before rendering',
          'It only caches image files',
        ],
        correctAnswer: 0,
        explanation: 'Stale-while-revalidate strikes the optimal balance: instant rendering from local cache followed by silent freshness synchronization.',
        topicTag: 'Caching Strategies',
        difficulty: 'intermediate',
      },
    ],
  },
];

const initialQuizAttempts: QuizAttempt[] = [
  {
    id: 'qa_1',
    quizId: 'quiz_1',
    quizTitle: 'Cross-Platform Web & PWA Architecture Assessment',
    userId: DEFAULT_USER_ID,
    score: 3,
    totalQuestions: 3,
    percentage: 100,
    timeSpentSeconds: 145,
    answers: { q1: 0, q2: 'False', q3: 0 },
    weakTopics: [],
    strongTopics: ['Service Worker Lifecycle', 'PWA Manifest', 'Caching Strategies'],
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const initialFlashcards: FlashcardDeck[] = [
  {
    id: 'deck_1',
    userId: DEFAULT_USER_ID,
    projectId: 'proj_web_ai',
    title: 'Web Performance & Core Web Vitals',
    subject: 'Computer Science',
    color: '#2563eb',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    cards: [
      {
        id: 'c1',
        deckId: 'deck_1',
        front: 'What does LCP measure in Core Web Vitals?',
        back: 'Largest Contentful Paint: Measures perceived load speed by timing when the largest main visual block becomes visible (Target: <= 2.5s).',
        hint: 'Loading performance metric',
        tag: 'Core Web Vitals',
        status: 'know',
        reviewCount: 3,
      },
      {
        id: 'c2',
        deckId: 'deck_1',
        front: 'What is Cumulative Layout Shift (CLS)?',
        back: 'Measures visual stability by scoring unexpected layout shifts while the page loads (Target: <= 0.1).',
        hint: 'Visual jumpiness prevention',
        tag: 'Layout Stability',
        status: 'review',
        reviewCount: 2,
      },
      {
        id: 'c3',
        deckId: 'deck_1',
        front: 'Explain Interaction to Next Paint (INP).',
        back: 'Measures page responsiveness to user taps, clicks, and keystrokes throughout the entire session (Target: <= 200ms).',
        hint: 'Replaced FID in March 2024',
        tag: 'Responsiveness',
        status: 'new',
        reviewCount: 0,
      },
    ],
  },
];

const initialStudyPlans: StudyPlan[] = [
  {
    id: 'plan_1',
    userId: DEFAULT_USER_ID,
    projectId: 'proj_web_ai',
    title: '4-Week Cross-Platform AI App Mastery',
    subject: 'Full-Stack Software Engineering',
    goal: 'Build and deploy production-ready PWA with Gemini AI integration and Android packaging.',
    availableHoursPerDay: 2,
    targetExamDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    currentLevel: 'intermediate',
    progressPercent: 50,
    weeklyGoals: [
      'Week 1: Reactive UI Architecture & Component Hierarchies',
      'Week 2: Gemini API Integration & Server-Side Security',
      'Week 3: Offline PWA Shell, Caching, and In-App Install Prompt',
      'Week 4: Performance Optimization & Android APK Packaging',
    ],
    weakTopicsFocus: ['Service Worker Stale-While-Revalidate', 'Multimodal Gemini Payloads'],
    tasks: [
      {
        id: 'st_1',
        dayNumber: 1,
        title: 'Review Responsive Touch & Viewport Constraints',
        description: 'Ensure touch targets >= 44px and eliminate unwanted horizontal scrolling across 360px mobile viewports.',
        estimatedMinutes: 45,
        isCompleted: true,
        type: 'practice',
      },
      {
        id: 'st_2',
        dayNumber: 2,
        title: 'Implement Interactive AI Teacher Step Logic',
        description: 'Build Socratic lesson progression with active knowledge checks.',
        estimatedMinutes: 60,
        isCompleted: true,
        type: 'practice',
      },
      {
        id: 'st_3',
        dayNumber: 3,
        title: 'Quiz & Timed Exam Assessment Simulation',
        description: 'Test knowledge with instant feedback, explanations, and weak-topic diagnostics.',
        estimatedMinutes: 40,
        isCompleted: false,
        type: 'quiz',
      },
      {
        id: 'st_4',
        dayNumber: 4,
        title: 'Spaced Repetition Review & Flashcards',
        description: 'Review cards tagged with Review and Difficult to solidify recall.',
        estimatedMinutes: 30,
        isCompleted: false,
        type: 'revision',
      },
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const initialNotes: NoteItem[] = [
  {
    id: 'note_1',
    userId: DEFAULT_USER_ID,
    projectId: 'proj_web_ai',
    title: 'Active Learning vs. Passive Reading',
    content: `Active recall combined with immediate pedagogical feedback yields 2.5x higher conceptual retention compared to highlighting or re-reading.

Key takeaways:
- Always test oneself before looking up the solution.
- Use the Feynman Technique: if you cannot explain it simply (ELI5), you do not understand it deeply yet.
- Good Learning AI encourages answering questions at every lesson stage.`,
    tags: ['Learning Science', 'Retention', 'Feynman Method'],
    isPinned: true,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initialAnalytics: AnalyticsStats = {
  totalStudyMinutes: 380,
  sessionsCompleted: 14,
  quizzesTaken: 5,
  averageQuizScore: 92,
  flashcardsReviewed: 28,
  topicsMasteredCount: 9,
  streakDays: 7,
  weakTopics: [
    { topic: 'Service Worker Sync', errorRate: 25 },
    { topic: 'LaTeX Complex Matrices', errorRate: 20 },
  ],
  strongTopics: [
    { topic: 'Event Loop & Promises', accuracy: 98 },
    { topic: 'PWA Manifest Standards', accuracy: 95 },
    { topic: 'Bengali-English Synthesis', accuracy: 94 },
  ],
  weeklyActivity: [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 50 },
    { day: 'Thu', minutes: 70 },
    { day: 'Fri', minutes: 40 },
    { day: 'Sat', minutes: 55 },
    { day: 'Sun', minutes: 60 },
  ],
};

// Database state singleton
class MemoryDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: { [DEFAULT_USER_ID]: initialUserProfile },
      preferences: { [DEFAULT_USER_ID]: initialPreferences },
      projects: { [DEFAULT_USER_ID]: initialProjects },
      conversations: { [DEFAULT_USER_ID]: initialConversations },
      documents: { [DEFAULT_USER_ID]: initialDocuments },
      quizzes: { [DEFAULT_USER_ID]: initialQuizzes },
      quizAttempts: { [DEFAULT_USER_ID]: initialQuizAttempts },
      flashcards: { [DEFAULT_USER_ID]: initialFlashcards },
      studyPlans: { [DEFAULT_USER_ID]: initialStudyPlans },
      notes: { [DEFAULT_USER_ID]: initialNotes },
      researchReports: { [DEFAULT_USER_ID]: [] },
      analytics: { [DEFAULT_USER_ID]: initialAnalytics },
    };
  }

  // Cross-platform Synchronization export
  getSyncData(userId: string = DEFAULT_USER_ID) {
    return {
      user: this.data.users[userId] || initialUserProfile,
      preferences: this.data.preferences[userId] || initialPreferences,
      projects: this.data.projects[userId] || [],
      conversations: this.data.conversations[userId] || [],
      documents: this.data.documents[userId] || [],
      quizzes: this.data.quizzes[userId] || [],
      quizAttempts: this.data.quizAttempts[userId] || [],
      flashcards: this.data.flashcards[userId] || [],
      studyPlans: this.data.studyPlans[userId] || [],
      notes: this.data.notes[userId] || [],
      researchReports: this.data.researchReports[userId] || [],
      analytics: this.data.analytics[userId] || initialAnalytics,
      serverTimestamp: new Date().toISOString(),
    };
  }

  // Sync update from client (merges client records)
  updateSyncData(userId: string = DEFAULT_USER_ID, payload: Partial<any>) {
    if (payload.preferences) {
      this.data.preferences[userId] = { ...this.data.preferences[userId], ...payload.preferences };
    }
    if (payload.projects) this.data.projects[userId] = payload.projects;
    if (payload.conversations) this.data.conversations[userId] = payload.conversations;
    if (payload.documents) this.data.documents[userId] = payload.documents;
    if (payload.quizzes) this.data.quizzes[userId] = payload.quizzes;
    if (payload.quizAttempts) this.data.quizAttempts[userId] = payload.quizAttempts;
    if (payload.flashcards) this.data.flashcards[userId] = payload.flashcards;
    if (payload.studyPlans) this.data.studyPlans[userId] = payload.studyPlans;
    if (payload.notes) this.data.notes[userId] = payload.notes;
    if (payload.analytics) this.data.analytics[userId] = { ...this.data.analytics[userId], ...payload.analytics };
    return this.getSyncData(userId);
  }

  // Individual mutations
  addConversation(userId: string, conv: Conversation) {
    if (!this.data.conversations[userId]) this.data.conversations[userId] = [];
    this.data.conversations[userId].unshift(conv);
    return conv;
  }

  addMessage(userId: string, convId: string, message: any) {
    const list = this.data.conversations[userId] || [];
    const conv = list.find((c) => c.id === convId);
    if (conv) {
      conv.messages.push(message);
      conv.updatedAt = new Date().toISOString();
      return message;
    }
    return null;
  }

  addDocument(userId: string, doc: DocumentItem) {
    if (!this.data.documents[userId]) this.data.documents[userId] = [];
    this.data.documents[userId].unshift(doc);
    return doc;
  }

  addQuiz(userId: string, quiz: Quiz) {
    if (!this.data.quizzes[userId]) this.data.quizzes[userId] = [];
    this.data.quizzes[userId].unshift(quiz);
    return quiz;
  }

  recordQuizAttempt(userId: string, attempt: QuizAttempt) {
    if (!this.data.quizAttempts[userId]) this.data.quizAttempts[userId] = [];
    this.data.quizAttempts[userId].unshift(attempt);
    // update analytics
    const analytics = this.data.analytics[userId] || initialAnalytics;
    analytics.quizzesTaken += 1;
    analytics.averageQuizScore = Math.round(
      (analytics.averageQuizScore * (analytics.quizzesTaken - 1) + attempt.percentage) / analytics.quizzesTaken
    );
    return attempt;
  }

  addNote(userId: string, note: NoteItem) {
    if (!this.data.notes[userId]) this.data.notes[userId] = [];
    this.data.notes[userId].unshift(note);
    return note;
  }

  addProject(userId: string, project: Project) {
    if (!this.data.projects[userId]) this.data.projects[userId] = [];
    this.data.projects[userId].unshift(project);
    return project;
  }
}

export const db = new MemoryDatabase();
