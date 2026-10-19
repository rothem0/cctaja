export type GameMode = 'RAIN_GAME' | 'WORD_RECALL_QUIZ' | 'POEM_TYPING' | 'MEMORY_LOG';

export type SpeedLevel = 'very-slow' | 'slow' | 'normal' | 'fast';

export type TextSize = 'normal' | 'large' | 'huge';

export interface WordItem {
  id: string;
  word: string;
  category: string;
  clue: string;
  initials: string;
  difficulty: 1 | 2 | 3;
  funFact?: string;
  synonyms?: string[];
}

export interface FallingWord {
  id: string;
  word: string;
  clue: string;
  initials: string;
  category: string;
  x: number; // 5% to 85%
  y: number; // 0% to 100%
  speed: number;
  isSpecial?: 'rain' | 'freeze' | 'hint';
  resolved?: boolean;
}

export interface PoemItem {
  id: string;
  title: string;
  author: string;
  category: string;
  lines: string[];
  description: string;
}

export interface RecalledRecord {
  id: string;
  word: string;
  category: string;
  timestamp: number;
  mode: GameMode;
  success: boolean;
}

export interface UserStats {
  totalWordsRecalled: number;
  vitalityPoints: number;
  streakDays: number;
  averageSpeed: number; // cpm (타수)
  bestSpeed: number;
  dailyRecalls: RecalledRecord[];
}
