import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const pages = ['index.html','game-audio-loop-tester/index.html','subtitle-reading-speed/index.html','monitor-ppi/index.html','gpu-psu/index.html','display-bandwidth/index.html','obs-storage/index.html','about.html','privacy.html','contact.html','affiliate.html','404.html'];
for (const file of pages) test(`static metadata, JSON-LD and local links: ${file}`, () => {
  const html=readFileSync(file,'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert.match(html,/<html lang="ja">/); assert.match(html,/<meta name="description"/);
  assert.match(html,/<meta property="og:url"/);
  assert.match(html,file==='404.html'?/name="robots" content="noindex"/:/rel="canonical" href="https:\/\/curren2766-star.github.io\/soloforge-tools\//);
  for (const [,json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) assert.ok(JSON.parse(json)['@context']);
  for (const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|#)/.test(href)) continue;
    let target;
    if(href.startsWith('/soloforge-tools/')) target=href.slice('/soloforge-tools/'.length).split('#')[0];
    else target=href.split('#')[0];
    assert.ok(existsSync(target === '' || target.endsWith('/') ? target+'index.html' : target),`${file}: ${href}`);
  }
  assert.doesNotMatch(html,/data-affiliate|準備段階|正式公開時に/);
  assert.doesNotMatch(html,/googletagmanager.com/);
});
test('sitemap and robots retain correct production base', () => {
  const sitemap=readFileSync('sitemap.xml','utf8');
  assert.match(sitemap,/soloforge-tools\/display-bandwidth\//);
  assert.match(sitemap,/soloforge-tools\/gpu-psu\//);
  assert.match(sitemap,/soloforge-tools\/monitor-ppi\//);
  assert.match(sitemap,/soloforge-tools\/subtitle-reading-speed\//);
  assert.match(sitemap,/soloforge-tools\/game-audio-loop-tester\//);
  assert.doesNotMatch(sitemap,/404/);
  assert.match(readFileSync('robots.txt','utf8'),/Sitemap: https:\/\/curren2766-star.github.io\/soloforge-tools\/sitemap.xml/);
  assert.equal(readFileSync('google77f4dbcb8e106fb1.html','utf8').trim(),'google-site-verification: google77f4dbcb8e106fb1.html');
});
test('subtitle tool is integrated on home with FAQ schema', () => {
  const home=readFileSync('index.html','utf8');
  const subtitle=readFileSync('subtitle-reading-speed/index.html','utf8');
  assert.equal((home.match(/class="card tool-card/g)||[]).length,6);
  assert.match(home,/href="subtitle-reading-speed\/"/);
  assert.match(subtitle,/"@type":"FAQPage"/);
  assert.match(subtitle,/入力内容はブラウザ内で計算/);
});
test('PPI tool is integrated on home and linked both ways with display checker', () => {
  const home=readFileSync('index.html','utf8');
  const ppi=readFileSync('monitor-ppi/index.html','utf8');
  const display=readFileSync('display-bandwidth/index.html','utf8');
  assert.equal((home.match(/class="card tool-card/g)||[]).length,6);
  assert.match(home,/href="monitor-ppi\/"/);
  assert.match(ppi,/href="\/soloforge-tools\/display-bandwidth\/"/);
  assert.match(display,/href="\/soloforge-tools\/monitor-ppi\/"/);
  assert.match(ppi,/"@type":"FAQPage"/);
});
test('audio loop tester is private, non-judgmental and integrated', () => {
  const home=readFileSync('index.html','utf8');
  const page=readFileSync('game-audio-loop-tester/index.html','utf8');
  assert.match(home,/href="game-audio-loop-tester\/"/);
  assert.match(page,/音声ファイルはブラウザ内で処理/);
  assert.match(page,/実際のゲームエンジンや再生環境での動作を保証するものではありません/);
  assert.doesNotMatch(page,/id="(?:seamless|score|verdict)/i);
  assert.match(page,/accept="\.wav,audio\/wav,audio\/x-wav"/);
});
