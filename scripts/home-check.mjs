#!/usr/bin/env node
// scripts/home-check.mjs — homepage static checks (spec §6.5, §8, §11.A; v2 direction). Run: node scripts/home-check.mjs
// Exit 1 on any FAIL. WARN lines (verify list, roster drift, copy length, soft code rules) never fail.
//   1. camera.js unit tests + gridDims
//   2. content guards (ids, highlights, counts, v2 copy rules: removed keys, 3 honours, forbidden strings)
//   3. land.generated.ts + the atlas.data loader (run exactly as VitePress runs it, via Vite)
//   4. contrast ratios parsed from styles/home.css (+ the VitePress vars it references, from theme/custom.css):
//      text >= 4.5:1, white on the primary button >= 4.5:1, accent marks >= 3:1 vs land dots
//   5. image-host URLs from img/index.ts (lead decision D1)
//   6. roster drift vs the two MemberContent.vue files (warning)
//   7. source rules for section code (static gsap / d3 imports, VERIFY_BEFORE_DISPLAY, class "title", ClientOnly,
//      no serif font anywhere, v2 removals: DeepTime, MotionToggle, RoleBadge, fonts/)
//   8. rendered HTML (when docs/.vitepress/dist is newer than components/home): no VERIFY_BEFORE_DISPLAY fact and
//      no removed v2 copy (pill, "figures as stated", motion toggle) is rendered; the zh <title>
//   9. prints VERIFY_BEFORE_DISPLAY
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const HOME_DIR = resolve(ROOT, 'docs/.vitepress/components/home')
const imp = (p) => import(pathToFileURL(resolve(HOME_DIR, p)).href)

let fails = 0
let warns = 0
const ok = (msg) => console.log(`  ok    ${msg}`)
const fail = (msg) => { fails++; console.log(`  FAIL  ${msg}`) }
const warn = (msg) => { warns++; console.log(`  WARN  ${msg}`) }
const check = (cond, msg, detail = '') => (cond ? ok(msg) : fail(msg + (detail ? ` — ${detail}` : '')))
const section = (t) => console.log(`\n${t}`)
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps

const C = await imp('home.content.ts')
const D = await imp('lib/derive.ts')
const cam = await imp('lib/camera.js')
const { LAND } = await imp('land.generated.ts')

// ------------------------------------------------------------------------------------------ 1. camera
section('1. camera.js + gridDims')
{
  const boxes = [[189.3, 105.1, 120.2, 66.2], [727.8, 328.3, 0, 0], [32.5, 324.6, 329.4, 208.2], [548.8, -7.4, 281.6, 119.8], [0, 0, 1000, 738], [821.1, 211.6, 50, 36]]
  const aspects = [16 / 10, 1000 / 738, 700 / 640, 0.75, 2.2]
  let aspectOk = true, containOk = true, minWOk = true
  for (const b of boxes) for (const a of aspects) for (const opt of [undefined, { pad: 0.02, minW: 0 }, { pad: 0.1, minW: 400 }]) {
    if (opt && opt.minW === 0 && b[2] === 0 && b[3] === 0) continue // degenerate: a point with no minimum width
    const vb = cam.fitViewBox(b, a, opt)
    const minW = opt ? opt.minW : 1000 / 4.5
    if (!near(vb[2] / vb[3], a, 1e-9)) aspectOk = false
    if (vb[0] > b[0] + 1e-9 || vb[1] > b[1] + 1e-9 || vb[0] + vb[2] < b[0] + b[2] - 1e-9 || vb[1] + vb[3] < b[1] + b[3] - 1e-9) containOk = false
    if (vb[2] < minW - 1e-9) minWOk = false
  }
  check(aspectOk, 'fitViewBox: output aspect equals the stage aspect')
  check(containOk, 'fitViewBox: bbox is contained')
  check(minWOk, 'fitViewBox: minW respected (kMax 4.5 by default)')
  const def = cam.fitViewBox([100, 100, 10, 10], 1)
  check(near(def[2], 1000 / 4.5) && near(def[0] + def[2] / 2, 105) && near(def[1] + def[3] / 2, 105), 'fitViewBox: default minW = 1000/4.5, centred on the bbox')
  const vbAll = cam.fitViewBox([0, 0, 1000, 738], 1000 / 738, { pad: 0.02, minW: 0 })
  check(near(vbAll[2], 1040) && near(vbAll[3], 1040 * 0.738), 'fitViewBox: overview pad .02 → 1040 wide', vbAll.join(' '))
  check(near(cam.unitsPerPx([0, 0, 1000, 738], 600, 600), 1000 / 600) && near(cam.unitsPerPx([0, 0, 1000, 738], 2000, 500), 738 / 500)
    && near(cam.unitsPerPx([10, 20, 400, 300], 800, 600), 0.5), 'unitsPerPx: meet math = max(w/stageW, h/stageH)')
  check(near(cam.zoomOf([0, 0, 250, 100]), 4) && near(cam.zoomOf([0, 0, 500, 100], 2000), 4), 'zoomOf = mapW / w')
  // dotStroke: on-screen px (= user units / unitsPerPx) monotonic in k and capped at 2.4x the base.
  const stageW = 700, stageH = 640, aspect = stageW / stageH
  const basePx = 2.94 * stageW / 1000
  let prev = -Infinity, mono = true, capped = true, base = true
  for (let k = 0.5; k <= 12; k += 0.25) {
    const w = 1000 / k
    const vb = [0, 0, w, w / aspect]
    const px = cam.dotStroke(vb, stageW, stageH) / cam.unitsPerPx(vb, stageW, stageH)
    if (px < prev - 1e-9) mono = false
    if (px > basePx * 2.4 + 1e-9) capped = false
    if (k <= 1 && !near(px, basePx, 1e-9)) base = false
    prev = px
  }
  check(mono, 'dotStroke: monotonic (non-decreasing) in zoom k')
  check(capped, 'dotStroke: capped at 2.4x the base dot')
  check(base, 'dotStroke: base = 2.94·stageW/mapW px at k <= 1')
  check(near(cam.dotStroke([0, 0, 1000, 738], 600, 442.8), 2.94, 1e-9), 'dotStroke: overview at 600 px = 0.42·STEP = 2.94 user units')
  const g8 = D.gridDims(1001, 8), g6 = D.gridDims(1001, 6)
  check(g8.cols === 91 && g8.rows === 11, 'gridDims(1001, 8) = 91x11', `${g8.cols}x${g8.rows}`)
  check(g6.cols === 77 && g6.rows === 13, 'gridDims(1001, 6) = 77x13', `${g6.cols}x${g6.rows}`)
  check(D.gridDims(7, 3).cols === 7 && D.gridDims(12, 1.4).cols === 4, 'gridDims: primes and small n')
}

