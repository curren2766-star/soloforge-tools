import { compareMonitors, PRESETS } from './monitor-ppi-model.js';
import { session } from './site.js';

const form = document.querySelector('#ppiForm');
const results = document.querySelector('#ppiResults');
const status = document.querySelector('#inputStatus');
const analytics = session('monitor_ppi');
let userAction = false;

const controls = side => ({
  preset: document.querySelector(`#${side}Preset`),
  diagonal: document.querySelector(`#${side}Diagonal`),
  width: document.querySelector(`#${side}Width`),
  height: document.querySelector(`#${side}Height`)
});
const aControls = controls('a');
const bControls = controls('b');

function addPresets(select) {
  select.append(new Option('手入力', 'custom'));
  for (const preset of PRESETS) select.append(new Option(`${preset.label} · ${preset.width}×${preset.height}`, preset.id));
}

function applyPreset(side, id) {
  const preset = PRESETS.find(item => item.id === id);
  if (!preset) return;
  side.diagonal.value = preset.diagonal;
  side.width.value = preset.width;
  side.height.value = preset.height;
}

function read(side) {
  return { diagonal: side.diagonal.value, width: side.width.value, height: side.height.value };
}

function label(side, monitor) {
  const preset = PRESETS.find(item => item.id === side.preset.value);
  return preset ? preset.label : `${monitor.diagonal}インチ ${monitor.width}×${monitor.height}`;
}

function incomplete() {
  return [...form.querySelectorAll('input')].some(input => input.value.trim() === '');
}

function errorMessage() {
  for (const side of [aControls, bControls]) {
    const diagonal = Number(side.diagonal.value);
    if (!Number.isFinite(diagonal) || diagonal <= 0 || diagonal > 500) return '対角インチは0より大きい500以下の数値で入力してください。';
    for (const input of [side.width, side.height]) {
      const pixels = Number(input.value);
      if (!Number.isFinite(pixels) || !Number.isInteger(pixels) || pixels <= 0 || pixels > 100000) return '横・縦解像度は1〜100,000の整数で入力してください。';
    }
  }
  return '入力値を確認してください。';
}

function comparisonText(result, aLabel, bLabel) {
  if (result.kind === 'same') return `${bLabel}と${aLabel}は、同じ画素密度です。`;
  if (result.kind === 'near') return `${bLabel}と${aLabel}の画素密度は、ほぼ同じです。`;
  const direction = result.kind === 'higher' ? '高い' : '低い';
  return `${bLabel}は現在の${aLabel}より、画素密度が約${result.percent.toFixed(1)}%${direction}です。`;
}

function render(track = userAction) {
  if (incomplete()) {
    results.hidden = true;
    status.textContent = '';
    return;
  }
  let result;
  try { result = compareMonitors(read(aControls), read(bControls)); }
  catch {
    results.hidden = true;
    status.textContent = errorMessage();
    return;
  }
  status.textContent = '';
  const aLabel = label(aControls, result.a);
  const bLabel = label(bControls, result.b);
  document.querySelector('#comparison').textContent = comparisonText(result, aLabel, bLabel);
  document.querySelector('#aResultLabel').textContent = aLabel;
  document.querySelector('#bResultLabel').textContent = bLabel;
  document.querySelector('#aPpi').textContent = result.a.ppi.toFixed(1);
  document.querySelector('#bPpi').textContent = result.b.ppi.toFixed(1);
  document.querySelector('#aPitch').textContent = result.a.pitch.toFixed(3);
  document.querySelector('#bPitch').textContent = result.b.pitch.toFixed(3);
  document.querySelector('#connectionNext').hidden = !(result.b.width >= 3440 || result.b.height >= 2160);
  results.hidden = false;
  if (track) analytics.complete(`${result.kind}:${aControls.preset.value}:${bControls.preset.value}`);
}

for (const side of [aControls, bControls]) {
  addPresets(side.preset);
  side.preset.addEventListener('change', () => {
    userAction = true;
    analytics.start();
    applyPreset(side, side.preset.value);
    render(true);
  });
  for (const input of [side.diagonal, side.width, side.height]) input.addEventListener('input', () => {
    userAction = true;
    analytics.start();
    side.preset.value = 'custom';
    render(true);
  });
}

form.addEventListener('submit', event => { event.preventDefault(); userAction = true; analytics.start(); render(true); });
aControls.preset.value = '27-wqhd';
bControls.preset.value = '32-4k';
applyPreset(aControls, aControls.preset.value);
applyPreset(bControls, bControls.preset.value);
render(false);
