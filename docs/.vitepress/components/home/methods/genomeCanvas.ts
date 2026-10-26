// methods/genomeCanvas.ts — geometry of the 1,001 figure (shared by the SSR poster) and its scroll-scrubbed
// canvas (spec §7.4 Part B, v2 colours). No library.
//
// Figure box W × H (CSS px at full size): the ledger (gridDims(GENOMES) dots) fills the width along the top;
// below it a faint ring whose 36° wedge (a tenth) at 12 o'clock is solid.
//   d (≥ 560 px): a 143 × 7 ribbon across the whole container, the ring under its right half (the text sits
//                 under its left half, the number's top level with the wedge's: GenomeFigure.vue).
//   m (below):    a 77 × 13 ledger above a centred ring.
// Progress p (0 → 1, scrubbed by ScrollTrigger in GenomeFigure.vue):
//   0    → .42  the ledger fills column by column (ghost dots → accent); onCount(columns × rows)
//   .55  → .75  the faint ring sweeps clockwise from the wedge (the whole ring is on screen by then)
//   .58  → .99  every dot arcs from its cell into a slot of the wedge (left columns first, slots sorted by
//               angle, so the wedge fills clockwise); its cell turns ghost again
//   .88  → .98  the wedge turns solid — the last frame equals the SSR poster
// - Draws only when asked (draw); the caller owns the rAF. DPR ≤ 2. colors() re-reads the CSS tokens.
import { GENOMES } from '../home.content.ts'
import { gridDims } from '../lib/derive.ts'

export interface Geo {
  W: number; H: number
  cols: number; rows: number
  pitch: number; dot: number          // grid pitch (W / cols: the ledger spans the box), dot radius
  top: number                         // y of the wedge's outer edge (the top of the ring)
  cx: number; cy: number; R: number; r0: number
  pop: number                         // the wedge stands out of the ring by this much on both sides
  din: number                         // dot radius once in the wedge
}

const TAU = Math.PI * 2
const DEG = Math.PI / 180
const A0 = -108 * DEG                 // the wedge: 36° centred on 12 o'clock (y down: clockwise = +angle)
const A1 = -72 * DEG
const GAP = 1.6 * DEG

function geo(W: number, aspect: number, dot: number, gap: number, R: number, pop: number, cx: number, din: number): Geo {
  const { cols, rows } = gridDims(GENOMES, aspect)
  const pitch = W / cols
  const top = rows * pitch + gap
  const cy = top + pop + R
  return { W, H: Math.ceil(cy + R + pop + 1), cols, rows, pitch, dot, top, cx: W * cx, cy, R, r0: R * 0.74, pop, din }
}

export const GEO = { d: geo(1136, 20, 1.9, 44, 166, 3, 0.7, 1.3), m: geo(358, 6, 1.3, 22, 105, 2.5, 0.5, 1.1) }

const f2 = (n: number) => Math.round(n * 100) / 100

/** SVG path of an annular sector a → b (clockwise, radians). */
function sector(g: Geo, a: number, b: number, r0: number, r1: number): string {
  const pt = (r: number, t: number) => `${f2(g.cx + r * Math.cos(t))} ${f2(g.cy + r * Math.sin(t))}`
  const L = b - a > Math.PI ? 1 : 0
  return `M${pt(r1, a)}A${f2(r1)} ${f2(r1)} 0 ${L} 1 ${pt(r1, b)}L${pt(r0, b)}A${f2(r0)} ${f2(r0)} 0 ${L} 0 ${pt(r0, a)}Z`
}

/** The poster's ring (faint) and wedge (solid) paths. */
export function rings(g: Geo): { ring: string; wedge: string } {
  return { ring: sector(g, A1 + GAP, A0 + TAU - GAP, g.r0, g.R), wedge: sector(g, A0, A1, g.r0 - g.pop, g.R + g.pop) }
}

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) / 2)

export interface Genome {
  canvas: HTMLCanvasElement
  /** Render progress p (0…1). */
  draw(p: number): void
  /** Re-measure the box (after a resize) and redraw. */
  size(): void
  /** Re-read --kl-accent / --kl-accent-soft / --kl-ghost (theme change) and redraw. */
  colors(): void
}

