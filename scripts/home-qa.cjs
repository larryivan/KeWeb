#!/usr/bin/env node
// scripts/home-qa.cjs — Playwright QA for the homepage (spec §11.B, with lead decision D1 applied).
//
//   pnpm docs:build && pnpm docs:preview --port 4180 &        (any free port 4180–4199)
//   NODE_PATH=$(npm root -g) node scripts/home-qa.cjs http://localhost:4180 /tmp/kl-qa [options]
//
// Options:
//   --pages=/,/zh/          pages to test (default both)
//   --quick                 light-scheme variants only (desktop + mobile × no-preference/reduce, + lite)
//   --require=1,2,3,10,13   checks that decide the exit code (default: all 1–16)
//
// Matrix: pages × {1440×900 DPR1, 390×844 DPR2 touch} × {light, dark} × {no-preference, reduce}, plus
// ?kl-motion=lite at 390. Requests to https://larryivan.github.io/picx-images-hosting/ are fulfilled from the
// local clone /home/user/picx-images-hosting/ (the container cannot reach github.io). Per D1 they are allowed
// for images only; any other cross-origin request is a check-2 violation.
// Writes <outDir>/report.json and <outDir>/<page>_<variant>_<scheme>[_reduced|_lite]_{top,full}.png.
//
// Checks: 1 errors/hydration · 2 origins · 3 no horizontal overflow · 4 h1 + section labels · 5 img attrs and
// rel=noopener · 6 root height · 7 Join door above the fold (390) · 8 no dimmed text · 9 reduced motion
// (no motion library downloaded, no rAF 3–5 s, instant camera) · 10 CLS < 0.02 · 11 LCP element ·
// 12 text facts (hero stat, banned strings, no v2-removed pill / motion toggle) · 13 sans-only (no serif font
// requested; h1 / h2 / lede computed font-family has no serif; fonts same-origin) · 14 sticky stage / mini-maps ·
// 15 lite: no canvas, poster visible · 16 screenshots.
const { chromium } = require('playwright')
const fs = require('fs')
const os = require('os')
const path = require('path')

const IMG_PREFIX = 'https://larryivan.github.io/picx-images-hosting/'
const IMG_ROOT = '/home/user/picx-images-hosting/'
const IMG_ORIGIN = 'https://larryivan.github.io'
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.svg': 'image/svg+xml' }
// Only the GSAP libraries themselves contain these (banners are kept as legal comments; "pin-spacer" is a
// ScrollTrigger string literal). Section code may legitimately mention the word "ScrollTrigger".
const MOTION_LIB = /pin-spacer|\b(?:GSAP|ScrollTrigger|DrawSVGPlugin) \d+\.\d+\.\d+/
const BANNED = ['杨浦区', '200438', 'Yakun', '融合理论', '上海青年科学家', '1905', '历史悠久的主楼', '奥茨塔尔', '演化人类学', 'state-of-the-art']

const args = process.argv.slice(2)
const pos = args.filter((a) => !a.startsWith('--'))
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true] }))
const base = (pos[0] || 'http://localhost:4173').replace(/\/$/, '')
const outDir = path.resolve(pos[1] || path.join(os.tmpdir(), 'kl-home-qa'))
const pages = opt.pages ? String(opt.pages).split(',') : ['/', '/zh/']
const required = opt.require ? String(opt.require).split(',').map(Number) : Array.from({ length: 16 }, (_, i) => i + 1)
const baseOrigin = new URL(base).origin

