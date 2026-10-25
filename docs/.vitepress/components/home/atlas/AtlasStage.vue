<script setup lang="ts">
// AtlasStage — the sticky map panel of the Findings section (desktop >= 960 px; hidden below).
// Every region is drawn once; the active stop's regions scale up and show their labels, the other marks dim
// (marks only) and the other areas fade out. The camera (useAtlasCamera) drives the viewBox through
// MapBase.setViewBox(). Hovering a card lights up that paper's regions and dims the rest of the chapter.
// First view: the map is revealed radially from Shanghai and the marks pop in (v-reveal.custom).
// SSR / no JS / reduced motion: the whole map, every mark at rest, no labels.
import { computed, ref } from 'vue'
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
import type { MapApi, Sides, StopId } from './useAtlasCamera.ts'

const props = defineProps<{ stop: StopId; hot: RegionId[]; sides: Sides; hidden: RegionId[]; origin: string; glow: string }>()
const { t } = useHome()

const vb0 = fitStop('intro', atlas, { w: 1, h: 1, text: () => '' }).vb
const LAYER = { area: 0, endpoint: 1, co: 2, led: 2, presentDay: 2, home: 3 } as const
const pop = Object.fromEntries(atlas.popOrder.map((id, i) => [id, i])) as Record<RegionId, number>
const regions = REGIONS.map((r) => ({
  id: r.id, type: regionMarkType(r.id), x: atlas.xy[r.id][0], y: atlas.xy[r.id][1], area: atlas.areas[r.id],
  label: t(r.id === 'shanghai' ? HOME.hero.homeLabel : r.label), side: r.labelSide,
})).sort((a, b) => LAYER[a.type] - LAYER[b.type])

const focus = computed(() => new Set(focusOf(props.stop)))
const overview = computed(() => props.stop === 'intro')
const isHot = (id: RegionId) => props.hot.includes(id)
const side = (id: RegionId): LabelSide | undefined => {
  const s = props.sides[id] ?? regions.find((r) => r.id === id)?.side
  return s === 'in' ? 'n' : s
}
const isIn = (id: RegionId) => props.sides[id] === 'in'
/** Glyphs of other chapters dim; while a card is hovered, so do this chapter's regions it does not touch. */
const isDim = (id: RegionId) => !overview.value && (props.hot.length ? !isHot(id) : !focus.value.has(id))
/** Areas of other chapters are not painted in a chapter view (no slivers at the frame's edge). */
const isOff = (id: RegionId) => !overview.value && !focus.value.has(id) && !isHot(id)
const vars = computed(() => {
  const [gx, gy] = props.glow.split(' ')
  return `--kl-o:${props.origin};--kl-gx:${gx};--kl-gy:${gy}`
})

const el = ref<HTMLElement | null>(null)
const mapRef = ref<(InstanceType<typeof MapBase> & MapApi) | null>(null)
defineExpose({ el, map: (): MapApi | null => mapRef.value })
</script>

<template>
  <div ref="el" v-reveal.custom="{ threshold: 0.5 }" class="kl-atlas__stage" aria-hidden="true" :style="vars">
    <div class="kl-atlas__glow" />
    <div class="kl-atlas__plate">
      <MapBase ref="mapRef" :view-box="vb0" :ssr-width="544">
        <g v-for="r in regions" :key="r.id" class="kl-atlas__pop" :data-r="r.id" :style="`--i:${pop[r.id]}`">
          <template v-if="r.type === 'area' && r.area">
            <MapArea :x="r.x" :y="r.y" :rx="r.area[0]" :ry="r.area[1]" :label="r.label" :label-side="side(r.id)"
                     :active="focus.has(r.id) || isHot(r.id)" :dim="isDim(r.id)"
                     :class="{ 'is-off': isOff(r.id), 'is-hot': isHot(r.id), 'kl-area--in': isIn(r.id) }" />
            <!-- The 'in' label (inside a large area, under its top edge): always rendered, so it fades like the rest. -->
            <g class="kl-area__label kl-area__label--in" :class="{ 'is-active': isIn(r.id) && (focus.has(r.id) || isHot(r.id)) }"
               :style="`transform:translate(${r.x}px,${inTop(r.id, atlas)}px) scale(var(--kl-u,1))`">
              <text class="kl-map-label" :y="IN_Y" dy=".8em" text-anchor="middle">{{ r.label }}</text>
            </g>
          </template>
          <MapMark v-else :x="r.x" :y="r.y" :type="r.type" :label="r.label" :label-side="side(r.id)"
                   :active="focus.has(r.id)" :hot="isHot(r.id)" :dim="isDim(r.id)" :class="{ 'is-off': hidden.includes(r.id) }" />
        </g>
      </MapBase>
    </div>
  </div>
