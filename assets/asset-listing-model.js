const clean = value => String(value ?? '').replace(/\r\n?/g, '\n').trim();

const sections = (input, headings) => [
  [headings.contents, clean(input.contents)],
  [headings.format, clean(input.format)],
  [headings.terms, clean(input.terms)],
  [headings.credit, clean(input.credit)],
  [headings.notes, clean(input.notes)]
].filter(([, value]) => value);

const render = (input, headings) => {
  const blocks = [clean(input.name), clean(input.summary)].filter(Boolean);
  for (const [heading, value] of sections(input, headings)) blocks.push(`${heading}\n${value}`);
  return blocks.join('\n\n');
};

export function formatListings(input) {
  const normalized = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, clean(value)]));
  if (!normalized.name) return { error: '商品名を入力してください。', booth: '', itch: '' };
  return {
    error: '',
    booth: render(normalized, {
      contents: '【内容物】', format: '【ファイル形式】', terms: '【利用条件】', credit: '【クレジット条件】', notes: '【補足】'
    }),
    itch: render(normalized, {
      contents: 'CONTENTS', format: 'FILE FORMAT', terms: 'TERMS OF USE', credit: 'CREDIT', notes: 'NOTES'
    })
  };
}
