import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { FlashcardDeck } from '../../types/index.ts';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const { flashcards, addFlashcardDeck, updateFlashcardStatus, user, addToast } = useApp();

  const [selectedDeckId, setSelectedDeckId] = useState<string>(flashcards[0]?.id || '');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [generatorTopic, setGeneratorTopic] = useState<string>('Operating Systems and Virtual Memory');
  const [cardCount, setCardCount] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const activeDeck: FlashcardDeck | undefined =
    flashcards.find((d) => d.id === selectedDeckId) || flashcards[0];
  const currentCard = activeDeck?.cards[currentCardIndex];

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatorTopic.trim()) return;

    setIsGenerating(true);
    try {
      const cards = await AIService.generateFlashcards({
        topicOrText: generatorTopic.trim(),
        count: cardCount,
      });

      const newDeck: FlashcardDeck = {
        id: `deck_${Date.now()}`,
        userId: user.id,
        title: generatorTopic.trim(),
        subject: 'Computer Science',
        color: '#e11d48',
        cards,
        createdAt: new Date().toISOString(),
      };

      addFlashcardDeck(newDeck);
      setSelectedDeckId(newDeck.id);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowGenerator(false);
      addToast(`Generated ${cards.length} spaced repetition cards!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Could not generate cards. Try another topic.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGrade = (status: 'know' | 'review' | 'difficult') => {
    if (!activeDeck || !currentCard) return;

    updateFlashcardStatus(activeDeck.id, currentCard.id, status);
    setIsFlipped(false);

    // Advance to next card if available
    if (currentCardIndex < activeDeck.cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      addToast('Finished deck review! Great active recall session.', 'success');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Active Recall & Spaced Repetition (SRS)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Interactive Flashcard Decks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Solidify long-term memory with active retrieval. Rate each card to automatically adjust spaced
            repetition intervals.
          </p>
        </div>

        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 active:scale-95 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Deck</span>
        </button>
      </div>

      {/* Generator Accordion */}
      {showGenerator && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md animate-in zoom-in-95 duration-150 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Generate AI Flashcard Deck</h3>
          <form onSubmit={handleGenerateDeck} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic or Concept</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems, Organic Chemistry, World History..."
                  value={generatorTopic}
                  onChange={(e) => setGeneratorTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Count</label>
                <select
                  value={cardCount}
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-rose-500"
                >
                  <option value={5}>5 Flashcards</option>
                  <option value={8}>8 Flashcards</option>
                  <option value={12}>12 Flashcards</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGenerator(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Cards</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deck Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {flashcards.map((deck) => {
          const isSelected = deck.id === (activeDeck?.id || '');
          return (
            <button
              key={deck.id}
              onClick={() => {
                setSelectedDeckId(deck.id);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {deck.title} ({deck.cards.length})
            </button>
          );
        })}
      </div>

      {/* Interactive 3D Card Display */}
      {activeDeck && currentCard ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>
              Card {currentCardIndex + 1} of {activeDeck.cards.length}
            </span>
            <span className="font-semibold text-rose-600">
              Reviews: {currentCard.reviewCount} • Status: {currentCard.status.toUpperCase()}
            </span>
          </div>

          {/* Flip Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[260px] sm:min-h-[300px] w-full bg-white rounded-3xl border-2 border-slate-200/80 hover:border-rose-300 p-8 shadow-xs cursor-pointer select-none transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                {isFlipped ? 'Answer & Deep Context (Back)' : 'Question / Cue (Front)'}
              </span>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tap to flip</span>
              </button>
            </div>

            <div className="py-6 text-center">
              <div className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed max-w-xl mx-auto">
                {isFlipped ? currentCard.back : currentCard.front}
              </div>

              {!isFlipped && currentCard.hint && (
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Hint: {currentCard.hint}</span>
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-slate-400">
              {isFlipped ? 'Grade your recall below to optimize scheduling' : 'Think of the answer, then click to check'}
            </div>
          </div>

          {/* SRS Grading Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleGrade('difficult')}
              className="py-3 px-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition flex flex-col items-center gap-1 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Difficult</span>
              <span className="text-[10px] text-rose-600/70 font-normal">Review Soon</span>
            </button>

            <button
              onClick={() => handleGrade('review')}
              className="py-3 px-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition flex flex-col items-center gap-1 active:scale-95"
            >
              <RotateCw className="w-4 h-4 text-amber-600" />
              <span>Good</span>
              <span className="text-[10px] text-amber-600/70 font-normal">Review Later</span>
            </button>

            <button
              onClick={() => handleGrade('know')}
              className="py-3 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition flex flex-col items-center gap-1 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mastered</span>
              <span className="text-[10px] text-emerald-600/70 font-normal">Spaced Out</span>
            </button>
          </div>

          {/* Card Carousel Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              disabled={currentCardIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Card</span>
            </button>

            <button
              onClick={() => {
                setCurrentCardIndex((prev) => Math.min(activeDeck.cards.length - 1, prev + 1));
                setIsFlipped(false);
              }}
              disabled={currentCardIndex === activeDeck.cards.length - 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1"
            >
              <span>Next Card</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
          No flashcard decks available. Click "New AI Deck" above to generate one from any topic.
        </div>
      )}
    </div>
  );
};
