import { MAX_WAV_BYTES, segmentFrameCount, validateAudioBuffer, validateWavFile } from './game-audio-loop-model.js';
import { session } from './site.js';

const fileInput = document.querySelector('#audioFile');
const dropZone = document.querySelector('#audioDropZone');
const segmentSelect = document.querySelector('#segmentSeconds');
const playButton = document.querySelector('#playLoop');
const stopButton = document.querySelector('#stopLoop');
const status = document.querySelector('#audioStatus');
const analytics = session('game_audio_loop_tester');
let context;
let decoded;
let boundary;
let source;

function stopPlayback(message = '') {
  if (source) {
    try { source.stop(); } catch {}
    source.disconnect();
    source = null;
  }
  stopButton.disabled = true;
  if (message) status.textContent = message;
}

function buildBoundaryBuffer() {
  if (!context || !validateAudioBuffer(decoded)) throw new Error('invalid-audio');
  const seconds = Number(segmentSelect.value);
  const frames = segmentFrameCount(decoded, seconds);
  const result = context.createBuffer(decoded.numberOfChannels, frames * 2, decoded.sampleRate);
  for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
    const input = decoded.getChannelData(channel);
    const output = result.getChannelData(channel);
    output.set(input.subarray(decoded.length - frames), 0);
    output.set(input.subarray(0, frames), frames);
  }
  boundary = result;
}

async function closeContext() {
  stopPlayback();
  decoded = null;
  boundary = null;
  if (context && context.state !== 'closed') await context.close().catch(() => {});
  context = null;
}

async function loadFile(file) {
  analytics.start();
  stopPlayback();
  playButton.disabled = true;
  const error = validateWavFile(file);
  if (error) { status.textContent = error; return; }
  status.textContent = 'WAVを読み込んでいます…';
  await closeContext();
  try {
    context = new AudioContext();
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength <= 0 || bytes.byteLength > MAX_WAV_BYTES) throw new Error('invalid-size');
    decoded = await context.decodeAudioData(bytes);
    if (!validateAudioBuffer(decoded)) throw new Error('invalid-audio');
    buildBoundaryBuffer();
    playButton.disabled = false;
    status.textContent = '準備できました。「継ぎ目を再生」で末尾→先頭を繰り返し確認できます。';
    analytics.complete('ready');
  } catch {
    await closeContext();
    status.textContent = 'このファイルをこのブラウザでは読み込めませんでした。';
  }
}

fileInput.addEventListener('change', () => loadFile(fileInput.files?.[0]));
for (const type of ['dragenter', 'dragover']) dropZone.addEventListener(type, event => {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  dropZone.classList.add('dragging');
});
for (const type of ['dragleave', 'drop']) dropZone.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
});
dropZone.addEventListener('drop', event => loadFile(event.dataTransfer?.files?.[0]));
segmentSelect.addEventListener('change', () => {
  analytics.start();
  stopPlayback();
  if (!decoded) return;
  try { buildBoundaryBuffer(); status.textContent = '確認区間を更新しました。もう一度再生できます。'; }
  catch { playButton.disabled = true; status.textContent = 'この音声の確認区間を作成できませんでした。'; }
});
playButton.addEventListener('click', async () => {
  if (!context || !boundary) return;
  stopPlayback();
  await context.resume();
  source = context.createBufferSource();
  source.buffer = boundary;
  source.loop = true;
  source.connect(context.destination);
  source.start();
  stopButton.disabled = false;
  status.textContent = '末尾→先頭の継ぎ目を繰り返し再生しています。';
});
stopButton.addEventListener('click', () => stopPlayback('停止しました。もう一度確認できます。'));
window.addEventListener('pagehide', () => { closeContext(); });
