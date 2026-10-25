<script setup lang="ts">
// MapArea — a broad region (kind 'area'): a soft --kl-accent-soft ellipse in MAP units (x, y, rx, ry from
// atlas.data xy + areas; hairline accent edge), with an optional label drawn in CSS px at the ellipse edge
// (labelSide, default 'n'). States: active (stronger edge), dim (opacity .4).
import { computed } from 'vue'
import type { LabelSide } from '../home.content.ts'
import { labelOffset } from '../lib/derive.ts'

const props = withDefaults(
  defineProps<{ x: number; y: number; rx: number; ry: number; label?: string; labelSide?: LabelSide; active?: boolean; dim?: boolean }>(),
  { labelSide: 'n', active: false, dim: false },
)

const EDGE: Record<LabelSide, [number, number]> = {
  n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0],
  ne: [0.7071, -0.7071], nw: [-0.7071, -0.7071], se: [0.7071, 0.7071], sw: [-0.7071, 0.7071],
}
const anchor = computed(() => {
  const [ex, ey] = EDGE[props.labelSide]
  return [Math.round((props.x + ex * props.rx) * 10) / 10, Math.round((props.y + ey * props.ry) * 10) / 10]
})
const lab = computed(() => labelOffset(props.labelSide, 6))
const tf = computed(() => `translate(${anchor.value[0]}px, ${anchor.value[1]}px) scale(var(--kl-u, 1))`)
</script>

<template>
  <g class="kl-area" :class="{ 'is-active': active, 'is-dim': dim }">
    <ellipse class="kl-area__shape" :cx="x" :cy="y" :rx="rx" :ry="ry" />
    <g v-if="label" class="kl-area__label" :style="{ transform: tf }">
      <text class="kl-map-label" :x="lab.x" :y="lab.y" :dy="lab.dy" :text-anchor="lab.anchor">{{ label }}</text>
    </g>
  </g>
</template>
