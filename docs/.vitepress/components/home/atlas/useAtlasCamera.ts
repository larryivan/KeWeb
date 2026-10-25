// atlas/useAtlasCamera.ts — the Findings camera (ATLAS).
//
// Pure part (also used for the SSR mini-maps): which regions a stop focuses on, a label-aware camera fit
// (viewBox + a label side per focus region so every label stays inside the frame and off the other marks),
// and a smooth pan-and-zoom path between two views (van Wijk & Nuij, as in d3-interpolate's interpolateZoom).
//
// Composable part (desktop stage only): an IntersectionObserver on the [data-stop] blocks picks the active
// stop (the one crossing the middle 10 % of the viewport); the camera then glides there with GSAP
// (1.0 s, power3.inOut) or jumps there at once when motion is off / GSAP is not loaded. While the stage's
// first-view reveal plays, the camera holds the overview and glides on once it is done. It never needs GSAP
// to work, and never calls requestAnimationFrame itself.
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import type { Ref } from 'vue'
import type { ChapterId, LabelSide, RegionId } from '../home.content.ts'
import { CHAPTERS, REGIONS } from '../home.content.ts'
import { chapterById, labelOffset, regionById, regionMarkType } from '../lib/derive.ts'
import { fitViewBox } from '../lib/camera.js'
import { useMotion, useScene } from '../lib/useMotion.ts'
import type { SceneApi } from '../lib/useMotion.ts'

export type ViewBox = [number, number, number, number]
export type StopId = 'intro' | ChapterId | 'home'
/** A label side, or 'in': inside a large area, hanging from its top edge. */
export type Side = LabelSide | 'in'
export type Sides = Partial<Record<RegionId, Side>>

/** The geometry the camera needs from atlas.data (passed in, so this file stays importable from Node). */
export interface AtlasGeo {
  w: number
  h: number
  xy: Record<RegionId, [number, number]>
  areas: Partial<Record<RegionId, [number, number]>>
  chapterBox: Record<string, [number, number, number, number]>
}

export const STOPS: StopId[] = ['intro', ...CHAPTERS.map((c) => c.id), 'home']

export function focusOf(stop: StopId | null): RegionId[] {
  if (!stop || stop === 'intro') return []
  if (stop === 'home') return ['shanghai']
  return chapterById[stop].focus
}

// ------------------------------------------------------------------------------------ label geometry
interface Rect { x0: number; y0: number; x1: number; y1: number }

