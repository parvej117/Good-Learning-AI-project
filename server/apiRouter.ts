import express, { Request, Response } from 'express';
import {
  generateAIChat,
  teachStep,
  generateQuizQuestions,
  analyzeDocumentText,
  analyzeImageEducational,
  generatePersonalizedStudyPlan,
  generateFlashcardDeck,
  conductEducationalResearch,
  tutorCode,
  getGenAI,
  DEFAULT_MODEL,
  PRIMARY_MODEL,
  FALLBACK_MODEL,
  BASE_TEACHER_SYSTEM_PROMPT,
} from './gemini.ts';
import { db, DEFAULT_USER_ID } from './db.ts';

export const apiRouter = express.Router();

// Parse JSON bodies
apiRouter.use(express.json({ limit: '20mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check & System Status
apiRouter.get('/health', (_req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    appName: 'Good Learning AI',
    version: '1.0.0',
    aiConfigured: hasKey,
    model: DEFAULT_MODEL,
    message: hasKey
      ? 'Gemini AI engine is active and ready.'
      : 'Using built-in intelligent pedagogic engine. Configure GEMINI_API_KEY for real-time model synthesis.',
  });
});

// Cross-Platform Synchronization
apiRouter.get('/sync', (req: Request, res: Response) => {
  const userId = (req.query?.userId as string) || DEFAULT_USER_ID;
  const syncData = db.getSyncData(userId);
  res.json({ success: true, data: syncData });
});

apiRouter.post('/sync', (req: Request, res: Response) => {
  const body = req.body || {};
  const userId = body.userId || (req.query?.userId as string) || DEFAULT_USER_ID;
  const updatedData = db.updateSyncData(userId, body);
  res.json({ success: true, data: updatedData });
});

// AI Chat (Standard JSON)
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, systemPrompt, temperature } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const reply = await generateAIChat(messages, systemPrompt, temperature);
    return res.json({ success: true, content: reply });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process chat' });
  }
});

// AI Chat (Streaming with SSE)
apiRouter.post('/chat/stream', async (req: Request, res: Response) => {
  const { messages, systemPrompt, temperature } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const ai = getGenAI();
  if (!ai) {
    // Stream fallback message in simulated chunks
    const fallbackText = await generateAIChat(messages, systemPrompt, temperature);
    const words = fallbackText.split(' ');
    for (let i = 0; i < words.length; i++) {
      const token = (i > 0 ? ' ' : '') + words[i];
      res.write(`data: ${JSON.stringify({ text: token })}\n\n`);
      await new Promise((r) => setTimeout(r, 20));
    }
    res.write(`data: [DONE]\n\n`);
    res.end();
    return;
  }

  try {
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: PRIMARY_MODEL,
        contents,
        config: {
          systemInstruction: systemPrompt || BASE_TEACHER_SYSTEM_PROMPT,
          temperature: temperature || 0.7,
        },
      });
    } catch (modelErr: any) {
      console.warn(`[Stream Failover] ${PRIMARY_MODEL} stream unavailable (${modelErr?.message}). Failing over to ${FALLBACK_MODEL}...`);
      responseStream = await ai.models.generateContentStream({
        model: FALLBACK_MODEL,
        contents,
        config: {
          systemInstruction: systemPrompt || BASE_TEACHER_SYSTEM_PROMPT,
          temperature: temperature || 0.7,
        },
      });
    }

    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err: any) {
    console.warn('Streaming error, falling back to simulated stream:', err?.message);
    try {
      const fallbackText = await generateAIChat(messages, systemPrompt, temperature);
      const words = fallbackText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const token = (i > 0 ? ' ' : '') + words[i];
        res.write(`data: ${JSON.stringify({ text: token })}\n\n`);
        await new Promise((r) => setTimeout(r, 15));
      }
    } catch {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
    }
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// AI Teacher & Teach Me Mode Step
apiRouter.post('/teacher/step', async (req: Request, res: Response) => {
  try {
    const { topic, level, style, currentStep, studentAnswer, conceptHistory } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const stepResult = await teachStep({
      topic,
      level: level || 'intermediate',
      style: style || 'teacher',
      currentStep: currentStep || 1,
      studentAnswer,
      conceptHistory,
    });

    return res.json({ success: true, data: stepResult });
  } catch (err: any) {
    console.error('Teacher step error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process teacher step' });
  }
});

