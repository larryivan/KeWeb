<script setup lang="ts">
// HomeHero — #top (v2 §5.1, mockup B without the pill): eyebrow · H1 (gradient key phrase) · lede · two stats
// (a 10-cell waffle under 1001) · three doors (Join = brand primary) · the dot map.
// Desktop (≥960): text | map in two equal columns, doors in a full-width row beneath; the en H1 keeps its two
// authored lines (font size follows the column). Below 960: text, stats, doors (stacked rows), then the map.
// The H1 and lede are static SSR text (LCP). Stats and doors rise once at first paint (CSS only).
import { HOME } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import { splitKey } from './lib/derive.ts'
import ArrowIcon from './ui/ArrowIcon.vue'
import HeroMap from './hero/HeroMap.vue'

const { t, tl, locale, href, fmt } = useHome()
const key = t(HOME.hero.h1Key)
// Typographic glue only (no copy change): line breaks may fall after "·" or "," but never inside a name, and
// never put "—" or "·" at the start of a line.
const eyebrow = t(HOME.hero.eyebrow).replace(/ · /g, ' ·\n').replace(/, /g, ',\n').split('\n')
const glue = (s: string) => s.replace(/ (—|·) /g, ' $1 ').replace(/\bDr\. /g, 'Dr. ')
</script>

<template>
  <section id="top" class="kl-hero kl-band kl-band--hero" aria-labelledby="top-h">
    <div class="kl-container kl-hero__grid">
      <div class="kl-hero__text">
        <p class="kl-kicker kl-hero__eyebrow"><template v-for="(part, i) in eyebrow" :key="i">{{ i ? ' ' : '' }}<span>{{ part }}</span></template></p>
        <h1 id="top-h" class="kl-h1 kl-hero__h1">
          <span v-for="(line, i) in tl(HOME.hero.h1)" :key="i" class="kl-hero__line"><template
            v-for="(part, j) in splitKey(line, key)" :key="j"><em v-if="j === 1 && part" class="kl-grad">{{ part }}</em><template
            v-else>{{ part }}</template></template>{{ locale === 'en' && i === 0 ? ' ' : '' }}</span>
        </h1>
        <p class="kl-lede kl-hero__lede">{{ t(HOME.hero.lede) }}</p>
        <div class="kl-hero__stats">
          <div v-for="(s, i) in HOME.hero.stats" :key="s.id" class="kl-hero__stat kl-hero__in" :style="{ '--d': i }">
            <p class="kl-num">{{ fmt(s.value) }}<span v-if="s.suffix" class="kl-num__unit">{{ t(s.suffix) }}</span></p>
            <span v-if="s.id === 'genomes'" class="kl-hero__waffle" aria-hidden="true"><i v-for="n in 10" :key="n" /></span>
            <p class="kl-meta">{{ glue(t(s.label)) }}</p>
          </div>
        </div>
      </div>
      <HeroMap class="kl-hero__map" />
      <ul class="kl-hero__doors">
        <li v-for="(d, i) in HOME.hero.doors" :key="d.id" class="kl-hero__in" :style="{ '--d': i + 2 }">
          <a :href="href(d.href)" class="kl-card kl-hero__door" :class="{ 'kl-card--primary': d.id === 'join' }">
            <span class="kl-hero__door-t">{{ t(d.title) }} <ArrowIcon /></span>
            <span class="kl-hero__door-s">{{ glue(t(d.sub)) }}</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.kl-hero { padding-block: 36px 24px; }
.kl-hero__grid { position: relative; z-index: 1; display: grid; grid-template-areas: "text" "doors" "map"; }
.kl-hero__text { grid-area: text; }
.kl-hero__eyebrow { text-wrap: balance; }
.kl-hero__eyebrow span { white-space: nowrap; }
.kl-hero__h1 { margin-top: 14px; }
.kl-hero__h1 em { white-space: nowrap; }
.kl-home--zh .kl-hero__line { display: block; }
.kl-hero__lede { margin-top: 18px; }
/* zh: break at punctuation, not inside words (分化, 评述). */
.kl-home--zh .kl-hero__lede, .kl-home--zh .kl-hero__stat .kl-meta { word-break: keep-all; overflow-wrap: anywhere; }
.kl-home--zh .kl-hero__lede { max-width: 22em; } /* two lines from 400 px, broken at the comma */