// ------------------------------------------------------------------------------------------ 2. content
section('2. content guards')
{
  const { REGIONS, PAPERS, CHAPTERS, MEMBERS, HOME, GENOMES } = C
  const rid = new Set(REGIONS.map((r) => r.id))
  const errs = []
  for (const p of PAPERS) {
    for (const r of p.regions) if (!rid.has(r)) errs.push(`paper ${p.id}: region ${r}`)
    if (p.chapter && !CHAPTERS.some((c) => c.id === p.chapter)) errs.push(`paper ${p.id}: chapter ${p.chapter}`)
  }
  for (const c of CHAPTERS) {
    for (const r of c.focus) if (!rid.has(r)) errs.push(`chapter ${c.id}: focus ${r}`)
  }
  check(errs.length === 0, 'all region / chapter ids resolve', errs.join('; '))
  const hl = PAPERS.filter((p) => p.highlight)
  check(hl.length === 8, '8 highlight papers', hl.map((p) => p.id).join(','))
  check(hl.every((p) => p.doi && p.headline && p.chapter), 'every highlight has doi, headline and chapter')
  check(PAPERS.filter((p) => p.chapter).every((p) => p.doi), 'every chapter paper has a DOI')
  check(PAPERS.every((p) => !/[⺀-鿿豈-﫿＀-￯]/.test(p.title)), 'paper titles are the English originals (no CJK)')
  const counts = Object.fromEntries(CHAPTERS.map((c) => [c.id, PAPERS.filter((p) => p.chapter === c.id).length]))
  check(JSON.stringify(counts) === JSON.stringify({ africa: 4, europe: 3, northAsia: 2, china: 4, seAsia: 1 }), 'chapter study counts 4 · 3 · 2 · 4 · 1', JSON.stringify(counts))
  const hlBy = Object.fromEntries(CHAPTERS.map((c) => [c.id, D.chapterHighlights(c.id).length]))
  check(JSON.stringify(hlBy) === JSON.stringify({ africa: 2, europe: 2, northAsia: 2, china: 1, seAsia: 1 }), 'chapterHighlights() per chapter 2 · 2 · 2 · 1 · 1', JSON.stringify(hlBy))
  check(CHAPTERS.every((c) => D.chapterHighlights(c.id).every((p, i, a) => !i || a[i - 1].year >= p.year)), 'chapterHighlights() newest first')
  const mc = { phd: 0, master: 0, undergrad: 0 }
  for (const m of MEMBERS) mc[m.group]++
  // Counts follow the roster (kept in step with the Members pages by section 6); only shape is checked here.
  check(mc.phd > 0 && mc.master > 0 && mc.undergrad > 0 && mc.phd + mc.master + mc.undergrad === C.MEMBERS.length,
    `MEMBERS: every member in a known group (${mc.phd} PhD · ${mc.master} master · ${mc.undergrad} undergrad)`, JSON.stringify(mc))
  check(GENOMES === 1001 && HOME.hero.stats[0].value === GENOMES, 'GENOMES = 1001 drives the hero stat')
  // H1 key phrase (gradient) appears in exactly one line per locale.
  for (const lang of ['en', 'zh']) {
    const hits = HOME.hero.h1[lang].map((line) => D.splitKey(line, HOME.hero.h1Key[lang])).filter((p) => p[1])
    check(hits.length === 1, `hero.h1Key (${HOME.hero.h1Key[lang]}) is in exactly one ${lang} H1 line`)
  }
  check(JSON.stringify(D.splitKey('从古DNA中，', '古DNA')) === JSON.stringify(['从', '古DNA', '中，']) && D.splitKey('abc', 'x')[0] === 'abc', 'splitKey()')
  const { createHome } = await imp('lib/useHome.ts')
  const en = createHome('en'), zh = createHome('zh')
  check(en.fmt(1001) === '1,001' && zh.fmt(1001) === '1001' && en.fmt(1234567) === '1,234,567' && en.fmt(5) === '5', 'fmt: en 1,001 · zh 1001 (no Intl)')
  check(en.href('/Contact') === '/Contact' && zh.href('/Contact') === '/zh/Contact' && zh.href('#join') === '#join'
    && zh.href('https://doi.org/x') === 'https://doi.org/x' && zh.href('mailto:a@b') === 'mailto:a@b' && zh.href('/Notes/index') === '/zh/Notes/index',
  'href: /zh prefix on zh; #, http, mailto unchanged')
  check(en.otherLang() === 'zh-CN' && zh.otherLang() === 'en', 'otherLang')
  const s1 = D.seeded(1001), s2 = D.seeded(1001)
  const a = [s1(), s1(), s1()], b = [s2(), s2(), s2()]
  check(a.every((v, i) => v === b[i] && v >= 0 && v < 1), 'seeded(): deterministic in [0, 1)')
  // v2 copy rules (owner: concise; no pill, captions, legends, notes, role badges, era notes, motion toggle).
  const REMOVED = ['pill', 'mapCaption', 'statsSource', 'legendLed', 'legendCo', 'legendHome', 'legendLines', 'legendRegions', 'era',
    'indexLabel', 'alsoLabel', 'barrier', 'ribbon', 'whoCaption', 'who', 'whoNote', 'figure', 'venn', 'vennCenter', 'gridNote', 'ringNote',
    'ringLabel', 'deepTime', 'courses', 'coursesLabel', 'tiles', 'tileCta', 'teamCount', 'lead', 'reduceMotion', 'byLab', 'originalTitle',
    'caption', 'where', 'note', 'glyph', 'short', 'period', 'roleNote', 'cover', 'venueZh', 'schematic', 'studies', 'study', 'contributed', 'altName']
  const found = []
  const walkKeys = (o, path) => {
    if (!o || typeof o !== 'object') return
    for (const [k, v] of Object.entries(o)) {
      if (!Array.isArray(o) && REMOVED.includes(k)) found.push(path + '.' + k)
      walkKeys(v, Array.isArray(o) ? `${path}[${k}]` : `${path}.${k}`)
    }
  }
  walkKeys(HOME, 'HOME'); walkKeys(PAPERS, 'PAPERS'); walkKeys(CHAPTERS, 'CHAPTERS')
  check(found.length === 0, 'no removed (unrendered) v2 keys in home.content.ts', found.slice(0, 8).join(', '))
  check(!('ROLE' in C) && !('newestPill' in D) && !('displayZhText' in D) && !('yearRange' in D) && !('memberCounts' in D), 'ROLE / newestPill / displayZhText / yearRange / memberCounts are gone')
  // v2 draws no link arcs: the LINKS table (with its explanatory labels) and chapter.links are gone.
  check(!('LINKS' in C) && CHAPTERS.every((c) => !('links' in c)), 'no LINKS table / chapter.links (v2 draws no arcs)')
  check(HOME.hero.doors.every((d) => !('kicker' in d)), 'hero doors have no kicker')
  check(HOME.people.pi.honours.length === 3, 'PI card: exactly 3 honours', String(HOME.people.pi.honours.length))
  // One-line copy (warning only): chapter blurbs and step lines stay short.
  const long = []
  for (const c of CHAPTERS) { if (c.blurb.en.length > 72) long.push(`${c.id} blurb en ${c.blurb.en.length}`); if (c.blurb.zh.length > 24) long.push(`${c.id} blurb zh ${c.blurb.zh.length}`) }
  for (const st of HOME.methods.steps) { if (st.body.en.length > 56) long.push(`step ${st.id} en ${st.body.en.length}`); if (st.body.zh.length > 22) long.push(`step ${st.id} zh ${st.body.zh.length}`) }
  if (long.length) warn(`copy longer than one line: ${long.join(', ')}`)
  else ok('chapter blurbs and step lines are one-liners (en <= 72/56, zh <= 24/22 chars)')
  // Card headlines: 1–2 lines (v2 §5.2). ~105 en / ~34 zh chars = 2 lines on a 440–480 px card at 17 px.
  const longHl = PAPERS.filter((p) => p.headline && (p.headline.en.length > 108 || p.headline.zh.length > 36))
    .map((p) => `${p.id} (${p.headline.en.length}/${p.headline.zh.length})`)
  if (longHl.length) warn(`card headlines longer than 2 lines (en > 108 / zh > 36 chars): ${longHl.join(', ')}`)
  else ok('card headlines fit 2 lines (en <= 108, zh <= 36 chars)')
  // Forbidden strings anywhere in the rendered copy (VERIFY_BEFORE_DISPLAY excluded: it is never rendered).
  const { VERIFY_BEFORE_DISPLAY, ...rendered } = C
  const blob = JSON.stringify(rendered)
  const banned = ['杨浦区', '200438', 'Yakun', '融合理论', '上海青年科学家', '1905', '历史悠久的主楼', '奥茨塔尔', '演化人类学', 'state-of-the-art', 'Historical Main Building', '扬帆']
  const hits = banned.filter((s) => blob.includes(s))
  check(hits.length === 0, 'no forbidden strings in the copy', hits.join(', '))
  const rm = D.regionMarkType
  check(rm('shanghai') === 'home' && rm('seAsia') === 'presentDay' && rm('easternAfrica') === 'led'
    && rm('viennaBasin') === 'led' && rm('carpathianBasin') === 'co' && rm('northernChina') === 'co', 'regionMarkType()')
  check(C.REGIONS.every((r) => !['area', 'endpoint'].includes(rm(r.id))), 'no soft-area ellipses or title-only endpoint dots on the maps')
}

