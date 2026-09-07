import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCredits } from '../assets/game-asset-credits-model.js';

test('creates TXT, Markdown, short and AI disclosure outputs', () => {
  const result = buildCredits([{ name:'Village Tiles', author:'Maker', url:'https://example.com/a', credit:'Maker表記必須', license:'Custom', ai:'yes', aiUsage:'下絵に使用' }]);
  assert.equal(result.error, '');
  assert.match(result.txt, /CREDITS[\s\S]*Village Tiles[\s\S]*AI利用: 使用あり/);
  assert.match(result.markdown, /# Credits[\s\S]*## 1\. Village Tiles/);
  assert.equal(result.short, 'Village Tiles — Maker');
  assert.match(result.aiDisclosure, /Village Tiles: 下絵に使用/);
});

test('unknown values remain explicit and are never converted to no', () => {
  const result = buildCredits([{ name:'Unknown Asset', ai:'unknown' }]);
  assert.match(result.txt, /作者: 未確認/);
  assert.match(result.txt, /ライセンス: 未確認（公開前に要確認）/);
  assert.match(result.txt, /AI利用: 不明（要確認）/);
  assert.match(result.aiDisclosure, /「不明」の素材が1件/);
  assert.doesNotMatch(result.txt, /AI利用: 使用なし/);
});

test('ignores empty rows but validates partial rows and URLs', () => {
  assert.equal(buildCredits([{}, { name:'Valid', ai:'no' }]).error, '');
  assert.match(buildCredits([{ author:'Someone' }]).error, /素材名/);
  assert.match(buildCredits([{ name:'Bad URL', url:'javascript:alert(1)' }]).error, /http:\/\/ または https:\/\//);
  assert.equal(buildCredits([{ name:'Good URL', url:'https://example.com' }]).error, '');
});

test('requires at least one asset and preserves markup-looking text as text', () => {
  assert.match(buildCredits([{}, {}]).error, /1件以上/);
  const payload = '<img src=x onerror=alert(1)>';
  assert.match(buildCredits([{ name:payload }]).txt, /<img src=x onerror=alert\(1\)>/);
});
