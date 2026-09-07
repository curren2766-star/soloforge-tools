// Optional dev-only integration test. No dependencies are loaded by the public site.
// Set PLAYWRIGHT_MODULE to the installed playwright package path if not on NODE_PATH.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const base = 'http://127.0.0.1:4173/soloforge-tools/';
mkdirSync('.qa', { recursive: true });
const errors = [];
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read','clipboard-write'] });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const external = [];
  page.on('request', req => { if (!req.url().startsWith('http://127.0.0.1')) external.push(req.url()); });
  await page.goto(base + 'display-bandwidth/');
  await page.waitForFunction(() => document.querySelector('#bandwidth').textContent === '35.83');
  check(await page.locator('.link-result').count() === 13, 'all link classes rendered');
  check((await page.locator('#recommendation').textContent()).includes('FRL 48'), 'useful default result');
  await page.screenshot({ path: '.qa/display-desktop.png', fullPage: true });
  await page.locator('#shareBtn').click();
  await page.waitForFunction(() => document.querySelector('#shareStatus').textContent.includes('コピー'));
  check((await page.locator('#shareStatus').textContent()).includes('コピーしました'), 'display copy success');
  check((await page.evaluate(() => navigator.clipboard.readText())).includes('35.831808'), 'clipboard includes precise active bandwidth');
  await page.getByRole('button', { name: 'UWQHD 165Hz', exact: true }).click();
  check(await page.locator('#bandwidth').textContent() === '24.52', 'preset updates');
  check((await page.locator('.link-result').filter({ hasText: 'HBR3 ·' }).locator('.badge').textContent()) === '条件付き', 'near-boundary HBR3');
  await page.locator('#resolution').selectOption('custom');
  await page.locator('#width').fill('');
  check(await page.locator('#displayResults').isHidden(), 'invalid result hidden');
  check(await page.locator('#comparison').textContent() === '', 'invalid comparison cleared');
  check(await page.locator('#shareBtn').isDisabled(), 'invalid result cannot copy');
  await page.locator('#width').fill('1920'); await page.locator('#height').fill('1080');
  await page.locator('#refresh').selectOption('60'); await page.locator('#depth').selectOption('8');
  check(await page.locator('#bandwidth').textContent() === '2.99', 'custom input recovers');
  await page.locator('#refresh').selectOption('custom'); await page.locator('#customRefresh').fill('59.94');
  check((await page.locator('#conditionSummary').textContent()).includes('59.94'), 'fractional refresh');
  await page.locator('#chroma').selectOption('420'); await page.locator('#width').fill('1921');
  check((await page.locator('#inputStatus').textContent()).includes('偶数'), 'subsampling validation');
  await page.getByRole('button',{name:'4K 144Hz / HDR',exact:true}).click();
  await page.locator('#dsc').selectOption('confirmed');
  check((await page.locator('.link-result').filter({hasText:'HBR3 ·'}).locator('.badge').textContent())==='条件付き','DSC conditional');
  await page.goto(base+'obs-storage/');
  await page.waitForFunction(()=>document.querySelector('#fileSize').textContent !== '—');
  check(await page.locator('#fileSize').textContent()==='54.43 GB','OBS original size');
  check(await page.locator('#recordingsFit').textContent()==='16本','OBS original capacity');
  check(await page.locator('#uploadTime').textContent()==='4時間45分','OBS original upload');
  await page.locator('#videoBitrate').fill('8'); await page.locator('#audioBitrate').fill('0'); await page.locator('#hours').fill('1');
  check(await page.locator('#fileSize').textContent()==='3.60 GB','OBS independent known size');
  await page.locator('#shareBtn').click();
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('コピー'));
  check((await page.locator('#status').textContent()).includes('コピーしました'),'OBS copy');
  await page.locator('#hours').fill('');
  check(await page.locator('#obsResults').isHidden(),'OBS empty input hides stale results');
  await page.locator('#hours').fill('0'); await page.locator('#minutes').fill('0');
  check(await page.locator('#obsResults').isHidden(),'OBS zero duration');
  await page.locator('#minutes').fill('60');
  check(await page.locator('#obsResults').isHidden(),'OBS minutes upper limit');
  await page.locator('#minutes').fill('30');
  check(await page.locator('#fileSize').textContent()==='1.80 GB','OBS valid recovery');
  check(external.length===0,'local preview sends no analytics requests');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({width,height:900});
    for (const route of ['', 'display-bandwidth/','obs-storage/','privacy.html','contact.html','affiliate.html','about.html','missing/deep/route']) {
      const response = await page.goto(base+route);
      check(response.status()===(route.startsWith('missing')?404:200),`route ${route} status`);
      if (route==='display-bandwidth/') await page.waitForFunction(()=>document.querySelector('#bandwidth').textContent !== '—');
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`no overflow ${width} ${route}`);
      check(await page.locator('h1').count()===1,`one h1 ${route}`);
      check(await page.evaluate(()=>[...document.querySelectorAll('input,select')].every(el=>el.labels?.length || el.getAttribute('aria-label'))),`labelled inputs ${route}`);
      if([1440,390].includes(width)&&['','display-bandwidth/','obs-storage/'].includes(route)) await page.screenshot({path:`.qa/${route?route.replace('/',''):'home'}-${width}.png`,fullPage:true});
    }
  }
  await page.setViewportSize({width:640,height:900});
  await page.goto(base+'display-bandwidth/');
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% text zoom has no horizontal overflow');
  await page.goto(base);
  await page.keyboard.press('Tab');
  check(await page.evaluate(()=>document.activeElement.className==='skip-link'),'keyboard skip link first');
  await page.keyboard.press('Enter');
  check(await page.evaluate(()=>location.hash==='#main'),'skip link navigates to main');
  check(errors.length===0,`JS errors: ${errors}`);
  await context.close();
  // Production-origin fixture: serve repository files locally and intercept GA completely.
  const trackingContext = await browser.newContext({permissions:['clipboard-write','clipboard-read']});
  await trackingContext.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
  const production = 'https://curren2766-star.github.io/soloforge-tools/';
  let gaLoads=0;
  await trackingContext.route('**/*',async route=>{
    const url=route.request().url();
    if(url.startsWith(production)){
      let file=new URL(url).pathname.slice('/soloforge-tools/'.length);if(file.endsWith('/')||file==='')file+='index.html';
      const contentType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html';
      await route.fulfill({body:readFileSync(file),contentType});
    } else { if(url.includes('googletagmanager'))gaLoads++; await route.fulfill({body:'',contentType:'text/javascript'}); }
  });
  const tracking = await trackingContext.newPage();
  const events = () => tracking.evaluate(()=>window.dataLayer.filter(x=>x[0]==='event').map(x=>({name:x[1],params:x[2]})));
  for(const route of ['display-bandwidth/','obs-storage/']){
    await tracking.goto(production+route);
    await tracking.waitForFunction(()=>window.dataLayer.some(x=>x[0]==='config'));
    check((await events()).length===0,'no initial tool events');
    if(route==='display-bandwidth/'){
      await tracking.locator('#depth').selectOption('8');
      await tracking.getByRole('button',{name:'接続条件をチェック',exact:false}).click();
    } else { await tracking.locator('#videoBitrate').fill('20');await tracking.locator('#calcBtn').click();await tracking.locator('#calcBtn').click(); }
    let emitted=await events();
    check(emitted.filter(x=>x.name==='tool_start').length===1,'one start per page session');
    check(emitted.filter(x=>x.name==='tool_complete').length===1,'deduplicated completion');
    await tracking.locator('#shareBtn').click();
    await tracking.waitForFunction(()=>window.dataLayer.some(x=>x[0]==='event'&&x[1]==='result_share'));
    check((await events()).filter(x=>x.name==='result_share').length===1,'only successful copy tracked');
    check((await events()).every(x=>Object.keys(x.params).join(',')==='tool'),'no input values in analytics');
  }
  await tracking.evaluate(()=>{
    const add=(href,slot)=>{const a=document.createElement('a');a.href=href;a.textContent=slot;a.dataset.affiliate=slot;document.body.append(a);};
    add('#','placeholder');add('/soloforge-tools/affiliate.html','internal');add('https://example.com/product','external');
  });
  await tracking.getByRole('link',{name:'placeholder',exact:true}).click();
  check(!(await events()).some(x=>x.name==='outbound_affiliate_click'),'placeholder never tracked');
  // Prevent navigation AFTER the shared document listener, retaining the captured event.
  await tracking.evaluate(()=>window.addEventListener('click',e=>e.preventDefault()));
  await tracking.getByRole('link',{name:'internal',exact:true}).click();
  check(!(await events()).some(x=>x.name==='outbound_affiliate_click'),'internal never tracked');
  await tracking.getByRole('link',{name:'external',exact:true}).click();
  check((await events()).filter(x=>x.name==='outbound_affiliate_click').length===1,'real external affiliate measured');
  check(gaLoads===2,'GA loaded once per page');
  const before=gaLoads;
  await tracking.goto(production+'display-bandwidth/?analytics=off');
  await tracking.waitForFunction(()=>document.querySelector('#bandwidth').textContent!=='—');
  check(gaLoads===before,'analytics off blocks GA loader');
  await trackingContext.close();
  console.log(`Browser QA passed: ${checks} checks, no JavaScript errors. Screenshots: .qa/`);
} finally { await browser.close(); }
