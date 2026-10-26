// lib/derive.ts — pure helpers derived from home.content.ts (spec §6.2, v2).
// Erasable TypeScript only: Node >= 22.18 imports this file directly (type stripping) from scripts/,
// so type-only imports MUST use `import type` and the content import keeps its `.ts` extension.
import type { Region, RegionId, Paper, ChapterId, Chapter, Member, MemberId, LabelSide } from '../home.content.ts'
import { REGIONS, PAPERS, CHAPTERS, MEMBERS, LED_ROLES } from '../home.content.ts'

/** Mark glyph types shared by every map (spec §4.3). In v2 'led', 'co' and 'presentDay' look the same. */
export type MarkType = 'led' | 'co' | 'presentDay' | 'home' | 'endpoint' | 'area'

// Lookup tables. `byId` + /* @__PURE__ */ let Rollup drop the tables (and the arrays they index) when unused.
function byId<T extends { id: string }>(list: T[]): Record<string, T> {
  return Object.fromEntries(list.map((x) => [x.id, x]))
}
export const regionById = /* @__PURE__ */ byId(REGIONS) as Record<RegionId, Region>
export const paperById: Record<string, Paper> = /* @__PURE__ */ byId(PAPERS)
export const chapterById = /* @__PURE__ */ byId(CHAPTERS) as Record<ChapterId, Chapter>
export const memberById = /* @__PURE__ */ byId(MEMBERS) as Record<MemberId, Member>

/** Lab-led paper: first | coFirst | senior | coSupervisor (data only in v2). */
export function isLed(p: Paper): boolean {
  return LED_ROLES.includes(p.role)
}

/** Mark type of a region: from its kind, and for study regions from the most-led paper touching it. */
export function regionMarkType(id: RegionId): MarkType {
  const r = regionById[id]
  if (!r) throw new Error(`regionMarkType: unknown region "${id}"`)
  if (r.kind === 'home') return 'home'
  if (r.kind === 'endpoint') return 'endpoint'
  if (r.kind === 'area') return 'area'
  if (r.kind === 'presentDay') return 'presentDay'
  return PAPERS.some((p) => p.regions.includes(id) && isLed(p)) ? 'led' : 'co'
}

/** The highlight cards of a chapter, newest first (ties keep data order). Today: 2 · 2 · 2 · 1 · 1. */
export function chapterHighlights(id: ChapterId): Paper[] {
  return PAPERS.filter((p) => p.chapter === id && p.highlight).sort((a, b) => b.year - a.year)
}

export function doiUrl(doi: string): string {
  return 'https://doi.org/' + doi
}

/**
 * Split a line around a key phrase (for the H1 gradient): splitKey('从古DNA中，', '古DNA') →
 * ['从', '古DNA', '中，']; a line without the key → [line, '', ''].
 */
export function splitKey(line: string, key: string): [string, string, string] {
  const i = key ? line.indexOf(key) : -1
  return i < 0 ? [line, '', ''] : [line.slice(0, i), key, line.slice(i + key.length)]
}

/**
 * Factor pair of n (cols >= rows) whose cols/rows is closest (in log ratio) to aspect.
 * gridDims(1001, 8) → 91×11; gridDims(1001, 6) → 77×13.
 */
export function gridDims(n: number, aspect: number): { cols: number; rows: number } {
  let best = { cols: n, rows: 1 }
  let bestErr = Infinity
  for (let rows = 1; rows * rows <= n; rows++) {
    if (n % rows) continue
    const cols = n / rows
    const err = Math.abs(Math.log(cols / rows) - Math.log(aspect))
    if (err < bestErr) { bestErr = err; best = { cols, rows } }
  }
  return best
}

/** Deterministic PRNG (mulberry32). Use instead of Math.random() anywhere near render. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** '{n}' templating: fill('{n} studies', { n: 4 }) → '4 studies'. Unknown keys are left as-is. */
export function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}

/**
 * Label placement for map labels drawn in CSS px inside a mark's scaled group (MapMark / MapArea / custom).
 * `off` = distance from the mark centre in CSS px. Returns x/y offsets, text-anchor and a dy (em) that
 * vertically centres (e/w), hangs below (s*) or sits on the baseline above (n*).
 */
export function labelOffset(side: LabelSide = 'e', off = 13): { x: number; y: number; anchor: 'start' | 'middle' | 'end'; dy: string } {
  const d = Math.round(off * 0.75 * 10) / 10
  switch (side) {
    case 'n': return { x: 0, y: -off, anchor: 'middle', dy: '0' }
    case 's': return { x: 0, y: off, anchor: 'middle', dy: '0.8em' }
    case 'w': return { x: -off, y: 0, anchor: 'end', dy: '0.35em' }
    case 'ne': return { x: d, y: -d, anchor: 'start', dy: '0' }
    case 'nw': return { x: -d, y: -d, anchor: 'end', dy: '0' }
    case 'se': return { x: d, y: d, anchor: 'start', dy: '0.8em' }
    case 'sw': return { x: -d, y: d, anchor: 'end', dy: '0.8em' }
    default: return { x: off, y: 0, anchor: 'start', dy: '0.35em' }
  }
}
