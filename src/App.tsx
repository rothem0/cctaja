import React, { useState, useEffect } from 'react';
import { GameMode, TextSize, RecalledRecord } from './types/game';
import { HeaderNav } from './components/HeaderNav';
import { RainGame } from './components/RainGame';
import { WordRecallQuiz } from './components/WordRecallQuiz';
import { PoemTyping } from './components/PoemTyping';
import { MemoryLog } from './components/MemoryLog';
import { soundManager } from './utils/soundEffects';
import { Sparkles, HeartHandshake, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('RAIN_GAME');
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ttsEnabled, setTTSEnabled] = useState<boolean>(true);
  const [records, setRecords] = useState<RecalledRecord[]>([]);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Load saved preferences and records on startup
  useEffect(() => {
    try {
      const savedSize = localStorage.getItem('cheongchun_text_size') as TextSize | null;
      if (savedSize) setTextSize(savedSize);

      setSoundEnabled(soundManager.isSoundEnabled());
      setTTSEnabled(soundManager.isTTSEnabled());

      const savedRecords = localStorage.getItem('cheongchun_records');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleTextSizeChange = (newSize: TextSize) => {
    setTextSize(newSize);
    try {
      localStorage.setItem('cheongchun_text_size', newSize);
    } catch {
      // ignore
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundManager.setSoundEnabled(next);
    setSoundEnabled(next);
  };

  const handleToggleTTS = () => {
    const next = !ttsEnabled;
    soundManager.setTTSEnabled(next);
    setTTSEnabled(next);
    if (next) {
      soundManager.speakKorean('안내 음성이 켜졌습니다. 편안하게 연습하세요.');
    }
  };

  // Record a word recall event into memory log
  const handleRecordRecall = (word: string, category: string, success: boolean) => {
    const newRecord: RecalledRecord = {
      id: `${Date.now()}_${Math.random()}`,
      word,
      category,
      timestamp: Date.now(),
      mode: currentMode,
      success,
    };

    setRecords(prev => {
      const updated = [...prev, newRecord];
      try {
        localStorage.setItem('cheongchun_records', JSON.stringify(updated.slice(-200)));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearRecords = () => {
    if (window.confirm('기억 일지의 기록을 모두 초기화하시겠습니까?')) {
      setRecords([]);
      try {
        localStorage.removeItem('cheongchun_records');
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 font-sans">
      {/* Top Header Navigation */}
      <HeaderNav
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        textSize={textSize}
        onChangeTextSize={handleTextSizeChange}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        ttsEnabled={ttsEnabled}
        onToggleTTS={handleToggleTTS}
      />

      {/* Senior Comfort Sub-Bar */}
      <div className="bg-amber-100/60 border-b border-amber-200/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs sm:text-sm text-amber-950 font-medium gap-2">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>어르신 두뇌 안심 교실:</strong> 서두르지 않고 천천히 떠올리셔도 좋습니다. 틀려도 감점이 없으니 즐겁게 소환해 보세요!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1 text-amber-900 font-bold hover:underline cursor-pointer ml-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>이용 도움말</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentMode === 'RAIN_GAME' && (
          <RainGame textSize={textSize} onRecordRecall={handleRecordRecall} />
        )}

        {currentMode === 'WORD_RECALL_QUIZ' && (
          <WordRecallQuiz textSize={textSize} onRecordRecall={handleRecordRecall} />
        )}

        {currentMode === 'POEM_TYPING' && (
          <PoemTyping textSize={textSize} onRecordRecall={handleRecordRecall} />
        )}

        {currentMode === 'MEMORY_LOG' && (
          <MemoryLog
            records={records}
            textSize={textSize}
            onClearRecords={handleClearRecords}
          />
        )}
      </main>

      {/* Warm Dignified Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-stone-100/90 py-6 text-stone-600 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-bold text-stone-800 text-sm">
              청춘타자 (靑春打字) 두뇌활력교실
            </div>
            <div className="text-stone-600 mt-0.5">
              치매 예방 및 단어소환력(Word Retrieval) 인지 재활을 위해 정성껏 제작되었습니다.
            </div>
          </div>

          <div className="flex items-center gap-4 text-stone-600 text-xs">
            <span>두뇌 건강 지킴이</span>
            <span aria-hidden="true">·</span>
            <span>한메타자 스타일</span>
            <span aria-hidden="true">·</span>
            <span>음성 안내 지원</span>
          </div>
        </div>
      </footer>

      {/* Help Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-300 animate-pop">
            <h3 className="text-xl font-bold text-stone-900 mb-3 flex items-center gap-2">
              <span>📖 청춘타자 이용 안내</span>
            </h3>

            <div className="flex flex-col gap-3 text-stone-700 text-sm leading-relaxed">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block mb-0.5">1. 소나기 단어소환</strong>
                옛 한메타자 '베네치아 / 산성비' 게임처럼 하늘에서 내려오는 단어가 연못에 닿기 전에 입력합니다. 초성 보기나 소리로 듣기 힌트를 쓸 수 있습니다.
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block mb-0.5">2. 단어 연상 퀴즈</strong>
                옛 추억의 물건이나 음식의 뜻풀이를 읽고 초성을 보며 머릿속에서 단어를 소환하여 맞춰보는 두뇌 훈련입니다.
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block mb-0.5">3. 정다운 노래 연습</strong>
                '고향의 봄', '반달' 등 정겨운 가사를 한 줄씩 차분하게 치면서 타자 감각을 익힙니다.
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <strong className="text-stone-900 block mb-0.5">4. 화면 자판 안내</strong>
                화면 아래의 자판에서 다음에 칠 글자가 노란색으로 반짝여 쉽게 찾으실 수 있습니다.
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
