#!/usr/bin/env node
// scripts/home-budget.mjs — homepage size budgets (spec §5), measured on docs/.vitepress/dist after
// `pnpm docs:build`. KB = 1000 bytes; JS/CSS sizes are gzip -9. Exit 1 when a hard budget is exceeded.
//
//   eager home JS   index.md.*.js + zh_index.md.*.js + the chunks they statically import that
//                   Members.md does not                                   ≤ 40 KB (target 32)
//   lazy motion     chunks reachable only through dynamic import() from the home code
//                   (GSAP core + ScrollTrigger + DrawSVGPlugin)            ≤ 50 KB
//   style.css       growth vs the pre-homepage baseline (32,449 B)         ≤ +12 KB (raised from 9: six finished sections; looks over bytes)
//   fonts           none of our own: no serif webfont in the build (v2 is sans-only, the VitePress Inter stack)
//   images          no <img> in the hero (#top) on / and /zh/
//   client chunks   none contains geoNaturalEarth1 (d3-geo stays build-time)
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const DIST = resolve(ROOT, 'docs/.vitepress/dist')
const ASSETS = join(DIST, 'assets')
const KB = 1000
const BASELINE_STYLE_GZ = 32449 // style.css gzip before the homepage work (spec §5: 32.4 KB)
const BUDGET = { eager: 40 * KB, eagerTarget: 32 * KB, lazy: 50 * KB, styleGrowth: 12 * KB }
const ST_SIGNATURE = /pin-spacer|ScrollTrigger \d+\.\d+\.\d+/ // only the ScrollTrigger library itself contains these

if (!existsSync(ASSETS)) {
  console.error('home-budget: docs/.vitepress/dist/assets not found — run pnpm docs:build first')
  process.exit(1)
}

const files = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p) } }
walk(ASSETS)
const js = files.filter((f) => f.endsWith('.js'))
const cache = new Map()
const src = (f) => { if (!cache.has(f)) cache.set(f, readFileSync(f, 'utf8')); return cache.get(f) }
const gz = (f) => gzipSync(readFileSync(f), { level: 9 }).length
const fmt = (b) => `${(b / KB).toFixed(1)} KB`
const rel = (f) => relative(DIST, f)

/** Static and dynamic relative imports of a built chunk. */
function edges(f) {
  const code = src(f)
  const dir = dirname(f)
  const stat = new Set()
  const dyn = new Set()
  for (const m of code.matchAll(/(?:^|[;}\s)])(?:import|export)\s*(?:[\w$*{}\s,]*?\bfrom\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g)) stat.add(resolve(dir, m[1]))
  for (const m of code.matchAll(/import\(\s*["'](\.{1,2}\/[^"']+\.js)["']\s*\)/g)) dyn.add(resolve(dir, m[1]))
  // Vite's preload helper lists a dynamic import's deps as "assets/…" strings.
  for (const m of code.matchAll(/__vite__mapDeps\(\[([^\]]*)\]/g)) {
    for (const d of m[1].matchAll(/["']([^"']+\.js)["']/g)) dyn.add(resolve(DIST, d[1]))
  }
  return { stat: [...stat].filter(existsSync), dyn: [...dyn].filter(existsSync) }
}
function closure(entries) {
  const seen = new Set()
  const stack = [...entries]
  while (stack.length) {
    const f = stack.pop()
    if (seen.has(f)) continue
    seen.add(f)
    stack.push(...edges(f).stat)
  }
  return seen
}
const pageChunk = (name) => js.find((f) => new RegExp(`^${name}\\.md\\.[\\w-]+\\.js$`).test(f.split('/').pop()))

let failed = 0
const rows = []
const row = (item, value, budget, pass, note = '') => { rows.push({ item, value, budget, pass, note }); if (pass === false) failed++ }

// ------------------------------------------------------------------ eager JS
const en = pageChunk('index'), zh = pageChunk('zh_index'), members = pageChunk('Members')
if (!en || !zh || !members) {
  console.error(`home-budget: page chunks not found (index: ${!!en}, zh_index: ${!!zh}, Members: ${!!members})`)
  process.exit(1)
}
const membersSet = closure([members])
const homeSet = new Set([...closure([en]), ...closure([zh])].filter((f) => !membersSet.has(f)))
const eagerBytes = [...homeSet].reduce((s, f) => s + gz(f), 0)
row('eager home JS (gzip)', fmt(eagerBytes), `≤ ${fmt(BUDGET.eager)} (target ${fmt(BUDGET.eagerTarget)})`, eagerBytes <= BUDGET.eager,
  `headroom ${fmt(BUDGET.eager - eagerBytes)}: ` + [...homeSet].map((f) => `${rel(f)} ${fmt(gz(f))}`).join(', '))
