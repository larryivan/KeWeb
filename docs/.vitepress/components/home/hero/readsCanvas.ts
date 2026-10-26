// hero/readsCanvas.ts — the hero's one-shot "DNA reads" canvas (spec §7.1, v2 colours). No library.
//
// Short blue/teal strokes (sequencing reads) start in a loose haze around their own land dot — so the first frame
// already hints at the continents — then converge west → east, shrink into dots and dim as they land, handing
// over to the SVG land that fades in beneath them. The canvas then fades out and removes itself (t = 0 → 1.45 s).
// - Targets: every `every`-th land dot (decodeLand), mapped through the map svg's getScreenCTM().
// - The canvas covers only `box` (the map, inflated, clamped clear of the text and the doors). Reads outside
//   the land rect fade out towards the canvas edge, so nothing is ever hard-clipped.
// - Seeded PRNG (1001): the same choreography on every load. Alpha is bucketed (NB levels) per colour, so a
//   frame is at most 2 × NB stroke() calls.
// - Returns stop(): cancels the frame loop and removes the canvas (idempotent). Call it on motion-off.
import { LAND } from '../land.generated.ts'
import { decodeLand } from '../lib/land.ts'
import { seeded } from '../lib/derive.ts'

export interface ReadsBox { l: number; t: number; r: number; b: number }

export interface ReadsOptions {
  /** Positioned element the canvas is appended to (absolute, under the map svg). */
  host: HTMLElement
  /** The hero map svg; land dots are mapped through its CTM. */
  svg: SVGSVGElement
  /** Viewport px the reads may occupy. */
  box: ReadsBox
  /** Take every Nth land dot (4 on desktop ≈ 1,870 reads; 7 on phones ≈ 1,070). */
  every: number
  /** Start-cloud radius as a fraction of the land width. */
  spread: number
  /** Damping of the westward spread (1 = none), keeps the haze off the text column. */
  west: number
  /** Stroke colours (CSS colour strings); reads are split 2 : 1 between them. */
  colors: [string, string]
}

const TRAVEL = 1.15  // s, per read (easeOutExpo)
const SWEEP = 0.55   // s, west → east delay across the land width
const JITTER = 0.12  // s
const FADE_IN = 0.25
const FADE_OUT = 1.05
const END = 1.45
const ALPHA = 0.6
const NB = 8         // alpha buckets per colour

const expoOut = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p))

export function startReads(o: ReadsOptions): () => void {
  const m = o.svg.getScreenCTM()
  const hr = o.host.getBoundingClientRect()
  const { l: bl, t: bt } = o.box
  const W = o.box.r - bl
  const H = o.box.b - bt
  if (!m || W < 1 || H < 1) return () => {}

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cv = document.createElement('canvas')
  cv.setAttribute('aria-hidden', 'true')
  cv.width = Math.round(W * dpr)
  cv.height = Math.round(H * dpr)
  cv.style.cssText = `position:absolute;left:${bl - hr.left}px;top:${bt - hr.top}px;width:${W}px;height:${H}px;pointer-events:none;z-index:0`
  const g = cv.getContext('2d')
  if (!g) return () => {}

  // The land rect in canvas px. Outside it, a read's alpha falls linearly to 0 at the canvas edge.
  const lw = m.a * LAND.w
  const L0 = m.e - bl
  const T0 = m.f - bt
  const L1 = L0 + lw
  const T1 = T0 + m.d * LAND.h
  const ramp = (v: number, a: number, b: number, size: number) =>
    v < a ? (a > 0 ? v / a : 0) : v > b ? (size > b ? (size - v) / (size - b) : 0) : 1
  const edge = (x: number, y: number) => Math.min(ramp(x, L0, L1, W), ramp(y, T0, T1, H))

  // Reads: [sx, sy, tx, ty, hx, hy, delay, colour] — start, target (canvas px), half-vector, delay (s), 0 | 1.
  // Start radius is biased towards the dot (r = R·(.06 + .94u³)); strokes lie roughly along their path, so the
  // haze reads as being drawn in rather than as confetti. Length 6–14 px, scaled down on small maps.
  const sc = Math.min(1, lw / 600)
  const R = o.spread * lw
  const pts = decodeLand(LAND.d)
  const rnd = seeded(1001)
  const rd: number[] = []
  for (let i = 0; i < pts.length; i += 2 * o.every) {
    const x = pts[i]
    const y = pts[i + 1]
    const tx = m.a * x + m.c * y + m.e - bl
    const ty = m.b * x + m.d * y + m.f - bt
    const phi = rnd() * Math.PI * 2
    const u = rnd()
    const r = R * (0.06 + 0.94 * u * u * u)
    const dx = Math.cos(phi) * r
    const a = phi + (rnd() - 0.5) * 1.2
    const half = ((6 + rnd() * 8) * sc) / 2
    rd.push(
      tx + (dx < 0 ? dx * o.west : dx), ty + Math.sin(phi) * r * 0.8, tx, ty,
      Math.cos(a) * half, Math.sin(a) * half,
      SWEEP * (x / LAND.w) + rnd() * JITTER, rnd() < 0.67 ? 0 : 1,
    )
  }
  const n = rd.length / 8
  const buf = Array.from({ length: 2 * NB }, () => new Float32Array(n * 4))
  const cnt = new Int32Array(2 * NB)

  o.host.appendChild(cv)
  let raf = 0
  let t0 = -1
  let done = false
  const stop = () => {
    if (done) return
    done = true
    cancelAnimationFrame(raf)
    cv.remove()
  }

  const frame = (now: number) => {
    if (t0 < 0) t0 = now
    const t = (now - t0) / 1000
    if (t >= END) return stop()
    cnt.fill(0)
    for (let k = 0; k < rd.length; k += 8) {
      const e = expoOut(Math.min(1, Math.max(0, (t - rd[k + 6]) / TRAVEL)))
      const x = rd[k] + (rd[k + 2] - rd[k]) * e
      const y = rd[k + 1] + (rd[k + 3] - rd[k + 1]) * e
      const al = edge(x, y) * (1 - 0.8 * e * e) // dims as it lands: the land takes over
      if (!(al > 0.03)) continue
      const f = 1 - e
      const bi = rd[k + 7] * NB + Math.min(NB - 1, (al * NB) | 0)
      const p = buf[bi]
      const j = cnt[bi]++ * 4
      p[j] = x - rd[k + 4] * f
      p[j + 1] = y - rd[k + 5] * f
      p[j + 2] = x + rd[k + 4] * f + 0.01
      p[j + 3] = y + rd[k + 5] * f
    }
    const ga = ALPHA * Math.min(1, t / FADE_IN) * (t > FADE_OUT ? Math.max(0, (END - t) / (END - FADE_OUT)) : 1)
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, W, H)
    g.lineWidth = 1 + 0.3 * sc
    g.lineCap = 'round'
    for (let bi = 0; bi < 2 * NB; bi++) {
      const c = cnt[bi]
      if (!c) continue
      const p = buf[bi]
      g.globalAlpha = (ga * ((bi % NB) + 1)) / NB
      g.strokeStyle = o.colors[bi < NB ? 0 : 1]
      g.beginPath()
      for (let j = 0; j < c * 4; j += 4) {
        g.moveTo(p[j], p[j + 1])
        g.lineTo(p[j + 2], p[j + 3])
      }
      g.stroke()
    }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
  return stop
}
