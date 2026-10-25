#!/usr/bin/env node
// scripts/home-tools/images.mjs — homepage image variants (spec §9, lead decision D1).
//
//   pnpm --dir scripts/home-tools install && node scripts/home-tools/images.mjs [outDir]
//
// Writes the optimised variants into outDir (default: /home/user/picx-images-hosting/home/, the local
// clone of the image host), and writes docs/.vitepress/components/home/img/index.ts with the variant URLs
// under https://larryivan.github.io/picx-images-hosting/home/<file>, intrinsic width/height and the
// computed placeholder colour. Raster images are NEVER written into the KeWeb repo.
// This script never runs git: the image-host repo is reviewed, committed and pushed by hand.
import sharp from 'sharp'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = 'https://larryivan.github.io/picx-images-hosting/'
const CLONE = '/home/user/picx-images-hosting/'
const URL_BASE = HOST + 'home/'
const OUT = resolve(process.argv[2] || CLONE + 'home/')
const REPO = fileURLToPath(new URL('../../', import.meta.url))
const IMG_TS = resolve(REPO, 'docs/.vitepress/components/home/img/index.ts')

const AVIF = { quality: 50, effort: 6 }
const WEBP = { quality: 74 }
const JPEG = { quality: 78, mozjpeg: true }

/** Variant jobs. `aspect` crops (cover) to w:h. Widths are never upscaled. */
const JOBS = [
  { id: 'gate', src: { host: '20250507/1.67xodug9di.jpg' }, widths: [640, 960, 1600, 2400], avif: true, webp: true, fallback: { w: 1600, fmt: 'jpg' } },
  { id: 'ginkgo', src: { host: '20250507/7.2yykh6w1r0.jpg' }, widths: [480, 690], avif: true, webp: true, fallback: { w: 690, fmt: 'jpg' } },
  { id: 'pi', src: { host: '20250507/wk.45hvpslowv.jpg' }, widths: [360, 720], aspect: [4, 5], avif: true, webp: true, fallback: { w: 720, fmt: 'jpg' } },
  { id: 'logo', src: { repo: 'docs/src/public/logo.png' }, widths: [160], avif: false, webp: true, fallback: { w: 160, fmt: 'png' }, placeholder: 'transparent' },
]
/** Used as-is from the image host (D1): no variant. */
const AS_IS = [{ id: 'wechatQr', src: { host: '20250516/640.1ap7x401ma.jpg' } }]