const DESKTOP = { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
const MOBILE = { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const variants = []
for (const dev of [DESKTOP, MOBILE]) for (const scheme of ['light', 'dark']) for (const motion of ['no-preference', 'reduce']) {
  if (opt.quick && scheme === 'dark') continue
  variants.push({ dev, scheme, motion, lite: false })
}
variants.push({ dev: MOBILE, scheme: 'light', motion: 'no-preference', lite: true })

// Runs in the page before any script: CLS, LCP and rAF instrumentation.
function instrument() {
  window.__kl = { cls: 0, shifts: [], lcp: null, raf: [] }
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue
        window.__kl.cls += e.value
        window.__kl.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), nodes: (e.sources || []).map((s) => s.node && s.node.nodeType === 1 ? s.node.tagName.toLowerCase() + (s.node.id ? '#' + s.node.id : '') + (s.node.className && typeof s.node.className === 'string' ? '.' + s.node.className.trim().split(/\s+/).join('.') : '') : String(s.node && s.node.nodeName)) })
      }
    }).observe({ type: 'layout-shift', buffered: true })
  } catch (e) {}
  try {
    new PerformanceObserver((list) => {
      const es = list.getEntries()
      const e = es[es.length - 1]
      if (e) window.__kl.lcpEl = e.element || null
      if (e) window.__kl.lcp = { t: Math.round(e.startTime), size: e.size }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (e) {}
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => raf((ts) => { window.__kl.raf.push(performance.now()); return cb(ts) })
}

const tagOf = (p, v) => `${p.replace(/\W+/g, '_').replace(/^_+|_+$/g, '') || 'root'}_${v.dev.name}_${v.scheme}${v.motion === 'reduce' ? '_reduced' : ''}${v.lite ? '_lite' : ''}`

async function runOne(browser, p, v) {
  const tag = tagOf(p, v)
  const ctx = await browser.newContext({
    viewport: v.dev.viewport, deviceScaleFactor: v.dev.deviceScaleFactor, isMobile: !!v.dev.isMobile, hasTouch: !!v.dev.hasTouch,
    colorScheme: v.scheme, reducedMotion: v.motion,
  })
  await ctx.addInitScript((s) => { try { localStorage.setItem('vitepress-theme-appearance', s) } catch (e) {} }, v.scheme)
  await ctx.addInitScript(instrument)
  await ctx.route(IMG_PREFIX + '**', async (route) => {
    const rel = decodeURIComponent(route.request().url().slice(IMG_PREFIX.length).split('?')[0])
    const file = path.join(IMG_ROOT, rel)
    if (file.startsWith(IMG_ROOT) && fs.existsSync(file)) {
      return route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', headers: { 'access-control-allow-origin': '*' } })
    }
    return route.fulfill({ status: 404, body: '' })
  })
  const page = await ctx.newPage()
  const errors = []
  const requests = []
  const bodyChecks = []
  const motionLibResponses = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    const text = m.text()
    if (m.type() === 'error') errors.push('console.error: ' + text)
    else if (/hydration/i.test(text)) errors.push(`console.${m.type()} (hydration): ${text}`)
  })
  page.on('request', (r) => requests.push({ url: r.url(), type: r.resourceType() }))
  page.on('response', (res) => {
    const t = res.request().resourceType()
    if (['image', 'font', 'media'].includes(t)) return
    bodyChecks.push(res.text().then((body) => { if (MOTION_LIB.test(body)) motionLibResponses.push(res.url()) }).catch(() => {}))
  })

  const url = base + p + (v.lite ? '?kl-motion=lite' : '')
  const R = {}
  const set = (id, pass, detail) => { R[id] = { pass, detail } }
  const t0 = Date.now()
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  } catch (e) {
    errors.push('goto: ' + e.message)
  }
  const vh = v.dev.viewport.height
  const isDesktop = v.dev === DESKTOP

  // ---- at load (no scrolling yet)
  const atLoad = await page.evaluate(() => {
    const join = document.querySelector('main.kl-home #top a[href="#join"]')
    return { joinTop: join ? join.getBoundingClientRect().top : null }
  })
  if (!isDesktop) set(7, atLoad.joinTop !== null && atLoad.joinTop < 844, atLoad.joinTop === null ? 'no a[href="#join"] in #top (stub?)' : `top ${Math.round(atLoad.joinTop)} px`)
  else set(7, null, 'mobile only')

  // ---- CLS + LCP over load + 3 s (interval polling: 'raf' polling would itself call requestAnimationFrame)
  await page.waitForFunction(() => performance.now() >= 3000, null, { timeout: 30000, polling: 100 }).catch(() => {})
  const perf = await page.evaluate(() => {
    const k = window.__kl || {}
    const el = k.lcpEl
    return {
      cls: k.cls || 0, shifts: (k.shifts || []).slice(0, 8), lcp: k.lcp,
      lcpTag: el ? el.tagName : null, lcpInHero: el ? !!el.closest('.kl-hero') : false,
      lcpDesc: el ? el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') : null,
    }
  })
  set(10, perf.cls < 0.02, `CLS ${perf.cls.toFixed(4)}${perf.shifts.length ? ' shifts ' + JSON.stringify(perf.shifts) : ''}`)
  set(11, !!perf.lcpTag && perf.lcpInHero && perf.lcpTag !== 'IMG', perf.lcpTag ? `${perf.lcpDesc} at ${perf.lcp && perf.lcp.t} ms${perf.lcpInHero ? '' : ' (outside .kl-hero)'}` : 'no LCP entry')

  // ---- reduced motion: rAF quiet 3–5 s, instant camera
  let rafQuiet = null
  let camera = null
  if (v.motion === 'reduce') {
    await page.waitForFunction(() => performance.now() >= 5100, null, { timeout: 30000, polling: 100 }).catch(() => {})
    rafQuiet = await page.evaluate(() => (window.__kl.raf || []).filter((t) => t >= 3000 && t <= 5000).length)
    if (isDesktop) {
      camera = await page.evaluate(async () => {
        const stop = document.getElementById('findings-europe')
        const svg = document.querySelector('.kl-atlas__stage svg.kl-map, .kl-atlas__stage svg')
        if (!stop || !svg) return { missing: !stop ? '#findings-europe' : '.kl-atlas__stage svg' }
        const r = stop.getBoundingClientRect()
        window.scrollTo(0, window.scrollY + r.top + r.height / 2 - innerHeight / 2)
        const t = performance.now()
        while (performance.now() - t < 200) await new Promise((res) => setTimeout(res, 20))
        const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number)
        return { width: vb[2] }
      })
    }
  }

  await page.screenshot({ path: path.join(outDir, tag + '_top.png') })

  // ---- scroll-through, then +2 s
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += Math.floor(vh * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(250)
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await page.waitForTimeout(2000)

  const dom = await page.evaluate(({ BANNED, isEn }) => {
    const main = document.querySelector('main.kl-home')
    const out = { hasMain: !!main }
    if (!main) return out
    const de = document.documentElement
    out.overflow = de.scrollWidth - de.clientWidth
    out.height = Math.round(main.getBoundingClientRect().height)
    out.h1 = main.querySelectorAll('h1').length
    out.badSections = []
    for (const s of main.querySelectorAll('section')) {
      const ids = (s.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean)
      const ok = ids.length && ids.every((id) => { const el = document.getElementById(id); return el && /^H[1-6]$/.test(el.tagName) })
      if (!ok) out.badSections.push(s.id || s.className || 'section')
    }
    out.badImgs = [...main.querySelectorAll('img')].filter((i) => !(i.getAttribute('alt') || '').trim() || !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.currentSrc || i.src)
    out.badLinks = [...main.querySelectorAll('a[target="_blank"]')].filter((a) => !/\bnoopener\b/.test(a.getAttribute('rel') || '')).map((a) => a.href)
    // effective opacity of visible text
    const dim = []
    const seen = new Set()
    const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    while (tw.nextNode()) {
      const el = tw.currentNode.parentElement
      if (!tw.currentNode.textContent.trim() || !el || seen.has(el)) continue
      seen.add(el)
      if (el.closest('[aria-hidden="true"], .kl-sr, script, style, template, noscript')) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility !== 'visible' || !el.getClientRects().length) continue
      let o = 1
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity)
      if (o < 0.99) dim.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} "${el.textContent.trim().slice(0, 40)}" ${o.toFixed(2)}`)
    }
    out.dim = dim
    // text facts
    const hero = main.querySelector('#top')
    const heroText = hero ? hero.textContent : ''
    out.heroStat = isEn ? heroText.includes('1,001') : heroText.includes('1001') && !heroText.includes('1,001')
    const attrs = [...main.querySelectorAll('[alt],[aria-label],[title]')].map((e) => [e.getAttribute('alt'), e.getAttribute('aria-label'), e.getAttribute('title')].join(' ')).join(' ')
    const text = main.textContent + ' ' + attrs
    out.banned = BANNED.filter((s) => text.includes(s))
    // stage / mini-maps / lite
    const stage = main.querySelector('.kl-atlas__stage')
    out.stage = stage ? { position: getComputedStyle(stage).position, display: getComputedStyle(stage).display } : null
    out.minimaps = [...main.querySelectorAll('.kl-minimap')].filter((m) => m.getClientRects().length && getComputedStyle(m).visibility === 'visible').length
    out.canvases = main.querySelectorAll('canvas').length
    const poster = main.querySelector('.kl-genome-poster')
    if (poster) {
      const cs = getComputedStyle(poster)
      const r = poster.getBoundingClientRect()
      out.poster = cs.display !== 'none' && cs.visibility === 'visible' && r.width > 0 && r.height > 0 && parseFloat(cs.opacity) > 0.99
    } else out.poster = null
    out.removed = ['年新发表', 'New in 20', 'Figures as stated', '数据由课题组提供'].filter((x) => text.includes(x))
    if (main.querySelector('.kl-motion-toggle')) out.removed.push('.kl-motion-toggle')
    out.families = [...main.querySelectorAll('h1, h2, .kl-lede')].slice(0, 6).map((e) => getComputedStyle(e).fontFamily)
    out.motionAttr = main.getAttribute('data-motion')
    out.lite = main.hasAttribute('data-lite')
    return out
  }, { BANNED, isEn: !p.startsWith('/zh') })

  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(outDir, tag + '_full.png'), fullPage: true })
  await Promise.allSettled(bodyChecks)

  // ---- verdicts
  set(1, errors.length === 0, errors.length ? errors.slice(0, 6).join(' | ') : 'clean')
  const foreign = requests.filter((r) => {
    if (/^(data|blob|about):/.test(r.url)) return false
    const o = new URL(r.url).origin
    if (o === baseOrigin) return false
    if (o === IMG_ORIGIN && r.type === 'image' && r.url.startsWith(IMG_PREFIX)) return false // D1: images only
    return true
  })
  const imgHost = requests.filter((r) => r.url.startsWith(IMG_ORIGIN)).length
  set(2, foreign.length === 0, foreign.length ? foreign.slice(0, 5).map((r) => `${r.type} ${r.url}`).join(' | ') : `only ${baseOrigin}${imgHost ? ` + ${imgHost} image(s) from ${IMG_ORIGIN}` : ''}`)
  if (!dom.hasMain) {
    for (const id of [3, 4, 5, 6, 8, 12, 14, 15]) set(id, false, 'main.kl-home not found')
  } else {
    set(3, dom.overflow === 0, `scrollWidth − clientWidth = ${dom.overflow}`)
    set(4, dom.h1 === 1 && dom.badSections.length === 0, `${dom.h1} h1${dom.badSections.length ? '; unlabelled sections: ' + dom.badSections.join(', ') : ''}`)
    set(5, !dom.badImgs.length && !dom.badLinks.length, [dom.badImgs.length ? 'img without alt/width/height: ' + dom.badImgs.slice(0, 3).join(', ') : '', dom.badLinks.length ? 'target=_blank without noopener: ' + dom.badLinks.slice(0, 3).join(', ') : ''].filter(Boolean).join('; ') || 'ok')
    const limit = isDesktop ? 9900 : 16000
    const target = isDesktop ? 9000 : 14500
    set(6, dom.height <= limit, `${dom.height} px (limit ${limit}, target ${target}${dom.height > target ? ' — over target' : ''})`)
    set(8, dom.dim.length === 0, dom.dim.length ? `${dom.dim.length} dimmed: ` + dom.dim.slice(0, 5).join(' | ') : 'all visible text at opacity ≥ 0.99')
    set(12, dom.heroStat && dom.banned.length === 0 && dom.removed.length === 0, `${dom.heroStat ? 'hero stat ok' : `hero stat missing (${p.startsWith('/zh') ? '1001' : '1,001'})`}${dom.banned.length ? '; banned: ' + dom.banned.join(', ') : ''}${dom.removed.length ? '; v2-removed copy: ' + dom.removed.join(', ') : ''}`)
    if (isDesktop) set(14, !!dom.stage && dom.stage.position === 'sticky', dom.stage ? `stage position ${dom.stage.position}` : 'no .kl-atlas__stage (stub?)')
    else set(14, !!dom.stage && dom.stage.display === 'none' && dom.minimaps === 6, `${dom.stage ? `stage display ${dom.stage.display}` : 'no .kl-atlas__stage'}; ${dom.minimaps} visible .kl-minimap`)
    if (v.lite) set(15, dom.canvases === 0 && dom.poster === true, `${dom.canvases} canvas; poster ${dom.poster === null ? 'missing (.kl-genome-poster)' : dom.poster ? 'visible' : 'hidden'}; data-lite ${dom.lite}`)
    else set(15, null, 'lite only')
  }
  if (v.motion === 'reduce') {
    const parts = []
    let pass = motionLibResponses.length === 0
    parts.push(motionLibResponses.length ? `motion library downloaded: ${motionLibResponses.map((u) => u.split('/').pop()).join(', ')}` : 'no motion library downloaded')
    pass = pass && rafQuiet === 0
    parts.push(`${rafQuiet} rAF callbacks in 3–5 s`)
    if (isDesktop) {
      if (camera && camera.missing) { pass = false; parts.push(`camera: ${camera.missing} missing (stub?)`) }
      else if (camera) { pass = pass && camera.width < 300; parts.push(`europe viewBox width ${camera.width} after 200 ms`) }
    }
    if (dom.motionAttr !== 'off') { pass = false; parts.push(`data-motion="${dom.motionAttr}"`) }
    set(9, pass, parts.join('; '))
  } else set(9, null, 'reduce only')
  {
    // v2: sans-only. No serif webfont requested; headings / ledes resolve to the sans stack; fonts same-origin.
    const fonts = requests.filter((r) => /\.(woff2?|ttf|otf)(\?|$)/.test(r.url))
    const foreignFonts = fonts.filter((r) => !r.url.startsWith(baseOrigin + '/'))
    const serifFonts = fonts.filter((r) => /serif/i.test(r.url.split('/').pop()) && !/sans/i.test(r.url.split('/').pop()))
    const SERIF = /(?<!sans-)\bserif\b|Georgia|Times|Songti|STSong|KL Serif|Source Serif/i
    const serifFam = (dom.families || []).filter((f) => SERIF.test(f))
    set(13, !foreignFonts.length && !serifFonts.length && !serifFam.length && (dom.families || []).length > 0,
      `${fonts.length} font request(s)${foreignFonts.length ? '; cross-origin: ' + foreignFonts.map((r) => r.url).join(', ') : ''}${serifFonts.length ? '; serif: ' + serifFonts.map((r) => r.url).join(', ') : ''}${serifFam.length ? '; serif family: ' + serifFam[0] : ''}; h1 family: ${(dom.families || [])[0] || 'n/a'}`)
  }
  const shots = ['_top.png', '_full.png'].every((s) => fs.existsSync(path.join(outDir, tag + s)))
  set(16, shots, shots ? `${tag}_{top,full}.png` : 'missing screenshots')

  await ctx.close()
  return { page: p, variant: v.dev.name, scheme: v.scheme, motion: v.motion, lite: v.lite, tag, ms: Date.now() - t0, height: dom.height, checks: R, requests: requests.length, errors }
}

;(async () => {
  fs.mkdirSync(outDir, { recursive: true })
  const browser = await chromium.launch()
  const runs = []
  for (const p of pages) for (const v of variants) {
    const r = await runOne(browser, p, v)
    runs.push(r)
    const line = Object.entries(r.checks).map(([id, c]) => (c.pass === null ? '' : `${id}${c.pass ? '✓' : '✗'}`)).filter(Boolean).join(' ')
    console.log(`${r.tag.padEnd(36)} ${line}`)
  }
  await browser.close()
  const summary = {}
  for (let id = 1; id <= 16; id++) {
    const applicable = runs.filter((r) => r.checks[id] && r.checks[id].pass !== null)
    const failed = applicable.filter((r) => !r.checks[id].pass)
    summary[id] = { pass: applicable.length > 0 && failed.length === 0, applicable: applicable.length, failed: failed.map((r) => `${r.tag}: ${r.checks[id].detail}`) }
  }
  const report = { base, outDir, when: new Date().toISOString(), required, summary, runs }
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1))
  console.log('\nsummary')
  for (const [id, s] of Object.entries(summary)) {
    console.log(`  ${String(id).padStart(2)} ${s.pass ? 'pass' : 'FAIL'} (${s.applicable - s.failed.length}/${s.applicable})${required.includes(+id) ? '' : '  [not required]'}`)
    for (const f of s.failed.slice(0, 3)) console.log(`       ${f}`)
  }
  const bad = required.filter((id) => !summary[id].pass)
  console.log(`\nhome-qa: report ${path.join(outDir, 'report.json')}; ${bad.length ? `required checks failing: ${bad.join(', ')}` : 'all required checks pass'}`)
  process.exit(bad.length ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(2) })
