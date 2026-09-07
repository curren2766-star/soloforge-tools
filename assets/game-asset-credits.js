import { buildCredits } from './game-asset-credits-model.js';
import { copyText, session, track } from './site.js';

const list = document.querySelector('#assetEntries');
const template = document.querySelector('#assetEntryTemplate');
const addButton = document.querySelector('#addAsset');
const form = document.querySelector('#creditsForm');
const results = document.querySelector('#creditsResults');
const status = document.querySelector('#creditsStatus');
const analytics = session('game_asset_credits');
const outputs = {
  txt: document.querySelector('#creditsTxt'),
  markdown: document.querySelector('#creditsMarkdown'),
  short: document.querySelector('#creditsShort'),
  aiDisclosure: document.querySelector('#creditsAi')
};

function renumber() {
  [...list.children].forEach((entry, index) => {
    entry.querySelector('[data-entry-number]').textContent = `素材 ${index + 1}`;
    for (const control of entry.querySelectorAll('[data-field]')) {
      const id = `asset-${index + 1}-${control.dataset.field}`;
      control.id = id;
      entry.querySelector(`[data-label="${control.dataset.field}"]`).htmlFor = id;
    }
    entry.querySelector('[data-remove]').disabled = list.children.length === 1;
  });
  addButton.disabled = list.children.length >= 20;
  document.querySelector('#assetCount').textContent = `${list.children.length} / 20`;
}

function addEntry() {
  if (list.children.length >= 20) return;
  list.append(template.content.cloneNode(true));
  renumber();
}

function clearResults() {
  results.hidden = true;
  for (const output of Object.values(outputs)) output.value = '';
  status.textContent = '';
}

for (let index = 0; index < 5; index++) addEntry();
addButton.addEventListener('click', () => { analytics.start(); addEntry(); });
list.addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button || list.children.length === 1) return;
  analytics.start();
  button.closest('.asset-entry').remove();
  renumber();
  clearResults();
});
form.addEventListener('input', () => { analytics.start(); clearResults(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  analytics.start();
  const entries = [...list.children].map(entry => Object.fromEntries([...entry.querySelectorAll('[data-field]')].map(control => [control.dataset.field, control.value])));
  const built = buildCredits(entries);
  if (built.error) { clearResults(); status.textContent = built.error; return; }
  for (const [key, output] of Object.entries(outputs)) output.value = built[key];
  results.hidden = false;
  status.textContent = 'Credits案を作成しました。公開前に原典・利用条件・表記内容を確認してください。';
  analytics.complete('generated');
});
for (const button of document.querySelectorAll('[data-copy-credit]')) button.addEventListener('click', async () => {
  const copied = await copyText(outputs[button.dataset.copyCredit].value);
  status.textContent = copied ? 'Credits案をコピーしました。' : 'コピーできませんでした。選択してコピーしてください。';
  if (copied) track('result_share', 'game_asset_credits');
});
for (const button of document.querySelectorAll('[data-download-credit]')) button.addEventListener('click', () => {
  const key = button.dataset.downloadCredit;
  const blob = new Blob([outputs[key].value], { type: key === 'markdown' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = key === 'markdown' ? 'CREDITS.md' : 'CREDITS.txt';
  link.click();
  URL.revokeObjectURL(href);
  status.textContent = `${link.download} をダウンロードしました。`;
});
