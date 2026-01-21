# バッチ処理の進捗通知 - ストリーミングの仕組み解説

## 概要

バッチ処理のように時間がかかる処理を実行する際、クライアント（ブラウザ）に「処理が進行中である」ことを伝える仕組みを実装しました。

## なぜストリーミングが必要？

### 従来の問題

```
[クライアント] → リクエスト送信 → [サーバー]
                                    ↓
              （3分間、何も返ってこない...）
                                    ↓
              ← 結果を受信 ←←←←←←←
```

- クライアントは3分間、何が起きているかわからない
- 「エラー？」「まだ動いてる？」が判断できない
- ブラウザがタイムアウトする可能性もある

### ストリーミングで解決

```
[クライアント] → リクエスト送信 → [サーバー]
              ← 「処理開始しました」
              ← 「処理継続中...(15秒経過)」
              ← 「処理継続中...(30秒経過)」
              ← 「処理継続中...(45秒経過)」
              ...
              ← 「完了しました！結果:○○」
```

- 定期的にメッセージが届く → 「まだ動いている」と安心できる

---

## 仕組みの全体像

```
┌─────────────────┐         ┌─────────────────┐
│   ブラウザ       │         │   サーバー       │
│   (page.tsx)    │         │ (cronExecutor)  │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ ① fetch(stream=true)     │
         │ ─────────────────────────>│
         │                           │
         │                           │ ② バッチ処理を開始
         │                           │    ↓
         │ ③ "処理を開始しました"    │
         │ <─────────────────────────│
         │                           │
         │                           │ (処理中...)
         │                           │
         │ ④ "処理継続中(15秒経過)"  │ ← 15秒ごとに送信
         │ <─────────────────────────│
         │                           │
         │ ⑤ "処理継続中(30秒経過)"  │
         │ <─────────────────────────│
         │                           │
         │                           │ 処理完了！
         │ ⑥ "完了しました"          │
         │ <─────────────────────────│
         │                           │
         ▼                           ▼
```

---

## サーバー側の実装解説

### ファイル: `cronExecutor.ts`

```typescript
// ① SSEメッセージの形式を定義
type SSEMessage = {
  type: 'progress' | 'complete'  // メッセージの種類
  message?: string               // 表示するメッセージ
  success?: boolean              // 成功/失敗
  result?: any                   // 結果データ
  error?: string                 // エラーメッセージ
}
```

### SSE (Server-Sent Events) とは？

サーバーからクライアントへ一方向にデータを送り続ける仕組みです。

```typescript
// メッセージのフォーマット
// "data: " + JSON文字列 + 改行2つ という形式
const formatSSEMessage = (data: SSEMessage): string => {
  return `data: ${JSON.stringify(data)}\n\n`
}

// 例: 以下のような文字列が送られる
// data: {"type":"progress","message":"処理継続中...(15秒経過)"}
//
// data: {"type":"complete","success":true,"message":"完了しました"}
//
```

### ReadableStream とは？

「少しずつデータを流す」仕組みです。水道の蛇口をイメージしてください。

```typescript
const stream = new ReadableStream({
  async start(controller) {
    // controller.enqueue() = 蛇口から水を流す
    // controller.close()   = 蛇口を閉める

    // 15秒ごとに進捗メッセージを送信
    const keepAliveInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)

      // 「水を流す」= メッセージを送信
      controller.enqueue(
        encodeSSEMessage({
          type: 'progress',
          message: `処理継続中... (${elapsed}秒経過)`,
        })
      )
    }, 15000)  // 15000ミリ秒 = 15秒

    try {
      // 実際のバッチ処理を実行
      const result = await batchConfig.handler()

      clearInterval(keepAliveInterval)  // タイマー停止

      // 完了メッセージを送信
      controller.enqueue(
        encodeSSEMessage({
          type: 'complete',
          success: true,
          result,
        })
      )
    } catch (error) {
      clearInterval(keepAliveInterval)

      // エラーメッセージを送信
      controller.enqueue(
        encodeSSEMessage({
          type: 'complete',
          success: false,
          error: error.message,
        })
      )
    } finally {
      controller.close()  // 蛇口を閉める
    }
  },
})

// ストリームをレスポンスとして返す
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',  // SSE用のContent-Type
    'Cache-Control': 'no-cache',          // キャッシュしない
    'Connection': 'keep-alive',           // 接続を維持
  },
})
```

