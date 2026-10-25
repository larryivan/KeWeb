<script setup lang="ts">
// StepIcon — the six hand-drawn pipeline icons (48 × 48, stroke 1.5): navy line work, accent details,
// soft accent fills. Decorative (aria-hidden). Final drawing = SSR. The drawings are static markup strings
// (v-html: lighter than six compiled vnode trees; trusted, authored here).
// Micro-motion: plays once when the parent cell (.kl-step, v-reveal.custom) gets `kl-pre is-in`, after the
// cell's own stagger (--d). Parts: .d = stroke draws on (pathLength 1), .m = moves/scales/fades in from
// --x / --y / --s (.p = pop: scale 0 + back easing); --t = delay, --du = duration, --e = easing.
// Reduced motion / motion off: home.css kills every animation, so the drawing simply stays final.
defineProps<{ name: string }>()
const ICONS: Record<string, string> = {
  tooth: '<path class="f m" style="--t:450ms;--du:.5s" d="M17 8.5C12.5 8.5 10 12 10.5 16.5C11 21 13.5 23.5 14.5 28C15.5 33 15.5 40 18.5 40C21 40 21 34.5 22 31.5C22.6 29.8 23.2 29 24 29C24.8 29 25.4 29.8 26 31.5C27 34.5 27 40 29.5 40C32.5 40 32.5 33 33.5 28C34.5 23.5 37 21 37.5 16.5C38 12 35.5 8.5 31 8.5C28 8.5 26.5 10.5 24 10.5C21.5 10.5 20 8.5 17 8.5Z"/><path class="s d" style="--du:.8s" pathLength="1" d="M24 10.5C21.5 10.5 20 8.5 17 8.5C12.5 8.5 10 12 10.5 16.5C11 21 13.5 23.5 14.5 28C15.5 33 15.5 40 18.5 40C21 40 21 34.5 22 31.5C22.6 29.8 23.2 29 24 29C24.8 29 25.4 29.8 26 31.5C27 34.5 27 40 29.5 40C32.5 40 32.5 33 33.5 28C34.5 23.5 37 21 37.5 16.5C38 12 35.5 8.5 31 8.5C28 8.5 26.5 10.5 24 10.5Z"/><path class="as m" style="--t:700ms" d="M14.5 15.5C15 13.6 16.4 12.6 18.2 12.5"/>',
  tube: '<g transform="translate(3.5 0)"><path class="f m" style="--y:3px;--t:520ms" d="M17.93 31H30.07L25.5 40.6C24.9 41.8 23.1 41.8 22.5 40.6Z"/><path class="as m" style="--t:560ms" d="M18.2 31H29.8"/><path class="s" d="M16.5 16V28L22.5 40.6C23.1 41.8 24.9 41.8 25.5 40.6L31.5 28V16"/><rect class="s" x="14.5" y="12.5" width="19" height="3.5" rx="1.25"/><path class="s" d="M14.5 14.25C11.5 14.25 9.75 15.5 9.75 18.5"/><rect class="s" x="6.5" y="18.5" width="6.5" height="9" rx="1.5"/><path class="a m" style="--y:-9px;--du:.55s;--e:cubic-bezier(.5,0,.75,0)" d="M24 1.8C24 1.8 21.3 5.3 21.3 7A2.7 2.7 0 0 0 26.7 7C26.7 5.3 24 1.8 24 1.8Z"/></g>',
  adapters: '<path class="s" d="M15 11.25H33M15 14.75H33M11 22.25H27M11 25.75H27M21 33.25H37M21 36.75H37"/><rect class="a m p" style="--t:0ms" x="9" y="9.5" width="5" height="7" rx="1.5"/><rect class="a m p" style="--t:60ms" x="34" y="9.5" width="5" height="7" rx="1.5"/><rect class="a m p" style="--t:120ms" x="5" y="20.5" width="5" height="7" rx="1.5"/><rect class="a m p" style="--t:180ms" x="28" y="20.5" width="5" height="7" rx="1.5"/><rect class="a m p" style="--t:240ms" x="15" y="31.5" width="5" height="7" rx="1.5"/><rect class="a m p" style="--t:300ms" x="38" y="31.5" width="5" height="7" rx="1.5"/>',
  reads: '<path class="s" d="M6 41H42"/><path class="s r m" style="--x:-14px;--t:0ms" d="M10 9H26"/><path class="s r m" style="--x:14px;--t:50ms" d="M18 15.5H38"/><path class="s r m" style="--x:-14px;--t:100ms" d="M7 22H22"/><path class="s r m" style="--x:14px;--t:150ms" d="M22 28.5H40"/><path class="s r m" style="--x:-14px;--t:200ms" d="M13 35H30"/><path class="as r m" style="--t:650ms;--du:.2s" d="M10 9H11.5M18 15.5H19.5M7 22H8.5M22 28.5H23.5M13 35H14.5"/>',
  tree: '<path class="s d" style="--du:.25s;--e:linear" pathLength="1" d="M24 41V31"/><path class="s d" style="--t:240ms;--du:.3s" pathLength="1" d="M24 31H14V20"/><path class="s d" style="--t:240ms;--du:.3s" pathLength="1" d="M24 31H34V16"/><path class="s d" style="--t:520ms;--du:.3s" pathLength="1" d="M14 20H9V10"/><path class="s d" style="--t:520ms;--du:.3s" pathLength="1" d="M14 20H19V10"/><path class="s d" style="--t:480ms;--du:.3s" pathLength="1" d="M34 16H29V10"/><path class="s d" style="--t:480ms;--du:.3s" pathLength="1" d="M34 16H39V10"/><circle class="a m p" style="--t:760ms" cx="9" cy="8.5" r="2.5"/><circle class="a m p" style="--t:800ms" cx="19" cy="8.5" r="2.5"/><circle class="a m p" style="--t:720ms" cx="29" cy="8.5" r="2.5"/><circle class="a m p" style="--t:760ms" cx="39" cy="8.5" r="2.5"/>',
  venn: '<circle class="s m" style="--y:-10px;--du:.9s" cx="24" cy="18.77" r="9.6"/><circle class="s m" style="--x:-8.7px;--y:5px;--du:.9s" cx="18" cy="29.16" r="9.6"/><circle class="s m" style="--x:8.7px;--y:5px;--du:.9s" cx="30" cy="29.16" r="9.6"/><path class="a m p" style="--t:650ms" d="M24 21.67A9.6 9.6 0 0 1 27.49 27.71A9.6 9.6 0 0 1 20.51 27.71A9.6 9.6 0 0 1 24 21.67Z"/>',
}
</script>

