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

// --- Extra fix: guard SW registration call under https + navigator check ---
try {
  const setupPath = path.resolve(SRC, 'pages/app/use-setup-app.tsx')
  if (fs.existsSync(setupPath)) {
    let code = fs.readFileSync(setupPath, 'utf8')
    // Wrap registerServiceWorker({...}) with a safe gate if not already wrapped
    if (!/navigator\.serviceWorker/.test(code)) {
      code = code.replace(
        /registerServiceWorker\s*\(\s*\{/,
        'if (typeof navigator !== "undefined" && "serviceWorker" in navigator && location.protocol.startsWith("https")) registerServiceWorker({'
      )
      fs.writeFileSync(setupPath, code, 'utf8')
      console.log('[rewrite-tilde-imports] guarded SW registration in pages/app/use-setup-app.tsx')
    }
  }
} catch (e) {
  console.warn('[rewrite-tilde-imports] could not guard SW registration:', e)
}

// --- Extra fix: relax CSP to allow worker-src (keeps UI unchanged) ---
try {
  const indexPath = path.resolve(ROOT, 'index.html')
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8')
    html = html.replace(
      /(<meta[^>]+http-equiv=['"]Content-Security-Policy['"][^>]+content=")([^"]*)(")/i,
      (m, p1, policy, p3) => {
        let p = policy
        if (!/worker-src/i.test(p)) {
          p += " worker-src 'self' blob:;"
        }
        // ensure script-src has 'self'; keep existing
        return p1 + p + p3
      }
    )
    fs.writeFileSync(indexPath, html, 'utf8')
    console.log('[rewrite-tilde-imports] added worker-src to CSP')
  }
} catch (e) {
  console.warn('[rewrite-tilde-imports] could not patch CSP:', e)
}

// --- Kill-switch: stub out SW registration import & call ---
try {
  const setupPath = path.resolve(SRC, 'pages/app/use-setup-app.tsx')
  if (fs.existsSync(setupPath)) {
    let code = fs.readFileSync(setupPath, 'utf8')
    // Replace the import with a noop to avoid compile errors
    code = code.replace(
      /import\s+\{\s*registerServiceWorker\s*\}\s+from\s+['"][^'"]+['"];?/,
      'const registerServiceWorker = (_opts?: any) => {};'
    )
    fs.writeFileSync(setupPath, code, 'utf8')
    console.log('[rewrite-tilde-imports] stubbed registerServiceWorker in use-setup-app.tsx')
  }
} catch (e) {
  console.warn('[rewrite-tilde-imports] could not stub registerServiceWorker:', e)
}

// --- Inject small inline boot helper to unregister any old SW and surface errors on screen ---
try {
  const indexPath = path.resolve(ROOT, 'index.html')
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8')
    if (!/__boot_helper__/.test(html)) {
      const inject = `
<script id="__boot_helper__">
(function(){
  // 1) Unregister any old service workers and clear caches
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(regs){
      regs.forEach(function(r){ r.unregister().catch(function(){}); });
    });
  }
  if (typeof caches !== 'undefined') {
    caches.keys().then(function(keys){ keys.forEach(function(k){ caches.delete(k); }); }).catch(function(){});
  }

  // 2) Surface errors onscreen (helpful on mobile)
  function showErr(msg){
    var el = document.getElementById('__err_overlay__');
    if(!el){
      el = document.createElement('div');
      el.id='__err_overlay__';
      el.style.cssText='position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#111;color:#fff;padding:8px;font:12px/1.4 monospace;max-height:50vh;overflow:auto';
      document.body.appendChild(el);
    }
    var line = document.createElement('div');
    line.textContent = msg;
    el.appendChild(line);
  }
  window.addEventListener('error', function(e){ showErr('Error: ' + e.message); });
  window.addEventListener('unhandledrejection', function(e){ try{showErr('Promise: ' + (e.reason && (e.reason.message||e.reason)||''));}catch(_){showErr('Promise Rejection');} });

  // 3) Mark boot started
  document.documentElement.setAttribute('data-boot','starting');
  window.addEventListener('load', function(){ document.documentElement.setAttribute('data-boot','loaded'); });
})();
</script>`;
      html = html.replace(/<\/head>/i, inject + '\n</head>')
      fs.writeFileSync(indexPath, html, 'utf8')
      console.log('[rewrite-tilde-imports] injected boot helper into index.html')
    }
  }
} catch (e) {
  console.warn('[rewrite-tilde-imports] could not inject boot helper:', e)
}

// --- Ensure CSP allows inline boot helper (adds 'unsafe-inline' if missing) ---
try {
  const indexPath = path.resolve(ROOT, 'index.html')
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8')
    html = html.replace(
      /(<meta[^>]+http-equiv=['"]Content-Security-Policy['"][^>]+content=")([^"]*)(")/i,
      function(m, p1, policy, p3){
        var p = policy;
        if (!/script-src/.test(p)) { p += " script-src 'self' blob:;"; }
        if (!/unsafe-inline/.test(p)) { p = p.replace(/script-src([^;]*)/, "script-src$1 'unsafe-inline'"); }
        if (!/worker-src/.test(p)) { p += " worker-src 'self' blob:;"; }
        if (!/connect-src/.test(p)) { p += " connect-src 'self' blob: data:;"; }
        return p1 + p + p3;
      }
    )
    fs.writeFileSync(indexPath, html, 'utf8')
  }
} catch (e) {
  console.warn('[rewrite-tilde-imports] could not ensure CSP for boot helper:', e)
}
