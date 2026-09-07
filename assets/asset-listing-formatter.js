import { formatListings } from './asset-listing-model.js';
import { copyText, session, track } from './site.js';

const form = document.querySelector('#listingForm');
const result = document.querySelector('#listingResults');
const status = document.querySelector('#listingStatus');
const booth = document.querySelector('#boothOutput');
const itch = document.querySelector('#itchOutput');
const analytics = session('asset_listing_formatter');
const fields = ['name', 'summary', 'contents', 'format', 'terms', 'credit', 'notes'];

function values() {
  return Object.fromEntries(fields.map(key => [key, form.elements[key].value]));
}

function clearResult() {
  result.hidden = true;
  booth.value = '';
  itch.value = '';
  status.textContent = '';
}

form.addEventListener('input', () => {
  analytics.start();
  clearResult();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  analytics.start();
  const output = formatListings(values());
  if (output.error) {
    clearResult();
    status.textContent = output.error;
    form.elements.name.focus();
    return;
  }
  booth.value = output.booth;
  itch.value = output.itch;
  result.hidden = false;
  status.textContent = '2種類の説明文案を作成しました。内容と各販売先の最新ルールを確認してから使用してください。';
  analytics.complete('generated');
});

for (const button of document.querySelectorAll('[data-copy-output]')) {
  button.addEventListener('click', async () => {
    const output = button.dataset.copyOutput === 'booth' ? booth : itch;
    const copied = await copyText(output.value);
    status.textContent = copied ? '説明文案をコピーしました。' : 'コピーできませんでした。選択してコピーしてください。';
    if (copied) track('result_share', 'asset_listing_formatter');
  });
}
