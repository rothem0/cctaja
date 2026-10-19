// Hangul decomposition and 2-Beol-Sik keyboard mapping

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Complex vowels decomposed into base keys
const COMPLEX_VOWEL_MAP: Record<string, string[]> = {
  'ㅘ': ['ㅗ', 'ㅏ'],
  'ㅙ': ['ㅗ', 'ㅐ'],
  'ㅚ': ['ㅗ', 'ㅣ'],
  'ㅝ': ['ㅜ', 'ㅓ'],
  'ㅞ': ['ㅜ', 'ㅔ'],
  'ㅟ': ['ㅜ', 'ㅣ'],
  'ㅢ': ['ㅡ', 'ㅣ']
};

// Complex jongsung decomposed into base keys
const COMPLEX_JONGSUNG_MAP: Record<string, string[]> = {
  'ㄳ': ['ㄱ', 'ㅅ'],
  'ㄵ': ['ㄴ', 'ㅈ'],
  'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'],
  'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'],
  'ㄿ': ['ㄹ', 'ㅍ'],
  'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ']
};

// 2-Beol-Sik jamo to key character
export const JAMO_TO_KEY: Record<string, { key: string; shift?: boolean }> = {
  'ㅂ': { key: 'q' },
  'ㅃ': { key: 'q', shift: true },
  'ㅈ': { key: 'w' },
  'ㅉ': { key: 'w', shift: true },
  'ㄷ': { key: 'e' },
  'ㄸ': { key: 'e', shift: true },
  'ㄱ': { key: 'r' },
  'ㄲ': { key: 'r', shift: true },
  'ㅅ': { key: 't' },
  'ㅆ': { key: 't', shift: true },
  'ㅛ': { key: 'y' },
  'ㅕ': { key: 'u' },
  'ㅑ': { key: 'i' },
  'ㅐ': { key: 'o' },
  'ㅒ': { key: 'o', shift: true },
  'ㅔ': { key: 'p' },
  'ㅖ': { key: 'p', shift: true },
  'ㅁ': { key: 'a' },
  'ㄴ': { key: 's' },
  'ㅇ': { key: 'd' },
  'ㄹ': { key: 'f' },
  'ㅎ': { key: 'g' },
  'ㅗ': { key: 'h' },
  'ㅓ': { key: 'j' },
  'ㅏ': { key: 'k' },
  'ㅣ': { key: 'l' },
  'ㅋ': { key: 'z' },
  'ㅌ': { key: 'x' },
  'ㅊ': { key: 'c' },
  'ㅍ': { key: 'v' },
  'ㅠ': { key: 'b' },
  'ㅜ': { key: 'n' },
  'ㅡ': { key: 'm' },
  ' ': { key: ' ' }
};

/**
 * Extracts initial consonants (초성) from a Korean string.
 * Example: "된장찌개" -> "ㄷㅈㅉㄱ"
 */
export function getInitials(text: string): string {
  let initials = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const chosungIndex = Math.floor((code - 0xac00) / (21 * 28));
      initials += CHOSUNG[chosungIndex];
    } else {
      initials += text[i];
    }
  }
  return initials;
}

/**
 * Formats initials with space for senior legibility.
 * Example: "된장찌개" -> "ㄷ ㅈ ㅉ ㄱ"
 */
export function getSpacedInitials(text: string): string {
  return getInitials(text).split('').join(' ');
}

/**
 * Decomposes a Hangul syllable or string into atomic keyboard jamos.
 */
export function decomposeToAtomicJamo(text: string): string[] {
  const result: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const syllableIndex = code - 0xac00;
      const choIdx = Math.floor(syllableIndex / (21 * 28));
      const jungIdx = Math.floor((syllableIndex % (21 * 28)) / 28);
      const jongIdx = syllableIndex % 28;

      result.push(CHOSUNG[choIdx]);

      const jung = JUNGSUNG[jungIdx];
      if (COMPLEX_VOWEL_MAP[jung]) {
        result.push(...COMPLEX_VOWEL_MAP[jung]);
      } else {
        result.push(jung);
      }

      if (jongIdx > 0) {
        const jong = JONGSUNG[jongIdx];
        if (COMPLEX_JONGSUNG_MAP[jong]) {
          result.push(...COMPLEX_JONGSUNG_MAP[jong]);
        } else {
          result.push(jong);
        }
      }
    } else {
      result.push(text[i]);
    }
  }

  return result;
}

/**
 * Computes typing accuracy percentage between expected and typed text.
 */
export function calculateAccuracy(expected: string, typed: string): number {
  if (typed.length === 0) return 100;
  let correct = 0;
  const len = Math.min(expected.length, typed.length);
  for (let i = 0; i < len; i++) {
    if (expected[i] === typed[i]) {
      correct++;
    }
  }
  return Math.round((correct / typed.length) * 100);
}

/**
 * Computes characters per minute (타수)
 */
export function calculateCPM(totalChars: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0) return 0;
  const minutes = timeInSeconds / 60;
  return Math.round(totalChars / minutes);
}
