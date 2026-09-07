import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, assess, links } from '../assets/display-model.js';
const calc = (overrides = {}) => calculate({ width: 3840, height: 2160, refresh: 144, depth: 10, chroma: '444', hdr: true, dsc: false, ...overrides });
const get = id => links.find(link => link.id === id);
for (const [name, inputs, expected] of [
  ['1080p60 RGB8', { width: 1920, height: 1080, refresh: 60, depth: 8 }, 2.985984],
  ['4K60 RGB8', { refresh: 60, depth: 8 }, 11.943936],
  ['4K144 RGB10', {}, 35.831808],
  ['UWQHD165 RGB10', { width: 3440, height: 1440, refresh: 165 }, 24.52032],
  ['4K120 420 10bit', { refresh: 120, chroma: '420' }, 14.92992]
]) test(name, () => assert.ok(Math.abs(calc(inputs).active - expected) < 1e-9));
test('all chroma / depth combinations', () => {
  for (const [chroma, expected] of [['444', [24,30,36]], ['422', [16,20,24]], ['420', [12,15,18]]]) [8,10,12].forEach((depth, i) => assert.equal(calc({chroma,depth}).bpp, expected[i]));
});
test('HDR is not a bandwidth multiplier', () => assert.equal(calc({hdr:false}).active, calc({hdr:true}).active));
test('4K144 10bit excludes FRL40 but fits FRL48 with headroom', () => {
  assert.equal(assess(calc(),get('frl40')).status,'short');
  assert.equal(assess(calc(),get('frl48')).status,'good');
  assert.equal(assess(calc(),get('hbr3')).status,'short');
});
test('UWQHD165 is conditional at HBR3', () => assert.equal(assess(calc({width:3440,height:1440,refresh:165}),get('hbr3')).status,'conditional'));
test('DSC never promotes an insufficient link to good; no DSC on TMDS', () => {
  assert.equal(assess(calc({dsc:true}),get('hbr3')).status,'conditional');
  assert.equal(assess(calc({dsc:true}),get('tmds18')).status,'short');
});
test('payload and status boundaries', () => {
  const link=get('hbr3');
  for(const [active,status] of [[link.payload*.85,'good'],[link.payload*.85+1e-8,'conditional'],[link.payload,'conditional'],[link.payload+1e-8,'short']]) assert.equal(assess({...calc(),active},link).status,status);
  assert.equal(get('hbr3').payload,25.92); assert.equal(get('uhbr20').payload,77.37);
  for (const id of ['hdmi64','hdmi80','hdmi96']) assert.equal(assess(calc(),get(id)).status,'conditional');
});
test('TMDS 422 packing remains conditional and pixel clock is limited', () => {
  assert.equal(assess(calc({width:1920,height:1080,refresh:60,chroma:'422',depth:8}),get('tmds18')).status,'conditional');
  assert.equal(assess(calc({width:3840,height:2160,refresh:75,chroma:'422',depth:8}),get('tmds18')).status,'short');
});
test('invalid, extreme and fractional inputs', () => {
  for (const overrides of [{width:0},{height:-1},{width:1.5},{width:16385},{refresh:0},{refresh:1001},{refresh:Infinity},{refresh:NaN},{depth:16},{chroma:'bad'},{hdr:'true'},{dsc:null},{chroma:'422',width:1921},{chroma:'420',height:1081}]) assert.throws(()=>calc(overrides),RangeError);
  assert.ok(Number.isFinite(calc({width:16384,height:16384,refresh:1000}).active));
  assert.ok(calc({refresh:59.94}).active > 0);
});
