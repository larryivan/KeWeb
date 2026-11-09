<script setup lang="ts">
// MapBase — the shared dot-map <svg>: <use href="#kl-land"> in width-independent user units + <slot/>.
// - viewBox [x, y, w, h] in map units (LAND.w = 1000 wide). preserveAspectRatio xMidYMid meet.
// - Sets --kl-u (user units per CSS px; marks use scale(var(--kl-u))) and the land stroke (camera.js
//   dotStroke) on SSR from `ssrWidth`, then from the real size via ResizeObserver after mount.
// - setViewBox(vb) updates the camera imperatively (one attribute write + one CSS var + land stroke),
//   without Vue reactivity: call it every animation frame. getViewBox() returns the current one.
// - Without `label` the svg is aria-hidden (put role="img" + aria-label on a wrapper instead).
// - The two inline styles are STRING bindings on purpose: Vue only re-patches a string style when the
//   string changes, so re-renders (e.g. slot content toggling classes) never clobber setViewBox() writes.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { dotStroke, unitsPerPx } from '../lib/camera.js'
import { decodeLand } from '../lib/land.ts'
import { LAND } from '../land.generated.ts'

export type ViewBox = [number, number, number, number]

// fade: the land fades out towards the frame (#kl-land-fade). An SVG mask re-composites the whole land on
// every repaint, so it is only for maps that do not move (the hero), never for the atlas camera.
// canvas: once mounted, the land dots are drawn on a <canvas> under the svg instead of by the <use> (which stays
// as the SSR / no-JS land). Re-stroking a ~7,000-dot path on every frame of a camera glide drops frames on
// phones; filling only the dots in view on a canvas does not. Marks and labels stay in the svg.
const props = withDefaults(defineProps<{ viewBox: ViewBox; ssrWidth?: number; label?: string; fade?: boolean; canvas?: boolean }>(),
  { ssrWidth: 600, fade: false, canvas: false })

const svgEl = ref<SVGSVGElement | null>(null)
const landEl = ref<SVGUseElement | null>(null)

const r4 = (n: number) => Math.round(n * 1e4) / 1e4
const vbString = (vb: ViewBox) => vb.map(r4).join(' ')

// SSR (and first client render): assume the svg is ssrWidth px wide at the viewBox aspect.
const ssr = computed(() => {
  const vb = props.viewBox
  const w = props.ssrWidth
  const h = (w * vb[3]) / vb[2]
  return { u: r4(unitsPerPx(vb, w, h)), stroke: r4(dotStroke(vb, w, h)) }
})

let current: ViewBox = [...props.viewBox] as ViewBox
let stageW = 0
let stageH = 0

function measure() {
  const el = svgEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  stageW = r.width
  stageH = r.height
}

let uTimer: ReturnType<typeof setTimeout> | undefined
function apply() {
  const el = svgEl.value
  if (!el) return
  el.setAttribute('viewBox', vbString(current))
  if (!stageW || !stageH) return
  const u = String(r4(unitsPerPx(current, stageW, stageH)))
  if (props.canvas) {
    // During a glide, write each mark's own transform: changing the inherited --kl-u on the svg would restyle
    // every element in it on every frame. --kl-u itself catches up once the camera has been still for 120 ms.
    for (const m of el.querySelectorAll<SVGGElement>('[data-at]')) {
      const [x, y] = (m.dataset.at as string).split(' ')
      m.style.transform = `translate(${x}px, ${y}px) scale(${u})`
    }
    clearTimeout(uTimer)
    uTimer = setTimeout(() => el.style.setProperty('--kl-u', u), 120)
  } else el.style.setProperty('--kl-u', u)
  landEl.value?.style.setProperty('stroke-width', r4(dotStroke(current, stageW, stageH)) + 'px')
  draw()
}

let cvs: HTMLCanvasElement | null = null
let dots: Float32Array | null = null
let themeMo: MutationObserver | null = null
/** Dot colour and size rule, read from CSS once (and again on a theme change), never per frame: reading a
 *  computed style right after a --kl-u write would force a style recalc on every frame of a glide. */
let look: { color: string; min: number; dot: number } | null = null
function readLook() {
  const use = landEl.value
  if (!use) return
  const cs = getComputedStyle(use)
  const min = parseFloat(cs.getPropertyValue('--land-min'))
  const dot = parseFloat(cs.getPropertyValue('--dot'))
  look = { color: cs.color, min: Number.isFinite(min) ? min : 0, dot: Number.isFinite(dot) ? dot : 0 }
}