// ------------------------------------------------------------------------------------------ 3. geometry
section('3. land + atlas data loader')
{
  const gz = gzipSync(Buffer.from(LAND.d), { level: 9 }).length
  check(LAND.w === 1000 && LAND.h === 788 && LAND.step === 7, 'LAND w 1000, h 788, step 7')
  check(Math.abs(LAND.dots - 7038) <= 7038 * 0.01, 'LAND dots 7,038 (±1%)', String(LAND.dots))
  const { decodeLand } = await imp('lib/land.ts')
  check(decodeLand(LAND.d).length === LAND.dots * 2, 'decodeLand() returns every dot')
  check(gz <= 1800, `land path gzip <= 1.8 KB (${gz} B)`)
  // Run atlas.data.ts exactly like VitePress: bundled by Vite's loadConfigFromFile, then load().
  const vpReq = createRequire(realpathSync(resolve(ROOT, 'node_modules/vitepress/package.json')))
  const vite = await import(pathToFileURL(resolve(dirname(vpReq.resolve('vite/package.json')), 'dist/node/index.js')).href)
  const res = await vite.loadConfigFromFile({ command: 'build', mode: 'production' }, resolve(HOME_DIR, 'atlas.data.ts'), ROOT, 'silent')
  const A = await res.config.load([])
  const ids = C.REGIONS.map((r) => r.id)
  check(ids.every((id) => Array.isArray(A.xy[id]) && A.xy[id].every(Number.isFinite)), `xy for all ${ids.length} regions`)
  check(ids.length === 15, '15 regions')
  const expect = { shanghai: [785.0, 294.1], middleNile: [284.8, 378.8], viennaBasin: [229.2, 183.1], otztal: [199.5, 190.9], mongolia: [680.6, 189.6], altai: [570.3, 154.3], yellowRiverBend: [717.4, 238.9], seAsia: [679.5, 382.1] }
  const off = Object.entries(expect).filter(([id, [x, y]]) => Math.abs(A.xy[id][0] - x) > 1 || Math.abs(A.xy[id][1] - y) > 1)
  check(off.length === 0, 'projected anchors match the frame within ±1 unit', off.map(([id]) => `${id} ${A.xy[id]}`).join('; '))
  const boxKeys = [...C.CHAPTERS.map((c) => c.id), 'home', 'all']
  check(boxKeys.every((k) => A.chapterBox[k]?.length === 4) && Object.keys(A.chapterBox).length === 7, 'chapterBox for 5 chapters + home + all')
  {
    const [bx, by, bw, bh] = A.chapterBox.all
    const inAll = ids.every((id) => A.xy[id][0] > bx && A.xy[id][0] < bx + bw && A.xy[id][1] > by && A.xy[id][1] < by + bh)
    check(inAll && bx >= 0 && by >= 0 && bx + bw <= A.w && by + bh <= A.h && bw < A.w, 'chapterBox.all frames every region, inside the land frame and tighter than it', A.chapterBox.all.join(' '))
  }
  check(A.popOrder[0] === 'shanghai' && A.popOrder.length === ids.length, 'popOrder starts with shanghai and lists all regions')
  check(!('arcs' in A) && !('arcMid' in A), 'no arcs / arcMid in the atlas data (v2 draws no link arcs)')
  check(C.REGIONS.filter((r) => r.kind === 'area').every((r) => A.areas[r.id]?.every((v) => v > 0)), 'areas: projected radii for every area region')
  check(C.CHAPTERS.every((c) => A.heroXY[c.id]?.length === 2) && A.shanghaiPct.length === 2, 'heroXY + shanghaiPct')
  const eu = cam.fitViewBox(A.chapterBox.europe, 700 / 640)
  const hm = cam.fitViewBox(A.chapterBox.home, 700 / 640)
  check(eu[2] < 300, `europe camera width < 300 at a 700x640 stage (${eu[2].toFixed(1)})`)
  check(Math.abs(hm[2] - 222.2) < 1, `home camera width ~222 (${hm[2].toFixed(1)})`)
}

