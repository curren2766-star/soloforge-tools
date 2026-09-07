import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSubtitle, classifyCps, countDisplayCharacters, LIMITS } from '../assets/subtitle-reading-model.js';

test('required representative CPS cases', () => {
  assert.deepEqual([24, 20, 20, 3].map((characters, index) => {
    const seconds = [2, 5, 4, 2][index];
    const result = checkSubtitle('字'.repeat(characters), seconds);
    return [result.cps, result.band];
  }), [[12, 'very-fast'], [4, 'standard'], [5, 'fast'], [1.5, 'relaxed']]);
});

test('classification uses unrounded boundary values', () => {
  assert.equal(classifyCps(3), 'relaxed');
  assert.equal(classifyCps(3.0001), 'standard');
  assert.equal(classifyCps(4.5), 'standard');
  assert.equal(classifyCps(4.5001), 'fast');
  assert.equal(classifyCps(6), 'fast');
  assert.equal(classifyCps(6.0001), 'very-fast');
});

test('Japanese, emoji and grapheme clusters count as displayed characters', () => {
  assert.equal(countDisplayCharacters('😀'), 1);
  assert.equal(countDisplayCharacters('👍🏽'), 1);
  assert.equal(countDisplayCharacters('👨‍👩‍👧‍👦'), 1);
  assert.equal(countDisplayCharacters('日本語😀 A'), 6);
});

test('line breaks are excluded while internal spaces and symbols remain', () => {
  assert.equal(countDisplayCharacters('  一行目\r\n二 行目。\n  '), 8);
  assert.equal(countDisplayCharacters('A\u2028B\u2029C'), 3);
});

test('time guide rounds up and never falls below half a second', () => {
  const twenty = checkSubtitle('字'.repeat(20), 5);
  assert.equal(twenty.lowerSeconds, 3.4);
  assert.equal(twenty.upperSeconds, 5);
  for (const value of ['はい', 'OK', 'え？']) {
    const result = checkSubtitle(value, 1);
    assert.ok(result.lowerSeconds >= 0.5);
    assert.ok(result.upperSeconds >= 0.5);
  }
});

test('invalid text, seconds and technical limits are rejected', () => {
  for (const text of ['', '   ', '\r\n\n']) assert.throws(() => checkSubtitle(text, 2), RangeError);
  for (const seconds of ['', 0, -1, 'text', NaN, Infinity, 3601]) assert.throws(() => checkSubtitle('字幕', seconds), RangeError);
  assert.throws(() => checkSubtitle('字'.repeat(LIMITS.maxCharacters + 1), 2), RangeError);
  assert.equal(checkSubtitle('字'.repeat(LIMITS.maxCharacters), 3600).characters, LIMITS.maxCharacters);
  assert.equal(checkSubtitle('字幕', 1.5).cps, 2 / 1.5);
});