// Quiz & Exam Generator
apiRouter.post('/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { topic, count, difficulty, questionTypes, language } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const questions = await generateQuizQuestions({
      topic,
      count: count || 5,
      difficulty: difficulty || 'intermediate',
      questionTypes: questionTypes || ['mcq', 'true_false', 'short_answer'],
      language,
    });

    return res.json({ success: true, data: questions });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
});

// Quiz Attempt Submission
apiRouter.post('/quiz/attempt', (req: Request, res: Response) => {
  try {
    const attempt = req.body || {};
    const recorded = db.recordQuizAttempt(attempt.userId || DEFAULT_USER_ID, attempt);
    res.json({ success: true, data: recorded });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save quiz attempt' });
  }
});

// Document Analysis
apiRouter.post('/documents/analyze', async (req: Request, res: Response) => {
  try {
    const { docName, content, action, query } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: 'Document content is required' });
    }

    const analysis = await analyzeDocumentText({
      docName: docName || 'Uploaded Document',
      content,
      action: action || 'summarize',
      query,
    });

    return res.json({ success: true, data: analysis });
  } catch (err: any) {
    console.error('Document analysis error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze document' });
  }
});

// Multimodal Image / Vision Problem Solver
apiRouter.post('/vision/analyze', async (req: Request, res: Response) => {
  try {
    const { base64Image, mimeType, promptText } = req.body || {};
    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }

    const result = await analyzeImageEducational({
      base64Image,
      mimeType: mimeType || 'image/jpeg',
      promptText,
    });

    return res.json({ success: true, analysis: result });
  } catch (err: any) {
    console.error('Vision analysis error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze image' });
  }
});

// Study Plan Generator
apiRouter.post('/study-plan/generate', async (req: Request, res: Response) => {
  try {
    const { subject, goal, availableHoursPerDay, targetExamDate, currentLevel } = req.body || {};
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const plan = await generatePersonalizedStudyPlan({
      subject,
      goal: goal || 'Master concepts and pass assessment',
      availableHoursPerDay: availableHoursPerDay || 2,
      targetExamDate: targetExamDate || 'In 4 weeks',
      currentLevel: currentLevel || 'intermediate',
    });

    return res.json({ success: true, data: plan });
  } catch (err: any) {
    console.error('Study plan error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate study plan' });
  }
});

// Flashcard Deck Generator
apiRouter.post('/flashcards/generate', async (req: Request, res: Response) => {
  try {
    const { topicOrText, count } = req.body || {};
    if (!topicOrText) {
      return res.status(400).json({ error: 'topicOrText is required' });
    }

    const cards = await generateFlashcardDeck({
      topicOrText,
      count: count || 8,
    });

    return res.json({ success: true, data: cards });
  } catch (err: any) {
    console.error('Flashcards error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate flashcards' });
  }
});

// Research Mode
apiRouter.post('/research/analyze', async (req: Request, res: Response) => {
  try {
    const { topic, depth } = req.body || {};
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const report = await conductEducationalResearch({
      topic,
      depth: depth || 'deep',
    });

    return res.json({ success: true, data: report });
  } catch (err: any) {
    console.error('Research error:', err);
    return res.status(500).json({ error: err.message || 'Failed to conduct research' });
  }
});

// Coding Tutor
apiRouter.post('/coding/tutor', async (req: Request, res: Response) => {
  try {
    const { code, language, action, question } = req.body || {};
    if (!code) {
      return res.status(400).json({ error: 'Code snippet is required' });
    }

    const tutorResponse = await tutorCode({
      code,
      language: language || 'javascript',
      action: action || 'explain',
      question,
    });

    return res.json({ success: true, data: tutorResponse });
  } catch (err: any) {
    console.error('Coding tutor error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process coding request' });
  }
});

// Admin Metrics
apiRouter.get('/admin/metrics', (_req: Request, res: Response) => {
  const sync = db.getSyncData(DEFAULT_USER_ID);
  res.json({
    success: true,
    data: {
      totalUsers: 1,
      activeProjects: sync.projects.length,
      totalConversations: sync.conversations.length,
      totalDocuments: sync.documents.length,
      totalQuizzes: sync.quizzes.length,
      totalFlashcardDecks: sync.flashcards.length,
      aiModel: DEFAULT_MODEL,
      systemHealth: 'Optimal',
      subscriptionTiers: ['Free', 'Pro', 'Enterprise'],
      featureFlags: {
        liveVoiceAPI: true,
        documentVectorSearchRAG: true,
        androidTWAExport: true,
      },
    },
  });
});
