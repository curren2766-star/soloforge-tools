import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'https://curren2766-star.github.io/soloforge-tools/';
const indexable = new Map([
  ['index.html', base],
  ['asset-listing-formatter/index.html', base + 'asset-listing-formatter/'],
  ['game-audio-loop-tester/index.html', base + 'game-audio-loop-tester/'],
  ['subtitle-reading-speed/index.html', base + 'subtitle-reading-speed/'],
  ['monitor-ppi/index.html', base + 'monitor-ppi/'],
  ['gpu-psu/index.html', base + 'gpu-psu/'],
  ['display-bandwidth/index.html', base + 'display-bandwidth/'],
  ['obs-storage/index.html', base + 'obs-storage/'],
  ['about.html', base + 'about.html'],
  ['privacy.html', base + 'privacy.html'],
  ['affiliate.html', base + 'affiliate.html'],
  ['contact.html', base + 'contact.html']
]);
const tools = [...indexable.keys()].filter(file => file.includes('/'));
const html = file => readFileSync(file, 'utf8');
const one = (source, pattern, label) => {
  const matches = [...source.matchAll(pattern)];
  assert.equal(matches.length, 1, label);
  return matches[0][1];
};
const strip = value => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

test('indexable pages have unique metadata, exact canonicals and matching OGP', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [file, expectedUrl] of indexable) {
    const source = html(file);
    const title = one(source, /<title>(.*?)<\/title>/gs, `${file} title`);
    const description = one(source, /<meta name="description" content="([^"]+)">/g, `${file} description`);
    const canonical = one(source, /<link rel="canonical" href="([^"]+)">/g, `${file} canonical`);
    assert.equal(canonical, expectedUrl, `${file} canonical URL`);
    assert.doesNotMatch(source, /<meta name="robots" content="noindex">/, `${file} indexable`);
    assert.equal(one(source, /<meta property="og:title" content="([^"]+)">/g, `${file} og:title`), title.replace(/ \| SOLOFORGE Tools$/, ''));
    assert.equal(one(source, /<meta property="og:description" content="([^"]+)">/g, `${file} og:description`), description);
    assert.equal(one(source, /<meta property="og:url" content="([^"]+)">/g, `${file} og:url`), canonical);
    assert.ok(title.length >= 10 && title.length <= 100, `${file} title length`);
    assert.ok(description.length >= 30 && description.length <= 180, `${file} description length`);
    assert.ok(!titles.has(title), `${file} duplicate title`);
    assert.ok(!descriptions.has(description), `${file} duplicate description`);
    titles.add(title); descriptions.add(description);
  }
});

test('heading order starts at one H1 and never skips a level', () => {
  for (const file of [...indexable.keys(), '404.html']) {
    const headings = [...html(file).matchAll(/<h([1-3])(?:\s[^>]*)?>/g)].map(match => Number(match[1]));
    assert.equal(headings.filter(level => level === 1).length, 1, `${file} H1 count`);
    assert.equal(headings[0], 1, `${file} starts with H1`);
    for (let index = 1; index < headings.length; index++) assert.ok(headings[index] <= headings[index - 1] + 1, `${file} heading level skip`);
  }
});

test('tool structured data matches page metadata and visible FAQ', () => {
  for (const file of tools) {
    const source = html(file);
    const canonical = one(source, /<link rel="canonical" href="([^"]+)">/g, `${file} canonical`);
    const description = one(source, /<meta name="description" content="([^"]+)">/g, `${file} description`);
    const schemas = [...source.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
    const application = schemas.find(item => item['@type'] === 'SoftwareApplication');
    const breadcrumb = schemas.find(item => item['@type'] === 'BreadcrumbList');
    const faq = schemas.find(item => item['@type'] === 'FAQPage');
    const h1 = strip(one(source, /<h1(?:\s[^>]*)?>(.*?)<\/h1>/gs, `${file} H1`));
    assert.equal(application.url, canonical, `${file} application URL`);
    assert.equal(application.name, h1, `${file} application name`);
    assert.equal(application.description, description, `${file} application description`);
    assert.equal(breadcrumb.itemListElement.at(-1).item, canonical, `${file} breadcrumb URL`);
    assert.equal(breadcrumb.itemListElement.at(-1).name, h1, `${file} breadcrumb name`);
    assert.ok(faq?.mainEntity.length > 0, `${file} FAQ schema`);
    const visibleFaq = [...source.matchAll(/<details[^>]*>\s*<summary>(.*?)<\/summary>\s*<p[^>]*>(.*?)<\/p>\s*<\/details>/gs)]
      .map(match => ({ question: strip(match[1]), answer: strip(match[2]) }));
    assert.deepEqual(faq.mainEntity.map(item => ({ question: item.name, answer: item.acceptedAnswer.text })), visibleFaq, `${file} visible/schema FAQ parity`);
  }
});

test('sitemap is unique and exactly matches indexable canonicals', () => {
  const sitemap = readFileSync('sitemap.xml', 'utf8');
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">[\s\S]*<\/urlset>\s*$/);
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, urls.length, 'duplicate sitemap URL');
  assert.deepEqual(new Set(urls), new Set(indexable.values()));
});

test('all tools are crawlable from home and related clusters use descriptive links', () => {
  const home = html('index.html');
  for (const file of tools) assert.match(home, new RegExp(`href="${file.replace('index.html', '')}"`), `${file} home link`);
  const subtitle = html('subtitle-reading-speed/index.html');
  const obs = html('obs-storage/index.html');
  const ppi = html('monitor-ppi/index.html');
  const display = html('display-bandwidth/index.html');
  const gpu = html('gpu-psu/index.html');
  assert.match(subtitle, />OBS録画容量計算機へ/);
  assert.match(obs, />字幕読み速度チェッカーへ/);
  assert.match(ppi, />4K・高Hz 接続チェッカーへ/);
  assert.match(display, />モニターPPI比較計算機へ/);
  assert.match(gpu, />4K・高Hz 接続チェッカーへ/);
  for (const source of [subtitle, obs, ppi, display, gpu]) assert.doesNotMatch(source, />ツールを使う\s*</);
});

test('404 stays out of the index and public assets remain lightweight', () => {
  const notFound = html('404.html');
  assert.match(notFound, /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(notFound, /rel="canonical"/);
  const robots = readFileSync('robots.txt', 'utf8');
  assert.match(robots, /User-agent: \*\s+Allow: \//);
  assert.doesNotMatch(robots, /Disallow:/);
  assert.ok(readFileSync('assets/style.css').byteLength < 100_000);
  for (const file of ['assets/site.js', 'assets/favicon.svg']) assert.ok(readFileSync(file).byteLength < 20_000, `${file} size`);
});
