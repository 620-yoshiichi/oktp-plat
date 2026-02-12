# Ucar ダッシュボード - 仕様書

## 概要

QRプロジェクトの工程別リードタイム（LT）と滞留状況を可視化するダッシュボードページ。

- **URL**: `/ucar/dashboard`
- **対象**: 小売系車両（小売・CPO・オンライン）のみ
- **その他指標**: 全車両（卸・スクラップ含む）

---

## ページ構成

```
┌─────────────────────────────────────────────────────────┐
│ ヘッダー: QRプロジェクト リードタイム概況 | [年セレクタ] │
├──────────────────────┬──────────────────────────────────┤
│ ProcessSummaryTable  │  CurrentCountPieChart            │
│ (工程別集計テーブル)   │  (現在台数円グラフ)               │
│                      │                                  │
│                      ├──────────────────────────────────┤
│                      │  LeadTimeBarChart                │
│                      │  (LT横棒グラフ)                   │
│                      │  [期間セレクタ]                   │
├──────────────────────┴──────────────────────────────────┤
│ OtherMetricsTable (その他指標)                           │
│  - 小売割合                                              │
│  - QRシート総数（仕分け別）                               │
│  - 98番号集計                                            │
└─────────────────────────────────────────────────────────┘
```

---

## コンポーネント詳細

### 1. ProcessSummaryTable（工程別集計テーブル）

**表示内容:**

- 工程ごとの「現在台数」「目標日数」「全期間平均LT」「月別平均LT」
- 年フィルタ: クエリパラメータ `?year=2025` で表示年を指定

**データ基準:**

- **現在台数**: フィルタなし全件（小売系のみ）の滞留台数
- **月別LT**: 「QRシート発行月」で車両をグルーピングして平均化
- 表示列: 指定年の12ヶ月分のみ（データが存在する月のみ）

**インタラクション:**

- 工程ラベルをクリック → `ProcessDetailModal` を開く（滞留車両一覧）

**工程一覧（11工程）:**

1. QR発行 (CS01)
2. 拠点滞留 (CS02)
3. CR配送待ち (CS03)
4. 受入待ち (CR02)
5. 検収待ち (CR03)
6. 加修中 (CR04)
7. まるクリ (CR05)
8. 検査待ち (CR06)
9. 写真撮影 (CR07)
10. GAZOO (CR08)
11. 拠点配送 (CR09)

---

### 2. CurrentCountPieChart（現在台数円グラフ）

**表示内容:**

- 工程ごとの滞留台数を円グラフで表示
- 各工程の色は `UcarProcessCl.CODE` で定義された色を使用

**データ基準:**

- フィルタなし全件（小売系のみ）
- ProcessSummaryTable の「現在台数」列と同じデータ

**サイズ:**

- 高さ: 400px
- outerRadius: 140

---

### 3. LeadTimeBarChart（LT横棒グラフ）

**表示内容:**

- 工程ごとの平均LTを横棒グラフで表示
- LT値をバーの右端に数値表示

**データ基準:**

- **期間フィルタ**: `createdAt` が指定期間内の車両のみ
- クエリパラメータ: `?ltStart=YYYY-MM-DD&ltEnd=YYYY-MM-DD`
- デフォルト: 過去3ヶ月前の1日 〜 当月末

**インタラクション:**

- 棒をクリック → `LTProcessDetailModal` を開く（期間内の対象車両一覧）
- 期間セレクタで開始・終了日を変更可能
- 「直近3ヶ月」ボタンでデフォルトに戻す

---

### 4. OtherMetricsTable（その他指標）

**表示内容:**

- **小売割合**: 月別の小売台数 / 全仕分け台数
- **QRシート総数**: 仕分け別（小売、卸、スクラップ、CPO、オンライン）の月別台数
- **98番号集計**: QRシート発行台数、98番号付帯済台数（CR到着済対象）、付帯率

**データ基準:**

