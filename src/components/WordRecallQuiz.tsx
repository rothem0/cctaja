import React, { useState, useEffect } from 'react';
import { WordItem, TextSize } from '../types/game';
import { WORD_BANK, CATEGORIES } from '../data/wordBank';
import { soundManager } from '../utils/soundEffects';
import { KoreanKeyboard } from './KoreanKeyboard';
import { getSpacedInitials } from '../utils/hangul';
import confetti from 'canvas-confetti';
import { Volume2, Lightbulb, ChevronRight, CheckCircle2, RotateCcw, Sparkles, BookOpen } from 'lucide-react';

interface WordRecallQuizProps {
  textSize: TextSize;
  onRecordRecall: (word: string, category: string, success: boolean) => void;
}

export const WordRecallQuiz: React.FC<WordRecallQuizProps> = ({ textSize, onRecordRecall }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체 모음');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [revealedChars, setRevealedChars] = useState<number>(0);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);

  const filteredWords = selectedCategory === '전체 모음'
    ? WORD_BANK
    : WORD_BANK.filter(w => w.category === selectedCategory);

  const currentWord: WordItem | undefined = filteredWords[currentIndex] || filteredWords[0];

  // Read clue out loud when switching word
  useEffect(() => {
    if (currentWord) {
      soundManager.speakKorean(`이것은 무엇일까요? ${currentWord.clue}`);
    }
  }, [currentIndex, selectedCategory]);

  const handleNextWord = () => {
    setInputAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setRevealedChars(0);
    setCurrentIndex(prev => (prev + 1) % filteredWords.length);
  };

  const handleCheckAnswer = (entered: string = inputAnswer) => {
    if (!currentWord || isAnswered) return;
    const cleanEntered = entered.trim();

    if (cleanEntered === currentWord.word) {
      // Correct!
      soundManager.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setIsCorrect(true);
      setIsAnswered(true);
      setScore(s => s + 100);
      onRecordRecall(currentWord.word, currentWord.category, true);
      soundManager.speakKorean(`참 잘하셨습니다! 정답은 ${currentWord.word} 입니다.`);
    } else {
      // Soft hint guidance
      soundManager.playGentleNotice();
    }
  };

  // Keyboard button click
  const handleKeyboardPress = (char: string) => {
    if (isAnswered) return;
    soundManager.playKeyClick();
    const nextVal = inputAnswer + char;
    setInputAnswer(nextVal);
    if (currentWord && nextVal.trim() === currentWord.word) {
      handleCheckAnswer(nextVal);
    }
  };

  const handleBackspace = () => {
    soundManager.playKeyClick();
    setInputAnswer(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    soundManager.playKeyClick();
    setInputAnswer(prev => prev + ' ');
  };

  const handleRevealFirstLetter = () => {
    if (!currentWord) return;
    soundManager.playKeyClick();
    setRevealedChars(prev => Math.min(prev + 1, currentWord.word.length));
  };

  const handleShowFullAnswer = () => {
    if (!currentWord) return;
    setIsAnswered(true);
    setIsCorrect(false);
    setInputAnswer(currentWord.word);
    onRecordRecall(currentWord.word, currentWord.category, false);
    soundManager.speakKorean(`정답은 ${currentWord.word} 입니다. ${currentWord.clue}`);
  };

  const playClueAudio = () => {
    if (currentWord) {
      soundManager.speakKorean(currentWord.clue, true);
    }
  };

  // Display masked representation
  const renderWordMask = () => {
    if (!currentWord) return null;
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-3 py-4">
        {currentWord.word.split('').map((char, idx) => {
          const isRevealed = idx < revealedChars || isAnswered;
          return (
            <div
              key={idx}
              className={`w-12 h-14 sm:w-16 sm:h-18 rounded-xl flex items-center justify-center font-bold text-2xl sm:text-3xl border-2 transition-all ${
                isRevealed
                  ? 'bg-amber-100 border-amber-400 text-stone-900 shadow-sm'
                  : 'bg-white border-stone-300 text-stone-400 border-dashed'
              }`}
            >
              {isRevealed ? char : '?'}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-8">
      {/* Top Header Filter & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              추억 단어 연상 소환 퀴즈
            </h2>
            <div className="text-xs text-stone-600">
              단서를 읽고 머릿속에서 단어를 소환하여 키보드로 적어보세요
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setCurrentIndex(0);
              setInputAnswer('');
              setIsAnswered(false);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-2.5 py-1.5 rounded-lg">
            {currentIndex + 1} / {filteredWords.length} 문제
          </span>
        </div>
      </div>

      {/* Main Flash Quiz Card */}
      {currentWord && (
        <div className="bg-white rounded-2xl border-2 border-stone-200/90 shadow-md p-6 sm:p-8 flex flex-col gap-6">
          {/* Card Top Category & Audio */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              {currentWord.category}
            </span>

            <button
              type="button"
              onClick={playClueAudio}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-100/70 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>단서 소리로 듣기</span>
            </button>
          </div>

          {/* Question Clue Prompt */}
          <div className="text-center py-2">
            <div className="text-xs font-semibold text-stone-600 mb-2">
              💡 다음 설명을 읽고 어떤 단어인지 맞춰보세요
            </div>
            <p
              className={`font-serif text-stone-900 font-bold leading-relaxed max-w-2xl mx-auto ${
                textSize === 'huge' ? 'text-2xl sm:text-3xl' : textSize === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
              }`}
            >
              "{currentWord.clue}"
            </p>
          </div>

          {/* Initial Consonants (초성) Recall Banner */}
          <div className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="text-xs text-stone-600 font-medium mb-1">
              초성 힌트 ({currentWord.word.length}글자)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 tracking-widest font-mono">
              [ {getSpacedInitials(currentWord.word)} ]
            </div>
          </div>

          {/* Letter Slots */}
          {renderWordMask()}

          {/* Input Box */}
          <div className="max-w-md mx-auto w-full flex flex-col gap-3">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleCheckAnswer();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputAnswer}
                onChange={e => {
                  setInputAnswer(e.target.value);
                  if (e.target.value.trim() === currentWord.word) {
                    handleCheckAnswer(e.target.value);
                  }
                }}
                disabled={isAnswered}
                placeholder="단어를 적어주세요"
                autoFocus
                className={`flex-1 py-3 px-4 rounded-xl border-2 border-stone-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 text-center font-bold text-stone-900 focus:outline-none transition-all ${
                  textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-lg'
                }`}
              />
              <button
                type="submit"
                disabled={isAnswered || !inputAnswer.trim()}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                소환 확인
              </button>
            </form>

            {/* Hint Controls */}
            {!isAnswered && (
              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleRevealFirstLetter}
                  disabled={revealedChars >= currentWord.word.length}
                  className="flex items-center gap-1 text-stone-600 hover:text-amber-800 py-1 px-2.5 rounded border border-stone-200 bg-stone-50 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>글자 한 자 열기</span>
                </button>
                <button
                  type="button"
                  onClick={handleShowFullAnswer}
                  className="text-stone-600 hover:text-stone-800 py-1 px-2.5 rounded border border-stone-200 bg-stone-50 cursor-pointer"
                >
                  정답 확인하기
                </button>
              </div>
            )}
          </div>

          {/* Success / Explanation Feedback */}
          {isAnswered && (
            <div
              className={`p-5 rounded-xl border flex flex-col gap-2 animate-pop ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-6 h-6 ${isCorrect ? 'text-emerald-600' : 'text-amber-600'}`}
                  />
                  <span className="text-lg font-bold">
                    {isCorrect ? '참 잘하셨습니다! 소환 성공!' : `정답: ${currentWord.word}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextWord}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white font-bold text-sm rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <span>다음 문제로 가기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {currentWord.funFact && (
                <p className="text-sm text-stone-700 mt-2 border-t border-stone-200/60 pt-2 leading-relaxed">
                  📜 <strong>추억 이야기:</strong> {currentWord.funFact}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Virtual 2-Beol-Sik Keyboard */}
      {showKeyboard && (
        <KoreanKeyboard
          targetWord={currentWord?.word || ''}
          currentInput={inputAnswer}
          onKeyPress={handleKeyboardPress}
          onBackspace={handleBackspace}
          onSpace={handleSpace}
        />
      )}
    </div>
  );
};
