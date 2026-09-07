import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const base = 'https://curren2766-star.github.io/soloforge-tools/';
const esc = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const header = `<a class="skip-link" href="#main">本文へスキップ</a><header class="site-header"><nav class="nav" aria-label="メイン"><a class="brand" href="/soloforge-tools/"><span class="brand-mark" aria-hidden="true">S<span>F</span></span> SOLOFORGE <span class="brand-sub">Tools</span></a><div class="nav-links"><a href="/soloforge-tools/#tools">ツール一覧</a><a href="/soloforge-tools/about.html">このサイトについて</a></div></nav></header>`;
const footer = `<footer class="footer"><div class="footer-inner"><div><a class="brand" href="/soloforge-tools/">SOLOFORGE Tools</a><p>小さな面倒を、すぐ終わらせる。</p><small>© 2026 SOLOFORGE Tools</small></div><nav aria-label="フッター"><a href="/soloforge-tools/privacy.html">プライバシー</a><a href="/soloforge-tools/affiliate.html">広告・アフィリエイト</a><a href="/soloforge-tools/contact.html">お問い合わせ</a></nav></div></footer>`;
function page(path, title, description, body, { tool = '', script = '', schema = [], noindex = false } = {}) {
  const canonical = base + path;
  const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | SOLOFORGE Tools</title><meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:type" content="website"><meta property="og:locale" content="ja_JP"><meta property="og:site_name" content="SOLOFORGE Tools"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary">
<meta name="theme-color" content="#14263d"><link rel="icon" href="/soloforge-tools/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/soloforge-tools/assets/style.css">
${schema.map(data => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...data })}</script>`).join('\n')}
<script type="module" src="/soloforge-tools/assets/${script || 'site.js'}"></script></head><body data-tool="${tool}">
${header}<main class="wrap ${tool ? 'tool-page' : 'general-page'}" id="main">${body}</main>${footer}</body></html>\n`;
  const file = path.endsWith('/') || path === '' ? `${path}index.html` : path;
  if (file.includes('/')) mkdirSync(file.slice(0, file.lastIndexOf('/')), { recursive: true });
  writeFileSync(file, html);
}
const appSchema = (name, path) => ({ '@type': 'SoftwareApplication', name, url: base + path, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', inLanguage: 'ja', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' } });
const crumbs = name => `<div class="breadcrumb"><a href="/soloforge-tools/">ツール一覧</a><span aria-hidden="true">/</span>${name}</div>`;
const related = (href, name, text) => `<aside class="related"><div><span class="eyebrow">もうひとつ、面倒を解決</span><h2>${name}</h2><p class="muted">${text}</p></div><a class="button secondary" href="/soloforge-tools/${href}">ツールを使う <span aria-hidden="true">↗</span></a></aside>`;
page('', 'PC・動画制作の無料ツール集', 'グラボ交換の電源容量・補助電源、4K・高Hzの接続条件、OBS録画容量をブラウザですぐ確認。無料・ログイン不要のSOLOFORGE Tools。', `
<section class="home-hero"><div class="eyebrow">PC & CREATOR UTILITIES</div><p class="site-name">SOLOFORGE Tools</p><h1>小さな面倒を、<br><span>すぐ終わらせる。</span></h1><p class="lead">グラボ交換も、モニターの接続も、録画の容量も。<br>調べて、計算して、迷う時間をひとつ減らそう。</p><div class="trust-line"><span>無料で使える</span><span>ログイン不要</span><span>ブラウザ内で計算</span></div></section>
<section id="tools"><div class="section-heading"><h2>いま使えるツール</h2><span class="muted">03 TOOLS</span></div><div class="tool-cards">
<a class="card tool-card featured" href="gpu-psu/"><div class="card-top"><span class="tool-number">03 / GPU POWER</span><span class="badge">NEW</span></div><div class="card-metric" aria-hidden="true">GPU <span>→</span> PSU</div><h3>グラボ交換<br>電源・コネクタ診断</h3><p>このグラボ、今の電源で大丈夫？</p><p class="muted">GPUと現在のPSU情報から、電源容量と補助電源コネクタを分けて診断します。</p><span class="card-cta">交換条件を診断 <span aria-hidden="true">↗</span></span></a>
<a class="card tool-card" href="display-bandwidth/"><div class="card-top"><span class="tool-number">01 / DISPLAY</span><span class="badge neutral">モニター</span></div><div class="card-metric" aria-hidden="true">4K <span>×</span> 144<span>Hz</span></div><h3>4K・高Hz 接続チェッカー</h3><p>そのモニター、どの接続が必要？</p><p class="muted">解像度とHzを選ぶだけ。HDMI・DisplayPortの帯域を比較し、機器やケーブルの確認ポイントがわかります。</p><span class="card-cta">接続条件をチェック <span aria-hidden="true">↗</span></span></a>
<a class="card tool-card" href="obs-storage/"><div class="card-top"><span class="tool-number">02 / RECORDING</span><span class="badge neutral">動画・配信</span></div><div class="card-metric" aria-hidden="true">REC <span>→</span> GB</div><h3>OBS録画容量・<br>アップロード時間計算機</h3><p>録画する前に、容量の見通しを。</p><p class="muted">ビットレートと時間から、録画サイズ・SSDに保存できる本数・アップロード時間をまとめて計算。</p><span class="card-cta">録画容量を計算 <span aria-hidden="true">↗</span></span></a></div></section>
<section class="principles"><h2>必要な答えに、まっすぐ。</h2><div class="grid3"><div><h3>設定は、最小限。</h3><p>よく使う条件を用意。入力したら、その場で結果を確認できます。</p></div><div><h3>目安と根拠を、一緒に。</h3><p>計算の前提や限界も表示。結果を次の判断につなげられます。</p></div><div><h3>小さく作り、育てる。</h3><p>日々の小さな面倒から。使われるツールを少しずつ改善します。</p></div></div></section>`, { schema: [{ '@type': 'WebSite', name: 'SOLOFORGE Tools', url: base }] });
const displayFaqs = [
  ['4K 144HzにHDMI 2.1は必要ですか？', 'RGB 10bitのactive video帯域は約35.83Gbpsです。FRL 40Gbpsの符号化後上限約35.56Gbpsを超えます。FRL 48Gbpsなどが候補ですが、HDMI 2.1という名前だけでは最大帯域や対応Hzはわかりません。GPUとモニターの両方の対応モード表を確認してください。'],
  ['HDMI 2.0で4K 120Hzは使えますか？', 'TMDS 18Gbps級ではRGB 8bitのactive videoだけで約23.89Gbpsとなり、帯域不足です。4:2:0・8bitなら帯域は減りますが、そのモードに機器が対応するか確認が必要です。4:2:0・10bitは約14.93Gbpsで実効上限14.4Gbpsを超えます。'],
  ['DP1.4で4K 144Hz、UWQHD 165Hzは使えますか？', 'HBR3の4レーン実効帯域は25.92Gbps。4K 144Hz RGB 10bitは非圧縮では不足し、DSC等の確認が必要です。3440×1440・165Hz・RGB 10bitは約24.52Gbpsで上限に近く、タイミングによって変わるため条件付きです。'],
  ['HDRをONにすると帯域は増えますか？', 'この計算ではHDRという指定に固定倍率はかけません。色深度を8bitから10bitにすると映像データ量が増えます。HDRメタデータや音声などは概算に含めていません。HDR10用途では通常10bitが目安です。'],
  ['DSC対応なら必ず映りますか？', 'いいえ。GPU・モニター双方のDSC対応に加え、対応圧縮率、スライス構成、解像度やHzなどの条件が必要です。このツールは圧縮率を仮定せず、非圧縮で不足する場合に可能性を条件付きで案内します。TMDS接続にはDSCを適用しません。'],
  ['DisplayPort 2.1やHDMI 2.2なら最大帯域で使えますか？', 'バージョン名では判断できません。DisplayPortのUHBR10・13.5・20、HDMIのFRL伝送クラスなど、両側のポートが実際に対応する速度を確認してください。Ultra96の機器表示も64・80・96Gbpsのいずれかで、すべて96Gbpsとは限りません。'],
  ['USB-C・ドック・変換アダプターにも使えますか？', '比較表のDisplayPortは4レーン・単一画面の前提です。USB-Cで2レーンに制限される場合や、ドック・MSTで複数画面と帯域を共有する場合には、そのまま適用できません。各製品の対応モード表で確認してください。'],
  ['「余裕あり」は動作保証ですか？', 'いいえ。active videoが比較用実効帯域の85%以下であることを示す独自の目安です。残り15%は規格の保証値でも、正確なblanking計算でもありません。実際のタイミング、機器の上限、ケーブル長、VRR等で結果は変わります。']
];
const faqHtml = displayFaqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
page('display-bandwidth/', '4K・高Hz 接続チェッカー｜HDMI・DisplayPort帯域比較', '4K 144Hz・120Hz、UWQHD 165Hzなどの接続条件を無料チェック。HDR・10bit・DSCを考慮してHDMIのFRL、DPのHBR3・UHBRを比較。必要なケーブルと確認事項がわかります。', crumbs('4K・高Hz 接続チェッカー') + readFileSync('content/display-bandwidth.html', 'utf8') + `<section class="explanation"><h2>よくある質問</h2>${faqHtml}</section>` + related('obs-storage/', '録画するなら、容量も先に確認。', 'OBSの録画サイズとアップロード時間をまとめて計算。'), { tool: 'display_bandwidth', script: 'display-bandwidth.js', schema: [appSchema('4K・高Hz 接続チェッカー', 'display-bandwidth/'), { '@type': 'FAQPage', mainEntity: displayFaqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }, { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'ツール一覧', item: base }, { '@type': 'ListItem', position: 2, name: '4K・高Hz 接続チェッカー', item: base + 'display-bandwidth/' }] }] });
page('obs-storage/', 'OBS録画容量・アップロード時間計算機', 'OBS等の録画ビットレートと録画時間から、予想ファイル容量、SSD保存可能時間、アップロード時間を無料計算。', crumbs('OBS録画容量計算機') + readFileSync('content/obs-storage.html', 'utf8') + related('display-bandwidth/', 'モニターの接続条件もチェック。', '4K・高Hzに必要なHDMI・DisplayPortの帯域を比較。'), { tool: 'obs_storage', script: 'obs-storage.js', schema: [appSchema('OBS録画容量・アップロード時間計算機', 'obs-storage/')] });
const gpuFaqs = [
  ['グラボの推奨電源容量を満たせば安全ですか？', '推奨W数は入口です。PSUの12V出力、品質、経年、CPUや周辺機器、購入カード固有の仕様でも変わります。結果がOKでも、PSUとGPU両方のメーカー仕様を確認してください。'],
  ['同じRTXやRadeonなら補助電源コネクタも同じですか？', '同じGPUシリーズでも、メーカー製カードやOCモデルで推奨PSU容量・補助電源コネクタが異なる場合があります。このツールはシリーズの公式参考値を示し、個別製品の仕様確認先を案内します。'],
  ['PCIe 8-pinが1本から2口に分かれるケーブルは2本ですか？', 'この診断では1本として数えます。複数口を必要とするGPUでは、PSUから別々に出る専用PCIeケーブルを使う前提です。GPUとPSUの説明書が別の接続方法を指定する場合は、その指定を優先してください。'],
  ['12VHPWRと12V-2x6は同じように選べますか？', 'どちらも16-pinですが、名称だけで十分とは判断しません。必要な300W・450W・600W定格、PSUとケーブルの組み合わせ、GPU側の指定を確認し、コネクタを奥まで確実に挿してください。'],
  ['モジュラー電源のケーブルを流用できますか？', '別メーカーや別シリーズのPSUケーブルは、GPU側の形が同じでもPSU側の配線が同じとは限りません。流用せず、PSUメーカーが対象型番用として指定したケーブルだけを使ってください。'],
  ['変換ケーブルを買えばコネクタ不足を解決できますか？', '安易な市販変換で不足を回避しないでください。GPU同梱の指定アダプター、またはPSUメーカーがその型番向けに指定したケーブルを、説明書どおりに使います。条件を満たせない場合はPSU交換候補です。']
];
const gpuFaqHtml = gpuFaqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
page('gpu-psu/', 'グラボ交換 電源・コネクタ診断｜GPUの電源容量を確認', '交換したいGPUと現在の電源容量、PCIe 8-pin・12V-2x6 / 12VHPWR対応から、グラボの電源不足と補助電源を無料診断。RTX・Radeon主要モデルに対応。', crumbs('グラボ交換 電源・コネクタ診断') + readFileSync('content/gpu-psu.html', 'utf8') + `<section class="explanation"><h2>グラボ交換と電源のよくある質問</h2>${gpuFaqHtml}</section>` + related('display-bandwidth/', '新しいGPUなら、映像出力も確認。', '4K・高Hzに必要なHDMI・DisplayPort帯域を比較。'), { tool:'gpu_psu', script:'gpu-psu.js', schema:[appSchema('グラボ交換 電源・コネクタ診断', 'gpu-psu/'), { '@type':'FAQPage', mainEntity:gpuFaqs.map(([q,a])=>({ '@type':'Question', name:q, acceptedAnswer:{ '@type':'Answer', text:a } })) }, { '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'ツール一覧', item:base }, { '@type':'ListItem', position:2, name:'グラボ交換 電源・コネクタ診断', item:base+'gpu-psu/' }] }] });
const info = {
  'about.html': ['このサイトについて', '<p>SOLOFORGE Toolsは、PC・動画制作・配信の小さな面倒を、ブラウザだけで解決する無料ツールサイトです。</p><h2>小さく作り、使われるものを育てる</h2><p>必要な機能を軽量に公開し、利用状況やフィードバックをもとに改善します。会員登録は不要です。</p><h2>答えと、その前提を伝える</h2><p>各ツールに計算方法や制約を記載しています。計算結果は判断の目安として使い、購入前にはメーカーの仕様も確認してください。</p><p>運営：SOLOFORGE Tools（GitHub: curren2766-star）</p><p><a href="https://github.com/curren2766-star/soloforge-tools">ソースコードを見る</a></p>'],
  'privacy.html': ['プライバシーポリシー', '<h2>入力データ</h2><p>SOLOFORGE Toolsの各計算ツールはブラウザ内で動作します。入力値を当サイトのサーバーに保存したり、解析イベントに含めて送信したりする設計ではありません。コピーは利用者が操作した場合だけ行います。</p><h2>アクセス解析</h2><p>サイトの改善のためGoogle Analytics 4（Google LLC）を利用しています。Cookie等を通じ、ページ閲覧、端末や参照元、ツールの利用開始・計算完了・コピー成功などの情報が収集される場合があります。氏名、メールアドレス、計算の入力値を独自イベントに含めません。</p><p><a href="https://policies.google.com/privacy?hl=ja">Googleのプライバシーポリシー</a> / <a href="https://tools.google.com/dlpage/gaoptout?hl=ja">Google Analyticsオプトアウト</a></p><h2>広告と外部サイト</h2><p>現在、実アフィリエイトリンクは設置していません。外部サイトに移動した後の情報の取り扱いは、そのサイトの方針をご確認ください。</p><h2>免責・改定</h2><p>結果は計算上の目安です。機器仕様、録画設定、回線状況などにより実際の結果と異なる場合があります。本方針は機能や運用の変更に合わせて更新します。</p><p class="muted">更新日：2026年9月7日</p>'],
  'affiliate.html': ['広告・アフィリエイトについて', '<div class="notice">現在、実アフィリエイトリンクは設置していません。</div><p>ツール内のケーブル・SSD案内は、仕様を確認するための情報です。公式情報へのリンクによって当サイトが紹介料を受け取ることはありません。</p><h2>今後の導入について</h2><p>アフィリエイトを導入する場合は、対象リンクに広告・PRであることを明示し、必要なプログラム表記と本ページを更新します。報酬の有無によって計算結果を変更しません。</p><p>購入前に、販売元で最新の仕様・価格・在庫をご確認ください。</p>'],
  'contact.html': ['お問い合わせ', '<p>不具合や改善の提案は、公開リポジトリのGitHub Issuesからお知らせください。投稿にはGitHubアカウントが必要です。</p><p><a class="button primary" href="https://github.com/curren2766-star/soloforge-tools/issues">GitHub Issuesを開く ↗</a></p><h2>不具合を伝えるとき</h2><p>ツール名、操作手順、期待した結果、利用ブラウザを記載いただくと確認がスムーズです。投稿は公開されるため、氏名・メールアドレスなどの個人情報を記載しないでください。</p><p class="muted">個別機器の動作保証や購入相談への個別回答は行っていません。すべての投稿への返信はお約束できません。</p>'],
  '404.html': ['ページが見つかりません', '<div class="eyebrow">404 / PAGE NOT FOUND</div><p>URLが変わったか、ページが存在しないようです。ツール一覧からお探しください。</p><p><a class="button primary" href="/soloforge-tools/">ツール一覧へ戻る →</a></p>']
};
for (const [path, [title, body]] of Object.entries(info)) page(path, title, `${title}。SOLOFORGE Toolsの運営方針とご案内。`, `<article class="prose"><h1>${title}</h1>${body}</article>`, { noindex: path === '404.html' });
writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', 'gpu-psu/', 'display-bandwidth/', 'obs-storage/', ...Object.keys(info).filter(p => p !== '404.html')].map(path => `  <url><loc>${base}${path}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('Built 9 static pages and sitemap.');
