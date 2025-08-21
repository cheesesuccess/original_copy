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
app.use(morgan('dev'))
app.use(compression())
app.use(cors())
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

// ---------- Example dynamic APIs (extend as you wish) ----------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() })
})

app.post('/api/echo', (req, res) => {
  res.json({ received: req.body || null })
})

// Generic "contact" endpoint: logs to data/submissions.json
app.post(['/api/contact', '/contact', '/contact.php', '/forms/contact.php', '/send_mail.php', '/mail.php'], (req, res) => {
  const payload = {
    when: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null,
    data: req.body || {}
  }
  try {
    const arr = fs.existsSync(SUBMISSIONS_FILE) ? JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf-8') || '[]') : []
    arr.push(payload)
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(arr, null, 2))
  } catch (e) {
    console.error('Failed to persist submission:', e)
  }
  res.json({ ok: true })
})

// Optional email via nodemailer if env is set
app.post('/api/contact-email', async (req, res) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_TO || !MAIL_FROM) {
    return res.status(400).json({ ok: false, error: 'Email not configured. Set SMTP_* and MAIL_* env vars.' })
  }
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })
  const text = JSON.stringify(req.body || {}, null, 2)
  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject: 'Website Contact Form',
      text
    })
    res.json({ ok: true, messageId: info.messageId })
  } catch (e) {
    console.error('Email send failed:', e)
    res.status(500).json({ ok: false, error: 'Email send failed' })
  }
})

// --------- Vite + static serving ----------
let vite
if (!isProd) {
  // Dev: use Vite middleware
  const { createServer } = await import('vite')
  vite = await createServer({
    root: ROOT,
    server: { middlewareMode: true }
  })
  app.use(vite.middlewares)
} else {
  // Prod: serve compiled assets
  app.use(express.static(RESOLVED_DIST, { index: false }))
}

// Fallback: send index.html (transformed in dev)
app.use('*', async (req, res, next) => {
  try {
    if (!isProd) {
      // Use Vite to transform index.html in dev
      let html = fs.readFileSync(path.resolve(ROOT, 'index.html'), 'utf-8')
      html = await vite.transformIndexHtml(req.originalUrl, html)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } else {
      // Serve the built index.html
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
