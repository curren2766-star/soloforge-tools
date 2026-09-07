import { links, calculate, assess } from './display-model.js';
import { session, track, copyText } from './site.js';
const $ = id => document.getElementById(id);
const form = $('displayForm');
const events = session('display_bandwidth');
let current = null;
function read() {
  const custom = $('resolution').value === 'custom';
  const [width, height] = custom ? [Number($('width').value), Number($('height').value)] : $('resolution').value.split('x').map(Number);
  return calculate({ width, height, refresh: Number($('refresh').value === 'custom' ? $('customRefresh').value : $('refresh').value), chroma: $('chroma').value, depth: Number($('depth').value), hdr: $('hdr').checked, dsc: $('dsc').value === 'confirmed' });
}
function render(trackCompletion = false) {
  $('shareStatus').textContent = '';
  $('customResolution').hidden = $('resolution').value !== 'custom';
  $('customHz').hidden = $('refresh').value !== 'custom';
  for (const id of ['width', 'height']) $(id).disabled = $('customResolution').hidden;
  $('customRefresh').disabled = $('customHz').hidden;
  try {
    if (!form.checkValidity()) throw new RangeError('空欄や入力範囲を確認してください。解像度は1〜16384、Hzは1〜1000です。');
    current = read();
  } catch (error) {
    current = null; $('inputStatus').textContent = error.message; $('displayResults').hidden = true; $('comparison').replaceChildren(); $('shareBtn').disabled = true; return;
  }
  $('displayResults').hidden = false; $('shareBtn').disabled = false; $('inputStatus').textContent = '';
  $('bandwidth').textContent = current.active.toFixed(2);
  $('conditionSummary').textContent = `${current.width} × ${current.height} / ${current.refresh} Hz / ${current.depth} bit / ${current.chroma === '444' ? 'RGB・4:4:4' : current.chroma === '422' ? '4:2:2' : '4:2:0'}`;
  $('hdrNote').textContent = current.hdr && current.depth === 8 ? 'HDR ON・8bitです。HDR10用途では通常10bitが目安です。必要に応じて色深度を変更してください。' : current.chroma !== '444' ? '色差を間引く設定です。帯域は減りますが、PCの文字や細線がにじむことがあります。' : '文字の読みやすさを優先するPC用途は、RGB / 4:4:4が基本です。';
  $('comparison').replaceChildren();
  for (const family of ['HDMI', 'DisplayPort']) {
    const group = document.createElement('div'); group.className = 'link-group';
    const heading = document.createElement('h3'); heading.textContent = family; group.append(heading);
    links.filter(l => l.family === family).forEach(link => {
      const rating = assess(current, link);
      const item = document.createElement('details'); item.className = 'link-result';
      const summary = document.createElement('summary');
      const name = document.createElement('span'); name.textContent = link.name;
      const status = document.createElement('span'); status.className = `badge ${rating.status}`; status.textContent = rating.label;
      summary.append(name, status);
      const body = document.createElement('div');
      const reason = document.createElement('p'); reason.textContent = rating.reason;
      const capacity = document.createElement('p'); capacity.className = 'hint'; capacity.textContent = `公称リンク ${link.link} Gbps / ${link.payload === null ? '実効値は未確定' : `比較用実効帯域 ${link.payload.toFixed(2)} Gbps（上限目安）`}`;
      const cable = document.createElement('p'); cable.textContent = `ケーブル確認：${link.cable}`;
      body.append(reason, capacity, cable); item.append(summary, body); group.append(item);
    });
    $('comparison').append(group);
  }
  const candidates = ['HDMI', 'DisplayPort'].map(family => links.find(l => l.family === family && assess(current, l).status === 'good')).filter(Boolean);
  $('recommendation').textContent = candidates.length ? candidates.map(l => `${l.family} ${l.name}`).join(' または ') + ' が帯域上の候補です。' : '余裕ありの候補はありません。比較表の条件付き項目を確認し、Hz・色深度の変更も検討してください。';
  $('cableRecommendation').textContent = candidates.length ? '候補に合わせた認証：' + [...new Set(candidates.map(l => l.cable))].join(' / ') : '使用する伝送クラスを先に確認し、下の認証ガイドからケーブルを選んでください。';
  if (trackCompletion) events.complete(JSON.stringify(current));
}
form.addEventListener('input', () => { events.start(); render(false); });
form.addEventListener('change', () => render(true));
form.addEventListener('submit', event => { event.preventDefault(); render(true); });
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  const [resolution, hz, depth] = button.dataset.preset.split(',');
  $('resolution').value = resolution; $('refresh').value = hz; $('depth').value = depth;
  $('chroma').value = '444'; $('hdr').checked = depth === '10'; $('dsc').value = 'unknown';
  events.start(); render(true);
}));
$('shareBtn').addEventListener('click', async () => {
  if (!current) return;
  const copied = await copyText(`4K・高Hz 接続チェッカー\n${$('conditionSummary').textContent}\nHDR ${current.hdr ? 'ON' : 'OFF'} / DSC ${current.dsc ? '双方対応確認済み' : '考慮しない'}\nactive video基準 ${current.active.toFixed(6)} Gbps\n${$('recommendation').textContent}\n※blanking等を含まない概算。実機互換性は保証しません。\nhttps://curren2766-star.github.io/soloforge-tools/display-bandwidth/`);
  $('shareStatus').textContent = copied ? '結果をコピーしました。' : 'コピーできませんでした。結果のテキストを選択してコピーしてください。';
  if (copied) track('result_share', 'display_bandwidth');
});
render(false);
