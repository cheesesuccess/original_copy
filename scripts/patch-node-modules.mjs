import fs from 'node:fs'
import path from 'node:path'
const f = path.resolve('node_modules/@minht11/solid-virtual-container/dist/esm/index.js')
try {
  if (fs.existsSync(f)) {
    let s = fs.readFileSync(f, 'utf8')
    const next = s.replace(/const\s+setContainerRefEl/g, 'let setContainerRefEl')
    if (s !== next) {
      fs.writeFileSync(f, next, 'utf8')
      console.log('[patch] solid-virtual-container fixed')
    }
  }
} catch (e) {
  console.warn('[patch] failed:', e.message)
}
