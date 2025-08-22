// server.js - Express + Vite (middleware mode) for Render
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = process.cwd()
const isProd = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 10000
const HOST = '0.0.0.0'

const app = express()
app.set('trust proxy', 1)

let vite
if (!isProd) {
  vite = await createViteServer({
    root: ROOT,
    server: {
      middlewareMode: true,
      host: true,
      allowedHosts: [
        process.env.RENDER_EXTERNAL_HOSTNAME || '',
        '.onrender.com', '.render.com',
        'localhost', '127.0.0.1'
      ].filter(Boolean),
      hmr: false // avoid WS binding errors on Render
    }
  })
  app.use(vite.middlewares)
} else {
  app.use('/assets', express.static(path.resolve(__dirname, 'dist/assets'), { maxAge: '1y' }))
}

app.get('*', async (req, res, next) => {
  try {
    const url = req.originalUrl
    let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8')
    if (vite) {
      template = await vite.transformIndexHtml(url, template)
    }
    res.status(200).set({ 'Content-Type': 'text/html', 'Cache-Control': 'no-store' }).end(template)
  } catch (e) {
    vite && vite.ssrFixStacktrace(e)
    next(e)
  }
})

app.listen(PORT, HOST, () => {
  console.log(`server running on http://localhost:${PORT} (isProd=${isProd})`)
})
