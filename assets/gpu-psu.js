import { session } from './site.js';
import { GPU_DATA, gpuById } from './gpu-data.js';
import { diagnose } from './gpu-psu-model.js';

const $ = id => document.getElementById(id);
const form = $('gpuForm');
const analytics = session('gpu_psu');
let interacted = false;
const groups = Object.groupBy ? Object.groupBy(GPU_DATA, gpu => gpu.brand) : GPU_DATA.reduce((a,g)=>((a[g.brand]??=[]).push(g),a),{});
for (const [brand, gpus] of Object.entries(groups)) {
  const group = document.createElement('optgroup'); group.label = brand;
  for (const gpu of gpus) { const option=document.createElement('option'); option.value=gpu.id; option.textContent=gpu.name; group.append(option); }
  $('gpu').append(group);
}
$('gpu').value = 'rtx-5070';

function render() {
  const gpu = gpuById($('gpu').value);
  const psuWatts = Number($('psuWatts').value);
  const eightPinCables = Number($('eightPinCables').value);
  const native16 = $('native16').value;
  const needsCpuClass = gpu.psu >= 750;
  $('cpuField').hidden = !needsCpuClass;
  const cpuClass = needsCpuClass ? $('cpuClass').value : 'standard';
  const result = diagnose(gpu, { psuWatts, eightPinCables, native16, cpuClass });
  if (!result) { $('results').hidden=true; $('inputStatus').textContent='300W以上の電源容量と、0本以上のケーブル本数を入力してください。'; return; }
  $('inputStatus').textContent=''; $('results').hidden=false;
  $('overall').textContent=result.overall.label; $('overall').dataset.status=result.overall.status;
  for (const key of ['capacity','connector']) {
    $(`${key}Badge`).textContent=result[key].label; $(`${key}Badge`).className=`result-status ${result[key].status}`;
    $(`${key}Reason`).textContent=result[key].reason;
  }
  $('gpuSummary').textContent=`${gpu.name}｜ボード電力 ${gpu.board}W｜メーカー推奨PSU ${gpu.psu}W`;
  $('connectorReference').textContent=gpu.connector.type==='pcie8' ? `シリーズ参考：PCIe 8-pin × ${gpu.connector.eightPin}` : `シリーズ参考：${gpu.connector.nativeWatts}W以上の16-pin、または付属アダプター＋PCIe 8-pin × ${gpu.connector.eightPin}`;
  $('officialSource').href=gpu.source;
  $('psuSuggestion').hidden=result.overall.status!=='replace'; $('psuTier').textContent=`${result.suggestedTier}Wクラス`;
  if (interacted) analytics.complete(`${result.overall.status}:${result.capacity.status}:${result.connector.status}`);
}
const update = () => { interacted = true; analytics.start(); render(); };
form.addEventListener('input', update); form.addEventListener('change', update); render();
