<script setup lang="ts">
// ArrowIcon — 1em inline-block SVG arrow (never the → ↗ glyphs in serif text). Decorative.
withDefaults(defineProps<{ dir?: 'right' | 'upRight' | 'down' }>(), { dir: 'right' })
const D = {
  right: 'M2.5 8h11M9.5 4l4 4-4 4',
  upRight: 'M4.5 11.5l7-7M6 4.5h5.5V10',
  down: 'M8 2.5v11M4 9.5l4 4 4-4',
} as const
</script>

<template>
  <svg class="kl-arrow" :class="`kl-arrow--${dir}`" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"
       focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
       stroke-linejoin="round"><path :d="D[dir]" /></svg>
</template>