- **全車両（フィルタなし）** -- 卸・スクラップ含む
- 年フィルタ: ProcessSummaryTable と同じ年で月列を絞る

---

## データフロー

### Server Actions

#### 1. `fetchDashboardData()`

**実行タイミング:** 初回表示時のみ（1回）

**取得データ:**

- 小売系（KOURI/CPO/ONLINE）: 工程LT・滞留台数・グラフ用
- 全件: その他指標（仕分け別台数・小売割合・98番号集計）用

**WHERE条件:**

```typescript
// 小売系
AND: [
  UCAR_CONSTANTS.getCommonQuery({}),
  {daihatsuReserve: null},
  {destination: {in: ['02', '04', '05']}}, // KOURI/CPO/ONLINE
]

// 全件
AND: [UCAR_CONSTANTS.getCommonQuery({}), {daihatsuReserve: null}]
```

**SELECT:**

- sateiID, createdAt, destination, number98, qrIssuedAt, tmpRentalStoreId
- UcarProcess (processCode, date)
- OldCars_Base (DD_URIAGE)

**返却:** `DashboardResult` (processes, retailRatio, shiwakeBreakdown, number98Stats, months 等)

#### 2. `fetchPeriodLT(periodStart, periodEnd)`

**実行タイミング:** 期間変更時（LTグラフ用）

**WHERE条件:**

```typescript
AND: [...baseWhere(), KOURI_KEI_WHERE, {createdAt: {gte: periodStartUtc, lte: periodEndUtc}}]
```

**返却:** `PeriodLTSummary[]` (processKey, dashboardLabel, color, avgLT)

#### 3. `fetchProcessRetentionCars(processKey)`

**実行タイミング:** ProcessSummaryTable の工程ラベルクリック時

**WHERE条件:**

```typescript
AND: [
  ...baseWhere(),
  KOURI_KEI_WHERE,
  { UcarProcess: { some: { processCode: 自工程コード } } },
  { UcarProcess: { none: { processCode: 後続工程コード1 } } },
  { UcarProcess: { none: { processCode: 後続工程コード2 } } },
  ...
]
```

**返却:** `RetentionCarDetail[]` (sateiID, 車両情報, processMap)

#### 4. `fetchLTProcessCars(processKey, periodStart, periodEnd)`

**実行タイミング:** LeadTimeBarChart の棒クリック時

**WHERE条件:**

```typescript
AND: [
  ...baseWhere(),
  KOURI_KEI_WHERE,
  { createdAt: { gte: periodStartUtc, lte: periodEndUtc } },
  { UcarProcess: { some: { processCode: 自工程コード } } },
  { UcarProcess: { some: { processCode: { in: [後続工程コード...] } } } } // LT計算可能な車両
]
```

---

## 集計ロジック

### 滞留判定（`calcDashboardData` → `defaultCalcRetention`）

**原則:**

- 自工程が完了
- かつ、すべての後続工程が未完了
- → 該当工程で「滞留中」と判定

**例外: 拠点配送（CR_HAISO）のカスタム判定:**

```typescript
calcRetention: car => {
  const hasCR09 = car.processes.some(p => p.processCode === 'CR09' && p.date)
  if (!hasCR09) return false
  return !car.DD_URIAGE // 販売日がなければ滞留
}
```

### LT計算（`calcDashboardData` → `defaultCalcLT`）

**原則:**

- 自工程の完了日時 → 次に実施された後続工程の日時の差（日数）
- 工程スキップ対応: 直後の工程がスキップされても、それ以降で最初に完了した工程までをLTとする

**例:**

- CR着(CR02) 完了: 2月1日
- 検収(CR03): スキップ
- 加修開始(CR04): スキップ
- まるくり(CR05) 完了: 2月8日
- → CR着のLT = 7日

### 月別集計の基準

