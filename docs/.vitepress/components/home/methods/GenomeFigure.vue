<script setup lang="ts">
// THE 1,001 FIGURE (#genomes) — a huge "1,001" + one line and the figure: the ledger of 1,001 dots (gridDims)
// above a faint ring whose 36° wedge (a tenth) is solid.
//   ≥ 560 px: the ledger is a ribbon across the whole container; the text sits under its left half (number
//             level with the wedge's top), the ring under its right half (text and figure share one grid cell).
//   below:    text, then the ledger above a centred ring.
// SSR poster (.kl-genome-poster) = the final state: two inline SVGs switched by CSS. The figure is decorative
// (aria-hidden); the h3 (full sr-only text) and the line carry the facts.
// Motion (enabled, not lite, GSAP ready): a canvas over the same box, scrubbed by ScrollTrigger (forward
// only), fills the ledger column by column (≥ 560: the number counts with it), then arcs the dots into the
// wedge (genomeCanvas.ts). It plays only if the figure is still below the fold when the scene is built and the
// reader then scrolls it in; once the reader has seen the poster (built late, landed mid-range by a restored
// scroll or a jump, layout flipped, reverted while on screen) the poster stays: never a frame behind it.
// Complete: the canvas is dropped and the identical poster is back. Lite / reduced motion / off: the poster.
import { ref } from 'vue'
import { HOME, GENOMES } from '../home.content.ts'
import { useHome } from '../lib/useHome.ts'
import { useMotion, useScene } from '../lib/useMotion.ts'
import { GEO, rings, createGenome } from './genomeCanvas.ts'
import type { Genome } from './genomeCanvas.ts'

const motion = useMotion()
const { t, fmt, locale } = useHome()
const G = HOME.methods.genomes
const full = fmt(GENOMES)
const h3 = t(G.h3)
const rest = h3.startsWith(full) ? h3.slice(full.length).trim() : h3
// zh: the measure word stays with the number ("1001例" / "古代全基因组"), as the hero's "5次".
const unit = locale === 'zh' ? rest.charAt(0) : ''
const label = rest.slice(unit.length)
const r2 = (n: number) => Math.round(n * 100) / 100
const pct = (n: number) => `${(n * 100).toFixed(3)}%`
const figs = (['d', 'm'] as const).map((id) => {
  const g = GEO[id]
  return { id, g, w: r2(g.cols * g.pitch), h: r2(g.rows * g.pitch), c: r2(g.pitch / 2), ...rings(g) }
})
const D = GEO.d
const vars = {
  '--kl-ga-d': `${D.W} / ${D.H}`,
  '--kl-ga-m': `${GEO.m.W} / ${GEO.m.H}`,
  '--kl-gy': pct(D.top / D.W),                       // the wedge's top (wide layout)
  '--kl-gtx': pct((D.cx - D.R - D.pop) / D.W),       // the ring's left edge (wide layout)
}
const WIDE = '(min-width: 560px)'

const root = ref<HTMLElement | null>(null)
const box = ref<HTMLElement | null>(null)
const num = ref<HTMLElement | null>(null)
let seen = 0 // furthest progress shown; 1 once the reader has seen the final figure (outlives scene rebuilds)

useScene(root, ({ ScrollTrigger, belowFold }) => {
  const el = box.value
  if (motion.lite.value || !el) return
  if (seen >= 1 || (!seen && !belowFold(el))) { seen = 1; return } // the poster is (or was) on screen: keep it
  const wide = window.matchMedia(WIDE).matches
  const digits = wide ? num.value : null
  let fig: Genome | null = null
  let st: ReturnType<typeof ScrollTrigger.create> | null = null
  let target = seen, cur = seen, raf = 0, prev = 0
  const done = () => {
    cancelAnimationFrame(raf)
    raf = 0
    ro.disconnect()
    mo.disconnect()
    fig?.canvas.remove()
    fig = null
    el.classList.remove('is-live')
    if (digits) { digits.textContent = full; digits.classList.remove('is-counting') }
  }
  const finish = () => { seen = 1; st?.kill(); done() }
  // A light easing toward the scroll progress; frames only while catching up.
  const tick = (now: number) => {
    const dt = prev ? Math.min(now - prev, 64) : 16
    prev = now
    cur += (target - cur) * (1 - Math.exp(-dt / 110))
    if (target - cur < 5e-4) cur = target
    fig?.draw(cur)
    if (cur >= 1) { finish(); return }
    raf = cur < target ? requestAnimationFrame(tick) : 0
    if (!raf) prev = 0
  }
  const go = (p: number) => {
    if (p <= target) return
    // From the start line straight to mid-range in one step (restored scroll, anchor jump, End key): the
    // reader never watched it build, so they get the finished figure, not a frozen partial frame.
    if (target === 0 && p > 0.2) { finish(); return }
    target = seen = p
    if (fig && !raf) raf = requestAnimationFrame(tick)
  }
  const ro = new ResizeObserver(() => { if (window.matchMedia(WIDE).matches !== wide) finish(); else fig?.size() })
  const mo = new MutationObserver(() => fig?.colors())
  st = ScrollTrigger.create({
    trigger: el,
    start: 'top 92%',
    end: 'bottom 75%',
    onUpdate: (s) => go(s.progress),
    onRefresh: (s) => go(s.progress),
  })
  if (seen >= 1) { st.kill(); return }
  fig = createGenome(el, wide ? GEO.d : GEO.m, digits ? (n) => {
    digits.textContent = fmt(n)
    digits.classList.toggle('is-counting', n < GENOMES)
  } : undefined)
  if (!fig) { st.kill(); return }
  fig.draw(cur)
  el.classList.add('is-live')
  ro.observe(el)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => {
    if (fig && !belowFold(el)) seen = 1 // reverted while on screen: the reader now sees the poster
    done()
  }
})
</script>

