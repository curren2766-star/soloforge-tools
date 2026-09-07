// See docs/display-method.md for sources, transport limits and thresholds.
export const links = [
  { id: 'tmds18', family: 'HDMI', name: 'TMDS 18 Gbps', link: 18, payload: 14.4, cable: 'Premium High Speed HDMI Cable', special: true },
  ...[24, 32, 40, 48].map(rate => ({ id: `frl${rate}`, family: 'HDMI', name: `FRL ${rate} Gbps`, link: rate, payload: rate * 16 / 18, cable: 'Ultra High Speed HDMI Cable' })),
  ...[64, 80, 96].map(rate => ({ id: `hdmi${rate}`, family: 'HDMI', name: `${rate} Gbps級（2.2世代）`, link: rate, payload: null, cable: 'Ultra96 HDMI Cable' })),
  { id: 'hbr2', family: 'DisplayPort', name: 'HBR2 · 4レーン', link: 21.6, payload: 17.28, cable: 'VESA認証ケーブル（HBR2以上）' },
  { id: 'hbr3', family: 'DisplayPort', name: 'HBR3 · 4レーン', link: 32.4, payload: 25.92, cable: 'VESA認証ケーブル（HBR3対応を確認）' },
  ...[[10, 38.68], [13.5, 52.22], [20, 77.37]].map(([rate, payload]) => ({ id: `uhbr${rate}`, family: 'DisplayPort', name: `UHBR${rate} · 4レーン`, link: rate * 4, payload, cable: rate === 20 ? 'VESA Certified DP80' : 'VESA Certified DP54' }))
];
export function calculate({ width, height, refresh, chroma, depth, hdr, dsc }) {
  if (![width, height].every(v => Number.isInteger(v) && v >= 1 && v <= 16384) || !Number.isFinite(refresh) || refresh < 1 || refresh > 1000 || !['444', '422', '420'].includes(chroma) || ![8, 10, 12].includes(depth) || ![true, false].includes(hdr) || ![true, false].includes(dsc)) throw new RangeError('入力範囲を確認してください');
  if ((chroma !== '444' && width % 2) || (chroma === '420' && height % 2)) throw new RangeError('4:2:2は横、4:2:0は縦横を偶数にしてください');
  const bpp = depth * ({ '444': 3, '422': 2, '420': 1.5 }[chroma]);
  return { width, height, refresh, chroma, depth, hdr, dsc, bpp, active: width * height * refresh * bpp / 1e9 };
}
export function assess(result, transport) {
  if (transport.payload === null) return { status: 'conditional', label: '条件付き', reason: '実効帯域を確定していません。機器の対応モード表を確認してください。' };
  const exceedsClock = transport.special && result.chroma === '422' && result.width * result.height * result.refresh > 600e6;
  if (result.active > transport.payload || exceedsClock) return result.dsc && !transport.special
    ? { status: 'conditional', label: '条件付き', reason: '非圧縮では不足。DSC利用の可能性がありますが、対応圧縮率・解像度・Hzの確認が必要です。' }
    : { status: 'short', label: '不足', reason: transport.special ? '非圧縮では帯域またはTMDSクロックが不足します。FRLやDisplayPortを検討してください。' : '非圧縮では帯域不足です。Hz・色深度を下げるか、上位リンク・DSC対応を確認してください。' };
  if (result.active > transport.payload * 0.85 || (transport.special && result.chroma === '422')) return { status: 'conditional', label: '条件付き', reason: 'タイミング・伝送上の余白が未確認です。機器の対応モード表を確認してください。' };
  return { status: 'good', label: '余裕あり', reason: '帯域上は余裕があります。実機での対応はGPU・モニター・ケーブルの仕様を確認してください。' };
}
