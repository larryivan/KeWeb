<script setup lang="ts">
// STUB (foundation v2). Owned and fully replaced by the HERO workstream. It only exercises the v2 primitives
// (band, H1 gradient, stats, door cards, map marks) so the foundation can be checked visually.
import { HOME, CHAPTERS } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import { splitKey } from './lib/derive.ts'
import { data as atlas } from './atlas.data'
import MapBase from './ui/MapBase.vue'
import MapMark from './ui/MapMark.vue'
import ArrowIcon from './ui/ArrowIcon.vue'
import type { ViewBox } from './ui/MapBase.vue'

const { t, tl, locale, href, fmt } = useHome()
const key = t(HOME.hero.h1Key)
// The whole map plus 100 units of sea east of the land frame, so the en "Shanghai" label (east of the mark)
// stays inside the svg down to a 358 px map (390 px phone). fitViewBox(all, …, { pad: .02 }) clips it there.
const vb: ViewBox = [-20, -14.8, 1120, 767.5]
</script>

<template>
  <section id="top" class="kl-hero kl-band kl-band--hero" aria-labelledby="top-h">
    <div class="kl-container kl-hero-stub">
      <div class="kl-hero-stub__text">
        <span class="kl-kicker">{{ t(HOME.hero.eyebrow) }}</span>
        <h1 id="top-h" class="kl-h1">
          <span v-for="(line, i) in tl(HOME.hero.h1)" :key="i" class="kl-hero-stub__line"><template
            v-for="(part, j) in splitKey(line, key)" :key="j"><em v-if="j === 1 && part" class="kl-grad">{{ part }}</em><template
            v-else>{{ part }}</template></template>{{ locale === 'en' && i === 0 ? ' ' : '' }}</span>
        </h1>
        <p class="kl-lede">{{ t(HOME.hero.lede) }}</p>
        <div class="kl-hero-stub__stats">
          <div v-for="s in HOME.hero.stats" :key="s.id">
            <div class="kl-num">{{ fmt(s.value) }}<span v-if="s.suffix" class="kl-num__unit">{{ t(s.suffix) }}</span></div>
            <p class="kl-meta">{{ t(s.label) }}</p>
          </div>
        </div>
      </div>
      <div class="kl-hero-stub__map" role="img" :aria-label="t(HOME.hero.mapAlt)">
        <MapBase :view-box="vb">
          <MapMark v-for="c in CHAPTERS" :key="c.id" :x="atlas.heroXY[c.id][0]" :y="atlas.heroXY[c.id][1]" type="led"
                   :label="t(c.heroLabel)" :label-side="c.heroLabelSide" />
          <MapMark :x="atlas.xy.shanghai[0]" :y="atlas.xy.shanghai[1]" type="home" :label="t(HOME.hero.homeLabel)" />
        </MapBase>
      </div>
      <nav class="kl-hero-stub__doors">
        <a v-for="d in HOME.hero.doors" :key="d.id" :href="href(d.href)" class="kl-card kl-card--pad"
           :class="{ 'kl-card--primary': d.id === 'join' }">
          <span class="kl-hero-stub__door">{{ t(d.title) }} <ArrowIcon /></span>
          <span class="kl-hero-stub__sub">{{ t(d.sub) }}</span>
        </a>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.kl-hero-stub { display: grid; gap: 32px; }
.kl-hero-stub__line { display: block; }
.kl-hero-stub__map { --kl-map-label-size: 12px; }
.kl-hero-stub__text { display: flex; flex-direction: column; gap: 16px; }
.kl-hero-stub__stats { display: flex; gap: 32px; }
.kl-hero-stub__stats .kl-meta { margin-top: 8px; max-width: 17em; }
.kl-hero-stub__doors { display: grid; gap: 12px; }
.kl-hero-stub__door { display: flex; align-items: center; gap: .4em; font-size: 1.125rem; font-weight: 700; }
.kl-hero-stub__sub { display: block; margin-top: 4px; font-size: .8125rem; color: var(--kl-ink-3); }
.kl-card--primary .kl-hero-stub__sub { color: var(--kl-on-primary-2); }
@media (min-width: 960px) {
  .kl-hero-stub { grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); align-items: center; }
  .kl-hero-stub__doors { grid-column: 1 / -1; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .kl-hero-stub__map { --kl-map-label-size: 15px; --kl-map-label-weight: 700; }
}
</style>
