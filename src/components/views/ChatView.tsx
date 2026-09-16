import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  Send,
  Plus,
  Trash2,
  Bookmark,
  RefreshCw,
  Copy,
  Check,
  Search,
  Languages,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  HelpCircle,
  Pin,
  Mic,
  MicOff,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    createConversation,
    deleteConversation,
    addMessage,
    saveNote,
    preferences,
    setActiveTab,
    addToast,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'en' | 'bn' | 'banglish'>('auto');
  const [teachingMode, setTeachingMode] = useState<'teacher' | 'chat' | 'eli5' | 'socratic'>('teacher');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortStreamRef = useRef<(() => void) | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, streamBuffer]);

  // Handle Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast('Voice speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'bn' ? 'bn-BD' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        addToast('Listening... Speak now', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Ensure an active conversation exists
  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  }, [activeConversation, conversations, setActiveConversation]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isGenerating) return;

    let conv = activeConversation;
    if (!conv) {
      conv = createConversation(textToSend.slice(0, 35) + '...', 'chat', selectedLanguage);
    }

    // Add user message
    addMessage(conv.id, {
      conversationId: conv.id,
      sender: 'user',
      content: textToSend,
    });

    setInputPrompt('');
    setIsGenerating(true);
    setStreamBuffer('');

    const conversationHistory = [
      ...conv.messages.map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        content: m.content,
      })),
      { role: 'user' as const, content: textToSend },
    ];

    let fullAiResponse = '';

    // Choose system prompt based on mode & language
    let promptDirective = `You are Good Learning AI - an intelligent, patient, and pedagogically rigorous AI teacher and study assistant.
Target teaching style: ${teachingMode}.
Target language: ${selectedLanguage}. (If 'bn', respond in clear, grammatically sound Bengali. If 'auto', match the user's language smoothly).
Rule: Never simply blurt answers without building conceptual intuition. Include concrete examples and encourage critical thinking.`;

    abortStreamRef.current = AIService.streamChat(
      conversationHistory,
      (token) => {
        fullAiResponse += token;
        setStreamBuffer(fullAiResponse);
      },
      () => {
        // Done streaming
        addMessage(conv.id, {
          conversationId: conv.id,
          sender: 'ai',
          content: fullAiResponse || 'I am ready to help you understand this topic deeper.',
        });
        setStreamBuffer('');
        setIsGenerating(false);

        // Voice playback if enabled
        if (preferences.voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const cleanText = fullAiResponse.replace(/[#*`_]/g, '').slice(0, 300);
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = preferences.voiceSpeed || 1.0;
            if (selectedLanguage === 'bn') utterance.lang = 'bn-BD';
            window.speechSynthesis.speak(utterance);
          } catch {
            // ignore speech errors
          }
        }
      },
      (errorMsg) => {
        console.error('Chat stream failed:', errorMsg);
        addMessage(conv.id, {
          conversationId: conv.id,
          sender: 'ai',
          content: `I encountered an issue generating the live stream. Let's explore this concept: ${textToSend}. Could you specify which aspect you want to focus on first?`,
        });
        setStreamBuffer('');
        setIsGenerating(false);
      },
      promptDirective
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToNotes = (content: string) => {
    saveNote('Insight from AI Conversation', content, ['AI Chat', 'Saved Insight']);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const samplePrompts = [
    { title: 'Explain Closures', query: 'Explain JavaScript closures with a practical real-world analogy.' },
    { title: 'বাংলায় কোয়ান্টাম ফিজিক্স', query: 'বাংলায় কোয়ান্টাম মেকানিক্সের ভিত্তি ও ওয়েভ ফাংশন সহজভাবে বোঝাও।' },
    { title: 'ELI5: Neural Networks', query: 'Explain how Artificial Neural Networks learn like I am 10 years old.' },
    { title: 'Calculus Derivatives', query: 'Why do we need derivatives in calculus? Give an intuitive physical example.' },
  ];

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Left Chat History List */}
      <div className="hidden md:flex flex-col w-72 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Chat History</span>
          <button
            onClick={() => createConversation('New Discussion', 'chat', selectedLanguage)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Chats */}
        <div className="relative mb-2.5">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredConversations.map((c) => {
            const isSelected = activeConversation?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setActiveConversation(c)}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {c.pinned ? (
                    <Pin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  ) : (
                    <Bot className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  )}
                  <span className="truncate">{c.title}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition ${
                    isSelected ? 'text-white' : 'text-slate-400 hover:text-rose-600'
                  }`}
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Chat Control Toolbar */}
        <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800">
              {activeConversation ? activeConversation.title : 'AI Study Assistant'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
              {teachingMode.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-xl text-xs">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as any)}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="auto">Auto Detect</option>
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="banglish">Banglish</option>
              </select>
            </div>

            {/* Teaching Mode Selector */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-xl text-xs">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={teachingMode}
                onChange={(e) => setTeachingMode(e.target.value as any)}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="teacher">Teacher (Socratic)</option>
                <option value="eli5">ELI5 (Simple)</option>
                <option value="chat">Concise Direct</option>
                <option value="socratic">Exam Drill</option>
              </select>
            </div>
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(!activeConversation || activeConversation.messages.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">How can Good Learning AI assist you?</h3>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  Ask any academic question, solve conceptual doubts, or study in English or বাংলা.
                </p>
              </div>

              {/* Sample Starters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {samplePrompts.map((sp) => (
                  <button
                    key={sp.title}
                    onClick={() => handleSendMessage(sp.query)}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-200 transition text-xs"
                  >
                    <div className="font-semibold text-slate-800">{sp.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{sp.query}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeConversation?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`group relative p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? (
                  <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}

                {/* Message Actions */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-200/60 text-slate-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSaveToNotes(msg.content)}
                      className="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 transition"
                      title="Save to Knowledge Base"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('quiz');
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 transition"
                      title="Generate Quiz from this"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live Streaming Response Buffer */}
          {isGenerating && streamBuffer && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800 text-xs sm:text-sm shadow-xs">
                <MarkdownRenderer content={streamBuffer} />
                <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1 align-middle" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200/80 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              title="Voice Speech Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder="Ask anything, request an explanation, or type in বাংলা..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isGenerating}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition active:scale-95"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
