import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

function safePatch(file, find, replace) {
  if (!fs.existsSync(file)) return false
  let txt = fs.readFileSync(file, 'utf8')
  if (txt.includes(replace)) return false
  if (txt.includes(find)) {
    txt = txt.replace(new RegExp(find, 'g'), replace)
    fs.writeFileSync(file, txt, 'utf8')
    console.log('[patch] patched', file, `(${find} -> ${replace})`)
    return true
  } else {
    return false
  }
}

try {
  const target = path.resolve(ROOT, 'node_modules/@minht11/solid-virtual-container/dist/esm/index.js')
  // The bug is "const setContainerRefEl" being reassigned. Make it "let".
  safePatch(target, 'const setContainerRefEl', 'let setContainerRefEl')
} catch (e) {
  console.warn('[patch] solid-virtual-container not found or patch failed:', e.message)
}
