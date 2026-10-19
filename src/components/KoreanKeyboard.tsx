import React from 'react';
import { JAMO_TO_KEY, decomposeToAtomicJamo } from '../utils/hangul';

interface KoreanKeyboardProps {
  onKeyPress?: (char: string) => void;
  onBackspace?: () => void;
  onSpace?: () => void;
  targetWord?: string;
  currentInput?: string;
  isCompact?: boolean;
}

// 2-Beol-Sik key layout rows
const ROW1 = [
  { char: 'ㅂ', shiftChar: 'ㅃ', en: 'Q' },
  { char: 'ㅈ', shiftChar: 'ㅉ', en: 'W' },
  { char: 'ㄷ', shiftChar: 'ㄸ', en: 'E' },
  { char: 'ㄱ', shiftChar: 'ㄲ', en: 'R' },
  { char: 'ㅅ', shiftChar: 'ㅆ', en: 'T' },
  { char: 'ㅛ', shiftChar: '', en: 'Y' },
  { char: 'ㅕ', shiftChar: '', en: 'U' },
  { char: 'ㅑ', shiftChar: '', en: 'I' },
  { char: 'ㅐ', shiftChar: 'ㅒ', en: 'O' },
  { char: 'ㅔ', shiftChar: 'ㅖ', en: 'P' },
];

const ROW2 = [
  { char: 'ㅁ', shiftChar: '', en: 'A' },
  { char: 'ㄴ', shiftChar: '', en: 'S' },
  { char: 'ㅇ', shiftChar: '', en: 'D' },
  { char: 'ㄹ', shiftChar: '', en: 'F' },
  { char: 'ㅎ', shiftChar: '', en: 'G' },
  { char: 'ㅗ', shiftChar: '', en: 'H' },
  { char: 'ㅓ', shiftChar: '', en: 'J' },
  { char: 'ㅏ', shiftChar: '', en: 'K' },
  { char: 'ㅣ', shiftChar: '', en: 'L' },
];

const ROW3 = [
  { char: 'ㅋ', shiftChar: '', en: 'Z' },
  { char: 'ㅌ', shiftChar: '', en: 'X' },
  { char: 'ㅊ', shiftChar: '', en: 'C' },
  { char: 'ㅍ', shiftChar: '', en: 'V' },
  { char: 'ㅠ', shiftChar: '', en: 'B' },
  { char: 'ㅜ', shiftChar: '', en: 'N' },
  { char: 'ㅡ', shiftChar: '', en: 'M' },
];

export const KoreanKeyboard: React.FC<KoreanKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onSpace,
  targetWord = '',
  currentInput = '',
  isCompact = false,
}) => {
  // Find which jamo should be typed next for the hint highlight
  let nextJamo = '';
  if (targetWord) {
    const targetJamos = decomposeToAtomicJamo(targetWord);
    const typedJamos = decomposeToAtomicJamo(currentInput);
    if (targetJamos.length > typedJamos.length) {
      nextJamo = targetJamos[typedJamos.length];
    }
  }

  const isNextKey = (char: string, shiftChar?: string) => {
    return nextJamo === char || (Boolean(shiftChar) && nextJamo === shiftChar);
  };

  const isVowel = (char: string) => {
    return 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.includes(char);
  };

  const renderKey = (item: { char: string; shiftChar: string; en: string }) => {
    const active = isNextKey(item.char, item.shiftChar);
    const vowel = isVowel(item.char);

    return (
      <button
        key={item.char}
        type="button"
        onClick={() => onKeyPress && onKeyPress(item.char)}
        aria-label={`${item.char} 키`}
        className={`relative flex flex-col items-center justify-center rounded-lg transition-all select-none
          ${isCompact ? 'h-10 min-w-8 text-base' : 'h-12 sm:h-14 min-w-[2.2rem] sm:min-w-[2.8rem] text-lg sm:text-xl'}
          ${
            active
              ? 'bg-amber-400 text-stone-950 font-black shadow-md ring-2 ring-amber-600 scale-105 z-10 animate-bounce'
              : vowel
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/80 shadow-xs'
              : 'bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200 shadow-xs'
          }
          active:scale-95 cursor-pointer`}
      >
        <span className="font-bold leading-tight">{item.char}</span>
        {item.shiftChar && (
          <span className="text-[10px] sm:text-xs text-stone-500 font-semibold absolute top-1 right-1">
            {item.shiftChar}
          </span>
        )}
        {!isCompact && (
          <span className="text-[9px] text-stone-400 font-mono absolute bottom-0.5 right-1">
            {item.en}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-3 bg-stone-100/90 rounded-2xl border border-stone-200/90 shadow-sm backdrop-blur-xs">
      <div className="flex items-center justify-between px-2 pb-2 text-xs text-stone-600 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-stone-100 border border-stone-300"></span>
            <span>자음</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300"></span>
            <span>모음</span>
          </span>
        </div>
        {nextJamo ? (
          <div className="flex items-center gap-1 text-amber-900 font-bold bg-amber-100/80 px-2 py-0.5 rounded">
            <span>칠 차례:</span>
            <span className="text-base text-amber-950 font-black px-1.5 py-0.2 bg-amber-300 rounded shadow-xs">
              {nextJamo}
            </span>
          </div>
        ) : (
          <span className="text-stone-600">두벌식 한글 자판 안내</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {/* Row 1 */}
        <div className="flex justify-center gap-1 sm:gap-1.5">
          {ROW1.map(renderKey)}
        </div>

        {/* Row 2 */}
        <div className="flex justify-center gap-1 sm:gap-1.5 px-3">
          {ROW2.map(renderKey)}
        </div>

        {/* Row 3 with Backspace */}
        <div className="flex justify-center items-center gap-1 sm:gap-1.5">
          {ROW3.map(renderKey)}
          <button
            type="button"
            onClick={onBackspace}
            aria-label="한 글자 지우기"
            className={`flex items-center justify-center rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs sm:text-sm font-bold border border-stone-300 transition-colors cursor-pointer px-2 sm:px-3
              ${isCompact ? 'h-10' : 'h-12 sm:h-14'}`}
          >
            지우기 ⌫
          </button>
        </div>

        {/* Row 4: Space bar */}
        <div className="flex justify-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={onSpace}
            aria-label="띄어쓰기 스페이스바"
            className={`flex items-center justify-center w-64 rounded-lg bg-stone-50 hover:bg-stone-200 text-stone-600 text-xs sm:text-sm font-semibold border border-stone-200 transition-colors cursor-pointer shadow-xs
              ${isCompact ? 'h-8' : 'h-10 sm:h-11'}`}
          >
            스페이스 (띄어쓰기)
          </button>
        </div>
      </div>
    </div>
  );
};