</template>

<style scoped>
/* (The panel's look — backdrop, land dots, edge fade, quiet context marks — is shared with the mini maps: HomeAtlas.) */
.kl-atlas__stage { --fade: 22px; border-radius: 20px; }
/* A soft light under the current stop's regions; it follows the camera. */
.kl-atlas__glow {
  position: absolute; left: var(--kl-gx, 50%); top: var(--kl-gy, 50%); width: 80%; aspect-ratio: 1; translate: -50% -50%;
  border-radius: 50%; background: radial-gradient(closest-side, var(--kl-accent-soft), transparent);
  transition: left 1s var(--kl-ease-inout), top 1s var(--kl-ease-inout);
}
.kl-atlas__plate { position: absolute; inset: 0; }
/* Labels and glows belong to the active stop only… */
.kl-atlas__stage :deep(:is(.kl-mark__label, .kl-area__label, .kl-mark__glow)) { opacity: 0; transition: opacity var(--kl-t-base) var(--kl-ease-std); }
.kl-atlas__stage :deep(:is(.is-active, .is-hot) > :is(.kl-mark__label, .kl-area__label)),
.kl-atlas__stage :deep(:is(.is-active, .is-hot) .kl-mark__glow), .kl-area__label--in.is-active { opacity: 1; transition-delay: .55s; }
/* …and they light up as the camera lands (the 1 s glide), not mid-flight. */
.kl-atlas__stage :deep(.is-active .kl-mark__ring) { animation-delay: .6s; }
.kl-atlas__stage :deep(.is-hot > :is(.kl-mark__label, .kl-area__label)), .kl-atlas__stage :deep(.is-hot .kl-mark__glow) { transition-delay: 0s; }
/* An area whose label sits inside shows that one, not the edge label. */
.kl-atlas__stage :deep(.kl-area.kl-area--in > .kl-area__label) { opacity: 0; transition-delay: 0s; }
/* Other chapters' areas are not painted in a chapter view; a context mark on the frame's edge fades out. */
.kl-atlas__stage :deep(:is(.kl-mark, .kl-area)) { transition: opacity var(--kl-t-base) var(--kl-ease-std); }
.kl-atlas__stage :deep(:is(.kl-mark, .kl-area).is-off) { opacity: 0; }
/* The hovered card's areas: a fuller fill and a firmer edge. */
.kl-atlas__stage :deep(.kl-area__shape) {
  transition: opacity var(--kl-t-base) var(--kl-ease-std), fill var(--kl-t-fast) var(--kl-ease-std), stroke-opacity var(--kl-t-fast) var(--kl-ease-std);
}
.kl-atlas__stage :deep(.kl-area.is-hot .kl-area__shape) { fill: color-mix(in srgb, var(--kl-accent) 20%, transparent); stroke-opacity: .9; stroke-width: calc(var(--kl-u, 1) * 1.5px); }
/* Active marks grow 1.25x: their labels step 4px further out (LABEL_AIR in the camera fit). */
.kl-atlas__stage :deep(.kl-mark__label[text-anchor="start"]) { translate: 4px 0; }
.kl-atlas__stage :deep(.kl-mark__label[text-anchor="end"]) { translate: -4px 0; }
.kl-atlas__stage :deep(.kl-mark__label[text-anchor="middle"]) { translate: 0 4px; }
.kl-atlas__stage :deep(.kl-mark__label[text-anchor="middle"][dy="0"]) { translate: 0 -4px; }
/* First view: radial reveal from Shanghai (where the glow already sits), then the marks pop (nearest first). */
/* (The reveal observes the stage: Chrome's IntersectionObserver would see a clipped plate as invisible.) */
.kl-pre .kl-atlas__plate { clip-path: circle(0 at var(--kl-o)); }
.kl-pre.is-in .kl-atlas__plate { clip-path: circle(150% at var(--kl-o)); transition: clip-path 1.6s var(--kl-ease-inout); }
.kl-pre .kl-atlas__pop { opacity: 0; }
.kl-pre :deep(.kl-mark__glyph) { scale: .4; }
.kl-pre.is-in .kl-atlas__pop { opacity: 1; transition: opacity .45s var(--kl-ease-out) calc(.4s + var(--i) * 40ms); }
.kl-pre.is-in :deep(.kl-mark__glyph) {
  scale: 1;
  transition: scale .45s var(--kl-ease-back) calc(.4s + var(--i) * 40ms), transform var(--kl-t-base) var(--kl-ease-std), opacity var(--kl-t-base) var(--kl-ease-std);
}
</style>
