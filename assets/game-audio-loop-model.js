export const MAX_WAV_BYTES = 100 * 1024 * 1024;
export const SEGMENT_OPTIONS = Object.freeze([1, 2, 3, 5]);

export function validateWavFile(file) {
  if (!file || typeof file.name !== 'string' || typeof file.size !== 'number') return 'ファイルを選択してください。';
  if (!/\.wav$/i.test(file.name)) return '初版はWAVファイルに対応しています。';
  if (!Number.isFinite(file.size) || file.size <= 0) return '0 byteのファイルは読み込めません。';
  if (file.size > MAX_WAV_BYTES) return 'ファイルサイズは100MB以下にしてください。';
  return '';
}

export function validateAudioBuffer(buffer) {
  if (!buffer || !Number.isFinite(buffer.duration) || buffer.duration <= 0) return false;
  if (!Number.isFinite(buffer.sampleRate) || buffer.sampleRate <= 0) return false;
  if (!Number.isInteger(buffer.length) || buffer.length <= 0) return false;
  if (!Number.isInteger(buffer.numberOfChannels) || buffer.numberOfChannels <= 0 || buffer.numberOfChannels > 32) return false;
  return typeof buffer.getChannelData === 'function';
}

export function segmentFrameCount(buffer, seconds) {
  if (!validateAudioBuffer(buffer) || !SEGMENT_OPTIONS.includes(seconds)) throw new Error('invalid-audio');
  const requested = Math.floor(buffer.sampleRate * seconds);
  return Math.max(1, Math.min(buffer.length, requested));
}