const CJK = /[⺀-鿿豈-﫿＀-￯]/
/** Rough label width in px (Inter 600 / system CJK); replaced by a measured width on the client. */
export function textWidth(s: string, fs: number): number {
  let w = 0
  for (const ch of s) {
    if (CJK.test(ch)) w += fs
    else if (ch === ' ') w += fs * 0.27
    else if (/[A-Z]/.test(ch)) w += fs * 0.68
    else if (/[ilt.,'·’]/.test(ch)) w += fs * 0.33
    else if (/[mw]/.test(ch)) w += fs * 0.86
    else w += fs * 0.57
  }
  return w
}

const EDGE: Record<LabelSide, [number, number]> = {
  n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0],
  ne: [0.7071, -0.7071], nw: [-0.7071, -0.7071], se: [0.7071, 0.7071], sw: [-0.7071, 0.7071],
}
/** Extra px between an (active, 1.25x) mark and its label on the stage (AtlasStage shifts its labels). */
export const LABEL_AIR = 4
/** 'in' labels hang this far (px) below the area's top edge… */
export const IN_Y = 8
/** …and only when no other mark sits within this many px of them. */
const IN_CLEAR = 22
const OPP: Record<LabelSide, LabelSide> = { n: 's', s: 'n', e: 'w', w: 'e', ne: 'sw', sw: 'ne', nw: 'se', se: 'nw' }
const ORDER: LabelSide[] = ['e', 'w', 'n', 's', 'ne', 'se', 'nw', 'sw']

/** Context endpoints (Steppe, Central Plains, …) carry a smaller label than the study sites. */
const fsOf = (id: RegionId, fs: number) => (regionMarkType(id) === 'endpoint' ? fs - 1 : fs)

/** Map y (units) an 'in' label hangs from: the area's top edge, or the top of the land frame if it reaches past it. */
export function inTop(id: RegionId, A: AtlasGeo): number {
  return Math.max(A.xy[id][1] - (A.areas[id]?.[1] ?? 0), 0)
}

/** Glyph half-size in px (active marks are scaled 1.25). */
function glyphR(id: RegionId): number {
  const t = regionMarkType(id)
  return t === 'home' ? 16 : t === 'endpoint' ? 4 : t === 'area' ? 0 : 13
}

/** The label box of region `id` with side `side`, in px relative to the map point `anchor` returns. */
function labelGeom(id: RegionId, side: Side, tw: number, fs: number, A: AtlasGeo, air: number): { ax: number; ay: number; r: Rect } {
  const t = regionMarkType(id)
  let [ax, ay] = A.xy[id]
  if (side === 'in') return { ax, ay: inTop(id, A), r: { x0: -tw / 2 - 2, x1: tw / 2 + 2, y0: IN_Y - 2, y1: IN_Y + 1.02 * fs + 2 } }
  let off: number
  if (t === 'area') {
    const [rx, ry] = A.areas[id] ?? [0, 0]
    ax += EDGE[side][0] * rx
    ay += EDGE[side][1] * ry
    off = 6
  } else off = (t === 'endpoint' ? 7 : t === 'home' ? 17.5 : 15) + air
  const o = labelOffset(side, off)
  const x0 = o.anchor === 'start' ? o.x : o.anchor === 'end' ? o.x - tw : o.x - tw / 2
  const base = o.y + (o.dy === '0.35em' ? 0.35 : o.dy === '0.8em' ? 0.8 : 0) * fs
  return { ax, ay, r: { x0: x0 - 2, x1: x0 + tw + 2, y0: base - 0.8 * fs - 2, y1: base + 0.22 * fs + 2 } }
}

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))
const grow = (r: Rect, d: number): Rect => ({ x0: r.x0 - d, x1: r.x1 + d, y0: r.y0 - d, y1: r.y1 + d })

/** Share (0–.5) of a label box lying across an ellipse's outline: 0 = fully inside or fully outside. */
function straddle(r: Rect, cx: number, cy: number, rx: number, ry: number): number {
  let inside = 0
  for (let i = 0; i <= 6; i++) for (let j = 0; j <= 2; j++) {
    const x = r.x0 + ((r.x1 - r.x0) * i) / 6, y = r.y0 + ((r.y1 - r.y0) * j) / 2
    if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1) inside++
  }
  return Math.min(inside, 21 - inside) / 21
}

export interface FitOpts {
  /** Frame size in CSS px. */
  w: number
  h: number
  /** Label text of a region (current locale). */
  text: (id: RegionId) => string
  /** Measured label width in px, when known (client). */
  measured?: (id: RegionId) => number | undefined
  /** Label font size in px. */
  fs?: number
  /** Minimum px margin between the focus marks and the frame. */
  mx?: number
  my?: number
  /** Labels must stay this far inside the frame (px), clear of the frame's soft edge. */
  inset?: number
  /** Deepest zoom (map widths per frame width); default ZOOM_MAX (ZOOM_STOP for a few stops). */
  zoomMax?: number
  /** Extra px between a mark and its label (the stage scales active marks 1.25 and steps labels out). */
  air?: number
  /** Whether context endpoints (Steppe, Central Plains, …) carry a label (default true). */
  endpoints?: boolean
}

export interface Fit {
  vb: ViewBox
  sides: Sides
  k: number
  /** Dimmed context marks that would still sit on the frame's edge: fade them out. */
  hidden: RegionId[]
}

