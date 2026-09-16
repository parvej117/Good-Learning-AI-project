// Good Learning AI - AI Service Abstraction Layer

export interface ChatInputMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  images?: { base64Data: string; mimeType: string; name?: string }[];
}

export interface AIServiceInterface {
  chat(messages: ChatInputMessage[], systemPrompt?: string): Promise<string>;
  streamChat(
    messages: ChatInputMessage[],
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
    systemPrompt?: string
  ): () => void;
  teachStep(params: {
    topic: string;
    level: string;
    style: string;
    currentStep: number;
    studentAnswer?: string;
  }): Promise<any>;
  generateQuiz(params: {
    topic: string;
    count: number;
    difficulty: string;
    questionTypes: string[];
    language?: string;
  }): Promise<any[]>;
  analyzeDocument(params: {
    docName: string;
    content: string;
    action: 'summarize' | 'key_points' | 'difficult_sections' | 'exam_prep' | 'qa';
    query?: string;
  }): Promise<any>;
  analyzeImage(params: {
    base64Image: string;
    mimeType: string;
    promptText?: string;
  }): Promise<string>;
  createStudyPlan(params: {
    subject: string;
    goal: string;
    availableHoursPerDay: number;
    targetExamDate: string;
    currentLevel: string;
  }): Promise<any>;
  generateFlashcards(params: { topicOrText: string; count: number }): Promise<any[]>;
  research(params: { topic: string; depth: 'overview' | 'deep' | 'comparative' }): Promise<any>;
  codeTutor(params: {
    code: string;
    language: string;
    action: 'explain' | 'debug' | 'improve' | 'practice' | 'step_by_step';
    question?: string;
  }): Promise<any>;
}

class GeminiAIService implements AIServiceInterface {
  async chat(messages: ChatInputMessage[], systemPrompt?: string): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    if (!res.ok) {
      throw new Error(`Chat request failed: ${res.statusText}`);
    }
    const data = await res.json();
    return data.content || '';
  }

  streamChat(
    messages: ChatInputMessage[],
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (err: string) => void,
    systemPrompt?: string
  ): () => void {
    const controller = new AbortController();

    fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error(`Stream error: ${response.statusText}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.replace('data: ', '').trim();
              if (dataStr === '[DONE]') {
                onDone();
                return;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  onChunk(parsed.text);
                } else if (parsed.error) {
                  onError(parsed.error);
                }
              } catch {
                // ignore unparseable chunk
              }
            }
          }
        }
        onDone();
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError(err.message || 'Stream connection failed');
        }
      });

    return () => controller.abort();
  }

  async teachStep(params: {
    topic: string;
    level: string;
    style: string;
    currentStep: number;
    studentAnswer?: string;
  }): Promise<any> {
    const res = await fetch('/api/teacher/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Teacher step failed');
    const json = await res.json();
    return json.data;
  }

  async generateQuiz(params: {
    topic: string;
    count: number;
    difficulty: string;
    questionTypes: string[];
    language?: string;
  }): Promise<any[]> {
    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Quiz generation failed');
    const json = await res.json();
    return json.data || [];
  }

  async analyzeDocument(params: {
    docName: string;
    content: string;
    action: 'summarize' | 'key_points' | 'difficult_sections' | 'exam_prep' | 'qa';
    query?: string;
  }): Promise<any> {
    const res = await fetch('/api/documents/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Document analysis failed');
    const json = await res.json();
    return json.data;
  }

  async analyzeImage(params: {
    base64Image: string;
    mimeType: string;
    promptText?: string;
  }): Promise<string> {
    const res = await fetch('/api/vision/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Image analysis failed');
    const json = await res.json();
    return json.analysis || '';
  }

  async createStudyPlan(params: {
    subject: string;
    goal: string;
    availableHoursPerDay: number;
    targetExamDate: string;
    currentLevel: string;
  }): Promise<any> {
    const res = await fetch('/api/study-plan/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Study plan failed');
    const json = await res.json();
    return json.data;
  }

  async generateFlashcards(params: { topicOrText: string; count: number }): Promise<any[]> {
    const res = await fetch('/api/flashcards/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Flashcard generation failed');
    const json = await res.json();
    return json.data || [];
  }

  async research(params: { topic: string; depth: 'overview' | 'deep' | 'comparative' }): Promise<any> {
    const res = await fetch('/api/research/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Research failed');
    const json = await res.json();
    return json.data;
  }

  async codeTutor(params: {
    code: string;
    language: string;
    action: 'explain' | 'debug' | 'improve' | 'practice' | 'step_by_step';
    question?: string;
  }): Promise<any> {
    const res = await fetch('/api/coding/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Code tutor failed');
    const json = await res.json();
    return json.data;
  }

  // Full-Stack AI Coding Agent Methods
  async generateFullStackProject(params: {
    requirement: string;
    preferredStack?: string;
    targetLanguage?: 'en' | 'bn' | 'auto';
    includeAdmin?: boolean;
    includeAuth?: boolean;
  }): Promise<any> {
    const res = await fetch('/api/coding-agent/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Project generation failed');
    }
    const json = await res.json();
    return json.project;
  }

  async editProject(params: {
    requirement: string;
    currentFiles: any[];
    currentStack: any;
    targetLanguage?: 'en' | 'bn' | 'auto';
  }): Promise<any> {
    const res = await fetch('/api/coding-agent/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Project edit failed');
    }
    const json = await res.json();
    return json.data;
  }

  async debugProject(params: {
    errorMessage: string;
    stackTrace?: string;
    relevantCode?: string;
    currentFiles?: any[];
    targetLanguage?: 'en' | 'bn' | 'auto';
  }): Promise<any> {
    const res = await fetch('/api/coding-agent/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Code debugging failed');
    }
    const json = await res.json();
    return json.data;
  }

  async getCodingTemplates(): Promise<any[]> {
    try {
      const res = await fetch('/api/coding-agent/templates');
      if (!res.ok) return [];
      const json = await res.json();
      return json.templates || [];
    } catch {
      return [];
    }
  }
}

export const AIService = new GeminiAIService();
