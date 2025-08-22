import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import express from 'express'
import morgan from 'morgan'
import compression from 'compression'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config()

const isProd = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 3000
const ROOT = process.cwd()
const RESOLVED_DIST = path.resolve(ROOT, 'dist')
const INDEX_HTML_PATH = path.join(RESOLVED_DIST, 'index.html')
const SUBMISSIONS_FILE = path.resolve(ROOT, 'data', 'submissions.json')

const app = express()
app.set('trust proxy', 1)
app.use(morgan('dev'))
app.use(compression())
app.use(cors())
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

// Prevent aggressive caching of index.html
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    res.setHeader('Cache-Control', 'no-store')
  }
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() })
})

app.post('/api/echo', (req, res) => {
  res.json({ received: req.body || null })
})

app.post(['/api/contact', '/contact', '/contact.php', '/forms/contact.php', '/send_mail.php', '/mail.php'], (req, res) => {
  const payload = {
    when: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null,
    data: req.body || {}
  }
  try {
    const dir = path.dirname(SUBMISSIONS_FILE)
    fs.mkdirSync(dir, { recursive: true })
    const arr = fs.existsSync(SUBMISSIONS_FILE) ? JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf-8') || '[]') : []
    arr.push(payload)
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(arr, null, 2))
  } catch (e) {
    console.error('Failed to persist submission:', e)
  }
  res.json({ ok: true })
})

let vite
if (!isProd) {
  const { createServer } = await import('vite')
  vite = await createServer({
    root: ROOT,
    server: {
      middlewareMode: true,
      host: true,
      allowedHosts: [
        process.env.RENDER_EXTERNAL_HOSTNAME || '',
        '.onrender.com',
        '.render.com',
        'localhost',
        '127.0.0.1'
      ].filter(Boolean),
      hmr: {
        protocol: 'wss',
        host: process.env.RENDER_EXTERNAL_HOSTNAME || undefined,
        clientPort: 443
      }
    }
  })
  app.use(vite.middlewares)
} else {
  app.use(express.static(RESOLVED_DIST, { index: false }))
}

app.use('*', async (req, res, next) => {
  try {
    if (!isProd) {
      let html = fs.readFileSync(path.resolve(ROOT, 'index.html'), 'utf-8')
      html = await vite.transformIndexHtml(req.originalUrl, html)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } else {
      const html = fs.readFileSync(INDEX_HTML_PATH, 'utf-8')
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    }
  } catch (e) {
    vite?.ssrFixStacktrace?.(e)
    next(e)
  }
})

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT} (isProd=${isProd})`)
})
