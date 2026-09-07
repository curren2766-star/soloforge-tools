# SOLOFORGE Factory

- 小さく公開して反応を見て育てる。使いやすさと正確な説明を優先する。
- 公開URLは https://curren2766-star.github.io/soloforge-tools/ 。GitHub Pages main / root。
- 静的HTML・CSS・JavaScriptを優先し、実行時の依存と固定費を増やさない。
- 既存ツールの計算・URLを守る。新ツールは共通レイアウト、フォーム、計測へ乗せる。
- GA4に個人情報・入力値を送らない。初期表示やテストで利用イベントを汚さない。
- 根拠・概算の限界を明記する。規格上の帯域と実機互換性を区別する。
- 変更後は npm test と npm run build、必要なブラウザ検証を行い、diffを確認してから完了する。