async function readSource(src) {
  if (src.repo) return readFileSync(resolve(REPO, src.repo))
  const local = CLONE + src.host
  if (existsSync(local)) return readFileSync(local)
  console.log(`images: ${local} not found, fetching ${HOST + src.host}`)
  const res = await fetch(HOST + src.host)
  if (!res.ok) throw new Error(`images: GET ${HOST + src.host} → ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const hex = (n) => Math.round(n).toString(16).padStart(2, '0')
async function meanColour(buf) {
  const { channels } = await sharp(buf).stats()
  return ('#' + hex(channels[0].mean) + hex(channels[1].mean) + hex(channels[2].mean)).toUpperCase()
}

function pipeline(buf, w, srcW, srcH, aspect) {
  const width = Math.min(w, srcW)
  if (aspect) {
    const [aw, ah] = aspect
    const maxW = Math.min(srcW, Math.floor((srcH * aw) / ah))
    const cw = Math.min(width, maxW)
    return { img: sharp(buf).resize({ width: cw, height: Math.round((cw * ah) / aw), fit: 'cover', position: 'centre' }), width: cw }
  }
  return { img: sharp(buf).resize({ width, withoutEnlargement: true }), width }
}

async function write(img, file, fmt) {
  const p = resolve(OUT, file)
  const out = fmt === 'avif' ? img.avif(AVIF) : fmt === 'webp' ? img.webp(WEBP) : fmt === 'jpg' ? img.jpeg(JPEG) : img.png({ palette: true, compressionLevel: 9, effort: 10 })
  const info = await out.toFile(p)
  return { file, w: info.width, h: info.height, bytes: info.size }
}

mkdirSync(OUT, { recursive: true })
const pics = {}
const report = []
for (const job of JOBS) {
  const buf = await readSource(job.src)
  const meta = await sharp(buf).metadata()
  const placeholder = job.placeholder ?? (await meanColour(buf))
  const avif = []
  const webp = []
  for (const w of job.widths) {
    for (const fmt of ['avif', 'webp']) {
      if (!job[fmt]) continue
      const { img, width } = pipeline(buf, w, meta.width, meta.height, job.aspect)
      const r = await write(img, `${job.id}-${width}.${fmt}`, fmt)
      report.push(r)
      ;(fmt === 'avif' ? avif : webp).push({ w: r.w, url: URL_BASE + r.file, bytes: r.bytes })
    }
  }
  const { img, width } = pipeline(buf, job.fallback.w, meta.width, meta.height, job.aspect)
  const fb = await write(img, `${job.id}-${width}.${job.fallback.fmt}`, job.fallback.fmt)
  report.push(fb)
  pics[job.id] = { id: job.id, width: fb.w, height: fb.h, placeholder, avif, webp, src: URL_BASE + fb.file, srcBytes: fb.bytes }
}
for (const job of AS_IS) {
  const buf = await readSource(job.src)
  const meta = await sharp(buf).metadata()
  pics[job.id] = { id: job.id, width: meta.width, height: meta.height, placeholder: await meanColour(buf), avif: [], webp: [], src: HOST + job.src.host, srcBytes: buf.length }
}

for (const r of report) console.log(`images: ${r.file.padEnd(18)} ${String(r.w).padStart(4)}×${String(r.h).padEnd(4)} ${(r.bytes / 1000).toFixed(1).padStart(6)} KB`)

// ---------------------------------------------------------------- img/index.ts
const lit = (o) => {
  const list = (l) => `[${l.map((s) => `{ w: ${s.w}, url: '${s.url}' }`).join(', ')}]`
  return `{\n  id: '${o.id}', width: ${o.width}, height: ${o.height}, placeholder: '${o.placeholder}',\n` +
    `  avif: ${list(o.avif)},\n  webp: ${list(o.webp)},\n  src: '${o.src}',\n}`
}
const sizes = (o) => [...o.avif.map((s) => `avif ${s.w}: ${(s.bytes / 1000).toFixed(1)} KB`), ...o.webp.map((s) => `webp ${s.w}: ${(s.bytes / 1000).toFixed(1)} KB`), `src: ${(o.srcBytes / 1000).toFixed(1)} KB`].join(' · ')
const ts = `// GENERATED by scripts/home-tools/images.mjs (pnpm home:assets) — do not edit by hand.
// Lead decision D1: the files live on the image host (picx-images-hosting/home/), not in this repo.
// Only https://larryivan.github.io may serve homepage images. Use with ui/Picture.vue.

export interface PicSource { w: number; url: string }
export interface Pic {
  id: string
  /** Intrinsic size of the fallback file (use for width/height attributes; all variants share the aspect). */
  width: number
  height: number
  /** Mean colour of the source, shown until the image paints ('transparent' for images with alpha). */
  placeholder: string
  /** Ascending by width. Empty when the file is used as-is. */
  avif: PicSource[]
  webp: PicSource[]
  /** JPEG/PNG fallback URL. */
  src: string
}

export const IMG_HOST = '${URL_BASE}'

/** Campus photo 1 (gate). ${sizes(pics.gate)} */
export const gate: Pic = ${lit(pics.gate)}

/** Campus photo 2 (ginkgo, never upscaled past 690 px). ${sizes(pics.ginkgo)} */
export const ginkgo: Pic = ${lit(pics.ginkgo)}

/** PI portrait, 4:5. ${sizes(pics.pi)} */
export const pi: Pic = ${lit(pics.pi)}

/** WeChat QR, the hosted file as-is (no variant). ${sizes(pics.wechatQr)} */
export const wechatQr: Pic = ${lit(pics.wechatQr)}

/** Logo for the closing mark (display 64 px). ${sizes(pics.logo)} */
export const logo: Pic = ${lit(pics.logo)}

export const IMAGES = { gate, ginkgo, pi, wechatQr, logo }
`
mkdirSync(resolve(IMG_TS, '..'), { recursive: true })
writeFileSync(IMG_TS, ts)
console.log(`images: wrote ${report.length} files to ${OUT}`)
console.log(`images: wrote ${IMG_TS}`)
