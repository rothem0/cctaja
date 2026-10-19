import React, { useState, useEffect, useRef } from 'react';
import { PoemItem, TextSize } from '../types/game';
import { POEM_BANK } from '../data/wordBank';
import { soundManager } from '../utils/soundEffects';
import { KoreanKeyboard } from './KoreanKeyboard';
import { calculateAccuracy, calculateCPM } from '../utils/hangul';
import confetti from 'canvas-confetti';
import { Volume2, RotateCcw, ChevronRight, Award, Music, BookOpen } from 'lucide-react';

interface PoemTypingProps {
  textSize: TextSize;
  onRecordRecall: (word: string, category: string, success: boolean) => void;
}

export const PoemTyping: React.FC<PoemTypingProps> = ({ textSize, onRecordRecall }) => {
  const [selectedPoemIndex, setSelectedPoemIndex] = useState<number>(0);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);

  // Speed and accuracy metrics
  const [cpm, setCpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentPoem = POEM_BANK[selectedPoemIndex] || POEM_BANK[0];
  const targetLine = currentPoem.lines[currentLineIndex] || '';

  useEffect(() => {
    // Reset state when switching poem
    setCurrentLineIndex(0);
    setTypedText('');
    setStartTime(null);
    setCompletedLines([]);
    setIsFinished(false);
    setCpm(0);
    setAccuracy(100);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedPoemIndex]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    soundManager.playKeyClick();

    if (!startTime) {
      setStartTime(Date.now());
    }

    setTypedText(val);

    // Calculate current accuracy
    const acc = calculateAccuracy(targetLine, val);
    setAccuracy(acc);

    // Calculate CPM
    if (startTime) {
      const elapsedSec = (Date.now() - startTime) / 1000;
      const totalChars = completedLines.join('').length + val.length;
      setCpm(calculateCPM(totalChars, elapsedSec));
    }

    // Check if line is fully and correctly typed
    if (val === targetLine) {
      soundManager.playSuccess();
      const nextCompleted = [...completedLines, val];
      setCompletedLines(nextCompleted);

      onRecordRecall(targetLine.slice(0, 8), currentPoem.category, true);

      if (currentLineIndex + 1 < currentPoem.lines.length) {
        // Move to next line
        setCurrentLineIndex(prev => prev + 1);
        setTypedText('');
      } else {
        // Entire poem finished!
        setIsFinished(true);
        soundManager.playFanfare();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  // Keyboard button click
  const handleKeyboardPress = (char: string) => {
    soundManager.playKeyClick();
    if (!startTime) setStartTime(Date.now());

    const nextVal = typedText + char;
    setTypedText(nextVal);
    const acc = calculateAccuracy(targetLine, nextVal);
    setAccuracy(acc);

    if (nextVal === targetLine) {
      soundManager.playSuccess();
      const nextCompleted = [...completedLines, nextVal];
      setCompletedLines(nextCompleted);
      onRecordRecall(targetLine.slice(0, 8), currentPoem.category, true);

      if (currentLineIndex + 1 < currentPoem.lines.length) {
        setCurrentLineIndex(prev => prev + 1);
        setTypedText('');
      } else {
        setIsFinished(true);
        soundManager.playFanfare();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      }
    }
  };

  const handleBackspace = () => {
    soundManager.playKeyClick();
    setTypedText(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    handleKeyboardPress(' ');
  };

  const readLineAloud = () => {
    soundManager.speakKorean(targetLine, true);
  };

  const resetPoem = () => {
    setCurrentLineIndex(0);
    setTypedText('');
    setStartTime(null);
    setCompletedLines([]);
    setIsFinished(false);
    setCpm(0);
    setAccuracy(100);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5 pb-8">
      {/* Top Header Selector & Live Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-base font-bold text-stone-900">
              정다운 옛 노래 & 이야기 타자
            </h2>
            <div className="text-xs text-stone-600">
              마음이 따뜻해지는 동요 가사를 천천히 타이핑해보세요
            </div>
          </div>
        </div>

        {/* Poem Selector Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedPoemIndex}
            onChange={e => setSelectedPoemIndex(Number(e.target.value))}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 cursor-pointer"
          >
            {POEM_BANK.map((p, idx) => (
              <option key={p.id} value={idx}>
                {p.title} ({p.author})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
          <div className="text-[11px] text-stone-600 font-medium">현재 타수</div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono tabular-nums">
            {cpm} <span className="text-xs font-normal">타/분</span>
          </div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
          <div className="text-[11px] text-stone-600 font-medium">정확도</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tabular-nums">
            {accuracy}%
          </div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
          <div className="text-[11px] text-stone-600 font-medium">진행 줄수</div>
          <div className="text-xl sm:text-2xl font-black text-stone-800 font-mono tabular-nums">
            {currentLineIndex + 1} / {currentPoem.lines.length}
          </div>
        </div>
      </div>

      {/* Main Classic Typing Frame */}
      <div className="bg-white rounded-2xl border-2 border-stone-300/90 shadow-sm p-6 sm:p-8 flex flex-col gap-6 relative">
        {/* Title and Voice */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
              {currentPoem.title}
            </h3>
            <span className="text-xs text-stone-600 font-medium">
              {currentPoem.author} · {currentPoem.description}
            </span>
          </div>

          <button
            type="button"
            onClick={readLineAloud}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>노랫말 듣기</span>
          </button>
        </div>

        {/* Lines Display (Previous lines dim, active line highlighted) */}
        <div className="flex flex-col gap-3 font-serif">
          {currentPoem.lines.map((line, idx) => {
            const isCompleted = idx < currentLineIndex;
            const isCurrent = idx === currentLineIndex;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-amber-50/80 border-2 border-amber-300 shadow-xs'
                    : isCompleted
                    ? 'bg-stone-50 border border-stone-200/60 opacity-60'
                    : 'opacity-40'
                }`}
              >
                {/* Reference Text */}
                <div
                  className={`font-bold ${
                    textSize === 'huge'
                      ? 'text-2xl sm:text-3xl'
                      : textSize === 'large'
                      ? 'text-xl sm:text-2xl'
                      : 'text-lg sm:text-xl'
                  } ${isCurrent ? 'text-stone-950' : 'text-stone-600'}`}
                >
                  {line}
                </div>

                {/* Real-time typing display for active line */}
                {isCurrent && !isFinished && (
                  <div className="mt-3 pt-3 border-t border-amber-200/70 flex flex-col gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={typedText}
                      onChange={handleInputChange}
                      placeholder="위의 글을 보고 그대로 따라 쳐보세요"
                      autoFocus
                      className={`w-full py-2.5 px-3 rounded-lg border-2 border-amber-500 bg-white font-serif font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                        textSize === 'huge'
                          ? 'text-2xl'
                          : textSize === 'large'
                          ? 'text-xl'
                          : 'text-lg'
                      }`}
                    />

                    {/* Syllable-by-syllable comparison guide */}
                    <div className="flex flex-wrap gap-1 text-sm font-mono pt-1 text-stone-600">
                      <span>입력 상태:</span>
                      {line.split('').map((char, charIdx) => {
                        const typedChar = typedText[charIdx];
                        let statusColor = 'text-stone-400';
                        if (typedChar !== undefined) {
                          statusColor =
                            typedChar === char
                              ? 'text-emerald-700 font-bold bg-emerald-100 px-1 rounded'
                              : 'text-rose-700 font-bold bg-rose-100 px-1 rounded';
                        }
                        return (
                          <span key={charIdx} className={statusColor}>
                            {char === ' ' ? '␣' : char}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Finished Screen Card */}
        {isFinished && (
          <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-300 flex flex-col items-center justify-center text-center gap-3 animate-pop">
            <div className="w-14 h-14 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-stone-900 font-serif">
              "{currentPoem.title}" 완성을 축하드립니다!
            </h4>
            <p className="text-sm text-stone-700 max-w-md">
              평균 타수 <strong>{cpm}타/분</strong>, 정확도 <strong>{accuracy}%</strong>로 정성스럽게 한 글자 한 글자 소환하셨습니다.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={resetPoem}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg border border-stone-300 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 연습하기</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedPoemIndex(prev => (prev + 1) % POEM_BANK.length)
                }
                className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg shadow-xs cursor-pointer"
              >
                <span>다음 시/노래 선택</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Screen Keyboard */}
      {showKeyboard && !isFinished && (
        <KoreanKeyboard
          targetWord={targetLine}
          currentInput={typedText}
          onKeyPress={handleKeyboardPress}
          onBackspace={handleBackspace}
          onSpace={handleSpace}
        />
      )}
    </div>
  );
};
