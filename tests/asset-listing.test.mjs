import test from 'node:test';
import assert from 'node:assert/strict';
import { formatListings } from '../assets/asset-listing-model.js';

test('formats the same user content under platform-specific fixed headings', () => {
  const result = formatListings({ name:'Forest Pack', summary:'森の素材集', contents:'tree.png\nrock.png', format:'PNG', terms:'商用利用可', credit:'任意', notes:'AI使用：なし' });
  assert.equal(result.error, '');
  assert.match(result.booth, /【内容物】\ntree\.png/);
  assert.match(result.itch, /CONTENTS\ntree\.png/);
  assert.match(result.itch, /森の素材集/);
  assert.doesNotMatch(result.itch, /Forest asset collection/);
});

test('omits empty fields without inventing terms', () => {
  const result = formatListings({ name:'Minimal', summary:'', contents:'', format:'', terms:'', credit:'', notes:'' });
  assert.equal(result.booth, 'Minimal');
  assert.equal(result.itch, 'Minimal');
  assert.doesNotMatch(result.booth, /商用|著作権|クレジット/);
});

test('requires only a product name and preserves text as plain output', () => {
  assert.match(formatListings({ name:' ' }).error, /商品名/);
  const payload = '<img src=x onerror=alert(1)>';
  assert.equal(formatListings({ name:payload }).booth, payload);
});

test('normalizes line endings and trims field edges', () => {
  const result = formatListings({ name:'  Name  ', contents:' a\r\nb \r\n' });
  assert.equal(result.booth, 'Name\n\n【内容物】\na\nb');
});