/** Deepest chapter zoom: at 2.4 map widths per frame the dot land still draws recognisable coasts. */
export const ZOOM_MAX = 2.4
/** Europe's three sites sit close together: a closer view (still a readable Alps–Adriatic–Balkans frame). */
const ZOOM_STOP: Partial<Record<StopId, number>> = { europe: 3.4 }
/** Soft areas keep this much px air to the frame (point marks keep mx/my). */
const AREA_PAD = 22

/** Dimmed context marks sit at least this far (px) inside the frame, or fully outside it. */
const EDGE_GAP = 36
/** How far (map units) a chapter view may show sea/sky beyond the land frame before it looks cropped. */
const SEA = 8

/** Move v (centred) into [lmin, lmax] as far as the content allows ([cmin, cmax]). */
function keep(v: number, cmin: number, cmax: number, lmin: number, lmax: number): number {
  if (cmin > cmax) return (cmin + cmax) / 2
  const t = lmin <= lmax ? Math.min(Math.max(v, lmin), lmax) : v
  return Math.min(Math.max(t, cmin), cmax)
}

/**
 * Camera for a stop: the deepest zoom (<= zoomMax) at which the focus marks keep their margins and every
 * focus label finds a side that stays inside the frame without covering another label or mark. The view is
 * then centred on marks + labels, kept on the land (no empty sky beyond the map's edge), and nudged so no
 * dimmed context mark is cut in half by the frame. 'intro' = the whole map.
 */