// ------------------------------------------------------------------------------------------ 4. contrast
section('4. contrast (from styles/home.css + theme/custom.css)')
{
  const css = readFileSync(resolve(HOME_DIR, 'styles/home.css'), 'utf8')
  const block = (src, sel) => {
    const i = src.indexOf(sel + ' {')
    if (i < 0) throw new Error(`home-check: token block "${sel} {" not found`)
    return src.slice(i, src.indexOf('}', i))
  }
  const decls = (txt, prefix) => Object.fromEntries([...txt.matchAll(new RegExp(`--${prefix}([a-z0-9-]+)\\s*:\\s*([^;]+);`, 'g'))].map((m) => [m[1], m[2].replace(/\/\*.*?\*\//g, '').trim()]))
  // VitePress variables from every top-level ":root {" / ".dark {" block of theme/custom.css (later blocks win).
  const vpCss = readFileSync(resolve(ROOT, 'docs/.vitepress/theme/custom.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const vpVars = (sel) => {
    const out = {}
    for (const m of vpCss.matchAll(/(^|\n)([^{}\n]+)\{([^{}]*)\}/g)) if (m[2].trim() === sel) Object.assign(out, decls(m[3], 'vp-'))
    return out
  }
  const VP = { light: vpVars(':root'), dark: { ...vpVars(':root'), ...vpVars('.dark') } }
  const KL = { light: decls(block(css, '.kl-home'), 'kl-') }
  KL.dark = { ...KL.light, ...decls(block(css, '.dark .kl-home'), 'kl-') }
  const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
  const rgb = (c) => {
    if (c.startsWith('#')) return [0, 2, 4].map((i) => parseInt(c.slice(1 + i, 3 + i), 16))
    return c.match(/[\d.]+/g).map(Number).slice(0, 3)
  }
  /** Resolve a token to an opaque-or-rgba colour string: var() (kl- and vp-), #hex, rgb(a), color-mix(in srgb, A p%, B). */
  const resolveIn = (theme) => {
    const res = (v, depth = 0) => {
      if (depth > 12) throw new Error('home-check: var() cycle at ' + v)
      v = v.trim()
      let m
      if ((m = v.match(/^var\(--(kl|vp)-([a-z0-9-]+)\)$/))) {
        const table = m[1] === 'kl' ? KL[theme] : VP[theme]
        if (!(m[2] in table)) throw new Error(`home-check: --${m[1]}-${m[2]} not defined (${theme})`)
        return res(table[m[2]], depth + 1)
      }
      if ((m = v.match(/^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)$/))) {
        const A = rgb(res(m[1], depth + 1)), B = rgb(res(m[3], depth + 1)), p = +m[2] / 100
        return hex(...A.map((c, i) => c * p + B[i] * (1 - p)))
      }
      if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + [...v.slice(1)].map((c) => c + c).join('')
      if (/^#[0-9a-f]{6}$/i.test(v) || /^rgba?\(/.test(v)) return v
      throw new Error(`home-check: cannot resolve colour "${v}" (${theme})`)
    }
    return (name) => res(`var(--kl-${name})`)
  }
  const lum = (c) => {
    const [r, g, b] = rgb(c).map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
  const over = (c, under) => { // composite rgba over an opaque colour
    if (c.startsWith('#')) return c
    const v = c.match(/[\d.]+/g).map(Number); const al = v[3] ?? 1; const u = rgb(under)
    return hex(...v.slice(0, 3).map((x, i) => x * al + u[i] * (1 - al)))
  }
  for (const theme of ['light', 'dark']) {
    const T = resolveIn(theme)
    const bad = []
    const bgs = ['bg', 'bg-2', 'surface'].map((b) => [b, T(b)])
    for (const fg of ['ink', 'ink-2', 'ink-3', 'navy', 'accent', 'home-ink']) for (const [bn, bc] of bgs) {
      const r = ratio(over(T(fg), bc), bc); if (r < 4.5) bad.push(`${fg} on ${bn} ${r.toFixed(2)}`)
    }
    // Gradient text stops (.kl-grad).
    const stops = (KL[theme].grad.match(/#[0-9a-f]{6}/gi) || [])
    for (const st of stops) for (const [bn, bc] of bgs) { const r = ratio(st, bc); if (r < 4.5) bad.push(`grad stop ${st} on ${bn} ${r.toFixed(2)}`) }
    check(bad.length === 0 && stops.length >= 2, `${theme}: text tokens + gradient stops >= 4.5:1 on bg, bg-2, surface`, bad.join('; ') || 'no gradient stops parsed')
    const prim = T('primary'), hov = T('primary-hover')
    const pr = [['on-primary on primary', ratio(T('on-primary'), prim)], ['on-primary on primary-hover', ratio(T('on-primary'), hov)],
      ['on-primary-2 on primary', ratio(over(T('on-primary-2'), prim), prim)], ['on-primary-2 on primary-hover', ratio(over(T('on-primary-2'), hov), hov)],
      ['on-accent on accent', ratio(T('on-accent'), T('accent'))]]
    check(pr.every(([, r]) => r >= 4.5), `${theme}: primary button / card text >= 4.5:1 (${pr.map(([n, r]) => `${n} ${r.toFixed(2)}`).join(', ')})`)
    const land = over(T('land'), T('bg'))
    const am = ratio(T('accent'), land)
    check(am >= 3, `${theme}: accent marks vs land dots >= 3:1 (${am.toFixed(2)})`)
    const hm = ratio(T('home'), T('bg'))
    check(hm >= 3, `${theme}: home mark vs its backdrop halo >= 3:1 (${hm.toFixed(2)}; vs land dots ${ratio(T('home'), land).toFixed(2)})`)
    const soft = over(T('accent-soft'), T('surface'))
    const tint = ['ink', 'ink-2', 'navy'].map((fg) => [fg, ratio(T(fg), soft)])
    check(tint.every(([, r]) => r >= 4.5), `${theme}: ink / ink-2 / navy on --kl-accent-soft >= 4.5:1 (min ${Math.min(...tint.map(([, r]) => r)).toFixed(2)})`)
    const low = ['accent', 'ink-3'].map((fg) => [fg, ratio(T(fg), soft)]).filter(([, r]) => r < 4.5)
    if (low.length) console.log(`  note  ${theme}: ${low.map(([fg, r]) => `${fg} ${r.toFixed(2)}`).join(', ')} on --kl-accent-soft: not for text there`)
  }
}

// ------------------------------------------------------------------------------------------ 5. images
section('5. image host files (lead decision D1)')
{
  const IMG = await imp('img/index.ts')
  const HOST = 'https://larryivan.github.io/picx-images-hosting/'
  const CLONE = '/home/user/picx-images-hosting/'
  const urls = Object.values(IMG.IMAGES).flatMap((p) => [p.src, ...p.avif.map((s) => s.url), ...p.webp.map((s) => s.url)])
  check(urls.length > 0 && urls.every((u) => u.startsWith(HOST)), `all ${urls.length} image URLs are on ${HOST}`)
  check(Object.values(IMG.IMAGES).every((p) => p.width > 0 && p.height > 0 && /^(#[0-9A-F]{6}|transparent)$/i.test(p.placeholder)), 'every picture has width, height and a placeholder colour')
  if (existsSync(CLONE)) {
    const missing = urls.filter((u) => !existsSync(CLONE + u.slice(HOST.length)))
    if (missing.length) warn(`not in the local image-host clone (run pnpm home:assets, then commit + push picx-images-hosting): ${missing.join(', ')}`)
    else ok('every image URL exists in the local clone ' + CLONE)
    const gate960 = CLONE + 'home/gate-960.avif'
    if (existsSync(gate960)) check(statSync(gate960).size <= 70000, `gate-960.avif <= 70 KB (${(statSync(gate960).size / 1000).toFixed(1)} KB)`)
  } else warn(`image-host clone ${CLONE} not found; skipped file checks`)
}

// ------------------------------------------------------------------------------------------ 6. roster
section('6. roster drift vs MemberContent.vue (warning only)')
{
  const groupOf = (title) => (/phd|博士/i.test(title) ? 'phd' : /master|硕士/i.test(title) ? 'master' : /bachelor|undergrad|本科/i.test(title) ? 'undergrad' : null)
  for (const rel of ['docs/src/components/MemberContent.vue', 'docs/src/zh/components/MemberContent.vue']) {
    const p = resolve(ROOT, rel)
    if (!existsSync(p)) { warn(`${rel} not found`); continue }
    const src = readFileSync(p, 'utf8')
    const start = src.indexOf('const memberCategories')
    const found = []
    let group = null
    for (const m of src.slice(start).matchAll(/title:\s*"([^"]+)"|id:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g)) {
      if (m[1]) { group = groupOf(m[1]); continue }
      const name = m[3]
      const zh = (name.match(/[一-鿿]+/g) || []).join('')
      const en = name.replace(/[一-鿿()（）]+/g, '').split(',').map((s) => s.trim()).filter(Boolean).join(' ')
      found.push({ id: m[2], group, en, zh })
    }
    const diffs = []
    const same = (f, mem) => f.id === mem.id || f.zh === mem.name.zh // page ids differ for some members (e.g. "Larry")
    for (const mem of C.MEMBERS) {
      const f = found.find((x) => same(x, mem))
      if (!f) { diffs.push(`${mem.name.en} (${mem.id}) is not on the page`); continue }
      if (f.group !== mem.group) diffs.push(`${mem.name.en}: group ${f.group} on the page ≠ ${mem.group}`)
      if (f.en !== mem.name.en) diffs.push(`${mem.id}: "${f.en}" on the page ≠ "${mem.name.en}"`)
      if (f.zh !== mem.name.zh) diffs.push(`${mem.id}: ${f.zh} on the page ≠ ${mem.name.zh}`)
    }
    for (const f of found) if (!C.MEMBERS.some((m) => same(f, m))) diffs.push(`${f.en} ${f.zh} (${f.id}) is on the page but not in MEMBERS`)
    if (diffs.length) warn(`${rel}: ${diffs.join('; ')}`)
    else ok(`${rel}: ${found.length} members match MEMBERS`)
  }
}

// ------------------------------------------------------------------------------------------ 7. source rules
section('7. source rules for components/home')
{
  const files = []
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(vue|ts|js|mjs)$/.test(f)) files.push(p) } }
  walk(HOME_DIR)
  const rel = (p) => relative(HOME_DIR, p)
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1') // drop comments
  const bad = { gsap: [], geo: [], verify: [], title: [], clientOnly: [], random: [], tailwind: [] }
  for (const p of files) {
    const r = rel(p)
    const src = strip(readFileSync(p, 'utf8'))
    if (r !== 'lib/useMotion.ts' && /(^|\n)\s*import\s+(?!type\b)[^'";]*?\bfrom\s+['"]gsap(\/[^'"]*)?['"]/.test(src)) bad.gsap.push(r)
    if (r !== 'lib/useMotion.ts' && /\bimport\(\s*['"]gsap/.test(src)) bad.gsap.push(r + ' (dynamic)')
    if (r !== 'atlas.data.ts' && !r.startsWith('geo/') && /from\s+['"](d3-geo|topojson-client|world-atlas[^'"]*|\.{1,2}\/(?:\.\.\/)*geo\/frame\.mjs)['"]/.test(src)) bad.geo.push(r)
    if (r !== 'home.content.ts' && /VERIFY_BEFORE_DISPLAY/.test(src)) bad.verify.push(r)
    if (/\bclass\s*=\s*"[^"]*(?<![\w-])title(?![\w-])[^"]*"/.test(src) || /:class\s*=\s*"[^"]*'title'/.test(src)) bad.title.push(r)
    if (/<ClientOnly\b/i.test(src)) bad.clientOnly.push(r)
    if (/Math\.random\s*\(/.test(src)) bad.random.push(r)
  }
  check(!bad.gsap.length, 'gsap is imported only by lib/useMotion.ts (sections use useScene / type-only imports)', bad.gsap.join(', '))
  check(!bad.geo.length, 'd3-geo / topojson / world-atlas / geo/frame.mjs only in atlas.data.ts (build time)', bad.geo.join(', '))
  check(!bad.verify.length, 'no component imports VERIFY_BEFORE_DISPLAY', bad.verify.join(', '))
  check(!bad.title.length, 'no class named "title" (custom.css resizes .title)', bad.title.join(', '))
  check(!bad.clientOnly.length, 'no <ClientOnly>', bad.clientOnly.join(', '))
  if (bad.random.length) warn(`Math.random() found (use seeded() from lib/derive.ts): ${bad.random.join(', ')}`)
  // v2: sans-only. No serif family in any homepage source (comments ignored), no font package, no fonts/ dir.
  const serif = []
  for (const p of [...files, resolve(HOME_DIR, 'styles/home.css')]) {
    const src = strip(readFileSync(p, 'utf8'))
    if (/(?<!sans-)\bserif\b|fontsource|\.woff2?\b|@font-face/i.test(src)) serif.push(rel(p))
  }
  check(!serif.length, 'no serif font, @font-face, woff2 or @fontsource in components/home', serif.join(', '))
  const pkg = readFileSync(resolve(ROOT, 'package.json'), 'utf8') + readFileSync(resolve(ROOT, 'scripts/home-tools/package.json'), 'utf8')
  check(!/fontsource|subset-font|serif/i.test(pkg), 'no font packages in package.json / scripts/home-tools/package.json')
  const gone = ['HomeDeepTime.vue', 'ui/MotionToggle.vue', 'ui/RoleBadge.vue', 'fonts'].filter((f) => existsSync(resolve(HOME_DIR, f)))
  if (existsSync(resolve(ROOT, 'scripts/home-tools/subset-zh.mjs'))) gone.push('scripts/home-tools/subset-zh.mjs')
  const pubAssets = resolve(ROOT, 'docs/src/public/assets')
  if (existsSync(pubAssets) && readdirSync(pubAssets).some((f) => /serif/i.test(f))) gone.push('docs/src/public/assets/*serif*')
  check(!gone.length, 'v2 removals: no HomeDeepTime, MotionToggle, RoleBadge, fonts/, subset tool or serif woff2', gone.join(', '))
  const css = strip(readFileSync(resolve(HOME_DIR, 'styles/home.css'), 'utf8'))
  const unscoped = []
  for (const m of css.matchAll(/([^{};]+)\{/g)) {
    const prelude = m[1].trim()
    if (!prelude || prelude.startsWith('@')) continue // @media / @font-face / @keyframes wrappers
    const parts = []
    let depth = 0, cur = ''
    for (const ch of prelude) { // split on top-level commas only (not inside :is() / :where())
      if (ch === '(') depth++
      else if (ch === ')') depth--
      if (ch === ',' && depth === 0) { parts.push(cur); cur = '' } else cur += ch
    }
    parts.push(cur)
    for (const s of parts.map((x) => x.trim()).filter(Boolean)) {
      if (/^(from|to|[\d.]+%)$/.test(s)) continue // keyframe steps
      if (!/^(\.dark\s+)?\.kl-(home|page)\b/.test(s)) unscoped.push(s)
    }
  }
  check(!unscoped.length, 'every home.css selector is scoped under .kl-home / .kl-page', unscoped.slice(0, 5).join(' | '))
  // zh: no automatic CJK–Latin spacing (mockup B sets 古DNA tight; the subpages don't autospace either).
  // The copy carries its own spaces where wanted ('1001 例', 'MSMC-IM 等').
  const autospace = [...files, resolve(HOME_DIR, 'styles/home.css')]
    .filter((p) => /text-autospace\s*:\s*(?!no-autospace)/.test(strip(readFileSync(p, 'utf8')))).map(rel)
  check(!autospace.length, 'no text-autospace other than no-autospace (zh H1 "古DNA" stays tight, as in mockup B)', autospace.join(', '))
}

// ------------------------------------------------------------------------------------------ 8. rendered HTML
section('8. rendered HTML in docs/.vitepress/dist (after pnpm docs:build)')
{
  const DIST = resolve(ROOT, 'docs/.vitepress/dist')
  const pagesHtml = { en: join(DIST, 'index.html'), zh: join(DIST, 'zh/index.html') }
  const newestSrc = (() => {
    let t = 0
    const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); const s = statSync(p); if (s.isDirectory()) walk(p); else if (/\.(vue|ts|js|mjs|css|json)$/.test(f)) t = Math.max(t, s.mtimeMs) } }
    walk(HOME_DIR)
    return t
  })()
  if (!existsSync(pagesHtml.en) || !existsSync(pagesHtml.zh)) warn('no build in docs/.vitepress/dist — run pnpm docs:build, then home-check again for the rendered checks')
  else if (Math.min(statSync(pagesHtml.en).mtimeMs, statSync(pagesHtml.zh).mtimeMs) < newestSrc) warn('docs/.vitepress/dist is older than components/home — rebuild (pnpm docs:build) for the rendered checks; skipped')
  else {
    const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
    const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" }
    const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e] ?? m)
    const attr = (attrs, n) => { const m = attrs.match(new RegExp(`(?:^|\\s)${n}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i')); return m ? decode(m[1] ?? m[2]) : null }
    /** Text inside main.kl-home, and its alt / aria-label / title values. */
    const scan = (html) => {
      const start = html.search(/<main\b[^>]*class="[^"]*\bkl-home\b/)
      if (start < 0) return null
      const out = { text: '', attrs: '' }
      const stack = []
      const re = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/)?>|([^<]+)/g
      re.lastIndex = start
      let m
      while ((m = re.exec(html))) {
        const [, close, tag, attrs = '', self, text] = m
        if (text !== undefined) {
          out.text += decode(text)
          continue
        }
        if (!tag) continue // comment
        const name = tag.toLowerCase()
        if (close) {
          const i = stack.map((e) => e.name).lastIndexOf(name)
          if (i >= 0) stack.length = i
          if (name === 'main' && !stack.length) break
          continue
        }
        for (const a of ['alt', 'aria-label', 'title']) { const v = attr(attrs, a); if (v) out.attrs += ' ' + v }
        if (name === 'script' || name === 'style') { const end = html.indexOf(`</${name}`, re.lastIndex); re.lastIndex = end < 0 ? html.length : end; continue }
        if (!self && !VOID.has(name)) stack.push({ name })
      }
      return out
    }
    const en = scan(readFileSync(pagesHtml.en, 'utf8'))
    const zh = scan(readFileSync(pagesHtml.zh, 'utf8'))
    if (!en || !zh) fail(`main.kl-home not found in ${!en ? 'dist/index.html' : 'dist/zh/index.html'}`)
    else {
      // (a) both pages: VERIFY_BEFORE_DISPLAY facts are never rendered (text + alt / aria-label / title).
      const VERIFY_FACTS = ['5,300', '5300', '7,500', '7500', '1,226', '1,425', '7th', '8th', 'Neolithic', '新石器', 'million', '百万', '100万']
      // (b) v2: removed copy never comes back (pill, lab-figures note, captions, motion toggle, role badges).
      const REMOVED_COPY = ['New in 20', '年新发表', 'Figures as stated', '数据由课题组提供', 'Reduce motion', '减少动效', 'Original title', '论文原题',
        'Regions are approximate', '大致区域', 'Also in this region', '该地区的其他研究', 'Names from members', '成员信息来自',
        'Co-first author', 'Senior author', '末位作者', 'deep-time',
        // v1 role badges + the pill's authorship note (ROLE / roleNote): never rendered in v2.
        'First author', '第一作者', 'Second-to-last author', '倒数第二作者', 'Co-author', '合作作者', 'Co-supervisor', '共同指导',
        'PhD student Yin Zi', '博士生殷姿', 'Led by PhD student', '领衔：']
      for (const [lang, r, html] of [['/', en, readFileSync(pagesHtml.en, 'utf8')], ['/zh/', zh, readFileSync(pagesHtml.zh, 'utf8')]]) {
        const all = r.text + r.attrs
        const hits = VERIFY_FACTS.filter((s) => all.includes(s))
        check(hits.length === 0, `${lang}: no VERIFY_BEFORE_DISPLAY facts rendered (${VERIFY_FACTS.length} patterns)`, hits.join(', '))
        const back = REMOVED_COPY.filter((s) => all.includes(s) || (s === 'deep-time' && html.includes('id="deep-time"')))
        check(back.length === 0, `${lang}: no removed v2 copy rendered (pill, figures note, captions, motion toggle, role badges, deep time)`, back.join(', '))
        check(!/kl-motion-toggle/.test(html), `${lang}: no motion toggle in the page`)
      }
      const zhTitle = (readFileSync(pagesHtml.zh, 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || ''
      check(decode(zhTitle).startsWith('王轲课题组 · 古DNA与人类群体历史'), '/zh/ <title> = 王轲课题组 · 古DNA与人类群体历史 …', decode(zhTitle))
    }
  }
}

// ------------------------------------------------------------------------------------------ 9. verify list
section('9. VERIFY_BEFORE_DISPLAY (not rendered; PI to confirm)')
for (const v of C.VERIFY_BEFORE_DISPLAY) console.log(`  -     ${v}`)

console.log(`\nhome-check: ${fails ? `${fails} FAIL` : 'all checks passed'}, ${warns} warning(s)`)
process.exit(fails ? 1 : 0)
