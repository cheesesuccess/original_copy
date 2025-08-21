/**
 * Rewrite all imports that start with "~/"
 * to relative POSIX paths from the current file.
 * This runs BEFORE vite build.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC = path.resolve(ROOT, 'src')

const exts = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.css.ts', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']

function listFiles(dir) {
  /** @type {string[]} */
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...listFiles(full))
    } else if (/\.(ts|tsx|js|jsx|mjs|css\.ts)$/.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

function resolveWithExtensions(base) {
  for (const ext of exts) {
    const p = base + ext
    if (fs.existsSync(p)) return p
  }
  return null
}

function toPosix(p) { return p.split(path.sep).join('/') }

function rewriteFile(absFile) {
  const dir = path.dirname(absFile)
  let src = fs.readFileSync(absFile, 'utf8')
  let changed = false

  // Patterns: import ... from '...';  import '...';  export ... from '...';  dynamic import('...')
  const patterns = [
    /\bfrom\s+(['"])(~\/[^'"]+)\1/g,
    /\bimport\s*\(\s*(['"])(~\/[^'"]+)\1\s*\)/g,
    /\bimport\s+(['"])(~\/[^'"]+)\1/g,
    /\bexport\s+[^;]*\s+from\s+(['"])(~\/[^'"]+)\1/g,
  ]

  function replaceOne(spec) {
    const tildePath = spec.slice(2) // remove "~/"
    const baseTarget = path.resolve(SRC, tildePath)
    const found = resolveWithExtensions(baseTarget)
    const target = found || baseTarget
    let rel = path.relative(dir, target)
    if (!rel.startsWith('.')) rel = './' + rel
    rel = toPosix(rel)
    return rel
  }

  for (const pat of patterns) {
    src = src.replace(pat, (_m, q, spec) => {
      try {
        const rel = replaceOne(spec)
        changed = true
        return _m.replace(spec, rel)
      } catch {
        return _m
      }
    })
  }

  if (changed) {
    fs.writeFileSync(absFile, src, 'utf8')
    return true
  }
  return false
}

const files = listFiles(SRC)
let rewrites = 0
for (const f of files) {
  if (rewriteFile(f)) rewrites++
}
console.log(`[rewrite-tilde-imports] Rewrote ${rewrites} files out of ${files.length}`)

// --- Extra fix: neutralize 'service-worker:' scheme in src/sw/register-sw.ts ---
try {
  const regPath = path.resolve(SRC, 'sw/register-sw.ts')
  if (fs.existsSync(regPath)) {
    let content = fs.readFileSync(regPath, 'utf8')
    // Replace the special import with a standard URL (or remove entirely)
    content = content.replace(/import\s+swURL\s+from\s+['"]service-worker:\.\/sw['"];?/, "const swURL = new URL('./sw.ts', import.meta.url)")
    fs.writeFileSync(regPath, content, 'utf8')
    console.log('[rewrite-tilde-imports] patched service-worker import in sw/register-sw.ts')
  }
} catch (e) {
  console.warn('[rewrite-tilde-imports] could not patch service-worker import:', e)
}
