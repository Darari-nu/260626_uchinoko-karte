# デザイン設計 — うちの子カルテ

## デザイン4原則の方針（各原則ごとに『うちの子カルテでどう適用するか』を具体的に書く）

### 近接（関連項目をグループ化する例）

うちの子カルテでは、ユーザーが「何を入力すれば受診時に役立つか」を一目で理解できるよう、目的別に情報を近づける。

- 今日の記録カードでは、食事量、排便、気分、気になること、メモを1つの入力ブロックとしてまとめる。
- 食事量の選択肢は「完食」「少なめ」「半分以下」「食べない」を横並びまたは2列グリッドにし、食事以外の項目と混ざらないよう見出しと余白で区切る。
- 「いつもと違う」検出の理由は、該当日のすぐ下に「食事が2日連続で少なめ」のように表示し、ユーザーが赤い表示の意味を探さなくて済むようにする。
- レポート出力では、ペットプロフィール、2週間サマリー、日別表、注記を近接単位で分ける。獣医が見たい情報を上から順に読める構造にする。
- 設定セクションでは、プロフィール編集、通常値設定、データ削除を離して配置する。特に削除操作は通常操作から距離を置く。

### 整列（左揃え・グリッド配置の方針）

日常入力は柔らかく、印刷レポートはきちんと見えるよう、画面と印刷で整列ルールを分ける。

- 基本のテキスト、フォームラベル、説明文は左揃えにする。中央揃えはヒーローの短いコピーと空状態だけに限定する。
- モバイルは1カラムを基本にし、カード内の絵文字ボタンは2列または4列の均等グリッドにする。
- デスクトップではメイン領域を最大幅960px程度に制限し、「今日の記録」と「過去カレンダー」を2カラムにできる余地を持たせる。
- 入力項目はラベル、選択肢、補足テキストの開始位置を揃える。押す場所が毎回同じリズムになるようにする。
- 印刷ビューの表は、日付、食事、排便、気分、気になること、メモ、検出フラグの列をそろえる。獣医が短時間で追えるよう、余白より情報の読みやすさを優先する。

### 反復（カードコンポーネント・絵文字ボタン・カラーパレットの繰り返し）

画面の中で同じ意味を持つ要素は同じ見た目にし、学習コストを下げる。

- 主要セクションは共通のカードスタイルを使う。角丸は8px以下、背景は白、境界線は薄いグレー、影は控えめにする。
- 絵文字ボタンは、アイコン、短いラベル、選択状態の枠線を同じ構造にする。例：🍚 完食、💩 通常、🙂 元気。
- 「通常」「注意」「いつもと違う」の状態表示は全画面で同じ色とラベルにする。
- CTAボタンは「保存する」「印刷ビューを開く」などの主要アクションに限定し、同じ高さ、同じ角丸、同じ押下状態を使う。
- カレンダーの日付セル、日別履歴、印刷レポートのフラグ表示は、同じステータス色を反復する。

### 対比（重要な「いつもと違う」検出表示の強調、CTAボタンの色）

安心感を保ちながら、受診時に重要な変化だけは見落とさない対比を作る。

- 通常状態は白背景と落ち着いた文字色で、毎日の記録が負担に見えないようにする。
- 「いつもと違う」は赤系の背景、濃い赤文字、左ボーダーで強調する。赤は警告の意味に限定して使いすぎない。
- 注意レベルは琥珀色を使い、赤とは区別する。連続した軽い変化を「気に留める」表現にする。
- 主要CTAの「保存する」は落ち着いたティール、「印刷ビューを開く」は医療書類らしいブルーグリーンにする。
- 削除ボタンはアウトラインまたはテキストボタンにし、通常のCTAと混同しないようにする。

## 配色案（提案2案以上、HEXコード付き。ペット系の優しさ＋医療系の安心感）

### 案A：Calm Clinic

やさしい家庭感と清潔な医療感のバランスがよい本命案。初期実装ではこの案を推奨する。

| 用途 | 色名 | HEX |
| --- | --- | --- |
| 背景 | Warm White | `#FAF8F3` |
| カード背景 | White | `#FFFFFF` |
| メイン文字 | Ink Brown | `#2F2A25` |
| 補足文字 | Soft Gray | `#6F6A64` |
| 主要CTA | Clinic Teal | `#2F8F83` |
| CTAホバー | Deep Teal | `#256F67` |
| 注意 | Honey Amber | `#D99025` |
| 異常ハイライト | Vet Red | `#D84A4A` |
| 枠線 | Warm Border | `#E7E0D5` |
| やさしいアクセント | Paw Peach | `#F4B7A1` |

