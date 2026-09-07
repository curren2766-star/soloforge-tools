import test from 'node:test';
import assert from 'node:assert/strict';
import { GPU_DATA, gpuById } from '../assets/gpu-data.js';
import { diagnose } from '../assets/gpu-psu-model.js';

test('GPU catalog is extensible, unique and linked to official sources', () => {
  assert.equal(GPU_DATA.length, 18);
  assert.equal(new Set(GPU_DATA.map(g => g.id)).size, GPU_DATA.length);
  for (const gpu of GPU_DATA) {
    assert.ok(gpu.psu >= 550 && gpu.board > 0);
    assert.match(gpu.source, /^https:\/\/(www\.)?(nvidia|amd)\.com\//);
    assert.ok(['pcie8','hybrid16'].includes(gpu.connector.type));
  }
});

test('capacity OK with headroom and direct connector OK', () => {
  const result=diagnose(gpuById('rx-7800-xt'),{psuWatts:850,eightPinCables:2,native16:'0',cpuClass:'standard'});
  assert.equal(result.capacity.status,'ok'); assert.equal(result.connector.status,'ok'); assert.equal(result.overall.status,'candidate');
});

test('capacity below official recommendation is insufficient', () => {
  const result=diagnose(gpuById('rtx-5090'),{psuWatts:850,eightPinCables:4,native16:'0',cpuClass:'standard'});
  assert.equal(result.capacity.status,'insufficient'); assert.equal(result.overall.status,'replace');
});

test('missing independent PCIe cables is connector insufficient', () => {
  const result=diagnose(gpuById('rx-9070-xt'),{psuWatts:850,eightPinCables:1,native16:'0',cpuClass:'standard'});
  assert.equal(result.connector.status,'insufficient'); assert.equal(result.overall.status,'replace');
});

test('included adapter route and unknown native rating require confirmation', () => {
  const adapter=diagnose(gpuById('rtx-5080'),{psuWatts:1000,eightPinCables:3,native16:'0',cpuClass:'standard'});
  assert.equal(adapter.connector.status,'caution'); assert.equal(adapter.overall.status,'check');
  const unknown=diagnose(gpuById('rtx-5070'),{psuWatts:750,eightPinCables:0,native16:'unknown',cpuClass:'standard'});
  assert.equal(unknown.connector.status,'caution');
});

test('CPU class creates capacity confirmation without changing manufacturer baseline', () => {
  const result=diagnose(gpuById('rx-9070'),{psuWatts:750,eightPinCables:2,native16:'0',cpuClass:'high'});
  assert.equal(result.capacity.status,'caution'); assert.equal(result.target,750);
});

test('rated native 16-pin can satisfy the reference connector condition', () => {
  const result=diagnose(gpuById('rtx-5090'),{psuWatts:1200,eightPinCables:0,native16:'600',cpuClass:'standard'});
  assert.equal(result.connector.status,'ok'); assert.equal(result.overall.status,'candidate');
});

test('invalid form values return no stale diagnosis', () => {
  assert.equal(diagnose(gpuById('rtx-5070'),{psuWatts:0,eightPinCables:2,native16:'0'}),null);
});
