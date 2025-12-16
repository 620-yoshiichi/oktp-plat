const {createServer} = require('http')
const {parse} = require('url')
const next = require('next')
const {Server} = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Next.jsアプリを初期化
const app = next({dev, hostname, port})
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // HTTPサーバーを作成
  const httpServer = createServer(async (req, res) => {
    try {
      // Rangeヘッダーの検証と修正
      // Next.jsの内部で「not-found」がRangeヘッダーとして誤って解釈されるのを防ぐ
      if (req.headers.range) {
        const rangeHeader = req.headers.range
        // Rangeヘッダーが「not-found」などの不正な値の場合、削除
        if (typeof rangeHeader === 'string' && (rangeHeader === 'not-found' || !rangeHeader.match(/^bytes=\d+-\d*$/))) {
          delete req.headers.range
        }
      }

      const parsedUrl = parse(req.url, true)

      // not-foundページへのリクエストの場合、Rangeヘッダーを確実に削除
      if (parsedUrl.pathname && parsedUrl.pathname.includes('not-found')) {
        delete req.headers.range
      }

      await handle(req, res, parsedUrl)
    } catch (err) {
      // 「Unable to parse range」エラーの場合、特別な処理
      if (err.message && err.message.includes('Unable to parse range')) {
        console.error('Range parsing error detected:', {
          url: req.url,
          rangeHeader: req.headers.range,
          error: err.message,
        })
        // Rangeヘッダーを削除して再試行
        delete req.headers.range
        try {
          const parsedUrl = parse(req.url, true)
          await handle(req, res, parsedUrl)
          return
        } catch (retryErr) {
          console.error('Retry failed:', retryErr)
        }
      }
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Socket.ioサーバーを初期化
  const io = new Server(httpServer, {
    path: '/api/colabo-socket',
    addTrailingSlash: false,
    cors: {
      origin: dev ? 'http://localhost:3000' : true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  console.log('[Socket.io] サーバー初期化完了')

  // Socket.ioサーバーをグローバルに設定（Route Handlerで使用）
  global.httpServer = httpServer
  global.socketIOServer = io

  // Socket.ioイベントハンドラーはRoute Handlerで定義
  // Route Handlerから初期化されたSocket.ioインスタンスを使用

  httpServer
    .once('error', err => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