<template>
  <section id="genomes" ref="root" class="kl-band kl-band--alt kl-genomes" aria-labelledby="genomes-h">
    <div class="kl-container kl-genomes__grid" :style="vars">
      <div class="kl-genomes__text">
        <h3 id="genomes-h" class="kl-genomes__h">
          <span class="kl-sr">{{ h3 }}</span>
          <span class="kl-genomes__num" aria-hidden="true"><span ref="num">{{ full }}</span><span v-if="unit" class="kl-num__unit">{{ unit }}</span></span>
          <span class="kl-genomes__label" aria-hidden="true">{{ label }}</span>
        </h3>
        <p class="kl-genomes__p">{{ t(G.body) }}</p>
      </div>
      <div ref="box" class="kl-gfig" aria-hidden="true">
        <div class="kl-genome-poster">
          <svg v-for="f in figs" :key="f.id" class="kl-gfig__svg" :class="`kl-gfig__svg--${f.id}`"
               :viewBox="`0 0 ${f.g.W} ${f.g.H}`" focusable="false">
            <defs>
              <pattern :id="`kl-gp-${f.id}`" patternUnits="userSpaceOnUse" x="0" y="0" :width="f.g.pitch" :height="f.g.pitch">
                <circle :cx="f.c" :cy="f.c" :r="f.g.dot" />
              </pattern>
            </defs>
            <rect x="0" y="0" :width="f.w" :height="f.h" :fill="`url(#kl-gp-${f.id})`" class="kl-gfig__ghost" />
            <path class="kl-gfig__ring" :d="f.ring" />
            <path class="kl-gfig__wedge" :d="f.wedge" />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kl-genomes__grid { display:grid; row-gap:36px; }
.kl-genomes__h { display:flex; flex-direction:column; gap:16px; }
.kl-genomes__num {
  font-size:clamp(4.5rem, 2.4rem + 5vw, 7.5rem); line-height:.86; font-weight:800; letter-spacing:-.02em;
  font-variant-numeric:lining-nums; color:var(--kl-accent);
}
.kl-genomes__num .is-counting { font-variant-numeric:lining-nums tabular-nums; }
.kl-genomes__num .kl-num__unit { font-size:.38em; }
.kl-genomes__label { font-size:1.375rem; line-height:1.35; font-weight:700; letter-spacing:-.01em; color:var(--kl-ink); }
.kl-genomes__p { margin-top:12px; font-size:1.0625rem; line-height:1.65; color:var(--kl-ink-2); max-width:24em; }
.kl-home--zh .kl-genomes__p { line-height:1.85; }
.kl-gfig { --kl-ghost:.3; position:relative; width:100%; max-width:480px; aspect-ratio:var(--kl-ga-m); }
.dark .kl-gfig { --kl-ghost:.42; }
.kl-gfig__ghost { opacity:var(--kl-ghost); }
.kl-genome-poster, .kl-gfig__svg { position:absolute; inset:0; width:100%; height:100%; }
.kl-gfig__svg { display:block; overflow:visible; }
.kl-gfig__svg--d { display:none; }
.kl-gfig__svg circle, .kl-gfig__wedge { fill:var(--kl-accent); }
.kl-gfig__ring { fill:var(--kl-accent-soft); }
.kl-gfig.is-live .kl-genome-poster { visibility:hidden; }
@media (min-width: 560px) {
  .kl-genomes__grid > * { grid-area:1 / 1; }
  .kl-genomes__text { position:relative; z-index:1; align-self:start; margin-top:var(--kl-gy); max-width:calc(var(--kl-gtx) - 48px); }
  .kl-genomes__num { margin-top:-.055em; }
  .kl-gfig { max-width:none; aspect-ratio:var(--kl-ga-d); }
  .kl-gfig__svg--d { display:block; }
  .kl-gfig__svg--m { display:none; }
}
</style>