/* Stats. Below 720: stacked (number + waffle on one row, the label beneath). ≥ 720: side by side on one shared
   grid, so the numbers, the waffle row and the labels line up across both stats. */
.kl-hero__stats { display: grid; gap: 20px; margin-top: 28px; }
.kl-hero__stat { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 16px; row-gap: 8px; align-items: center; }
.kl-hero__stat .kl-num { grid-area: 1 / 1; }
.kl-hero__stat .kl-meta { grid-area: 2 / 1 / 3 / 3; max-width: 30em; }
.kl-hero__waffle { grid-area: 1 / 2; display: flex; gap: 3px; }
.kl-hero__waffle i { width: 9px; height: 9px; border-radius: 2px; box-shadow: inset 0 0 0 1px var(--kl-line-strong); }
.kl-hero__waffle i:first-child { background: var(--kl-accent); box-shadow: none; animation: kl-bloom .45s var(--kl-ease-back) .8s both; }

/* Doors: stacked rows below 960, a row of three from 960. */
.kl-hero__doors { grid-area: doors; display: grid; gap: 10px; margin-top: 28px; }
.kl-hero__door { display: flex; flex-direction: column; justify-content: center; gap: 2px; min-height: 64px; padding: 14px 18px; }
.kl-hero__door-t { display: flex; align-items: center; gap: .4em; font-size: 1.0625rem; font-weight: 700; line-height: 1.4; color: var(--kl-ink); }
.kl-hero__door-s { font-size: .8125rem; line-height: 1.5; color: var(--kl-ink-3); text-wrap: balance; }
.kl-card--primary .kl-hero__door-t { color: inherit; }
.kl-card--primary .kl-hero__door-s { color: var(--kl-on-primary-2); }

/* Map: full-bleed on phones; inside the container from 600. */
.kl-hero__map { grid-area: map; margin: 28px calc(-1 * var(--kl-gutter)) 0; }

/* First paint: stats then doors rise once (CSS only; reduced motion and ?kl-motion=off drop it). */
.kl-hero__in { animation: kl-rise .5s var(--kl-ease-std) calc(.2s + var(--d) * .06s) both; }

@media (max-width: 399px) {
  .kl-hero__eyebrow { font-size: 12px; letter-spacing: .08em; }
}
@media (min-width: 600px) {
  .kl-hero__map { margin: 36px 0 0; }
  .kl-hero__door { padding: 16px 22px; }
}
@media (min-width: 720px) {
  .kl-hero__stats { grid-template-columns: auto auto; grid-template-rows: auto auto auto; justify-content: start; gap: 0 48px; }
  .kl-hero__stat { grid-template-columns: none; grid-row: span 3; grid-template-rows: subgrid; gap: 0; align-items: start; }
  .kl-hero__stat .kl-num { grid-area: 1 / 1; }
  .kl-hero__waffle { grid-area: 2 / 1; margin-top: 12px; }
  .kl-hero__stat .kl-meta { grid-area: 3 / 1; margin-top: 10px; max-width: 17em; }
}
@media (min-width: 960px) {
  .kl-hero { display: flex; align-items: center; min-height: calc(100svh - var(--vp-nav-height, 64px)); padding-block: clamp(20px, 4vh, 80px); box-sizing: border-box; }
  .kl-hero__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-areas: "text map" "doors doors"; column-gap: 56px; align-items: center; }
  .kl-hero__h1 { margin-top: 16px; }
  /* Two authored lines: "Reading human history" (664 px at 64 px) fills the column at most (col = 50vw − 60px). */
  .kl-home--en .kl-hero__h1 { font-size: min(3.2rem, 4.7vw - 5.7px); }
  .kl-home--en .kl-hero__line { display: block; white-space: nowrap; }
  .kl-hero__lede { margin-top: 22px; }
  .kl-hero__stats { margin-top: clamp(24px, 4.5vh, 40px); }
  .kl-hero__map { margin: 0; }
  .kl-hero__doors { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: clamp(24px, 5vh, 56px); }
  .kl-hero__door { gap: 6px; min-height: clamp(80px, 11.5vh, 104px); padding: clamp(12px, 2.2vh, 18px) 24px; }
  .kl-hero__door-t { font-size: 1.1875rem; }
}
</style>