### 案B：Fresh Notebook

白いノートと朝の診察室を思わせる軽い配色。若い飼い主やスマホ利用に合う。

| 用途 | 色名 | HEX |
| --- | --- | --- |
| 背景 | Clean Mint | `#F2FBF8` |
| カード背景 | Paper White | `#FFFFFF` |
| メイン文字 | Charcoal | `#26312F` |
| 補足文字 | Cool Gray | `#65706D` |
| 主要CTA | Leaf Green | `#2E9B72` |
| CTAホバー | Forest Green | `#237858` |
| 注意 | Soft Orange | `#E7A23A` |
| 異常ハイライト | Clear Red | `#C93F4B` |
| 枠線 | Mint Border | `#D8E9E3` |
| やさしいアクセント | Sky Wash | `#B7DDE8` |

### 案C：Home Vet

ペットの生活感を少し強め、家族で使う印象に寄せる案。ヒーロー画像やOGPとの相性がよい。

| 用途 | 色名 | HEX |
| --- | --- | --- |
| 背景 | Soft Cream | `#FFF7EA` |
| カード背景 | White | `#FFFFFF` |
| メイン文字 | Cocoa Ink | `#332B24` |
| 補足文字 | Taupe Gray | `#746B62` |
| 主要CTA | Care Blue | `#3C88A3` |
| CTAホバー | Deep Care Blue | `#2E6C81` |
| 注意 | Marigold | `#DB962F` |
| 異常ハイライト | Warm Red | `#CF4F45` |
| 枠線 | Cream Border | `#EADDC8` |
| やさしいアクセント | Sage | `#A8C7A1` |

## タイポグラフィ（フォント候補、サイズ階層）

### フォント候補

