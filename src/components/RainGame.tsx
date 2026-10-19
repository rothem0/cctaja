import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WordItem, FallingWord, SpeedLevel, TextSize } from '../types/game';
import { WORD_BANK, CATEGORIES } from '../data/wordBank';
import { soundManager } from '../utils/soundEffects';
import { KoreanKeyboard } from './KoreanKeyboard';
import { getSpacedInitials } from '../utils/hangul';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Heart, HelpCircle, ShieldAlert, Award, Keyboard } from 'lucide-react';

interface RainGameProps {
  textSize: TextSize;
  onRecordRecall: (word: string, category: string, success: boolean) => void;
}

export const RainGame: React.FC<RainGameProps> = ({ textSize, onRecordRecall }) => {
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'PAUSED' | 'SUMMARY'>('READY');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체 모음');
  const [speedLevel, setSpeedLevel] = useState<SpeedLevel>('very-slow');
  const [displayMode, setDisplayMode] = useState<'FULL' | 'INITIALS' | 'CLUE_FIRST'>('FULL');
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);

  // Gameplay state
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [lives, setLives] = useState<number>(5);
  const [recalledCount, setRecalledCount] = useState<number>(0);
  const [lastRecalled, setLastRecalled] = useState<WordItem | null>(null);
  const [activeHintWord, setActiveHintWord] = useState<FallingWord | null>(null);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const freezeTimerRef = useRef<number | null>(null);

  // Speed multiplier based on senior-friendly presets
  const speedConfig = {
    'very-slow': { fallSpeed: 0.12, spawnInterval: 7000 },
    'slow': { fallSpeed: 0.22, spawnInterval: 5000 },
    'normal': { fallSpeed: 0.38, spawnInterval: 3800 },
    'fast': { fallSpeed: 0.65, spawnInterval: 2600 },
  }[speedLevel];

  // Filter word bank by chosen category
  const filteredWords = selectedCategory === '전체 모음'
    ? WORD_BANK
    : WORD_BANK.filter(w => w.category === selectedCategory);

  // Start or reset game
  const startGame = () => {
    setGameState('PLAYING');
    setFallingWords([]);
    setInputValue('');
    setScore(0);
    setCombo(0);
    setLives(5);
    setRecalledCount(0);
    setLastRecalled(null);
    setIsFrozen(false);
    lastSpawnTimeRef.current = Date.now();
    soundManager.playKeyClick();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const pauseGame = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      lastSpawnTimeRef.current = Date.now();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Spawn a new falling word item
  const spawnWord = useCallback(() => {
    if (filteredWords.length === 0) return;

    // Pick random word from bank
    const randomItem = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    // Random horizontal position (10% to 80%)
    const xPos = 10 + Math.random() * 70;

    // 10% chance of a special bonus drop (단비 / 시간 멈춤)
    const rand = Math.random();
    let special: 'rain' | 'freeze' | undefined = undefined;
    if (rand < 0.08) special = 'rain';
    else if (rand < 0.16) special = 'freeze';

    const newFalling: FallingWord = {
      id: `${randomItem.id}_${Date.now()}_${Math.random()}`,
      word: randomItem.word,
      clue: randomItem.clue,
      initials: randomItem.initials,
      category: randomItem.category,
      x: xPos,
      y: 2,
      speed: speedConfig.fallSpeed * (0.85 + Math.random() * 0.3),
      isSpecial: special,
    };

    setFallingWords(prev => [...prev, newFalling]);
    // Speak first spawned word if queue was empty
    if (fallingWords.length === 0) {
      soundManager.speakKorean(`${randomItem.word}. ${randomItem.clue}`);
    }
  }, [filteredWords, speedConfig.fallSpeed, fallingWords.length]);

  // Main animation frame game loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    let animationFrameId: number;

    const loop = () => {
      const now = Date.now();

      // Check spawn condition (max 5 active falling words to avoid cognitive overload)
      if (now - lastSpawnTimeRef.current > speedConfig.spawnInterval) {
        setFallingWords(prev => {
          if (prev.length < 5) {
            lastSpawnTimeRef.current = now;
            spawnWord();
          }
          return prev;
        });
      }

      // Move words down if not frozen
      if (!isFrozen) {
        setFallingWords(prev => {
          const updated: FallingWord[] = [];
          let missedCount = 0;

          for (const item of prev) {
            const nextY = item.y + item.speed;

            if (nextY >= 88) {
              // Reached flower garden at bottom
              missedCount++;
              soundManager.playGentleNotice();
              onRecordRecall(item.word, item.category, false);
            } else {
              updated.push({ ...item, y: nextY });
            }
          }

          if (missedCount > 0) {
            setLives(curr => {
              const nextLives = Math.max(0, curr - missedCount);
              if (nextLives === 0) {
                setGameState('SUMMARY');
              }
              return nextLives;
            });
            setCombo(0);
          }

          return updated;
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    gameLoopRef.current = animationFrameId;

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, isFrozen, speedConfig.spawnInterval, spawnWord, onRecordRecall]);

  // Handle typing input submission
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setInputValue(e.target.value);
    soundManager.playKeyClick();

    // Check if entered value matches any currently falling word
    const matchedIndex = fallingWords.findIndex(item => item.word === val);

    if (matchedIndex !== -1) {
      const matched = fallingWords[matchedIndex];

      // Success!
      soundManager.playDropSplash();
      soundManager.playSuccess();

      // Handle special items
      if (matched.isSpecial === 'rain') {
        // Clear all words on screen!
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setScore(s => s + 500);
      } else if (matched.isSpecial === 'freeze') {
        // Freeze falling words for 8 seconds
        setIsFrozen(true);
        if (freezeTimerRef.current) clearTimeout(freezeTimerRef.current);
        freezeTimerRef.current = window.setTimeout(() => {
          setIsFrozen(false);
        }, 8000);
      }

      // Record word and points
      const wordObj = WORD_BANK.find(w => w.word === matched.word) || null;
      setLastRecalled(wordObj);
      setRecalledCount(c => c + 1);
      const earned = 100 + combo * 20;
      setScore(s => s + earned);
      setCombo(c => c + 1);

      onRecordRecall(matched.word, matched.category, true);

      // Remove matched word
      setFallingWords(prev => prev.filter((_, idx) => idx !== matchedIndex));
      setInputValue('');
    }
  };

  // Keyboard button click handler
  const handleKeyboardPress = (char: string) => {
    soundManager.playKeyClick();
    const nextVal = (inputValue + char).trim();
    setInputValue(inputValue + char);

    // Check match
    const matchedIndex = fallingWords.findIndex(item => item.word === nextVal);
    if (matchedIndex !== -1) {
      const matched = fallingWords[matchedIndex];
      soundManager.playDropSplash();
      soundManager.playSuccess();
      const wordObj = WORD_BANK.find(w => w.word === matched.word) || null;
      setLastRecalled(wordObj);
      setRecalledCount(c => c + 1);
      setScore(s => s + 100 + combo * 20);
      setCombo(c => c + 1);
      onRecordRecall(matched.word, matched.category, true);
      setFallingWords(prev => prev.filter((_, idx) => idx !== matchedIndex));
      setInputValue('');
    }
  };

  const handleBackspace = () => {
    soundManager.playKeyClick();
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    soundManager.playKeyClick();
    setInputValue(prev => prev + ' ');
  };

  // Find lowest (most urgent) word for typing guidance
  const lowestWord = fallingWords.reduce<FallingWord | null>((lowest, current) => {
    if (!lowest) return current;
    return current.y > lowest.y ? current : lowest;
  }, null);

  // Trigger TTS voice reading for the most urgent word
  const speakCurrentWord = (item: FallingWord) => {
    setActiveHintWord(item);
    soundManager.speakKorean(`${item.word}. 뜻: ${item.clue}`, true);
  };

  // Text scaling classes
  const wordTextClass = {
    normal: 'text-lg sm:text-xl font-bold',
    large: 'text-xl sm:text-2xl font-bold',
    huge: 'text-2xl sm:text-3xl font-extrabold',
  }[textSize];

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto pb-8">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-4">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1.5" title="남은 꽃송이">
            <span className="text-xs text-stone-600 font-semibold mr-1">꽃밭 활력:</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform ${
                  i < lives
                    ? 'text-rose-500 fill-rose-500 scale-105'
                    : 'text-stone-300 fill-stone-100 scale-95'
                }`}
              />
            ))}
          </div>

          <span className="text-stone-300">|</span>

          {/* Recalled Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 font-semibold">소환 성공:</span>
            <span className="text-base sm:text-lg font-black text-amber-700 font-mono tabular-nums">
              {recalledCount}개
            </span>
          </div>

          {combo > 1 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-pulse">
              {combo}연속 소환!
            </span>
          )}
        </div>

        {/* Speed & Mode Selectors */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            disabled={gameState === 'PLAYING'}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-800 cursor-pointer disabled:opacity-50"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Speed Selector */}
          <select
            value={speedLevel}
            onChange={e => setSpeedLevel(e.target.value as SpeedLevel)}
            disabled={gameState === 'PLAYING'}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-800 cursor-pointer disabled:opacity-50"
          >
            <option value="very-slow">아주 느림 (시니어 맞춤)</option>
            <option value="slow">느림 (편안한 연습)</option>
            <option value="normal">보통 (산뜻한 연습)</option>
            <option value="fast">도전 (빠른 소환)</option>
          </select>

          {/* Display Mode */}
          <select
            value={displayMode}
            onChange={e => setDisplayMode(e.target.value as 'FULL' | 'INITIALS' | 'CLUE_FIRST')}
            disabled={gameState === 'PLAYING'}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-800 cursor-pointer disabled:opacity-50"
          >
            <option value="FULL">단어 바로 보기</option>
            <option value="INITIALS">초성 힌트 보고 소환</option>
            <option value="CLUE_FIRST">뜻 단서 듣고 소환</option>
          </select>
        </div>
      </div>

      {/* Main Game Screen Arena */}
      <div className="relative w-full h-[460px] sm:h-[500px] rounded-2xl overflow-hidden border-2 border-stone-700 shadow-xl bg-gradient-to-b from-sky-950 via-slate-900 to-emerald-950 select-none">
        {/* Soft Background Grid / Clouds */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        {/* Top Cloud Bar */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-sky-900/60 to-transparent flex items-center justify-between px-6 text-sky-200/80 text-xs font-medium pointer-events-none">
          <span>☁️ 푸른 하늘 구름에서 단어가 내려옵니다</span>
          {isFrozen && (
            <span className="bg-cyan-500/30 text-cyan-200 border border-cyan-400 px-2 py-0.5 rounded font-bold animate-pulse">
              ❄️ 단풍 멈춤 작동 중!
            </span>
          )}
        </div>

        {/* Falling Words List */}
        {gameState === 'PLAYING' &&
          fallingWords.map(item => {
            const isLowest = lowestWord?.id === item.id;
            const isSpecial = Boolean(item.isSpecial);

            // Determine text shown based on displayMode
            let displayText = item.word;
            if (displayMode === 'INITIALS') {
              displayText = getSpacedInitials(item.word);
            } else if (displayMode === 'CLUE_FIRST') {
              displayText = `[${getSpacedInitials(item.word)}] ${item.clue.slice(0, 10)}...`;
            }

            return (
              <div
                key={item.id}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, 0)',
                }}
                className={`absolute transition-transform duration-75 flex flex-col items-center ${
                  isLowest ? 'z-20' : 'z-10'
                }`}
              >
                {/* Word Capsule Container */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl backdrop-blur-md shadow-lg border transition-all cursor-pointer ${
                    item.isSpecial === 'rain'
                      ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-300 font-black'
                      : item.isSpecial === 'freeze'
                      ? 'bg-cyan-400 text-stone-950 border-cyan-300 ring-2 ring-cyan-200 font-black'
                      : isLowest
                      ? 'bg-stone-50 text-stone-900 border-amber-400 ring-2 ring-amber-400/80'
                      : 'bg-stone-900/90 text-stone-100 border-stone-600'
                  }`}
                  onClick={() => speakCurrentWord(item)}
                >
                  {/* Category subtle label */}
                  <span className="text-[10px] sm:text-xs text-amber-700 font-semibold border-r border-stone-300/50 pr-1.5 mr-0.5">
                    {item.category.replace('추억의 ', '').replace('고향의 ', '')}
                  </span>

                  <span className={wordTextClass}>{displayText}</span>

                  {/* Sound Listen Button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      speakCurrentWord(item);
                    }}
                    title="소리로 단서 듣기"
                    className="p-1 rounded hover:bg-stone-200/50 text-amber-700 transition-colors ml-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Optional Clue preview if focused */}
                {isLowest && (
                  <div className="mt-1 px-2.5 py-0.5 rounded bg-black/80 text-amber-300 text-[11px] sm:text-xs max-w-xs text-center border border-amber-500/40 shadow-sm backdrop-blur-xs">
                    💡 {item.clue}
                  </div>
                )}
              </div>
            );
          })}

        {/* Bottom Garden Pond (Peaceful destination) */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-emerald-950 via-emerald-900/80 to-transparent flex flex-col justify-end px-4 pb-2 border-t border-emerald-700/40">
          <div className="flex items-center justify-between text-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🌸</span>
              <span className="font-medium">정다운 꽃밭 연못 (단어가 닿기 전에 입력해 주세요)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-stone-300">
                타수 누적: <strong className="text-white font-mono">{score}</strong> 점
              </span>
            </div>
          </div>
        </div>

        {/* READY Screen Overlay */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl font-serif mb-4 shadow-lg">
              靑
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              소나기 단어소환 (한메 베네치아)
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-lg mb-6 leading-relaxed">
              하늘에서 천천히 내려오는 추억의 단어들을 키보드로 입력하여 소환해 보세요!
              <br />
              꽃들이 활짝 피어나고 어르신의 기억 세포가 상쾌하게 깨어납니다.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6 text-xs text-stone-400">
              <span className="bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
                ✓ 어르신 맞춤 아주 느린 속도 지원
              </span>
              <span className="bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
                ✓ 초성 힌트 & 음성 듣기 기능
              </span>
              <span className="bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800">
                ✓ 화면 터치 키보드 탑재
              </span>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-lg shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-stone-950" />
              <span>단어소환 시작하기</span>
            </button>
          </div>
        )}

        {/* PAUSED Screen Overlay */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <h3 className="text-2xl font-bold text-white mb-3">잠시 쉬어가기</h3>
            <p className="text-sm text-stone-300 mb-6">편안하게 숨을 고르신 후 계속 진행하세요.</p>
            <button
              type="button"
              onClick={pauseGame}
              className="px-6 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-lg cursor-pointer"
            >
              계속하기
            </button>
          </div>
        )}

        {/* SUMMARY / ROUND END Screen Overlay */}
        {gameState === 'SUMMARY' && (
          <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 animate-pop">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mb-3">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">
              참 잘하셨습니다!
            </h3>
            <p className="text-stone-300 text-sm mb-5">
              오늘도 어르신의 두뇌에 건강한 활력이 가득 피어났습니다.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6 bg-stone-900/90 p-4 rounded-xl border border-stone-800">
              <div className="text-center">
                <div className="text-xs text-stone-400 mb-0.5">소환 성공 단어</div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {recalledCount} <span className="text-sm font-normal">개</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-stone-400 mb-0.5">두뇌 활력 점수</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {score} <span className="text-sm font-normal">점</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-base shadow-md cursor-pointer transition-transform hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
                <span>한 번 더 하기</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Field & Main Action Bar */}
      <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              disabled={gameState !== 'PLAYING'}
              placeholder={
                gameState === 'PLAYING'
                  ? '내려오는 단어를 보고 입력하세요 (엔터 불필요, 완성 즉시 소환)'
                  : '위의 [단어소환 시작하기]를 누르면 시작됩니다'
              }
              autoComplete="off"
              autoFocus
              className={`w-full py-3 sm:py-3.5 px-4 rounded-xl border-2 border-amber-500/80 bg-amber-50/30 text-stone-950 font-bold placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-600 transition-all ${
                textSize === 'huge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-lg'
              }`}
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-700 px-2 py-1 bg-stone-100 rounded"
              >
                지우기
              </button>
            )}
          </div>

          {/* Pause / Resume Button */}
          {gameState === 'PLAYING' && (
            <button
              type="button"
              onClick={pauseGame}
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>잠시 멈춤</span>
            </button>
          )}

          {/* Keyboard Toggle */}
          <button
            type="button"
            onClick={() => setShowKeyboard(prev => !prev)}
            className={`px-3 py-3 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              showKeyboard
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-stone-100 border-stone-300 text-stone-700'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>화면 자판 {showKeyboard ? '닫기' : '열기'}</span>
          </button>
        </div>

        {/* Most Urgent Word Helper Card */}
        {gameState === 'PLAYING' && lowestWord && (
          <div className="flex items-center justify-between p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-stone-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-900">가장 가까운 단어:</span>
              <span className="text-base font-black text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded">
                {lowestWord.word}
              </span>
              <span className="text-stone-500 hidden sm:inline">({lowestWord.clue})</span>
            </div>
            <button
              type="button"
              onClick={() => speakCurrentWord(lowestWord)}
              className="flex items-center gap-1 text-amber-900 font-semibold hover:underline cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>소리로 듣기</span>
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Korean 2-Beol-Sik Keyboard with Next-Key Guidance */}
      {showKeyboard && (
        <div className="mt-1">
          <KoreanKeyboard
            targetWord={lowestWord?.word || ''}
            currentInput={inputValue}
            onKeyPress={handleKeyboardPress}
            onBackspace={handleBackspace}
            onSpace={handleSpace}
          />
        </div>
      )}

      {/* Recent Recalled Word Nostalgic Flash Story */}
      {lastRecalled && (
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/90 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-base">{lastRecalled.word}</span>
              <span className="text-xs text-stone-600 font-medium">{lastRecalled.category}</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5 leading-relaxed">
              {lastRecalled.funFact || lastRecalled.clue}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