export function fitStop(stop: StopId | null, A: AtlasGeo, o: FitOpts): Fit {
  const { w, h } = o
  const aspect = w / h
  if (!stop || stop === 'intro') return { vb: fitViewBox(A.chapterBox.all, aspect, { pad: 0.03, minW: 0 }) as ViewBox, sides: {}, k: w / (A.w * 1.06), hidden: [] }
  const fs = o.fs ?? 13, mx = o.mx ?? 64, my = o.my ?? 40, inset = o.inset ?? 16, air = o.air ?? LABEL_AIR
  const focus = focusOf(stop)
  const isArea = (id: RegionId) => regionMarkType(id) === 'area'
  const kMax = w / (A.w / (o.zoomMax ?? ZOOM_STOP[stop] ?? ZOOM_MAX))
  const widths = new Map(focus.map((id) => [id, o.measured?.(id) || textWidth(o.text(id), fsOf(id, fs))]))
  const areaIds = focus.filter(isArea)
  // Most important labels first: study marks west → east, then the soft areas, then endpoints.
  const rank = (id: RegionId) => ({ home: 0, led: 1, co: 1, presentDay: 1, area: 2, endpoint: 3 }[regionMarkType(id)])
  const order = focus.filter((id) => o.endpoints !== false || regionMarkType(id) !== 'endpoint')
    .sort((a, b) => rank(a) - rank(b) || A.xy[a][0] - A.xy[b][0])
  const unnamed = new Set(focus.filter((id) => !isArea(id) && !order.includes(id)))

  // Content in map units + px padding: point marks keep (mx, my); soft areas keep AREA_PAD. An area reaching
  // past the top of the land frame may be cut there (rather than framing empty sky above the map).
  const items = focus.map((id) => {
    const [x, y] = A.xy[id]
    const [rx, ry] = isArea(id) ? A.areas[id] ?? [0, 0] : [0, 0]
    const [px, py] = isArea(id) ? [AREA_PAD, AREA_PAD] : [mx, my]
    return { x0: x - rx, x1: x + rx, y0: Math.max(y - ry, -SEA), y1: y + ry, px, py }
  })
  const span = (k: number): Rect => {
    const r = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }
    for (const it of items) {
      r.x0 = Math.min(r.x0, it.x0 * k - it.px); r.x1 = Math.max(r.x1, it.x1 * k + it.px)
      r.y0 = Math.min(r.y0, it.y0 * k - it.py); r.y1 = Math.max(r.y1, it.y1 * k + it.py)
    }
    return r
  }
  const fitsAt = (k: number) => { const r = span(k); return r.x1 - r.x0 <= w && r.y1 - r.y0 <= h }
  let k = kMax
  if (!fitsAt(k)) {
    let lo = w / (A.w * 3), hi = kMax
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (fitsAt(m)) lo = m; else hi = m }
    k = lo
  }

  // Zoom out step by step until every label fits; if none does, keep the closest view that is clearly the least
  // crowded (zooming out frees the frame's edges but packs the marks closer).
  let best: Fit | null = null
  let bestBad = Infinity
  for (let iter = 0; iter < 14; iter++) {
    // Frame centred on the content, kept on the land as far as the content allows.
    const c = span(k)
    const x0 = keep((c.x0 + c.x1 - w) / 2 / k, (c.x1 - w) / k, c.x0 / k, -SEA, A.w + SEA - w / k)
    const y0 = keep((c.y0 + c.y1 - h) / 2 / k, (c.y1 - h) / k, c.y0 / k, -SEA, A.h + SEA - h / k)
    const P = (x: number, y: number): [number, number] => [(x - x0) * k, (y - y0) * k]
    const glyphs: Rect[] = focus.map((id) => {
      const [px, py] = P(...A.xy[id]); const r = glyphR(id)
      return { x0: px - r, x1: px + r, y0: py - r, y1: py + r }
    })
    const ells = areaIds.map((id) => { const [cx, cy] = P(...A.xy[id]); const [rx, ry] = A.areas[id]!; return { cx, cy, rx: rx * k, ry: ry * k } })
    const candsOf = (id: RegionId): Side[] => {
      const def = (regionById[id].labelSide ?? (isArea(id) ? 'n' : 'e')) as LabelSide
      const cands: Side[] = [def, OPP[def], ...ORDER.filter((s) => s !== def && s !== OPP[def])]
      // A large area may carry its label inside, under its top edge (second choice), when no mark sits close
      // under it (a study mark inside the area keeps its own label clear of the area's).
      const ar = A.areas[id]
      if (ar && 2 * ar[1] * k >= 4 * fs && 2 * ar[0] * k >= widths.get(id)! + 48) {
        const g = labelGeom(id, 'in', widths.get(id)!, fs, A, air)
        const [px, py] = P(g.ax, g.ay)
        const zone = grow({ x0: px + g.r.x0, x1: px + g.r.x1, y0: py + g.r.y0, y1: py + g.r.y1 }, IN_CLEAR)
        if (glyphs.every((q, j) => focus[j] === id || isArea(focus[j]) || !overlap(zone, q))) cands.splice(1, 0, 'in')
      }
      return cands
    }
    /** The best side for a label given the labels already placed. */
    const choose = (id: RegionId, cands: Side[], others: Rect[]) => {
      let p: { s: Side; r: Rect; score: number; hard: number } = { s: cands[0], r: { x0: 0, y0: 0, x1: 0, y1: 0 }, score: Infinity, hard: 0 }
      for (let i = 0; i < cands.length; i++) {
        const s = cands[i]
        const g = labelGeom(id, s, widths.get(id)!, fsOf(id, fs), A, air)
        const [px, py] = P(g.ax, g.ay)
        const r = { x0: px + g.r.x0, x1: px + g.r.x1, y0: py + g.r.y0, y1: py + g.r.y1 }
        const out = Math.max(0, inset - r.x0) + Math.max(0, r.x1 - (w - inset)) + Math.max(0, inset - r.y0) + Math.max(0, r.y1 - (h - inset))
        // Hard: 3px of clearance from other labels and marks. Soft: some air (8px) around other labels, and
        // no label lying across an area's outline.
        const rr = grow(r, 3), r8 = grow(r, 8)
        let lab = 0, near = 0
        for (const q of others) { lab += overlap(rr, q); near += overlap(r8, q) }
        let gl = 0, mute = 0
        for (let j = 0; j < focus.length; j++) {
          if (focus[j] === id) continue
          if (unnamed.has(focus[j])) mute += overlap(rr, glyphs[j]) // an unlabelled endpoint dot may go under a label
          else gl += overlap(rr, glyphs[j])
        }
        let cross = 0
        for (const e of ells) cross += straddle(r, e.cx, e.cy, e.rx, e.ry)
        const hard = out * 40 + lab + gl
        const score = hard + i * 3 + near / 24 + cross * 80 + mute / 4
        if (score < p.score) p = { s, r, score, hard }
      }
      return p
    }
    // Greedy, most important label first; then two rounds in which each label may move given all the others.
    const cands = new Map(order.map((id) => [id, candsOf(id)]))
    const pick = new Map<RegionId, ReturnType<typeof choose>>()
    for (const id of order) pick.set(id, choose(id, cands.get(id)!, [...pick.values()].map((q) => q.r)))
    for (let round = 0; round < 2; round++) {
      for (const id of order) {
        const others = order.filter((q) => q !== id).map((q) => pick.get(q)!.r)
        pick.set(id, choose(id, cands.get(id)!, others))
      }
    }
    const sides: Sides = {}
    const placed: Rect[] = []
    let bad = 0
    for (const id of order) { const q = pick.get(id)!; sides[id] = q.s; placed.push(q.r); bad += q.hard }
    const fits = bad < 1
    if (!fits && best && bad > bestBad / 2) { k *= 0.9; continue }

    // Final framing. Hard content (marks + labels) must stay `inset` inside; areas only inside.
    // (focus marks keep room for their glow, within the margins the zoom was chosen with)
    const gx = Math.max(0, Math.min(21, mx - 13 - inset)), gy = Math.max(0, Math.min(21, my - 13 - inset))
    const hard = [...placed, ...glyphs.filter((_, j) => !isArea(focus[j])).map((g) => ({ x0: g.x0 - gx, x1: g.x1 + gx, y0: g.y0 - gy, y1: g.y1 + gy }))]
    const soft = areaIds.map((id) => { const [x, y] = P(...A.xy[id]); const [rx, ry] = A.areas[id]!; return { x0: x - rx * k, x1: x + rx * k, y0: Math.max(y - ry * k, P(0, -SEA)[1]), y1: y + ry * k } })
    const U = (rs: Rect[]) => ({ x0: Math.min(...rs.map((r) => r.x0)), x1: Math.max(...rs.map((r) => r.x1)), y0: Math.min(...rs.map((r) => r.y0)), y1: Math.max(...rs.map((r) => r.y1)) })
    const H = U(hard), S = soft.length ? U(soft) : H, all = U([H, S])
    // Allowed frame shift (px) keeping the content inside.
    let ax0 = Math.max(H.x1 - (w - inset), S.x1 - w), ax1 = Math.min(H.x0 - inset, S.x0)
    let ay0 = Math.max(H.y1 - (h - inset), S.y1 - h), ay1 = Math.min(H.y0 - inset, S.y0)
    let dx = keep((all.x0 + all.x1 - w) / 2, ax0, ax1, (-SEA - x0) * k, (A.w + SEA - w / k - x0) * k)
    let dy = keep((all.y0 + all.y1 - h) / 2, ay0, ay1, (-SEA - y0) * k, (A.h + SEA - h / k - y0) * k)
    // No context mark half-cut by the frame: take the nearest shift (up to a tenth of the frame) that leaves
    // every dimmed mark clearly inside or fully outside; marks still on the edge after that fade out (hidden).
    const ctxIds = REGIONS.filter((r) => !focus.includes(r.id) && !isArea(r.id)).map((r) => r.id)
    const ctx = ctxIds.map((id) => P(...A.xy[id]))
    const clear = (d: number, axis: 0 | 1, other: number, size: number, osize: number, lo: number, hi: number): number => {
      const bad: Array<[number, number]> = []
      for (const m of ctx) {
        const o = m[1 - axis] - other
        if (o <= -EDGE_GAP || o >= osize + EDGE_GAP) continue // off-frame on the other axis
        const p = m[axis]
        bad.push([p - EDGE_GAP, p + EDGE_GAP], [p - size - EDGE_GAP, p - size + EDGE_GAP])
      }
      const ok = (v: number) => v >= lo && v <= hi && bad.every(([a, b]) => v <= a || v >= b)
      if (ok(d)) return d
      let best = d, gap = size * 0.1
      for (const v of bad.flat()) if (ok(v) && Math.abs(v - d) < gap) { gap = Math.abs(v - d); best = v }
      return best
    }
    dx = clear(dx, 0, dy, w, h, ax0, ax1)
    dy = clear(dy, 1, dx, h, w, ay0, ay1)
    dx = clear(dx, 0, dy, w, h, ax0, ax1)
    const near = (p: number, size: number) => p > -EDGE_GAP && p < size + EDGE_GAP && (p < EDGE_GAP || p > size - EDGE_GAP)
    const inside = (p: number, size: number) => p > -EDGE_GAP && p < size + EDGE_GAP
    // …and none under a label.
    const hidden = ctxIds.filter((_, i) => {
      const x = ctx[i][0] - dx, y = ctx[i][1] - dy
      const [cx, cy] = ctx[i], g = { x0: cx - 9, x1: cx + 9, y0: cy - 9, y1: cy + 9 }
      return (near(x, w) && inside(y, h)) || (near(y, h) && inside(x, w)) || placed.some((q) => overlap(g, q) > 0)
    }).concat([...unnamed].filter((id) => { const g = glyphs[focus.indexOf(id)]; return placed.some((q) => overlap(g, q) > 0) }))
    best = { vb: [x0 + dx / k, y0 + dy / k, w / k, h / k], sides, k, hidden }
    bestBad = bad
    if (fits) break
    k *= 0.9
  }
  return best!
}

