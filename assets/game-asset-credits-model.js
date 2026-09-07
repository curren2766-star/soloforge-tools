const clean = value => String(value ?? '').replace(/\r\n?/g, '\n').trim();
const unknown = '未確認';
const needsCheck = '未確認（公開前に要確認）';

function normalizeEntry(entry, index) {
  const item = Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, clean(value)]));
  const hasContent = ['name', 'author', 'url', 'credit', 'license', 'aiUsage'].some(key => item[key]) || (item.ai && item.ai !== 'unknown');
  if (!hasContent) return null;
  if (!item.name) return { error: `${index + 1}件目の素材名を入力してください。` };
  if (item.url) {
    try {
      const url = new URL(item.url);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
    } catch { return { error: `${index + 1}件目のURLは http:// または https:// から入力してください。` }; }
  }
  const ai = ['yes', 'no', 'unknown'].includes(item.ai) ? item.ai : 'unknown';
  return {
    name: item.name,
    author: item.author || unknown,
    url: item.url || unknown,
    credit: item.credit || needsCheck,
    license: item.license || needsCheck,
    ai,
    aiUsage: ai === 'yes' ? (item.aiUsage || needsCheck) : ''
  };
}

const aiLabel = ai => ai === 'yes' ? '使用あり' : ai === 'no' ? '使用なし' : '不明（要確認）';

export function buildCredits(entries) {
  const normalized = [];
  for (const [index, entry] of entries.entries()) {
    const item = normalizeEntry(entry, index);
    if (item?.error) return { error: item.error, txt:'', markdown:'', short:'', aiDisclosure:'' };
    if (item) normalized.push(item);
  }
  if (!normalized.length) return { error:'素材を1件以上入力してください。', txt:'', markdown:'', short:'', aiDisclosure:'' };

  const txtItems = normalized.map((item, index) => [
    `${index + 1}. ${item.name}`,
    `   作者: ${item.author}`,
    `   URL: ${item.url}`,
    `   クレジット条件: ${item.credit}`,
    `   ライセンス: ${item.license}`,
    `   AI利用: ${aiLabel(item.ai)}`,
    ...(item.ai === 'yes' ? [`   AI利用箇所: ${item.aiUsage}`] : [])
  ].join('\n')).join('\n\n');
  const markdownItems = normalized.map((item, index) => [
    `## ${index + 1}. ${item.name}`,
    `- 作者: ${item.author}`,
    `- URL: ${item.url}`,
    `- クレジット条件: ${item.credit}`,
    `- ライセンス: ${item.license}`,
    `- AI利用: ${aiLabel(item.ai)}`,
    ...(item.ai === 'yes' ? [`- AI利用箇所: ${item.aiUsage}`] : [])
  ].join('\n')).join('\n\n');
  const short = normalized.map(item => `${item.name} — ${item.author}`).join('\n');
  const used = normalized.filter(item => item.ai === 'yes');
  const unresolved = normalized.filter(item => item.ai === 'unknown');
  let aiDisclosure;
  if (used.length) {
    aiDisclosure = ['AI利用に関する開示案', ...used.map(item => `- ${item.name}: ${item.aiUsage}`)];
    if (unresolved.length) aiDisclosure.push('', `要確認: AI利用が不明の素材 ${unresolved.length}件`);
    aiDisclosure = aiDisclosure.join('\n');
  } else if (unresolved.length) {
    aiDisclosure = `AI利用が「不明」の素材が${unresolved.length}件あります。確認後に開示文を作成してください。`;
  } else {
    aiDisclosure = 'AI利用「あり」の素材が登録されていないため、開示案は作成していません。';
  }
  return { error:'', txt:`CREDITS\n=======\n\n${txtItems}`, markdown:`# Credits\n\n${markdownItems}`, short, aiDisclosure };
}
