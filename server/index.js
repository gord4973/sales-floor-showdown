import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import express from 'express'
import { openDatabase } from './db.js'
import { seed } from './seed.js'
import { mount, notFound, onError } from './routes.js'

if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

const isProd = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || 43123)
const app = express()
app.set('trust proxy', 1)
const server = http.createServer(app)
app.use(express.json({ limit: '1mb' }))

const db = await openDatabase()
await seed(db)
mount(app, db)
app.use(notFound)

if (isProd) {
  const dist = path.resolve('dist')
  app.use(express.static(dist, { index: false }))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
} else {
  const { createServer } = await import('vite')
  const vite = await createServer({
    server: { middlewareMode: true, hmr: { server } },
    appType: 'custom',
  })
  app.use(vite.middlewares)
  app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    try {
      const template = await vite.transformIndexHtml(req.originalUrl, fs.readFileSync(path.resolve('index.html'), 'utf8'))
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template)
    } catch (error) {
      vite.ssrFixStacktrace(error)
      next(error)
    }
  })
}

app.use(onError)

server.listen(port, '0.0.0.0', () => {
  console.log(`Sales Floor Showdown on http://127.0.0.1:${port} (${isProd ? 'production' : 'dev'}, ${db.dialect})`)
})
