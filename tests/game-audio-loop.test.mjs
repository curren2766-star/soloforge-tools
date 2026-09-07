import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_WAV_BYTES, SEGMENT_OPTIONS, segmentFrameCount, validateAudioBuffer, validateWavFile } from '../assets/game-audio-loop-model.js';

test('WAV file validation accepts case-insensitive WAV within 100MB', () => {
  assert.equal(validateWavFile({ name: 'loop.WAV', size: MAX_WAV_BYTES }), '');
  assert.match(validateWavFile({ name: 'loop.mp3', size: 10 }), /WAV/);
  assert.match(validateWavFile({ name: 'loop.wav', size: 0 }), /0 byte/);
  assert.match(validateWavFile({ name: 'loop.wav', size: MAX_WAV_BYTES + 1 }), /100MB/);
  assert.match(validateWavFile(null), /選択/);
});

test('decoded AudioBuffer validation rejects non-finite and abnormal values', () => {
  const valid = { duration: 2, sampleRate: 48000, length: 96000, numberOfChannels: 2, getChannelData() {} };
  assert.equal(validateAudioBuffer(valid), true);
  for (const patch of [{ duration: 0 }, { duration: NaN }, { sampleRate: Infinity }, { length: 0 }, { numberOfChannels: 0 }, { numberOfChannels: 33 }, { getChannelData: null }]) {
    assert.equal(validateAudioBuffer({ ...valid, ...patch }), false);
  }
});

test('boundary segment uses requested frames or the complete shorter source', () => {
  const buffer = { duration: 10, sampleRate: 48000, length: 480000, numberOfChannels: 2, getChannelData() {} };
  assert.deepEqual(SEGMENT_OPTIONS, [1, 2, 3, 5]);
  assert.equal(segmentFrameCount(buffer, 3), 144000);
  assert.equal(segmentFrameCount({ ...buffer, duration: 0.5, length: 24000 }, 3), 24000);
  assert.throws(() => segmentFrameCount(buffer, 4), /invalid-audio/);
});
