import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Languages,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export const VoiceTutorView: React.FC = () => {
  const { preferences, updatePreferences, addToast } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiVoiceResponse, setAiVoiceResponse] = useState(
    `Hello! I am your Good Learning Voice Tutor. You can practice speaking with me in English or বাংলা. Tap the microphone and tell me what you'd like to explore today!`
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'bn'>('en');

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = targetLanguage === 'bn' ? 'bn-BD' : 'en-US';

      rec.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(text);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [targetLanguage]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      addToast('Speech Recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const clean = text.replace(/[#*`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = preferences.voiceSpeed || 1.0;
    utterance.lang = targetLanguage === 'bn' ? 'bn-BD' : 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendVoiceQuery = async (customPrompt?: string) => {
    const query = customPrompt || transcript;
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      const response = await AIService.chat(
        [
          {
            role: 'user',
            content: `The user spoke the following query: "${query}". 
Respond as an encouraging voice conversational tutor. Keep answers concise, natural to hear aloud, and include pronunciation or phrasing tips if helpful. Language: ${targetLanguage}.`,
          },
        ],
        'You are an audio voice tutor. Speak warmly and clearly. Keep sentences concise for speech synthesis.'
      );

      setAiVoiceResponse(response);
      speakText(response);
      addToast('Voice response received!', 'success');
    } catch (err) {
      console.error(err);
      setAiVoiceResponse('I heard you clearly. Let us continue our verbal learning session!');
      speakText('I heard you clearly. Let us continue our verbal learning session!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2">
            <Mic className="w-3.5 h-3.5" />
            <span>Interactive Voice & Pronunciation Tutor</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Hands-Free Voice Study Partner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Engage in natural verbal dialogue. Practice English or বাংলা conversation, improve phrasing,
            and review academic concepts without touching a keyboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Target Language */}
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white shadow-xs focus:outline-hidden"
          >
            <option value="en">English (US/UK)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </div>
      </div>

      {/* Voice Interaction Stage */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center space-y-6">
        {/* Animated Mic Button */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-30 scale-150" />
            )}
            <button
              onClick={toggleMic}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-600/30 ring-8 ring-rose-100'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 ring-8 ring-teal-50'
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-4">
            {isListening ? 'Listening to your voice... Speak now' : 'Tap microphone to speak'}
          </span>
        </div>

        {/* Live speech transcription */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 min-h-[70px] flex items-center justify-center italic">
          {transcript || 'Your spoken words will appear here in real-time...'}
        </div>

        {transcript && (
          <button
            onClick={() => handleSendVoiceQuery()}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
          >
            {isProcessing ? 'Processing query...' : 'Ask Tutor This Speech Query'}
          </button>
        )}

        {/* Tutor Voice Response Card */}
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-teal-50/60 border border-teal-200 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tutor Verbal Response</span>
            </span>

            <button
              onClick={() => speakText(aiVoiceResponse)}
              className="p-1.5 rounded-lg bg-teal-100 text-teal-800 hover:bg-teal-200 transition"
              title="Replay Audio"
            >
              {isSpeaking ? <Volume2 className="w-4 h-4 text-teal-900 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-xs sm:text-sm text-teal-950 leading-relaxed">
            <MarkdownRenderer content={aiVoiceResponse} />
          </div>
        </div>

        {/* Speed & Controls */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="font-semibold">Speech Speed:</span>
          {[0.8, 1.0, 1.2].map((spd) => (
            <button
              key={spd}
              onClick={() => updatePreferences({ voiceSpeed: spd })}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                preferences.voiceSpeed === spd
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