/** Where the Shanghai mark sits in a frame showing `vb`, as a CSS position (for the radial reveal). */
export function originOf(vb: ViewBox, A: AtlasGeo): string {
  return pctOf(A.xy.shanghai, vb)
}

/** The centre of a stop's regions in a frame showing `vb`, as a CSS position (the stage's soft glow). */
export function glowOf(stop: StopId, vb: ViewBox, A: AtlasGeo): string {
  const ids = stop === 'intro' ? (['shanghai'] as RegionId[]) : focusOf(stop)
  const pts = ids.map((id) => A.xy[id])
  return pctOf([pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length], vb)
}

function pctOf([x, y]: [number, number], vb: ViewBox): string {
  const c = (v: number) => Math.round(Math.min(100, Math.max(0, v)) * 10) / 10
  return `${c(((x - vb[0]) / vb[2]) * 100)}% ${c(((y - vb[1]) / vb[3]) * 100)}%`
}

// ------------------------------------------------------------------------------------ smooth zoom path
/**
 * Pan-and-zoom path between two views [cx, cy, width] (van Wijk & Nuij 2003, the interpolateZoom of
 * d3-interpolate). rho < √2 keeps the zoom-out on long hops gentle.
 */
export function zoomPath(p0: [number, number, number], p1: [number, number, number], rho = 1.2): (t: number) => [number, number, number] {
  const [ux0, uy0, w0] = p0
  const [ux1, uy1, w1] = p1
  const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy
  const rho2 = rho * rho, rho4 = rho2 * rho2
  if (d2 < 1e-9) {
    const S = Math.log(w1 / w0) / rho
    return (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)]
  }
  const d1 = Math.sqrt(d2)
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1)
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1)
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0)
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1)
  const S = (r1 - r0) / rho
  const ch0 = Math.cosh(r0), sh0 = Math.sinh(r0)
  return (t) => {
    if (t >= 1) return [ux1, uy1, w1]
    const s = t * S
    const u = (w0 / (rho2 * d1)) * (ch0 * Math.tanh(rho * s + r0) - sh0)
    return [ux0 + u * dx, uy0 + u * dy, (w0 * ch0) / Math.cosh(rho * s + r0)]
  }
}

