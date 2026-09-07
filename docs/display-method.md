# 接続チェッカーの計算・出典

確認日：2026-09-07。実装：assets/display-model.js。

## 方針

帯域から候補を絞る概算であり、実機互換性・全タイミングの検証ではない。バージョンから最高リンクレートを推測しない。単一画面・DisplayPort 4レーンを前提とする。MST、USB-C 2レーン、ドック・変換器、VRRのモード制約は判定対象外。

active video = width × height × refresh × bpp / 1e9。

| 色形式 | 8bit | 10bit | 12bit |
| --- | ---: | ---: | ---: |
| RGB / 4:4:4 | 24 | 30 | 36 |
| 4:2:2 | 16 | 20 | 24 |
| 4:2:0 | 12 | 15 | 18 |

HDRフラグは倍率を変えず、8bit併用時だけ説明する。4:2:2は横、4:2:0は縦横が偶数でなければエラー。ピクセル寸法1〜16384の整数、Hz 1〜1000（小数可）。入力値は解析へ送信しない。

## リンク基準

| クラス | 公称Gbps | 比較用Gbps | 根拠・制限 |
| --- | ---: | ---: | --- |
| TMDS | 18 | 14.4 | 8b/10b。4:2:2は論理bppとパッキングが異なるので帯域内でも条件付き。active pixel clockが600MHz超なら不足。blankingを足したクロックは未計算 |
| FRL | 24 / 32 / 40 / 48 | 21.333… / 28.444… / 35.555… / 42.666… | 16b/18b符号化後の上限。FEC・制御・音声等を全て差し引いた映像payloadではない |
| HDMI 2.2世代 | 64 / 80 / 96 | 未確定 | 公開情報から安全な実効値を確定せず常に条件付き |
| HBR2 | 21.6 | 17.28 | 4レーン × 5.4 × 8/10 |
| HBR3 | 32.4 | 25.92 | VESA公表 |
| UHBR10 | 40 | 38.68 | UHBR20公表値の40/80倍を小数2桁へ切り捨てた概算 |
| UHBR13.5 | 54 | 52.22 | UHBR20公表値の54/80倍を小数2桁へ切り捨てた概算 |
| UHBR20 | 80 | 77.37 | VESA公表の最大payload |

85%以下は「余裕あり」、85%超〜上限は「条件付き」、上限超は「不足」。15%は独自の余白で、標準化されたblanking係数や保証ではない。TMDSの4:2:2・不明payloadは例外。非圧縮で不足しDSC対応確認済みなら条件付きとするが、TMDSにはDSCを適用しない。DSC圧縮率やスライス数を仮定しないため成立性は確定しない。

## 一次情報

- [VESA DP 2.0発表](https://vesa.org/press/vesa-publishes-displayport-2-0-video-standard-enabling-support-for-beyond-8k-resolutions-higher-refresh-rates-for-4k-hdr-and-virtual-reality-applications/)：HBR3 32.4/25.92、UHBR20 80/77.37、128b/132b、4レーンと2レーンの違い。
- [AMD HDMI TX Clocking](https://docs.amd.com/r/en-US/pg350-v-hdmi-txss1/Clocking)：active video式、FRLの16b/18b、リンクレート表、TMDS YUV422のpixel clock基準。
- [HDMI Ultra96](https://www.hdmi.org/spec2sub/ultra96)：機器の64/80/96Gbps区分、Ultra96ケーブル96Gbps、Ultra High Speed 48Gbps。
- [HDMI Premium認証](https://www.hdmi.org/spec/premiumcable)：18Gbps認証。
- [VESA DP54](https://vesa.org/press/vesa-announces-displayport-updates-and-extensions-for-gaming-and-automotive-market-at-ces/)：DP40からDP54へ更新、UHBR13.5 54Gbps。
- [VESA UHBR認証](https://vesa.org/featured-articles/vesa-readies-displayport-uhbr-ultra-high-bit-rate-device-certification-and-begins-certification-of-uhbr-cables/)：UHBR10/13.5/20、DP80の80Gbps認証。

将来より正確なタイミング計算を導入する際は、CTA/CVT-RB等の方式・丸め・機器のmode制約を別モデルとして扱い、active video値をひそかに置換しない。

## デザイン調査

[Omni Calculatorの公式UIガイド](https://www.omnicalculator.com/reports/documentation)、[Calculator.net](https://www.calculator.net/)、[CASIO keisan](https://keisan.casio.jp/)を調査。用途が先にわかる分類、入力単位の近接表示、入力と結果の同一画面配置、補助説明の段階表示を参考にした。文言・ブランド・レイアウトのコピーはしていない。画像・外部フォント・大型UIフレームワークを使わず、文字と情報階層を主役にした。
