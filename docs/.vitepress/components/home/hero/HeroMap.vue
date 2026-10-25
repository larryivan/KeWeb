<script setup lang="ts">
// HeroMap — the hero dot map: five glowing study regions (west → east) + the lab in Shanghai.
// SSR = final state. Motion (spec §7.1, one-shot): the land develops (.2 → 1), the DNA-reads canvas
// converges into it, region halos bloom west → east, labels fade in, the Shanghai ring pulses twice.
// - Mostly in view at mount (≥ 60 %): the CSS keyframes have run since first paint (no JS). If hydration came
//   before the land started to brighten, the map's animations are re-timed to start 100 ms before the reads.
// - Otherwise (phones, or a page opened further down): hold the from-state (`kl-pre`), then `is-playing` + the
//   reads once half of the map is on screen.
// - Reduced motion / ?kl-motion=off: no animation, no canvas. Lite: CSS only, no canvas.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { HOME, CHAPTERS } from '../home.content.ts'
import { LAND } from '../land.generated.ts'
import { data as atlas } from '../atlas.data'
import { useHome } from '../lib/useHome.ts'
import { useMotion } from '../lib/useMotion.ts'
import MapBase from '../ui/MapBase.vue'
import MapMark from '../ui/MapMark.vue'
import type { ViewBox } from '../ui/MapBase.vue'
import { startReads } from './readsCanvas.ts'

const { t } = useHome()
const motion = useMotion()

// The land (x 0–1000) plus 50 units of sea west and 120 east (the en "Shanghai" label sits east of its mark),
// vertically centred. Phones: the land starts ~16 px from the screen edge and every label stays ≥ 10 px inside
// a 360 px map. From 600 px the svg is drawn at 117 % (CSS below) so the land itself spans the column.
const vb: ViewBox = [-50, -32, 1170, 802]
const marks = [...CHAPTERS].sort((a, b) => atlas.heroXY[a.id][0] - atlas.heroXY[b.id][0])
const home = atlas.xy.shanghai
const LAND_DELAY = 500 // ms, = the kl-land-in delay below

const wrap = ref<HTMLElement | null>(null)
const base = ref<InstanceType<typeof MapBase> | null>(null)
let stop: (() => void) | null = null
let io: IntersectionObserver | null = null
let unOff: (() => void) | null = null

function reads(el: HTMLElement) {
  const svg = base.value?.svgEl
  const hero = el.closest('.kl-hero')
  const m = svg?.getScreenCTM()
  if (motion.lite.value || !svg || !hero || !m) return
  // The canvas box: the land rect inflated by .15 of its width, kept clear of the text column (desktop),
  // the doors and the hero's edges.
  const desk = innerWidth >= 960
  const lw = m.a * LAND.w
  const inf = 0.15 * lw
  const hr = hero.getBoundingClientRect()
  const doors = hero.querySelector('.kl-hero__doors')!.getBoundingClientRect()
  const text = hero.querySelector('.kl-hero__text')!.getBoundingClientRect()
  const top = m.f
  const bottom = m.f + m.d * LAND.h
  const box = desk
    ? { l: Math.max(text.right + 24, m.e - inf), t: Math.max(hr.top, top - inf), r: Math.min(document.documentElement.clientWidth, m.e + lw + inf), b: Math.min(doors.top - 12, bottom + inf) }
    : { l: Math.max(0, m.e - inf), t: Math.max(doors.bottom + 12, top - inf), r: Math.min(document.documentElement.clientWidth, m.e + lw + inf), b: Math.min(hr.bottom, bottom + inf) }
  const cs = getComputedStyle(el)
  stop = startReads({
    host: el, svg, box, every: desk ? 4 : 7, spread: desk ? 0.3 : 0.22, west: desk ? 0.5 : 1,
    colors: [cs.getPropertyValue('--kl-accent').trim(), cs.getPropertyValue('--kl-home').trim()],
  })
}

