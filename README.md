# SOLOFORGE Tools Factory v1

PROJECT SOLOFORGE Factoryの公開用共通サイト土台です。

## 現在含まれるもの

- トップページ
- OBS録画容量・アップロード時間計算機
- 共通CSS
- GA4イベント計測の枠
- プライバシーポリシー
- 広告・アフィリエイト表記
- お問い合わせ
- 404
- robots.txt
- sitemap.xml

## 現在の公開設定

- 公開URL: `https://curren2766-star.github.io/soloforge-tools/`
- GA4測定ID: `G-BMGC440MQL`
- GitHub Pages: main / root

独自ドメインを導入した場合は canonical / sitemap / robots.txt のURLを更新します。

## 計測イベント

- page_view（GA4標準）
- tool_start
- tool_complete
- result_share
- outbound_affiliate_click

## OBS計算式

容量(GB) =
((映像Mbps × 1,000,000) + (音声kbps × 1,000))
× 秒数 ÷ 8 ÷ 1,000,000,000

GBは10進法。
SSD保存可能時間は総容量の90%を利用可能と仮定。
アップロードはユーザー指定の実効速度率を反映。

## 推奨公開先

静的ホスティング。
GitHub Pages / Cloudflare Pages 等に配置可能。

## Factory運用

新規ツールは `/tool-slug/` を追加し、トップページからリンク。
共通CSS・イベント計測・FAQ・アフィリエイト枠を流用する。
