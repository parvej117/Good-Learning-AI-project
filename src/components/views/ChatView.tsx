import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService, ChatInputMessage } from '../../services/aiService.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import { CameraCaptureModal } from '../common/CameraCaptureModal.tsx';
import { ImageLightboxModal } from '../common/ImageLightboxModal.tsx';
import { ChatAttachment } from '../../types/index.ts';
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
  Paperclip,
  Image as ImageIcon,
  Camera,
  X,
  Maximize2,
  ScanEye,
  Upload,
} from 'lucide-react';

interface AttachedImageState {
  file: File;
  preview: string;
  base64Data: string;
  mimeType: string;
  name: string;
  size: number;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

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

  // Multimodal Image Attachment State
  const [attachedImage, setAttachedImage] = useState<AttachedImageState | null>(null);
  const [isReadingImage, setIsReadingImage] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('Image Preview');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortStreamRef = useRef<(() => void) | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, streamBuffer, isGenerating]);

  // Close attachment menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setIsAttachMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Clipboard Image Paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              processImageFile(file);
              e.preventDefault();
              break;
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Validate & Process Selected Image File
  const processImageFile = (file: File) => {
    if (!file) return;

    // Check file type
    const fileType = file.type.toLowerCase();
    const isTypeValid =
      ALLOWED_IMAGE_TYPES.includes(fileType) ||
      /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!isTypeValid) {
      addToast(
        'ভুল ফাইল ফরম্যাট! শুধুমাত্র JPG, JPEG, PNG ও WEBP ছবি নির্বাচন করুন।',
        'error'
      );
      return;
    }

    // Check file size (max 10MB)
    if (file.size > MAX_FILE_SIZE) {
      addToast(
        'ফাইলের আকার অনেক বড়! সর্বোচ্চ ১০ মেগাবাইট (10MB) পর্যন্ত ছবি আপলোড করা যাবে।',
        'error'
      );
      return;
    }

    setIsReadingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      setAttachedImage({
        file,
        preview: dataUrl,
        base64Data,
        mimeType: file.type || 'image/jpeg',
        name: file.name || `photo_${Date.now()}.jpg`,
        size: file.size,
      });
      setIsReadingImage(false);
      setIsAttachMenuOpen(false);
      addToast('ছবি সফলভাবে যুক্ত হয়েছে। প্রশ্ন লিখে অথবা সরাসরি Send চাপুন।', 'success');
    };
    reader.onerror = () => {
      setIsReadingImage(false);
      addToast('ছবি পড়তে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।', 'error');
    };
    reader.readAsDataURL(file);
  };

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

  // Send Message (Supports Text only, Image only, or Text + Image)
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt !== undefined ? customPrompt : inputPrompt;
    const currentAttachment = attachedImage;

    // Must have at least text or an image attachment
    if ((!textToSend.trim() && !currentAttachment) || isGenerating) return;

    let conv = activeConversation;
    if (!conv) {
      const convTitle = textToSend.trim()
        ? textToSend.slice(0, 35) + '...'
        : currentAttachment
        ? `ছবি বিশ্লেষণ: ${currentAttachment.name.slice(0, 22)}`
        : 'New Discussion';
      conv = createConversation(convTitle, 'chat', selectedLanguage);
    }

    // Build attachments array for local message history
    const messageAttachments: ChatAttachment[] = currentAttachment
      ? [
          {
            type: 'image',
            name: currentAttachment.name,
            preview: currentAttachment.preview,
            mimeType: currentAttachment.mimeType,
            base64Data: currentAttachment.base64Data,
            size: currentAttachment.size,
          },
        ]
      : [];

    // Add user message to conversation state
    addMessage(conv.id, {
      conversationId: conv.id,
      sender: 'user',
      content: textToSend.trim(),
      attachments: messageAttachments,
    });

    // Clear input & attachment immediately
    setInputPrompt('');
    setAttachedImage(null);
    setIsGenerating(true);
    setStreamBuffer('');

    // Prepare conversation history with images for server-side Gemini API
    const conversationHistory: ChatInputMessage[] = [
      ...conv.messages.map((m) => {
        const msgImages = m.attachments
          ?.filter((a) => a.type === 'image' && (a.base64Data || a.preview))
          .map((a) => ({
            base64Data: (a.base64Data || a.preview || '').replace(/^data:image\/\w+;base64,/, ''),
            mimeType: a.mimeType || 'image/jpeg',
            name: a.name,
          }));

        return {
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          content: m.content || '',
          ...(msgImages && msgImages.length > 0 ? { images: msgImages } : {}),
        };
      }),
      {
        role: 'user' as const,
        content: textToSend.trim(),
        ...(currentAttachment
          ? {
              images: [
                {
                  base64Data: currentAttachment.base64Data,
                  mimeType: currentAttachment.mimeType,
                  name: currentAttachment.name,
                },
              ],
            }
          : {}),
      },
    ];

    let fullAiResponse = '';

    // Pedagogical system prompt emphasizing multimodal vision and OCR
    const promptDirective = `You are Good Learning AI — an intelligent, empathetic, and pedagogically rigorous AI Teacher, Multimodal Vision Tutor, and Study Assistant.
Target teaching style: ${teachingMode}.
Target language: ${selectedLanguage}. (If 'bn', respond in clear, natural, grammatically sound Bengali. If 'auto', match the user's language).

Multimodal Guidelines:
- If an image is provided (handwritten notes, textbook math problems, physics diagrams, printed pages, circuits, graphs, or screenshots):
  1. OCR & Reading: Accurately read and transcribe any Bengali (বাংলা) or English text and mathematical formulas.
  2. Problem Solving: If it presents a problem or question, solve it step-by-step, showing the reasoning, formulas, and units clearly.
  3. Concept Clarity: Explain the underlying concept so the student truly understands.
  4. If only an image was sent without any text question, provide a structured breakdown: summary of what is shown, transcribed text/formulas, step-by-step solution if applicable, and key learning points.
Rule: Never simply blurt answers without building conceptual intuition.`;

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
          content: `আমি তথ্যটি প্রক্রিয়াকরণ করছি। আপনার ছবিটি পেয়েছি — অনুগ্রহ করে একটু অপেক্ষা করে আবার চেষ্টা করুন অথবা আপনার প্রশ্নটি সুনির্দিষ্ট করুন।`,
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
    <div
      className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4 max-w-7xl mx-auto animate-in fade-in duration-200"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processImageFile(e.dataTransfer.files[0]);
        }
      }}
    >
      {/* Drag and Drop Overlay Indicator */}
      {isDragOver && (
        <div className="fixed inset-0 z-40 pointer-events-none bg-blue-600/15 backdrop-blur-xs flex items-center justify-center border-4 border-dashed border-blue-500 rounded-3xl m-4 animate-pulse">
          <div className="bg-white/95 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-blue-200 text-blue-700">
            <Upload className="w-8 h-8 text-blue-600 animate-bounce" />
            <div>
              <div className="font-bold text-sm">ছবি এখানে ছেড়ে দিন (Drop image to attach)</div>
              <div className="text-xs text-slate-500">JPG, JPEG, PNG, WEBP (সর্বোচ্চ ১০ MB)</div>
            </div>
          </div>
        </div>
      )}

      {/* Left Chat History List */}
      <div className="hidden md:flex flex-col w-72 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Chat History</span>
          <button
            onClick={() => createConversation('New Discussion', 'chat', selectedLanguage)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition active:scale-95"
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
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden relative">
        {/* Chat Control Toolbar */}
        <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 truncate max-w-[180px] sm:max-w-xs">
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
                  Ask any academic question, solve math problems, upload diagrams or textbook photos, or study in English and বাংলা.
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
                {/* Uploaded Images Rendered in Chat History */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mb-2.5 space-y-2">
                    {msg.attachments.map((att, idx) => {
                      if (att.type === 'image' && (att.preview || att.url)) {
                        const imgUrl = att.preview || att.url || '';
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setLightboxImageUrl(imgUrl);
                              setLightboxTitle(att.name || 'Image Preview');
                            }}
                            className="group/img relative max-w-sm rounded-xl overflow-hidden border border-white/30 bg-black/25 cursor-pointer shadow-xs transition hover:brightness-105"
                          >
                            <img
                              src={imgUrl}
                              alt={att.name}
                              className="w-full max-h-64 object-cover object-center group-hover/img:scale-102 transition duration-200"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition flex items-end justify-between p-2.5">
                              <span className="text-[11px] text-white/95 font-medium truncate max-w-[200px]">
                                {att.name}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-white bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md font-semibold">
                                <Maximize2 className="w-3 h-3" />
                                <span>বড় করে দেখুন</span>
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                {/* Message Text Content */}
                {msg.sender === 'user' ? (
                  msg.content ? (
                    <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                  ) : (
                    <div className="text-xs font-medium text-white/90 italic flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>ছবি বিশ্লেষণ অনুরোধ (Image Analysis Request)</span>
                    </div>
                  )
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}

                {/* AI Message Actions */}
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
          {isGenerating && (
            <div className="flex gap-3 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800 text-xs sm:text-sm shadow-xs space-y-2">
                {streamBuffer ? (
                  <>
                    <MarkdownRenderer content={streamBuffer} />
                    <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1 align-middle" />
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium animate-pulse py-1">
                    <ScanEye className="w-4 h-4" />
                    <span>ছবি ও প্রশ্ন বিশ্লেষণ করা হচ্ছে (Analyzing image & content)...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Attachment Preview Area */}
        <div className="p-3 border-t border-slate-200/80 bg-white">
          {/* Small Preview Box above chat input */}
          {attachedImage && (
            <div className="mb-2.5 p-2 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  onClick={() => {
                    setLightboxImageUrl(attachedImage.preview);
                    setLightboxTitle(attachedImage.name);
                  }}
                  className="relative w-12 h-12 rounded-xl overflow-hidden border border-blue-300 flex-shrink-0 cursor-pointer group bg-slate-100"
                >
                  <img
                    src={attachedImage.preview}
                    alt={attachedImage.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[220px] sm:max-w-md">
                    {attachedImage.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{(attachedImage.size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">ছবি প্রস্তুত (Ready to send)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="ছবি বাতিল করুন (Remove image)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Reading Image Loading Indicator */}
          {isReadingImage && (
            <div className="mb-2 py-1 px-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs text-indigo-700 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>ছবি প্রস্তুত করা হচ্ছে (Loading image file)...</span>
            </div>
          )}

          {/* Hidden File Pickers */}
          <input
            type="file"
            ref={galleryInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                processImageFile(e.target.files[0]);
              }
              e.target.value = '';
            }}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
          />

          <input
            type="file"
            ref={cameraInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                processImageFile(e.target.files[0]);
              }
              e.target.value = '';
            }}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            {/* Attachment Button with Popover Menu */}
            <div className="relative" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => setIsAttachMenuOpen((prev) => !prev)}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                  isAttachMenuOpen || attachedImage
                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                title="ছবি সংযুক্ত করুন (Attach image / photo)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Attachment Choice Popover */}
              {isAttachMenuOpen && (
                <div className="absolute bottom-12 left-0 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      galleryInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div>গ্যালারি থেকে ছবি</div>
                      <div className="text-[10px] text-slate-400 font-normal">JPG, PNG, WEBP</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      setIsCameraModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition text-left mt-0.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div>ক্যামেরা দিয়ে ছবি তুলুন</div>
                      <div className="text-[10px] text-slate-400 font-normal">লাইভ ক্যামেরা স্ন্যাপ</div>
                    </div>
                  </button>

                  {/* Fallback Mobile Native Camera Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAttachMenuOpen(false);
                      cameraInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition text-left mt-0.5 sm:hidden"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div>ডিভাইস ক্যামেরা (Mobile)</div>
                      <div className="text-[10px] text-slate-400 font-normal">সরাসরি ক্যামেরা অ্যাপ</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Camera Button for Quick Snapping */}
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition hidden sm:flex items-center justify-center"
              title="ক্যামেরা দিয়ে ছবি তুলুন (Take Photo)"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
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

            {/* Chat Text Input */}
            <input
              type="text"
              placeholder={
                attachedImage
                  ? 'ছবির সাথে প্রশ্ন লিখুন বা সরাসরি Send চাপুন (Type question or Send)...'
                  : 'Ask anything, upload textbook image, or type in বাংলা...'
              }
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isGenerating}
              className="flex-1 px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isGenerating || (!inputPrompt.trim() && !attachedImage)}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition active:scale-95"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Live Webcam Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(file, dataUrl) => {
          processImageFile(file);
        }}
      />

      {/* Full-resolution Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!lightboxImageUrl}
        onClose={() => setLightboxImageUrl(null)}
        imageUrl={lightboxImageUrl || ''}
        title={lightboxTitle}
      />
    </div>
  );
};
