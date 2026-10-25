// lib/camera.js — pure camera math shared by every map (spec §6.5). Unit-tested by scripts/home-check.mjs.
// viewBox / bbox tuples are [x, y, w, h] in map units (LAND.w = 1000 wide).

/** Fit bbox [x,y,w,h] (map units) into a viewBox with the stage's exact aspect (w/h). */
export function fitViewBox([bx, by, bw, bh], aspect, { pad = 0.22, minW = 1000 / 4.5 } = {}) {
  const w = Math.max(bw * (1 + 2 * pad), bh * (1 + 2 * pad) * aspect, minW)
  const h = w / aspect
  return [bx + bw / 2 - w / 2, by + bh / 2 - h / 2, w, h]
}
/** User units per CSS px for preserveAspectRatio="xMidYMid meet". */
export function unitsPerPx([, , w, h], stageW, stageH) { return Math.max(w / stageW, h / stageH) }
export function zoomOf([, , w], mapW = 1000) { return mapW / w }
/** Land-dot stroke (user units) so dots stay dots: base = 0.42·STEP px at k = 1, growth 0.35/k-step, capped ×2.4. */
export function dotStroke(vb, stageW, stageH, mapW = 1000) {
  const basePx = 2.94 * Math.min(stageW / vb[2] * vb[2] / mapW, stageW / mapW) // = 2.94·stageW/mapW at overview
  const f = Math.min(Math.max(1 + 0.35 * (zoomOf(vb, mapW) - 1), 1), 2.4)
  return basePx * f * unitsPerPx(vb, stageW, stageH)
}
