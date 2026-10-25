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

export type ViewBox = [number, number, number, number]

const props = withDefaults(defineProps<{ viewBox: ViewBox; ssrWidth?: number; label?: string }>(), { ssrWidth: 600 })

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

function apply() {
  const el = svgEl.value
  if (!el) return
  el.setAttribute('viewBox', vbString(current))
  if (!stageW || !stageH) return
  el.style.setProperty('--kl-u', String(r4(unitsPerPx(current, stageW, stageH))))
  landEl.value?.style.setProperty('stroke-width', r4(dotStroke(current, stageW, stageH)) + 'px')
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
  measure()
  apply()
  if (typeof ResizeObserver !== 'undefined' && svgEl.value) {
    ro = new ResizeObserver(() => { measure(); apply() })
    ro.observe(svgEl.value)
  }
})
onBeforeUnmount(() => { ro?.disconnect(); ro = null })

defineExpose({ setViewBox, getViewBox, size, svgEl })
</script>

<template>
  <svg ref="svgEl" class="kl-map" :viewBox="vbString(viewBox)" preserveAspectRatio="xMidYMid meet"
       :aria-hidden="label ? undefined : 'true'" :role="label ? 'img' : undefined" :aria-label="label || undefined"
       focusable="false" :style="`--kl-u:${ssr.u}`">
    <use ref="landEl" href="#kl-land" class="kl-map__land" :style="`stroke-width:${ssr.stroke}px`" />
    <slot />
  </svg>
</template>