/** Canvas mode: paint the land dots in view for the current viewBox (preserveAspectRatio meet, like the svg). */
function draw() {
  if (!cvs || !dots || !stageW || !stageH) return
  if (!look) readLook()
  if (!look) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = Math.round(stageW * dpr)
  const H = Math.round(stageH * dpr)
  if (cvs.width !== W || cvs.height !== H) { cvs.width = W; cvs.height = H }
  const ctx = cvs.getContext('2d')
  if (!ctx) return
  const [vx, vy, vw, vh] = current
  const k = Math.min(W / vw, H / vh)
  const ox = (W - vw * k) / 2 - vx * k
  const oy = (H - vh * k) / 2 - vy * k
  // Same rule as the stylesheet's stroke-width for the <use>: max(--land-min, --kl-u · --dot), in map units;
  // without those variables, the dotStroke() width apply() sets.
  const u = unitsPerPx(current, stageW, stageH)
  const sw = look.dot ? Math.max(look.min, u * look.dot) : dotStroke(current, stageW, stageH)
  const r = Math.max((sw * k) / 2, 0.5)
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = look.color
  ctx.beginPath()
  const round = r > 1.2 // below ~2.4 device px a square dot reads the same and is cheaper
  for (let i = 0; i < dots.length; i += 2) {
    const x = dots[i] * k + ox
    const y = dots[i + 1] * k + oy
    if (x < -r || y < -r || x > W + r || y > H + r) continue
    if (round) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832) } else ctx.rect(x - r, y - r, 2 * r, 2 * r)
  }
  ctx.fill()
}

function setViewBox(vb: ViewBox) {
  current = [vb[0], vb[1], vb[2], vb[3]]
  if (!stageW) measure()
  apply()
}
function getViewBox(): ViewBox {
  return [...current] as ViewBox
}
/** Current stage size in CSS px (0 before mount). */
function size(): { w: number; h: number } {
  return { w: stageW, h: stageH }
}

watch(
  () => props.viewBox,
  (vb, old) => {
    if (old && vb.length === old.length && vb.every((v, i) => v === old[i])) return
    setViewBox(vb)
  },
  { flush: 'post' },
)

let ro: ResizeObserver | null = null
onMounted(() => {
  const el = svgEl.value
  if (props.canvas && el?.parentElement) {
    dots = decodeLand(LAND.d)
    cvs = document.createElement('canvas')
    cvs.className = 'kl-map__canvas'
    cvs.setAttribute('aria-hidden', 'true')
    el.parentElement.insertBefore(cvs, el)
    el.classList.add('kl-map--canvas')
    // Light/dark switch: the dot colour comes from CSS, so repaint.
    themeMo = new MutationObserver(() => { look = null; draw() })
    themeMo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  }
  measure()
  apply()
  if (typeof ResizeObserver !== 'undefined' && svgEl.value) {
    ro = new ResizeObserver(() => { measure(); apply() })
    ro.observe(svgEl.value)
  }
})
onBeforeUnmount(() => {
  ro?.disconnect(); ro = null
  clearTimeout(uTimer)
  themeMo?.disconnect(); themeMo = null
  cvs?.remove(); cvs = null
})

defineExpose({ setViewBox, getViewBox, size, svgEl })
</script>

<template>
  <svg ref="svgEl" class="kl-map" :viewBox="vbString(viewBox)" preserveAspectRatio="xMidYMid meet"
       :aria-hidden="label ? undefined : 'true'" :role="label ? 'img' : undefined" :aria-label="label || undefined"
       focusable="false" :style="`--kl-u:${ssr.u}`">
    <g :mask="fade ? 'url(#kl-land-fade)' : undefined">
      <use ref="landEl" href="#kl-land" class="kl-map__land" :style="`stroke-width:${ssr.stroke}px`" />
    </g>
    <slot />
  </svg>
</template>

<style>
/* Canvas mode: the canvas sits under the svg (marks and labels on top); the <use> stays only for SSR. */
.kl-home .kl-map__canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.kl-home .kl-map.kl-map--canvas { position: relative; }
.kl-home .kl-map.kl-map--canvas .kl-map__land { visibility: hidden; }
</style>