onMounted(() => {
  const el = wrap.value
  if (!el || !motion.enabled.value) return
  unOff = motion.onOff(() => {
    stop?.()
    io?.disconnect()
    el.classList.remove('kl-pre', 'is-playing')
  })
  const anims = el.getAnimations ? el.getAnimations({ subtree: true }) : []
  const land = anims.find((a) => (a as CSSAnimation).animationName === 'kl-land-in')
  const c = Number(land?.currentTime ?? Infinity) // ms since the CSS timeline started (first paint)
  const r = el.getBoundingClientRect()
  const seen = r.height > 0 ? Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)) / r.height : 0
  if (seen < 0.6) {
    // Partly visible with the land already brightening: leave the CSS timeline alone (no flash).
    if (seen > 0 && !(c < LAND_DELAY)) return
    el.classList.add('kl-pre')
    io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || e.intersectionRatio < 0.48) return
      io?.disconnect()
      io = null
      el.classList.add('is-playing')
      reads(el)
    }, { threshold: 0.5 })
    io.observe(el)
    return
  }
  if (!(c <= LAND_DELAY)) return
  for (const a of anims) a.currentTime = Math.max(0, Number(a.currentTime) - Math.max(0, c - 100))
  reads(el)
})

onBeforeUnmount(() => {
  stop?.()
  io?.disconnect()
  unOff?.()
})
</script>

<template>
  <div ref="wrap" class="kl-hmap" role="img" :aria-label="t(HOME.hero.mapAlt)">
    <MapBase ref="base" :view-box="vb" :ssr-width="620">
      <MapMark v-for="(c, i) in marks" :key="c.id" :x="atlas.heroXY[c.id][0]" :y="atlas.heroXY[c.id][1]" type="led"
               :label="t(c.heroLabel)" :label-side="c.heroLabelSide" :style="{ '--i': i }" />
      <MapMark :x="home[0]" :y="home[1]" type="home" :label="t(HOME.hero.homeLabel)" :style="{ '--i': marks.length }" />
    </MapBase>
  </div>
</template>

<style scoped>
.kl-hmap { position: relative; --kl-map-label-size: 12px; }
.kl-hmap :deep(.kl-map) { position: relative; z-index: 1; }
/* From 600: the land (viewBox x 0–1000 of −50…1120, y 0–738 of −32…770) fills the wrapper exactly; the sea
   margins spill outside it (percent margins are of the wrapper width = the land width). */
@media (min-width: 600px) {
  .kl-hmap :deep(.kl-map) { width: 117%; max-width: none; margin: -3.2% 0 -3.2% -5%; }
}
@media (min-width: 720px) {
  .kl-hmap { --kl-map-label-size: 15px; --kl-map-label-weight: 700; }
}
/* One timeline (t = 0 at first paint, or when the map scrolls in); the reads start at ≈ 100 ms. */
.kl-hmap :deep(.kl-map__land) { animation: kl-land-in .8s var(--kl-ease-std) .5s both; }
.kl-hmap :deep(.kl-mark__glyph) { animation: kl-bloom .45s var(--kl-ease-back) calc(1.05s + var(--i) * .1s) both; }
.kl-hmap :deep(.kl-mark__label) { animation: kl-fade .3s ease-out calc(1.15s + var(--i) * .1s) both; }
.kl-hmap :deep(.kl-mark--home .kl-mark__ring) { animation: kl-pulse .7s var(--kl-ease-out) 1.85s 2; }
/* Held until is-playing restarts the timeline. */
.kl-hmap.kl-pre:not(.is-playing) :deep(*) { animation: none; }
.kl-hmap.kl-pre:not(.is-playing) :deep(.kl-map__land) { opacity: .2; }
.kl-hmap.kl-pre:not(.is-playing) :deep(.kl-mark__glyph) { transform: scale(0); }
.kl-hmap.kl-pre:not(.is-playing) :deep(.kl-mark__label) { opacity: 0; }
</style>
