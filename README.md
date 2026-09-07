# SOLOFORGE Tools

小さな面倒を、すぐ終わらせる。PC・動画制作向けの無料静的ツール集。

- 公開：https://curren2766-star.github.io/soloforge-tools/
- GitHub Pages：main / root（生成済みHTMLをコミット）
- 公開ツール：/monitor-ppi/、/gpu-psu/、/obs-storage/、/display-bandwidth/
- GA4：G-BMGC440MQL

## 開発と検証

Node.js 22以降。ビルドと単体テストに外部パッケージは不要。

```sh
node scripts/build.mjs
node --test tests/*.test.mjs
node scripts/serve.mjs
```

npmがある環境では `npm run build`、`npm test`、`npm run dev` も同じ。ローカルURLは http://127.0.0.1:4173/soloforge-tools/ 。GitHub Pagesのサブパスと深い404を再現する。

ブラウザ検証はPlaywrightを開発環境に用意して、サーバー起動中に `node tests/browser.mjs`。パッケージが標準解決されなければ環境変数 `PLAYWRIGHT_MODULE` にインストール先、必要に応じ `BROWSER_EXECUTABLE` にブラウザ実行ファイルの絶対パスを指定。公開サイトに依存を追加する必要はない。スクリーンショットはGit対象外の `.qa/`。

## 構造と新ツール追加

| ファイル | 役割 |
| --- | --- |
| scripts/build.mjs | 共通ヘッダー・フッター・SEO・ページ登録・sitemap生成 |
| content/*.html | ツール本文の編集元 |
| assets/style.css | 共通トークン、カード、フォーム、結果、ステータス |
| assets/site.js | GA4、セッション、コピー、実アフィリエイト計測 |
| assets/display-model.js | DOM非依存の帯域式・クラスデータ・判定 |
| assets/display-bandwidth.js | 新ツールの入力・結果表示 |
| assets/gpu-data.js | GPUシリーズの公式参考値と出典URL |
| assets/gpu-psu-model.js | DOM非依存の容量・コネクタ判定 |
| assets/gpu-psu.js | GPU電源診断の入力・結果表示 |
| assets/monitor-ppi-model.js | DOM非依存のPPI・比較計算とプリセット |
| assets/monitor-ppi.js | モニターA/Bの入力・比較結果表示 |
| assets/obs-storage.js | 既存OBS式・表示 |
| tests/ | 数値・境界値・SEO・リンク・ブラウザ・計測テスト |
| docs/display-method.md | 技術判断と公式出典 |
| docs/gpu-psu-method.md | GPU電源診断の判定方針と公式出典 |
| docs/monitor-ppi-method.md | PPI・ピクセルピッチ・比較率の計算方針 |

1. content/<slug>.htmlに本文、assets/<slug>.jsにUIを書く。計算モデルはDOMから分離する。
2. 共通CSSのcard、fields、actions、badge等を使う。site.jsをimportし、固定のtool識別子で計測する。
3. ビルドのpage()にパス・title・description・本文・script・構造化データを登録。トップのカード、関連ツール、sitemapの登録配列を更新する。
4. 生成HTMLを直接編集せず、編集元からビルド。主要計算・無効入力・PC／スマホ・キーボード・SEO・計測を検証。
5. git diff --checkと差分を確認して生成物を含めコミット・push。Pages反映を別途確認する。

公開配信はHTML/CSS/ES modulesのみ。サーバー処理・ログイン・外部フォント・UIフレームワークは不要。404のCSS・ホームリンクは絶対サブパスなので深いURLでも壊れない。既存のGoogle所有権確認ファイルとrobots.txtは維持。

## GA4イベント契約

本番ホスト＋/soloforge-tools/配下だけでGA4を読み込む。localhost、navigator.webdriver、?analytics=offでは読み込まない。公開後の自動検証も解析へ送信しない。

| イベント | 発火 |
| --- | --- |
| page_view | GA4標準。独自に二重送信しない |
| tool_start | 初回の入力／計算／プリセット操作。ページ滞在につき1回 |
| tool_complete | changeによる入力確定、計算ボタン、プリセットで有効結果が得られたとき。連続する同条件を重複送信しない |
| result_share | クリップボードへのコピー成功時のみ |
| outbound_affiliate_click | a[data-affiliate]の実HTTP(S)外部リンク操作のみ。内部・ハッシュ・準備中は対象外 |

生の入力値、結果数値、URL、氏名、メールアドレスを独自イベントに含めない。送信パラメーターは固定tool識別子と、広告クリック時の固定slot識別子。初期自動計算には利用イベントを送信しない。実アフィリエイトは未導入。導入時はリンクのPR表示と開示ページを更新する。

ブラウザテストは本番originをローカルファイルで代替し、GAへの全通信をinterceptしてイベント配列を検証する。GA4管理画面での実受信チェックはテストに含まない。

## 計算方針

OBSは従来の10進GB式、SSDの90%を利用可能とする前提、上り速度×実効率を維持。無効入力時は古い結果とコピーを無効にする。

ディスプレイはactive video基準。HDR倍率なし、色形式とbit深度を分離。DSCは条件付き。バージョン名で実機最大帯域を断定せず、HDMI 64/80/96Gbps級の実効値は未確定。詳細と出典は[判定資料](docs/display-method.md)。

GPU電源診断はメーカーのシリーズ参考PSU値と補助電源条件を入口にし、CPUクラスと余裕幅、独立PCIeケーブル本数、16-pin定格を別々に判定する。個別カードの仕様差を明記し、モジュラーケーブル流用や非指定変換を案内しない。詳細は[判定資料](docs/gpu-psu-method.md)。

モニターPPI比較は、対角インチと横・縦解像度から未丸めのPPIを求め、現在Aを分母として購入候補Bとの差を計算する。PPIを画質の総合評価とは扱わない。詳細は[計算資料](docs/monitor-ppi-method.md)。

## 公開前確認

ローカル計算・ブラウザ検証 → 差分 → commit → git push origin main → GitHub Pagesの反映と実URLを確認。push成功と公開確認済みを区別する。Search Console設定変更は不要。実アフィリエイトURLを導入するまでは商品リンクを捏造しない。