const eagerST = [...homeSet].filter((f) => ST_SIGNATURE.test(src(f)))
row('ScrollTrigger library not in eager JS', eagerST.length ? eagerST.map(rel).join(', ') : 'none', 'none', eagerST.length === 0)

// ------------------------------------------------------------------ lazy JS
const lazyEntries = new Set()
for (const f of homeSet) for (const d of edges(f).dyn) if (!homeSet.has(d) && !membersSet.has(d)) lazyEntries.add(d)
const lazySet = new Set([...closure([...lazyEntries])].filter((f) => !homeSet.has(f) && !membersSet.has(f)))
const lazyBytes = [...lazySet].reduce((s, f) => s + gz(f), 0)
const lazyST = [...lazySet].filter((f) => ST_SIGNATURE.test(src(f)))
row('lazy motion chunks (gzip)', fmt(lazyBytes), `≤ ${fmt(BUDGET.lazy)}`, lazyBytes <= BUDGET.lazy,
  [...lazySet].map((f) => `${rel(f)} ${fmt(gz(f))}${ST_SIGNATURE.test(src(f)) ? ' [ScrollTrigger]' : ''}`).join(', ') || 'none')
if (!lazyST.length) row('ScrollTrigger is a lazy chunk', 'not found', 'present', null, 'no lazy chunk contains ScrollTrigger (motion not wired yet?)')

// ------------------------------------------------------------------ style.css
const styles = files.filter((f) => /\/style\.[\w-]+\.css$/.test(f))
const styleBytes = styles.reduce((s, f) => s + gz(f), 0)
const growth = styleBytes - BASELINE_STYLE_GZ
row('style.css growth (gzip)', `${growth >= 0 ? '+' : ''}${fmt(growth)} (${fmt(styleBytes)})`, `≤ +${fmt(BUDGET.styleGrowth)} vs ${fmt(BASELINE_STYLE_GZ)}`, growth <= BUDGET.styleGrowth,
  `headroom ${fmt(BUDGET.styleGrowth - growth)} gzip for every section's scoped <style> (cssCodeSplit:false → one global style.css; ±0.3 KB build noise)`)
const inlinedFonts = styles.reduce((n, f) => n + (src(f).match(/data:font\//g) || []).length, 0)
row('no fonts inlined into style.css', String(inlinedFonts), '0', inlinedFonts === 0)

// ------------------------------------------------------------------ fonts (v2: sans-only)
const serifFonts = files.filter((f) => /\.(woff2?|ttf|otf)$/.test(f) && /serif/i.test(f.split('/').pop()) && !/sans/i.test(f.split('/').pop()))
const serifCss = styles.filter((f) => /Source Serif|KL Serif|Noto Serif/i.test(src(f)))
row('no serif webfont in the build', serifFonts.length + serifCss.length ? [...serifFonts, ...serifCss].map(rel).join(', ') : 'none', 'none',
  serifFonts.length + serifCss.length === 0)

// ------------------------------------------------------------------ above-the-fold images
for (const page of ['index.html', 'zh/index.html']) {
  const html = readFileSync(join(DIST, page), 'utf8')
  const i = html.indexOf('id="top"')
  const hero = i < 0 ? '' : html.slice(i, html.indexOf('</section>', i))
  const imgs = (hero.match(/<img\b/g) || []).length
  row(`${page}: <img> in the hero`, i < 0 ? 'no #top' : String(imgs), '0', i >= 0 && imgs === 0)
}

// ------------------------------------------------------------------ d3-geo stays build-time
const geo = js.filter((f) => src(f).includes('geoNaturalEarth1'))
row('no client chunk contains geoNaturalEarth1', geo.length ? geo.map(rel).join(', ') : 'none', 'none', geo.length === 0)

// ------------------------------------------------------------------ report
const w = Math.max(...rows.map((r) => r.item.length))
console.log('home-budget (gzip -9, 1 KB = 1000 B)\n')
for (const r of rows) {
  const tag = r.pass === null ? 'WARN' : r.pass ? 'ok  ' : 'FAIL'
  console.log(`  ${tag}  ${r.item.padEnd(w)}  ${String(r.value).padEnd(24)}  budget ${r.budget}`)
  if (r.note) console.log(`        ${' '.repeat(w)}  ${r.note}`)
}
console.log(`\nhome-budget: ${failed ? `${failed} budget(s) exceeded` : 'all budgets met'}`)
process.exit(failed ? 1 : 0)
