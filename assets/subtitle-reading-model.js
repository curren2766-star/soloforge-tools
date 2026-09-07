const MAX_CHARACTERS = 5000;
const MAX_SECONDS = 3600;
const segmenter = typeof Intl?.Segmenter === 'function'
  ? new Intl.Segmenter('ja', { granularity: 'grapheme' })
  : null;

function countGraphemes(text) {
  return segmenter ? [...segmenter.segment(text)].length : Array.from(text).length;
}

export function countDisplayCharacters(value) {
  if (typeof value !== 'string') throw new TypeError('text');
  const visible = value.trim().replace(/[\r\n\u2028\u2029]/gu, '');
  return countGraphemes(visible);
}

export function classifyCps(cps) {
  if (cps <= 3) return 'relaxed';
  if (cps <= 4.5) return 'standard';
  if (cps <= 6) return 'fast';
  return 'very-fast';
}

const roundUpTenth = value => Math.ceil(value * 10) / 10;

export function checkSubtitle(text, secondsValue) {
  const characters = countDisplayCharacters(text);
  if (characters === 0) throw new RangeError('empty-text');
  if (characters > MAX_CHARACTERS) throw new RangeError('long-text');
  if (typeof secondsValue === 'string' && secondsValue.trim() === '') throw new RangeError('empty-seconds');
  const seconds = Number(secondsValue);
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > MAX_SECONDS) throw new RangeError('seconds');
  const cps = characters / seconds;
  const lowerSeconds = roundUpTenth(Math.max(0.5, characters / 6));
  const upperSeconds = roundUpTenth(Math.max(0.5, characters / 4));
  return { characters, seconds, cps, band: classifyCps(cps), lowerSeconds, upperSeconds };
}

export const LIMITS = { maxCharacters: MAX_CHARACTERS, maxSeconds: MAX_SECONDS };
