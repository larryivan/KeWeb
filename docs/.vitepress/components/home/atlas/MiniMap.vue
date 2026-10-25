<script setup lang="ts">
// MiniMap — the small map at the top of a chapter (and the home stop) below 960 px, where there is no stage.
// 16:10, framed on the stop's regions with every label inside (same fit as the stage camera). SSR frames it
// for a phone width; on the client it is refitted to its real size (tablets) once mounted and on resize.
// SSR = final state; on first view the marks pop in, nearest first (v-reveal.custom).
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { HOME, REGIONS } from '../home.content.ts'
import type { LabelSide, RegionId } from '../home.content.ts'
import { regionMarkType } from '../lib/derive.ts'
import { useHome } from '../lib/useHome.ts'
import { vReveal } from '../lib/reveal.ts'
import { data as atlas } from '../atlas.data'
import MapBase from '../ui/MapBase.vue'
import MapMark from '../ui/MapMark.vue'
import MapArea from '../ui/MapArea.vue'
import { IN_Y, fitStop, focusOf, inTop } from './useAtlasCamera.ts'
import type { Fit, StopId } from './useAtlasCamera.ts'

const props = defineProps<{ stop: Exclude<StopId, 'intro'> }>()
const { t } = useHome()

const label = Object.fromEntries(REGIONS.map((r) => [r.id, t(r.id === 'shanghai' ? HOME.hero.homeLabel : r.label)])) as Record<RegionId, string>
const focus = new Set(focusOf(props.stop))
// Zoom: 2.2 map widths per frame at phone width; wider frames show more map instead of bigger dots.
// Context endpoints (Steppe, Central Plains, …) are named only on frames wide enough for them (EP_W).
const EP_W = 400
const fitAt = (w: number, h: number, measured?: (id: RegionId) => number | undefined): Fit =>
  fitStop(props.stop, atlas, { w, h, mx: 44, my: 26, inset: 13, air: 0, zoomMax: Math.min(2.2, 1300 / w), endpoints: w >= EP_W, text: (id) => label[id], measured })
const fit = shallowRef(fitAt(340, 212.5))
const width = ref(340)
const named = (r: { id: RegionId; type: string }) => focus.has(r.id) && (r.type !== 'endpoint' || width.value >= EP_W)

const side = (id: RegionId): LabelSide | undefined => { const s = fit.value.sides[id]; return s === 'in' ? 'n' : s }
const LAYER = { area: 0, endpoint: 1, co: 2, led: 2, presentDay: 2, home: 3 } as const
const ALL = REGIONS.map((r) => ({ id: r.id, type: regionMarkType(r.id), x: atlas.xy[r.id][0], y: atlas.xy[r.id][1], area: atlas.areas[r.id] }))
// Only what can be seen, drawn bottom layer first: this stop's regions, and dimmed context marks only when they
// sit clearly inside the frame (never half-cut by the edge, never under a label). Other chapters' areas are not
// painted; an unlabelled endpoint dot that a label has to cover is left out.
const regions = computed(() => {
  const [x0, y0, vw, vh] = fit.value.vb
  const m = 24 * (vw / 340)
  const off = fit.value.hidden
  return ALL.filter((r) => !off.includes(r.id) && (focus.has(r.id) || (!r.area && r.x > x0 + m && r.x < x0 + vw - m && r.y > y0 + m && r.y < y0 + vh - m)))
    .sort((a, b) => LAYER[a.type] - LAYER[b.type] || +focus.has(a.id) - +focus.has(b.id))
})

const fig = ref<HTMLElement | null>(null)
let ro: ResizeObserver | null = null
onMounted(() => {
  const el = fig.value
  if (!el) return
  const widths = new Map<RegionId, number>()
  const refit = () => {
    const { width: w, height: h } = el.getBoundingClientRect()
    if (!w || !h) return // hidden (desktop)
    for (const g of el.querySelectorAll<SVGGElement>('[data-r]')) {
      const len = g.querySelector<SVGTextContentElement>('.kl-map-label')?.getComputedTextLength?.() ?? 0
      if (len > 0) widths.set(g.dataset.r as RegionId, len)
    }
    const f = fitAt(w, h, (id) => widths.get(id))
    width.value = w
    const cur = fit.value
    if (f.vb.some((v, i) => Math.abs(v - cur.vb[i]) > 0.05) || Object.keys(f.sides).some((id) => f.sides[id as RegionId] !== cur.sides[id as RegionId])) fit.value = f
  }
  refit()
  if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(refit); ro.observe(el) }
  document.fonts?.ready.then(refit).catch(() => {})
})
onBeforeUnmount(() => { ro?.disconnect(); ro = null })
</script>

<template>
  <figure ref="fig" v-reveal.custom="{ threshold: 0.4 }" class="kl-minimap" aria-hidden="true">
    <MapBase :view-box="fit.vb" :ssr-width="358">
      <g v-for="(r, i) in regions" :key="r.id" class="kl-minimap__pop" :data-r="r.id" :style="`--i:${i}`">
        <template v-if="r.type === 'area' && r.area">
          <MapArea :x="r.x" :y="r.y" :rx="r.area[0]" :ry="r.area[1]" active
                   :label="fit.sides[r.id] !== 'in' ? label[r.id] : undefined" :label-side="side(r.id)" />
          <g v-if="fit.sides[r.id] === 'in'" class="kl-area__label"
             :style="`transform:translate(${r.x}px,${inTop(r.id, atlas)}px) scale(var(--kl-u,1))`">
            <text class="kl-map-label" :y="IN_Y" dy=".8em" text-anchor="middle">{{ label[r.id] }}</text>
          </g>
        </template>
        <MapMark v-else :x="r.x" :y="r.y" :type="r.type" :label="named(r) ? label[r.id] : undefined"
                 :label-side="side(r.id)" :dim="!focus.has(r.id)" :glow="focus.has(r.id)" />
      </g>
    </MapBase>
  </figure>
</template>

<style scoped>
/* (Backdrop, land dots, edge fade and quiet context marks are shared with the stage: HomeAtlas.) */
.kl-minimap { --fade: 16px; --dot: 1.4px; position: relative; aspect-ratio: 16 / 10; border-radius: var(--kl-radius); }
.kl-minimap.kl-pre .kl-minimap__pop { opacity: 0; }
.kl-minimap.kl-pre :deep(.kl-mark__glyph) { scale: .4; }
.kl-minimap.kl-pre.is-in .kl-minimap__pop { opacity: 1; transition: opacity .4s var(--kl-ease-out) calc(var(--i) * 60ms); }
.kl-minimap.kl-pre.is-in :deep(.kl-mark__glyph) { scale: 1; transition: scale .4s var(--kl-ease-back) calc(var(--i) * 60ms); }
</style>
