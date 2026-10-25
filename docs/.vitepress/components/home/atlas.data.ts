// atlas.data.ts — VitePress data loader (spec §6.4). Runs in Node at build/dev time only:
// projects every region anchor, area and chapter bbox with the same frame as the land dots (v2 draws no link arcs).
// Client code imports `{ data }` from this file and receives plain JSON; d3-geo never reaches the client.
import { defineLoader } from 'vitepress'
import * as d3 from 'd3-geo'
import type { RegionId, ChapterId } from './home.content.ts'
import { REGIONS, CHAPTERS, PAPERS } from './home.content.ts'
import { LAND } from './land.generated.ts'
import { makeProjection } from './geo/frame.mjs'

export type Box = [number, number, number, number] // [x, y, w, h] in map units

export interface AtlasData {
  w: number; h: number
  xy: Record<RegionId, [number, number]>               // rounded to 0.1
  areas: Partial<Record<RegionId, [number, number]>>   // projected ellipse radii [rx, ry] for kind 'area'
  chapterBox: Record<ChapterId | 'home' | 'all', Box>  // bbox incl. area extents; home = Shanghai ±[25,18]; all = [0,0,w,h]
  heroXY: Record<ChapterId, [number, number]>
  popOrder: RegionId[]                                 // ascending great-circle distance from Shanghai
  shanghaiPct: [number, number]                        // Shanghai as % of w/h, for the radial reveal
}

declare const data: AtlasData
export { data }

const r1 = (n: number) => Math.round(n * 10) / 10
const CJK = /[⺀-鿿豈-﫿＀-￯]/

function guard(): void {
  const regionIds = new Set<string>(REGIONS.map((r) => r.id))
  const chapterIds = new Set<string>(CHAPTERS.map((c) => c.id))
  const errs: string[] = []
  const dup = (kind: string, ids: string[]) => {
    const seen = new Set<string>()
    for (const id of ids) { if (seen.has(id)) errs.push(`duplicate ${kind} id "${id}"`); seen.add(id) }
  }
  dup('region', REGIONS.map((r) => r.id)); dup('paper', PAPERS.map((p) => p.id))
  for (const p of PAPERS) {
    for (const r of p.regions) if (!regionIds.has(r)) errs.push(`paper ${p.id}: unknown region "${r}"`)
    if (p.chapter && !chapterIds.has(p.chapter)) errs.push(`paper ${p.id}: unknown chapter "${p.chapter}"`)
    if (p.highlight && (!p.doi || !p.headline || !p.chapter)) errs.push(`highlight paper ${p.id} needs doi, headline and chapter`)
    if (CJK.test(p.title)) errs.push(`paper ${p.id}: title must be the original English title (found CJK)`)
  }
  for (const c of CHAPTERS) {
    for (const r of c.focus) if (!regionIds.has(r)) errs.push(`chapter ${c.id}: unknown focus region "${r}"`)
  }
  for (const r of REGIONS) if (r.kind === 'area' && !r.radiusDeg) errs.push(`area region ${r.id} needs radiusDeg`)
  if (errs.length) throw new Error('[atlas.data] content errors:\n  - ' + errs.join('\n  - '))

  const g = globalThis as { __klAtlasWarned?: boolean }
  if (!g.__klAtlasWarned) {
    g.__klAtlasWarned = true
    const hl = PAPERS.filter((p) => p.highlight).length
    if (hl > 8) console.warn(`[atlas.data] ${hl} highlight papers (cap is 8)`)
    const v = REGIONS.filter((r) => r.verify).map((r) => r.id)
    if (v.length) console.warn(`[atlas.data] map anchors flagged verify (PI to confirm): ${v.join(', ')}`)
  }
}

export function buildAtlas(): AtlasData {
  guard()
  const w = LAND.w
  const h = LAND.h
  const p = makeProjection(d3, h)
  const proj = (ll: [number, number]): [number, number] => {
    const q = p(ll)
    if (!q) throw new Error(`[atlas.data] cannot project ${ll}`)
    return [r1(q[0]), r1(q[1])]
  }

  const xy = {} as Record<RegionId, [number, number]>
  const areas: Partial<Record<RegionId, [number, number]>> = {}
  for (const r of REGIONS) {
    xy[r.id] = proj(r.lonLat)
    if (r.kind === 'area' && r.radiusDeg) {
      const [lon, lat] = r.lonLat
      const [dl, dp] = r.radiusDeg
      const a = p([lon - dl, lat])!, b = p([lon + dl, lat])!
      const c = p([lon, lat + dp])!, d = p([lon, lat - dp])!
      areas[r.id] = [r1(Math.abs(b[0] - a[0]) / 2), r1(Math.abs(d[1] - c[1]) / 2)]
    }
  }

  const extent = (id: RegionId): [number, number, number, number] => {
    const [x, y] = xy[id]
    const [rx, ry] = areas[id] ?? [0, 0]
    return [x - rx, y - ry, x + rx, y + ry]
  }
  const chapterBox = {} as Record<ChapterId | 'home' | 'all', Box>
  for (const c of CHAPTERS) {
    const es = c.focus.map(extent)
    const x0 = Math.min(...es.map((e) => e[0])), y0 = Math.min(...es.map((e) => e[1]))
    const x1 = Math.max(...es.map((e) => e[2])), y1 = Math.max(...es.map((e) => e[3]))
    chapterBox[c.id] = [r1(x0), r1(y0), r1(x1 - x0), r1(y1 - y0)]
  }
  const [sx, sy] = xy.shanghai
  chapterBox.home = [r1(sx - 25), r1(sy - 18), 50, 36]
  chapterBox.all = [0, 0, w, h]

  const heroXY = {} as Record<ChapterId, [number, number]>
  for (const c of CHAPTERS) heroXY[c.id] = proj(c.hero)

  const home = REGIONS.find((r) => r.kind === 'home')!.lonLat
  const popOrder = REGIONS.map((r) => ({ id: r.id, d: d3.geoDistance(r.lonLat, home) }))
    .sort((a, b) => a.d - b.d)
    .map((e) => e.id)

  return { w, h, xy, areas, chapterBox, heroXY, popOrder, shanghaiPct: [r1((sx / w) * 100), r1((sy / h) * 100)] }
}

export default defineLoader({
  load(): AtlasData {
    return buildAtlas()
  },
})