<template>
  <svg class="kl-ico" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false" v-html="ICONS[name]" />
</template>

<style scoped>
.kl-ico { display:block; width:100%; height:100%; overflow:visible; }
.kl-ico :deep(:is(.s, .as)) { fill:none; stroke:var(--kl-navy); stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.kl-ico :deep(.as) { stroke:var(--kl-accent); }
.kl-ico :deep(.r) { stroke-width:2; }
.kl-ico :deep(.a) { fill:var(--kl-accent); }
.kl-ico :deep(.f) { fill:var(--kl-accent-soft); }
.kl-ico :deep(.m) { transform-box:fill-box; transform-origin:center; }
.kl-ico :deep(.p) { --s:0; --e:var(--kl-ease-back); }
.kl-pre.is-in .kl-ico :deep(:is(.m, .d)) {
  animation:kl-ico-m var(--du, .5s) var(--e, var(--kl-ease-out)) calc(var(--d, 0ms) + 160ms + var(--t, 0ms)) backwards;
}
.kl-pre.is-in .kl-ico :deep(.d) { animation-name:kl-ico-d; }
@keyframes kl-ico-m { from { transform:translate(var(--x, 0), var(--y, 0)) scale(var(--s, 1)); opacity:0; } }
@keyframes kl-ico-d { from { stroke-dasharray:1 1; stroke-dashoffset:1; opacity:0; } 1% { opacity:1; } to { stroke-dasharray:1 1; stroke-dashoffset:0; } }
</style>