---

## クライアント側の実装解説

### ファイル: `page.tsx`

```typescript
// SSEメッセージをパースする関数
const parseSSEMessage = (text: string) => {
  const messages = []
  const lines = text.split('\n\n')  // 改行2つで分割

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      // "data: " を取り除いてJSONをパース
      const data = JSON.parse(line.slice(6))
      messages.push(data)
    }
  }
  return messages
}
```

### ストリームを読み取る処理

```typescript
const handleClick = async () => {
  // 実行中状態を設定（UIにスピナーを表示）
  setRunningBatches(prev => ({ ...prev, [action.id]: '処理を開始しています...' }))

  // ① fetchでストリーミングリクエストを送信
  const response = await fetch(`/api/cron/execute/${action.id}?stream=true`)

  // ② レスポンスのbodyからreaderを取得
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  // ③ データが届くたびに読み取る（無限ループ）
  while (true) {
    const { done, value } = await reader.read()

    // done = true なら、ストリームが終了した
    if (done) break

    // バイナリデータを文字列に変換
    const text = decoder.decode(value, { stream: true })

    // SSEメッセージをパース
    const messages = parseSSEMessage(text)

    // 各メッセージを処理
    for (const data of messages) {
      if (data.type === 'progress') {
        // 進捗メッセージ → UIを更新
        setRunningBatches(prev => ({
          ...prev,
          [action.id]: data.message  // "処理継続中...(15秒経過)"
        }))
      } else if (data.type === 'complete') {
        // 完了メッセージ → 実行中状態を解除
        setRunningBatches(prev => {
          const newState = { ...prev }
          delete newState[action.id]
          return newState
        })

        // トースト通知を表示
        if (data.success) {
          toast.success(`完了しました`)
        } else {
          toast.error(`エラー: ${data.error}`)
        }
      }
    }
  }
}
```

---

## データの流れ（時系列）

```
時間    サーバー                          クライアント
─────────────────────────────────────────────────────────────
0秒     リクエスト受信
        ログ記録開始
        "処理を開始しました" 送信 ────────> 画面: 「処理を開始しました」
        バッチ処理を開始

15秒    "処理継続中(15秒経過)" 送信 ─────> 画面: 「処理継続中(15秒経過)」

30秒    "処理継続中(30秒経過)" 送信 ─────> 画面: 「処理継続中(30秒経過)」

45秒    バッチ処理完了！
        ログ記録完了
        "完了しました" 送信 ──────────────> 画面: トースト「完了しました」
        ストリーム終了                      スピナー消える
```

---

## 比較: 通常のリクエスト vs ストリーミング

| 項目 | 通常のリクエスト | ストリーミング |
|------|-----------------|---------------|
| データの送信 | 処理完了後に一括 | 処理中に少しずつ |
| 進捗表示 | できない | できる |
| タイムアウト対策 | 難しい | 定期的に通信するので安心 |
| 実装の複雑さ | シンプル | やや複雑 |

---

## よくある質問

### Q: なぜ15秒間隔？

A: 短すぎると通信量が増え、長すぎると「動いてる？」という不安が生まれます。15秒は適度なバランスです。ただし、現在の実装では1秒間隔に変更されています。

### Q: Vercel Cronからの自動実行でもストリーミングを使う？

A: いいえ。自動実行時はクライアント（ブラウザ）がいないので、従来のJSON形式で返します。`?stream=true` パラメータがある場合のみストリーミングを使用します。

### Q: エラーが起きたらどうなる？

A: `type: 'complete'` で `success: false` のメッセージを送信し、ストリームを終了します。クライアントはエラートーストを表示します。

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/non-common/cron/cronExecutor.ts` | ストリーミングのサーバー側実装 |
| `src/app/api/cron/execute/[batchId]/route.tsx` | APIエンドポイント |
| `src/app/(apps)/common/admin/batch/page.tsx` | クライアント側UI |

---

## 参考リンク

- [MDN: Server-Sent Events](https://developer.mozilla.org/ja/docs/Web/API/Server-sent_events)
- [MDN: ReadableStream](https://developer.mozilla.org/ja/docs/Web/API/ReadableStream)
- [MDN: Fetch API - レスポンスのストリーミング](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch#body)
