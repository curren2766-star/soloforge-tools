import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMonitor, compareMonitors, PRESETS } from '../assets/monitor-ppi-model.js';

const close = (actual, expected, tolerance = 0.05) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
test('representative PPI and pixel pitch values', () => {
  close(calculateMonitor({ diagonal: 27, width: 2560, height: 1440 }).ppi, 108.8);
  close(calculateMonitor({ diagonal: 32, width: 3840, height: 2160 }).ppi, 137.7);
  close(calculateMonitor({ diagonal: 34, width: 3440, height: 1440 }).ppi, 109.7);
  close(calculateMonitor({ diagonal: 27, width: 2560, height: 1440 }).pitch, 0.2335, 0.0001);
});
test('comparison uses full precision and A as denominator', () => {
  const forward = compareMonitors({ diagonal: 27, width: 2560, height: 1440 }, { diagonal: 32, width: 3840, height: 2160 });
  close(forward.percent, 26.6, 0.05); assert.equal(forward.kind, 'higher');
  const reverse = compareMonitors({ diagonal: 32, width: 3840, height: 2160 }, { diagonal: 27, width: 2560, height: 1440 });
  close(reverse.percent, 21.0, 0.05); assert.equal(reverse.kind, 'lower');
});
test('same, near and lower classifications', () => {
  const base = { diagonal: 27, width: 2560, height: 1440 };
  assert.equal(compareMonitors(base, base).kind, 'same');
  assert.equal(compareMonitors(base, { ...base, diagonal: 27.1 }).kind, 'near');
  assert.equal(compareMonitors(base, { diagonal: 32, width: 2560, height: 1440 }).kind, 'lower');
});
test('invalid and extreme values are rejected', () => {
  const good = { diagonal: 27, width: 2560, height: 1440 };
  for (const invalid of [
    { ...good, diagonal: '' }, { ...good, diagonal: 0 }, { ...good, diagonal: -1 }, { ...good, diagonal: 501 },
    { ...good, diagonal: NaN }, { ...good, diagonal: Infinity }, { ...good, diagonal: 'text' },
    { ...good, width: '' }, { ...good, width: 0 }, { ...good, width: -1 }, { ...good, width: 1920.5 },
    { ...good, width: 100001 }, { ...good, height: NaN }, { ...good, height: Infinity }
  ]) assert.throws(() => calculateMonitor(invalid), RangeError);
  assert.ok(Number.isFinite(calculateMonitor({ diagonal: 500, width: 100000, height: 100000 }).ppi));
  assert.ok(calculateMonitor({ diagonal: 27.5, width: 3840, height: 2160 }).ppi > 0);
});
test('preset catalog stays small and unique', () => {
  assert.equal(PRESETS.length, 7);
  assert.equal(new Set(PRESETS.map(item => item.id)).size, 7);
});