- **QRシート発行月（`qrIssuedAt`）** で車両をグルーピング
- 各月に発行された車両の平均LTを算出
- 例: 2025年1月にQR発行された車両群の「CR着LT」の平均

---

## モーダル機能

### ProcessDetailModal（滞留車両一覧）

**トリガー:** ProcessSummaryTable の工程ラベルクリック

**表示内容:**

- 指定工程に滞留している車両一覧
- 車両情報: 査定ID、車種・グレード、担当店舗・スタッフ、QR発行日、ai21売上
- 工程別完了日時（12列: 11工程 + 販売日）
- LT差分バッジ（赤丸）: 各工程から次工程までの日数
- フォーカス工程をアウトラインで強調

### LTProcessDetailModal（LT期間車両一覧）

**トリガー:** LeadTimeBarChart の棒クリック

**表示内容:**

- 指定工程 + 期間（createdAt）のLT計算対象車両一覧
- 期間表示: ヘッダーに「期間: YYYY-MM-DD 〜 YYYY-MM-DD」
- その他は ProcessDetailModal と同じ

### 共通仕様（UcarProcessTable）

**工程セルの表示:**

- 完了済み: `YY/MM/DD(ddd)` + `HH:mm` の2行
- 未完了: 暗背景（`#00000070`）
- 現在工程（最新完了）: 黄色背景（`#ffff00`）
- フォーカス工程: 2px アウトライン強調

**LT差分バッジ:**

- 各工程セルの右下に赤丸で `+4.4` 形式
- 次に完了した工程までの日数を表示
- フォーカス工程のみ表示

**ヘッダー:**

- 固定（`sticky top-0`）でスクロール対応
- 工程列は `getColorStyles()` で色付け

---

## UTC/JST 対応

### データベース（UTC）

- すべての DateTime フィールドは UTC で格納
- 例: JST `2025-01-01 00:00` = UTC `2024-12-31 15:00`

### 表示（JST）

- `formatDate()` 関数を使用 → 自動的に `dayjs.tz('Asia/Tokyo')` で変換
- 月キー生成も `formatDate(d, 'YY-MM')` を使用

### 期間フィルタ（Prisma WHERE）

- クライアントから `YYYY-MM-DD` 形式で送信
- サーバー側で `jstDateStrToUtc()` 関数でUTC変換:
  ```typescript
  // 2025-01-01 → JST 2025/1/1 0:00 → UTC 2024/12/31 15:00
  const periodStartUtc = jstDateStrToUtc('2025-01-01')
  // 2025-01-31 → JST 2025/1/31 23:59:59 → UTC 2025/1/31 14:59:59
  const periodEndUtc = jstDateStrToUtc('2025-01-31', true)
  ```

---

## フィルタ仕様

### 小売系フィルタ（工程LT・滞留・グラフ）

**対象車両:**

```typescript
destination IN ('02', '04', '05') // 小売、CPO、オンライン
```

**適用箇所:**

- ProcessSummaryTable の滞留台数・LT
- CurrentCountPieChart
- LeadTimeBarChart
- ProcessDetailModal
- LTProcessDetailModal

### 年フィルタ（テーブル月列表示）

**対象:** ProcessSummaryTable, OtherMetricsTable

**動作:**

- クエリパラメータ: `?year=2025`
- デフォルト: 今年
- 指定年の1月〜12月のうち、データが存在する月のみ列表示

### 期間フィルタ（LTグラフ）

**対象:** LeadTimeBarChart のみ

**動作:**

- クエリパラメータ: `?ltStart=YYYY-MM-DD&ltEnd=YYYY-MM-DD`
- デフォルト: 過去3ヶ月前の1日 〜 当月末
- 「直近3ヶ月」ボタンでデフォルトに戻す
- `createdAt` が期間内の車両を Prisma で抽出

---

## 工程フロー定義

### 標準工程順序（`UcarProcessCl.MAIN_FLOW_ORDER`）

