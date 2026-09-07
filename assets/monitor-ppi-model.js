const MAX_INCHES = 500;
const MAX_PIXELS = 100000;

function finiteNumber(value) {
  if (typeof value === 'string' && value.trim() === '') throw new RangeError('empty');
  const number = Number(value);
  if (!Number.isFinite(number)) throw new RangeError('finite');
  return number;
}

export function calculateMonitor({ diagonal, width, height }) {
  const inches = finiteNumber(diagonal);
  const horizontal = finiteNumber(width);
  const vertical = finiteNumber(height);
  if (inches <= 0 || inches > MAX_INCHES) throw new RangeError('diagonal');
  for (const pixels of [horizontal, vertical]) {
    if (!Number.isInteger(pixels) || pixels <= 0 || pixels > MAX_PIXELS) throw new RangeError('pixels');
  }
  const ppi = Math.hypot(horizontal, vertical) / inches;
  return { diagonal: inches, width: horizontal, height: vertical, ppi, pitch: 25.4 / ppi };
}

export function compareMonitors(aInput, bInput) {
  const a = calculateMonitor(aInput);
  const b = calculateMonitor(bInput);
  const signedPercent = (b.ppi / a.ppi - 1) * 100;
  const effectivelyEqual = Math.abs(b.ppi - a.ppi) <= Number.EPSILON * Math.max(a.ppi, b.ppi) * 8;
  const kind = effectivelyEqual ? 'same' : Math.abs(signedPercent) < 1 ? 'near' : signedPercent > 0 ? 'higher' : 'lower';
  return { a, b, kind, signedPercent, percent: Math.abs(signedPercent) };
}

export const PRESETS = [
  { id: '24-fhd', label: '24インチ FHD', diagonal: 24, width: 1920, height: 1080 },
  { id: '27-fhd', label: '27インチ FHD', diagonal: 27, width: 1920, height: 1080 },
  { id: '27-wqhd', label: '27インチ WQHD', diagonal: 27, width: 2560, height: 1440 },
  { id: '27-4k', label: '27インチ 4K', diagonal: 27, width: 3840, height: 2160 },
  { id: '32-wqhd', label: '32インチ WQHD', diagonal: 32, width: 2560, height: 1440 },
  { id: '32-4k', label: '32インチ 4K', diagonal: 32, width: 3840, height: 2160 },
  { id: '34-uwqhd', label: '34インチ UWQHD', diagonal: 34, width: 3440, height: 1440 }
];
