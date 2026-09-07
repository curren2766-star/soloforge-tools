import { checkSubtitle, countDisplayCharacters, LIMITS } from './subtitle-reading-model.js';
import { session } from './site.js';

const form = document.querySelector('#subtitleForm');
const text = document.querySelector('#subtitleText');
const seconds = document.querySelector('#displaySeconds');
const results = document.querySelector('#subtitleResults');
const status = document.querySelector('#inputStatus');
const analytics = session('subtitle_reading_speed');

const messages = {
  relaxed: ['ゆったり', 'ゆったりした読み速度の目安です。映像や演出との間も取りやすい範囲です。'],
  standard: ['標準的な範囲', '標準的な読み速度の目安です。文章の難しさや映像の情報量もあわせて確認してください。'],
  fast: ['やや速め', 'やや速めです。少し表示時間を長くすると、読みやすくなる可能性があります。'],
  'very-fast': ['かなり速め', 'かなり速めです。表示時間を長くするか、文章を短くすることを検討してください。']
};

function clearResult(clearStatus = true) {
  results.hidden = true;
  if (clearStatus) status.textContent = '';
}

function errorMessage(error) {
  if (error?.message === 'empty-text') return '字幕・テロップ文章を入力してください。';
  if (error?.message === 'long-text') return `文章は表示文字数${LIMITS.maxCharacters.toLocaleString('ja-JP')}文字以下で入力してください。`;
  if (error?.message === 'empty-seconds') return '表示秒数を入力してください。';
  return `表示秒数は0より大きい${LIMITS.maxSeconds.toLocaleString('ja-JP')}秒以下の数値で入力してください。`;
}

function timeGuide(result) {
  if (result.lowerSeconds === 0.5 && result.upperSeconds === 0.5) return '0.5秒以上が目安';
  return `約${result.lowerSeconds.toFixed(1)}〜${result.upperSeconds.toFixed(1)}秒`;
}

function render() {
  let result;
  try { result = checkSubtitle(text.value, seconds.value); }
  catch (error) {
    clearResult(false);
    status.textContent = errorMessage(error);
    return;
  }
  const [label, advice] = messages[result.band];
  status.textContent = '';
  document.querySelector('#characterCount').textContent = result.characters.toLocaleString('ja-JP');
  document.querySelector('#cps').textContent = result.cps.toFixed(1);
  document.querySelector('#speedLabel').textContent = label;
  document.querySelector('#speedLabel').dataset.speed = result.band;
  document.querySelector('#timeGuide').textContent = timeGuide(result);
  document.querySelector('#judgement').textContent = advice;
  results.hidden = false;
  analytics.complete(result.band);
}

for (const input of [text, seconds]) input.addEventListener('input', () => {
  analytics.start();
  clearResult();
  const count = (() => { try { return countDisplayCharacters(text.value); } catch { return 0; } })();
  document.querySelector('#liveCount').textContent = `${count.toLocaleString('ja-JP')} / ${LIMITS.maxCharacters.toLocaleString('ja-JP')}文字`;
});
form.addEventListener('submit', event => { event.preventDefault(); render(); });
