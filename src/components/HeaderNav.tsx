import React from 'react';
import { GameMode, TextSize } from '../types/game';
import { Volume2, VolumeX, Mic, MicOff, Type } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface HeaderNavProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  textSize: TextSize;
  onChangeTextSize: (size: TextSize) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ttsEnabled: boolean;
  onToggleTTS: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentMode,
  onSelectMode,
  textSize,
  onChangeTextSize,
  soundEnabled,
  onToggleSound,
  ttsEnabled,
  onToggleTTS,
}) => {
  const cycleTextSize = () => {
    if (textSize === 'normal') onChangeTextSize('large');
    else if (textSize === 'large') onChangeTextSize('huge');
    else onChangeTextSize('normal');
  };

  const textSizeLabel = {
    normal: '글자 보통',
    large: '글자 크게',
    huge: '글자 아주크게',
  }[textSize];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectMode('RAIN_GAME')}
          className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg font-serif">
            靑
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              청춘타자 <span className="text-amber-400 font-normal text-sm font-serif">한메교실</span>
            </div>
            <div className="text-[10px] text-stone-400 tracking-wider">
              어르신 두뇌 활력 단어소환
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single-line, concise) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            type="button"
            onClick={() => onSelectMode('RAIN_GAME')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentMode === 'RAIN_GAME'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            소나기 단어소환
          </button>
          <button
            type="button"
            onClick={() => onSelectMode('WORD_RECALL_QUIZ')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentMode === 'WORD_RECALL_QUIZ'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            단어 연상 퀴즈
          </button>
          <button
            type="button"
            onClick={() => onSelectMode('POEM_TYPING')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentMode === 'POEM_TYPING'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            정다운 노래 연습
          </button>
          <button
            type="button"
            onClick={() => onSelectMode('MEMORY_LOG')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentMode === 'MEMORY_LOG'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            나의 두뇌 일지
          </button>
        </nav>

        {/* Zone 3: Senior-Friendly Quick Accessibility Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Text Size Toggle */}
          <button
            type="button"
            onClick={cycleTextSize}
            title="글자 크기 변경"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span>{textSizeLabel}</span>
          </button>

          {/* TTS Speech Toggle */}
          <button
            type="button"
            onClick={onToggleTTS}
            title={ttsEnabled ? '소리 읽기 끄기' : '소리 읽기 켜기'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              ttsEnabled
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            {ttsEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-800 bg-stone-950 px-2 py-2 text-xs">
        <button
          type="button"
          onClick={() => onSelectMode('RAIN_GAME')}
          className={`py-1 px-2 rounded ${currentMode === 'RAIN_GAME' ? 'text-amber-400 font-bold bg-stone-800' : 'text-stone-400'}`}
        >
          소나기 타자
        </button>
        <button
          type="button"
          onClick={() => onSelectMode('WORD_RECALL_QUIZ')}
          className={`py-1 px-2 rounded ${currentMode === 'WORD_RECALL_QUIZ' ? 'text-amber-400 font-bold bg-stone-800' : 'text-stone-400'}`}
        >
          단어 퀴즈
        </button>
        <button
          type="button"
          onClick={() => onSelectMode('POEM_TYPING')}
          className={`py-1 px-2 rounded ${currentMode === 'POEM_TYPING' ? 'text-amber-400 font-bold bg-stone-800' : 'text-stone-400'}`}
        >
          동요 연습
        </button>
        <button
          type="button"
          onClick={() => onSelectMode('MEMORY_LOG')}
          className={`py-1 px-2 rounded ${currentMode === 'MEMORY_LOG' ? 'text-amber-400 font-bold bg-stone-800' : 'text-stone-400'}`}
        >
          두뇌 일지
        </button>
      </div>
    </header>
  );
};
