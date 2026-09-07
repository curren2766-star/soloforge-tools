# サイト全体SEO・クロール監査

監査日：2026年9月7日。対象はトップ、公開5ツール、about、privacy、affiliate、contact、404、robots.txt、sitemap.xml、共通CSS・JavaScript。

## 確認結果

- 公開10 URLのtitleとmeta descriptionは固有で、ページ内容と一致する。
- 公開10 URLのcanonicalはHTTPS・本番ホスト・既存パス・末尾スラッシュ規則と一致する。404にはcanonicalがなく、noindexがある。
- OGPのtitle、description、URLは各ページの通常メタデータと一致する。
- H1は各ページ1件。H1からH3までの見出し順に飛び級はない。
- robots.txtは全ページとCSS・JavaScriptを許可し、本番sitemapを示す。
- sitemapはインデックス対象10 URLと完全一致し、重複・404・存在しないURLを含まない。
- トップの通常HTMLリンクから全5ツールへ到達できる。重要な説明、FAQ、関連リンクは生成済みHTMLに存在する。
- 5ツールのSoftwareApplication、BreadcrumbList、FAQPageはJSONとして解釈でき、URL・description・画面上のFAQと一致する。
- favicon、CSS、JavaScriptに欠損リンクはなく、大画像・同期外部依存・重い初期処理はない。

## 修正

- OBSの画面上FAQと同じFAQPageを追加し、BreadcrumbListも追加した。
- 全SoftwareApplicationにページ固有のmeta descriptionと同じdescriptionを追加した。
- about、privacy、affiliate、contact、404の定型meta descriptionを内容固有の説明へ変更した。
- 関連ツールボタンをリンク先が分かる文言に変更した。
- Creator系の字幕読み速度とOBS録画容量を自然に相互リンクした。PPIと4K・高Hz、GPUと4K・高Hzの既存関係は維持した。
- metadata、OGP、canonical、見出し、FAQ一致、sitemap完全一致、内部リンク、404、軽量アセットを継続検査するテストを追加した。

検索順位を保証する変更ではない。公開後はSearch Consoleでページのインデックス状況、クロールエラー、検索クエリ、表示回数、クリック率、平均掲載順位をページ別に観察する。