```
QR発行 → 入庫 → 店長検収 → CR着 → 検収 → 加修開始 → まるくり → 検査 → 写真 → GAZOO → 商品車受取
```

### 工程スキップ対応

**例:**

- CR着 完了: 2/1
- 検収・加修開始: **スキップ**
- まるくり 完了: 2/8
- → CR着のLT = 7日（まるくりまでを計算）
- → まるくり完了まではCR着の滞留としてカウント

### 拠点配送の特殊判定

**滞留:**

- CR09（商品車受取）完了
- かつ、`OldCars_Base.DD_URIAGE`（販売日）なし
- → 「拠点配送」滞留としてカウント

**完了:**

- `DD_URIAGE` があれば販売完了 → 滞留解消

---

## 販売日の扱い

### 定義

- **工程コード:** `SALES`
- **データソース:** `OldCars_Base.DD_URIAGE`
- **表示:** モーダルテーブルの最右列（12列目）

### 集計対象外

- `list: []` で集計対象外として定義
- `MAIN_FLOW_ORDER` には含まれない
- ProcessSummaryTable には表示されない

### LT計算

- 拠点配送 → 販売日のLTは**モーダルテーブル内でのみ自動計算・表示**
- 月別LT平均には含まれない

---

## クエリパラメータ

| パラメータ | 用途             | デフォルト   | 例                    |
| ---------- | ---------------- | ------------ | --------------------- |
| `year`     | テーブル表示年   | 今年         | `?year=2025`          |
| `ltStart`  | LTグラフ期間開始 | 3ヶ月前の1日 | `?ltStart=2025-11-01` |
| `ltEnd`    | LTグラフ期間終了 | 当月末       | `?ltEnd=2026-02-28`   |

---

## ファイル構成

```
src/app/(apps)/ucar/(pages)/dashboard/
├── page.tsx                       # Next.js ページエントリ
├── DashboardPage.tsx              # メインコンポーネント
├── server-actions.ts              # Server Actions（4関数）
├── README.md                      # この仕様書
├── lib/
│   ├── calcDashboardData.ts       # 集計ロジック（滞留判定・LT計算）
│   └── filterVisibleMonths.ts    # 月フィルタユーティリティ
├── components/
│   ├── ProcessSummaryTable.tsx    # 工程別集計テーブル
│   ├── CurrentCountPieChart.tsx   # 現在台数円グラフ
│   ├── LeadTimeBarChart.tsx       # LT横棒グラフ
│   ├── OtherMetricsTable.tsx      # その他指標テーブル
│   ├── UcarProcessTable.tsx       # 共通工程テーブル（モーダル用）
│   ├── ProcessDetailModal.tsx     # 滞留車両モーダル
│   └── LTProcessDetailModal.tsx   # LT期間車両モーダル
└── mock/
    └── mockData.ts                # 開発用モックデータ（本番では未使用）
```

---

## パフォーマンス最適化

### サーバー側集計

- `calcDashboardData` をサーバー側で実行
- クライアントには集計結果（`DashboardResult`、数KB）のみ送信
- 数千件の生データをシリアライズしない

### 必要カラムのみ取得

- `select` で最小限のフィールドのみ
- `include` でフルリレーションを取らない（モーダル用以外）

### インデックス活用

- `@@index([active])`
- `@@index([sateiID, processCode])`
- `@@index([createdAt])`

---

## 今後の拡張性

### 目標日数の設定

- `ProcessSummary.targetDays` フィールドは用意済み
- 各工程の目標LT日数を設定可能（現在は null）

### カスタム計算関数

- `UcarProcessCl.CODE` の各工程に `calcRetention` / `calcLT` をオプション定義可能
- 未定義時はデフォルト関数を使用
- 例: CR_HAISO の `calcRetention` はカスタム実装済み

### 列のカスタマイズ

- `UcarProcessTable` の props を拡張すれば表示列の追加・削除が可能
- 現在は「詳細版」（5列 + 工程12列）で固定
