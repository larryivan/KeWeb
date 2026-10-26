<script setup lang="ts">
// MapMark — one region mark (v2), drawn in CSS px inside
// <g style="transform: translate(Xpx,Ypx) scale(var(--kl-u))">, so it keeps its on-screen size at any zoom.
// type: 'led' | 'co' | 'presentDay' (all drawn alike in v2: --kl-accent core + soft ring + radial glow),
// 'home' (--kl-home diamond + ring), 'endpoint' (small --kl-ink-3 dot). Use derive.regionMarkType(id).
// For 'area' draw a MapArea instead (MapMark type 'area' renders only the optional label).
// States: active (scale 1.25 + ring pulses twice), hot (scale 1.4, full ring), dim (glyph opacity .35;
// the label never dims). glow=false drops the radial glow (dense maps). n = numeral in an enlarged core.
import { computed } from 'vue'
import type { LabelSide } from '../home.content.ts'
import type { MarkType } from '../lib/derive.ts'
import { labelOffset } from '../lib/derive.ts'

const props = withDefaults(
  defineProps<{
    x: number
    y: number
    type: MarkType
    label?: string
    labelSide?: LabelSide
    active?: boolean
    hot?: boolean
    dim?: boolean
    glow?: boolean
    n?: number | string
  }>(),
  { labelSide: 'e', active: false, hot: false, dim: false, glow: true },
)

const hasN = computed(() => props.n !== undefined && props.n !== null && props.n !== '')
const coreR = computed(() => (hasN.value ? 9 : 5))
const ringR = computed(() => (props.type === 'home' ? 12.5 : hasN.value ? 13.5 : 10))
const glowR = computed(() => (hasN.value ? 30 : 26))
const lab = computed(() => {
  const off = props.type === 'endpoint' ? 7 : props.type === 'area' ? 0 : ringR.value + 5
  return labelOffset(props.labelSide, off)
})
const tf = computed(() => `translate(${props.x}px, ${props.y}px) scale(var(--kl-u, 1))`)
</script>

<template>
  <g class="kl-mark" :class="[`kl-mark--${type}`, { 'is-active': active, 'is-hot': hot, 'is-dim': dim }]"
     :style="{ transform: tf }">
    <g v-if="type !== 'area'" class="kl-mark__glyph">
      <template v-if="type === 'home'">
        <circle class="kl-mark__ring" r="12.5" />
        <path class="kl-mark__core" d="M0 -6.5L6.5 0L0 6.5L-6.5 0Z" />
      </template>
      <circle v-else-if="type === 'endpoint'" class="kl-mark__core" r="2.5" />
      <template v-else>
        <circle v-if="glow" class="kl-mark__glow" :r="glowR" />
        <circle class="kl-mark__ring" :r="ringR" />
        <circle class="kl-mark__core" :r="coreR" />
      </template>
      <text v-if="hasN" class="kl-mark__n">{{ n }}</text>
    </g>
    <text v-if="label" class="kl-map-label kl-mark__label" :x="lab.x" :y="lab.y" :dy="lab.dy"
          :text-anchor="lab.anchor">{{ label }}</text>
  </g>
</template>