// ------------------------------------------------------------------------------------ composable
/** What the camera needs from the stage's MapBase (its exposed API). */
export interface MapApi {
  setViewBox(vb: ViewBox): void
  getViewBox(): ViewBox
  size(): { w: number; h: number }
  svgEl: SVGSVGElement | null
}

export interface CameraOpts {
  /** The element holding the [data-stop] blocks (the atlas grid). */
  root: Ref<HTMLElement | null>
  /** The stage element (sticky panel). */
  stage: Ref<HTMLElement | null>
  /** The stage's MapBase API (null until mounted). */
  map: () => MapApi | null
  atlas: AtlasGeo
  text: (id: RegionId) => string
  fs?: number
}

/** How long the camera holds the overview once the stage's reveal has started (ms). */
const REVEAL_HOLD = 1400

export function useAtlasCamera(o: CameraOpts) {
  const motion = useMotion()
  /** The stop the camera shows ('intro' = the whole map). */
  const active = ref<StopId>('intro')
  /** Label side per region on the stage (only focus regions show labels). */
  const sides = shallowRef<Sides>({})
  /** Context marks faded out at the current stop (they would sit on the frame's edge). */
  const hidden = shallowRef<RegionId[]>([])
  const vbIntro = fitStop('intro', o.atlas, { w: 1, h: 1, text: o.text }).vb
  /** Shanghai's position on the stage, for the radial reveal. */
  const origin = ref(originOf(vbIntro, o.atlas))
  /** Where the stage's soft glow sits (the current stop's regions). */
  const glow = ref(glowOf('intro', vbIntro, o.atlas))

  let gsap: SceneApi['gsap'] | null = null
  let tween: { kill(): void } | null = null
  let target: ViewBox | null = null
  let refit = false
  const widths = new Map<RegionId, number>()

  useScene(o.stage, (api) => {
    gsap = api.gsap
    return () => {
      gsap = null
      settle()
    }
  })

  function settle() {
    tween?.kill()
    tween = null
    const m = o.map()
    if (m && target) m.setViewBox(target)
  }

  function measure() {
    const svg = o.map()?.svgEl
    if (!svg) return
    for (const g of svg.querySelectorAll<SVGGElement>('[data-r]')) {
      const t = g.querySelector<SVGTextContentElement>('.kl-map-label')
      const len = t?.getComputedTextLength?.() ?? 0
      if (len > 0) widths.set(g.dataset.r as RegionId, len)
    }
  }

  const same = (a: ViewBox, b: ViewBox) => a.every((v, i) => Math.abs(v - b[i]) < 0.5)

  function go(stop: StopId, animate: boolean) {
    const m = o.map()
    if (!m) return
    const { w, h } = m.size()
    if (!w || !h) return
    const fit = fitStop(stop, o.atlas, { w, h, text: o.text, measured: (id) => widths.get(id), fs: o.fs })
    active.value = stop
    sides.value = { ...sides.value, ...fit.sides }
    hidden.value = fit.hidden
    glow.value = glowOf(stop, fit.vb, o.atlas)
    const svg = m.svgEl
    if (!svg?.closest('.is-in')) origin.value = originOf(fit.vb, o.atlas)
    if (tween && target && same(target, fit.vb)) return // already gliding there
    target = fit.vb
    tween?.kill()
    tween = null
    if (!animate || !gsap || !motion.enabled.value || same(m.getViewBox(), fit.vb)) {
      m.setViewBox(fit.vb)
      return
    }
    const from = m.getViewBox()
    const a = w / h
    const path = zoomPath([from[0] + from[2] / 2, from[1] + from[3] / 2, from[2]], [fit.vb[0] + fit.vb[2] / 2, fit.vb[1] + fit.vb[3] / 2, fit.vb[2]])
    const p = { t: 0 }
    tween = gsap.to(p, {
      t: 1,
      duration: 1.0,
      ease: 'power3.inOut',
      onUpdate: () => {
        const [cx, cy, vw] = path(p.t)
        const vh = vw / a
        m.setViewBox([cx - vw / 2, cy - vh / 2, vw, vh])
      },
      onComplete: () => {
        tween = null
        // Labels measured mid-glide (late web font): refit now, gliding if the frame moved.
        if (refit) { refit = false; go(active.value, true) }
      },
    })
  }

  let io: IntersectionObserver | null = null
  let ro: ResizeObserver | null = null
  let mo: MutationObserver | null = null
  let mq: MediaQueryList | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  /** Glides wait until then (the stage's first-view reveal). */
  let holdUntil = 0
  /** The stop the reader is at (the camera follows it, after the reveal). */
  let wanted: StopId = 'intro'
  const inBand = new Set<StopId>()
  const offs: Array<() => void> = []

  /** The stage has not been revealed yet (motion on, still below the fold): the camera keeps the overview. */
  const unrevealed = () => {
    const el = o.stage.value
    return !!el && el.classList.contains('kl-pre') && !el.classList.contains('is-in')
  }

  function follow() {
    clearTimeout(timer)
    timer = undefined
    if (wanted === active.value) return
    if (!motion.enabled.value) return go(wanted, false)
    if (unrevealed()) return // flushed by the reveal watcher
    const wait = holdUntil - performance.now()
    if (wait > 0) { timer = setTimeout(follow, wait); return }
    go(wanted, true)
  }

  function start() {
    const root = o.root.value
    if (!root || io) return
    measure()
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).dataset.stop as StopId
        if (e.isIntersecting) inBand.add(id)
        else inBand.delete(id)
      }
      let next: StopId | null = null
      for (const s of STOPS) if (inBand.has(s)) next = s
      if (next) { wanted = next; follow() }
    }, { rootMargin: '-45% 0px -45% 0px' })
    for (const el of root.querySelectorAll<HTMLElement>('[data-stop]')) io.observe(el)
    const st = o.stage.value
    if (st && typeof ResizeObserver !== 'undefined') {
      let seen = false
      ro = new ResizeObserver(() => {
        if (!seen) { seen = true; return } // the initial callback: nothing changed yet
        go(active.value, false)
      })
      ro.observe(st)
    }
    // First view: the map is revealed from Shanghai on the overview; the camera moves on once it has.
    if (st && unrevealed() && typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(() => {
        if (unrevealed()) return
        mo?.disconnect(); mo = null
        holdUntil = performance.now() + REVEAL_HOLD
        follow()
      })
      mo.observe(st, { attributes: true, attributeFilter: ['class'] })
    }
    go(active.value, false)
  }
  function stop() {
    io?.disconnect(); io = null
    ro?.disconnect(); ro = null
    mo?.disconnect(); mo = null
    clearTimeout(timer)
    inBand.clear()
  }

  onMounted(() => {
    mq = window.matchMedia('(min-width: 960px)')
    const sync = () => (mq!.matches ? start() : stop())
    mq.addEventListener('change', sync)
    offs.push(() => mq!.removeEventListener('change', sync))
    sync()
    // Labels are measured once the web font is in, then the current view is refitted (after a running glide).
    document.fonts?.ready.then(() => {
      if (!io) return
      measure()
      if (tween) refit = true
      else go(active.value, false)
    }).catch(() => {})
    offs.push(motion.onOff(() => { settle(); follow() }))
  })
  onBeforeUnmount(() => {
    stop()
    tween?.kill()
    for (const f of offs.splice(0)) f()
  })

  return { active, sides, hidden, origin, glow }
}
