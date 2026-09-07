const CPU_EXTRA = { standard:0, high:100, extreme:200 };
const labels = { ok:'OK', caution:'要確認', insufficient:'不足' };

export function diagnose(gpu, { psuWatts, eightPinCables, native16, cpuClass='standard' }) {
  if (!gpu || !Number.isFinite(psuWatts) || psuWatts < 300 || !Number.isInteger(eightPinCables) || eightPinCables < 0 || !(cpuClass in CPU_EXTRA)) return null;
  const target = gpu.psu + CPU_EXTRA[cpuClass];
  let capacityStatus = psuWatts < gpu.psu ? 'insufficient' : psuWatts < target + 100 ? 'caution' : 'ok';
  let capacityReason = capacityStatus === 'insufficient'
    ? `メーカー参考値 ${gpu.psu}W に ${gpu.psu - psuWatts}W届きません。`
    : capacityStatus === 'caution'
      ? `参考値は満たしますが、CPU構成と余裕幅を含む確認目安 ${target + 100}W 未満です。`
      : `CPU構成を含む確認目安 ${target}W に対して100W以上の余裕があります。`;

  let connectorStatus;
  let connectorReason;
  if (gpu.connector.type === 'pcie8') {
    connectorStatus = eightPinCables >= gpu.connector.eightPin ? 'ok' : 'insufficient';
    connectorReason = connectorStatus === 'ok'
      ? `シリーズ参考のPCIe 8-pin ${gpu.connector.eightPin}本を、別々のPSUケーブルで用意できます。`
      : `シリーズ参考のPCIe 8-pin ${gpu.connector.eightPin}本に対して、別々のPSUケーブルが${eightPinCables}本です。`;
  } else {
    const nativeRating = Number(native16) || 0;
    if (nativeRating >= gpu.connector.nativeWatts) {
      connectorStatus = 'ok';
      connectorReason = `${gpu.connector.nativeWatts}W以上のネイティブ16-pin定格を満たします。コネクタを奥まで確実に挿してください。`;
    } else if (native16 === 'unknown') {
      connectorStatus = 'caution';
      connectorReason = `16-pinケーブルの定格が不明です。PSU側の対応出力とGPU製品の指定を確認してください。`;
    } else if (eightPinCables >= gpu.connector.eightPin) {
      connectorStatus = 'caution';
      connectorReason = `付属変換アダプターを使う参考条件は満たします。PCIe 8-pin ${gpu.connector.eightPin}本を別々のPSUケーブルで接続し、製品指定を確認してください。`;
    } else {
      connectorStatus = 'insufficient';
      connectorReason = `必要定格のネイティブ16-pinも、付属アダプター用PCIe 8-pin ${gpu.connector.eightPin}本も確認できません。`;
    }
  }
  const overallStatus = capacityStatus === 'insufficient' || connectorStatus === 'insufficient'
    ? 'replace' : capacityStatus === 'caution' || connectorStatus === 'caution' ? 'check' : 'candidate';
  return {
    capacity:{ status:capacityStatus, label:labels[capacityStatus], reason:capacityReason },
    connector:{ status:connectorStatus, label:labels[connectorStatus], reason:connectorReason },
    overall:{ status:overallStatus, label:{ candidate:'そのまま交換候補', check:'PSU確認必要', replace:'PSU交換候補' }[overallStatus] },
    target, suggestedTier: Math.max(650, Math.ceil(target / 100) * 100)
  };
}