- 本文：`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `"Hiragino Sans"`, `"Yu Gothic"`, sans-serif。
- 数字と日付：本文と同じシステムフォントを使い、読みやすさと軽量性を優先する。
- 印刷ビュー：画面と同じフォントでよいが、表の文字はやや小さくしてA4に収める。
- Webフォントは使わない。GitHub Pagesで速く開けること、オフライン気味の環境でも崩れにくいことを優先する。

### サイズ階層

| 要素 | モバイル | デスクトップ | 用途 |
| --- | --- | --- | --- |
| H1 | 28px / 1.25 | 36px / 1.2 | サイト名と価値の提示。 |
| H2 | 22px / 1.3 | 26px / 1.3 | 今日の記録、過去カレンダーなどのセクション見出し。 |
| H3 | 18px / 1.35 | 20px / 1.35 | 入力グループ、レポート小見出し。 |
| 本文 | 16px / 1.7 | 16px / 1.75 | 説明文、メモ、注記。 |
| 補足 | 13px / 1.6 | 14px / 1.6 | 保存状態、ローカル保存説明。 |
| ボタン | 15px / 1.2 | 15px / 1.2 | 絵文字ボタン、CTA。 |
| 印刷表 | 10.5pt / 1.4 | 10.5pt / 1.4 | A4出力用。 |

## ワイヤーフレーム（モバイルファースト。ASCIIアートかMarkdownで簡易ワイヤー）

### モバイル

```text
┌─────────────────────────┐
│ うちの子カルテ       [⚙] │
│ こむぎ ▼                 │
├─────────────────────────┤
│ 獣医さんに「いつから？」  │
│ と聞かれても大丈夫に。   │
│ [今日の記録へ] [印刷]     │
├─────────────────────────┤
│ 今日の記録  6/26(金)     │
│ 食事                       │
│ [🍚完食] [少なめ]          │
│ [半分以下] [食べない]      │
│ 排便                       │
│ [💩通常] [少ない]          │
│ [多い] [下痢] [出てない]   │
│ 気分                       │
│ [🙂元気] [普通] [眠い]     │
│ [不機嫌] [ぐったり]        │
│ 気になること               │
│ [吐いた] [咳] [かゆい]     │
│ [歩き方] [水が多い]        │
│ メモ                       │
│ ┌───────────────────┐ │
│ │ 朝ごはんを少し残した │ │
│ └───────────────────┘ │
│ [保存する]                │
├─────────────────────────┤
│ 過去カレンダー            │
│ 6/13 ○ 6/14 ○ 6/15 !      │
│ 6/16 ○ 6/17 - 6/18 ○      │
│ ! いつもと違う             │
├─────────────────────────┤
│ レポート出力              │
│ 過去2週間の変化            │
│ ・食事少なめ 3日           │
│ ・下痢 1日                 │
│ [印刷ビューを開く]         │
├─────────────────────────┤
│ 設定                      │
│ ペットプロフィール         │
│ 通常値                    │
│ データ削除                │
└─────────────────────────┘
```

### デスクトップ

```text
┌──────────────────────────────────────────────┐
│ うちの子カルテ        こむぎ ▼      [印刷] [設定] │
├──────────────────────────────────────────────┤
│ 獣医さんに「いつから？」と聞かれても大丈夫に。      │
│ 1分の記録から、見せるための2週間レポートへ。        │
├──────────────────────┬───────────────────────┤
│ 今日の記録             │ 過去カレンダー              │
│ 食事ボタン             │ 14日分の記録状態             │
│ 排便ボタン             │ 選択日の詳細                 │
│ 気分ボタン             │ 赤: いつもと違う             │
│ 気になること           │                              │
│ メモ + 保存            │                              │
├──────────────────────┴───────────────────────┤
│ レポート出力                                  │
│ [2週間サマリー] [日別表プレビュー] [印刷ビュー] │
├──────────────────────────────────────────────┤
│ 設定：プロフィール / 通常値 / データ管理          │
└──────────────────────────────────────────────┘
```

### 印刷ビュー

```text
┌──────────────────────────────────────────────┐
│ うちの子カルテ 受診用レポート                  │
│ ペット名：こむぎ / 種類：猫 / 期間：6/13-6/26   │
├──────────────────────────────────────────────┤
│ 2週間サマリー                                  │
│ ・食事が少ない日：3日                           │
│ ・排便の変化：下痢1日、出ていない1日             │
│ ・最初の変化：6/15 食事少なめ                   │
├──────┬──────┬──────┬──────┬──────────────┤
│ 日付  │ 食事  │ 排便  │ 気分  │ メモ/気になること │
├──────┼──────┼──────┼──────┼──────────────┤
│ 6/15 │ 少なめ│ 通常  │ 眠い  │ 水が多い          │
│ 6/18 │ 半分  │ 下痢  │ 普通  │ 赤ハイライト      │
└──────┴──────┴──────┴──────┴──────────────┘
│ 注記：診断ではなく、受診時の説明補助です。        │
└──────────────────────────────────────────────┘
```

## Codexに渡す画像生成プロンプト（OGP画像、ヒーロー画像、空状態のイラスト用。英語プロンプト）

### OGP画像

```text
Create a warm and trustworthy social sharing image for a Japanese pet health record web app named "うちの子カルテ". Show a friendly cat and dog beside a clean veterinary-style health chart, with a small calendar and red highlight marks for unusual changes. The mood should be gentle, reassuring, and practical, not dramatic. Use soft warm white, clinic teal, peach, and a small amount of clear red. Flat editorial illustration, rounded simple shapes, high readability, 1200x630, no photorealism, no scary medical imagery, no extra text except the app name "うちの子カルテ".
```

### ヒーロー画像

```text
Create a horizontal hero illustration for a static web app that helps pet owners prepare for a vet visit. A middle-aged Japanese pet owner sits at a kitchen table with a smartphone, a calm cat and dog nearby, and a printed two-week health summary on the table. The scene should communicate relief after organizing symptoms, not anxiety. Bright natural morning light, clean home interior, subtle veterinary teal accents, warm neutral colors, soft flat illustration style, wide composition, no text, no logos, no dark or blurry atmosphere.
```

### 空状態のイラスト

```text
Create a small empty-state illustration for a pet health record app. Show a blank calendar page with a paw print, a pencil, and a small friendly cat and dog peeking from the side. The feeling should be light, kind, and easy to start. Minimal flat vector-like illustration, soft clinic teal and peach accents, white background, no text, no medical emergency symbols, suitable for a compact mobile UI.
```

### 印刷ビュー用ワンポイント

```text
Create a tiny monochrome line icon set for a pet health report print view: meal bowl, poop mark, mood face, note, alert flag, cat, dog. Simple consistent stroke, readable at small size, professional but friendly, black line only, transparent background, no text.
```