export function createGenome(box: HTMLElement, g: Geo, onCount?: (n: number) => void): Genome | null {
  const cv = document.createElement('canvas')
  const ctx = cv.getContext('2d')
  if (!ctx) return null
  cv.setAttribute('aria-hidden', 'true')
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'

  const { cols, rows, pitch, din } = g
  const N = cols * rows
  const FILL = 0.42                    // ledger complete
  const D = 0.18                       // flight time of one dot (in p)
  const F0 = 0.58, SPREAD = 0.22       // first → last column takes off
  const gx = new Float32Array(N), gy = new Float32Array(N)
  const sx = new Float32Array(N), sy = new Float32Array(N), dl = new Float32Array(N)
  const ri = g.r0 - g.pop + din + 0.5, ro = g.R + g.pop - din - 0.5
  for (let i = 0; i < N; i++) {
    const c = (i / rows) | 0, r = i % rows
    gx[i] = (c + 0.5) * pitch
    gy[i] = (r + 0.5) * pitch
    // Fibonacci lattice in the sector: angle by index (clockwise fill), radius area-uniform.
    const u = (i * 0.6180339887 + 0.31) % 1
    const rad = Math.sqrt(ri * ri + (ro * ro - ri * ri) * u)
    const pad = (din + 0.5) / rad
    const t = A0 + pad + (A1 - A0 - 2 * pad) * ((i + 0.5) / N)
    sx[i] = g.cx + rad * Math.cos(t)
    sy[i] = g.cy + rad * Math.sin(t)
    dl[i] = F0 + (c / (cols - 1)) * SPREAD + (r / rows) * 0.012
  }

  let dot = '#2563eb', soft = 'rgba(37,99,235,.1)', ghostA = 0.3
  let w = 0, k = 1, last = 0, count = -1

  function arc(a: number, b: number, r0 = g.r0, r1 = g.R) {
    ctx!.beginPath()
    ctx!.arc(g.cx, g.cy, r1, a, b, false)
    ctx!.arc(g.cx, g.cy, r0, b, a, true)
    ctx!.closePath()
    ctx!.fill()
  }

  function draw(p: number) {
    last = p
    if (!w) return
    const c2 = ctx!
    c2.setTransform(k, 0, 0, k, 0, 0)
    c2.clearRect(0, 0, g.W, g.H)
    c2.fillStyle = soft
    const tr = inOut(clamp((p - 0.55) / 0.2))
    if (tr > 0) arc(A1 + GAP, A1 + GAP + (TAU - (A1 - A0) - 2 * GAP) * tr)
    c2.fillStyle = dot
    const tw = clamp((p - 0.88) / 0.1)
    if (tw > 0) { c2.globalAlpha = tw; arc(A0, A1, g.r0 - g.pop, g.R + g.pop); c2.globalAlpha = 1 }

    const filled = Math.round(clamp(p / FILL) * cols)
    const n = filled * rows
    if (onCount && n !== count) { count = n; onCount(n) }
    const ghost = new Path2D(), solid = new Path2D(), fly = new Path2D()
    const r1 = g.dot
    for (let i = 0; i < N; i++) {
      const t = clamp((p - dl[i]) / D)
      if (t === 0 && (i / rows | 0) < filled) { solid.moveTo(gx[i] + r1, gy[i]); solid.arc(gx[i], gy[i], r1, 0, TAU) }
      else { ghost.moveTo(gx[i] + r1, gy[i]); ghost.arc(gx[i], gy[i], r1, 0, TAU) }
      if (t > 0) {
        // A shallow arc (control point level with the cell, halfway across): x moves evenly, y falls late.
        const e = inOut(t)
        const x = gx[i] + (sx[i] - gx[i]) * e, y = gy[i] + (sy[i] - gy[i]) * e * e, rr = r1 + (din - r1) * e
        fly.moveTo(x + rr, y); fly.arc(x, y, rr, 0, TAU)
      }
    }
    c2.globalAlpha = ghostA
    c2.fill(ghost)
    c2.globalAlpha = 1
    c2.fill(solid)
    c2.fill(fly)
  }

  function size() {
    w = box.clientWidth
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = Math.round(w * dpr)
    cv.height = Math.round(box.clientHeight * dpr)
    k = (w / g.W) * dpr
    draw(last)
  }

  function colors() {
    const cs = getComputedStyle(box)
    dot = cs.getPropertyValue('--kl-accent').trim() || dot
    soft = cs.getPropertyValue('--kl-accent-soft').trim() || soft
    ghostA = parseFloat(cs.getPropertyValue('--kl-ghost')) || ghostA
    draw(last)
  }

  box.appendChild(cv)
  colors()
  size()
  return { canvas: cv, draw, size, colors }
}
