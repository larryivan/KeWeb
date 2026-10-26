<script setup lang="ts">
// HomeAtlas — "Findings" (#findings). Desktop (>= 960 px): the text column (intro, five chapters, home) scrolls
// past a sticky map stage whose camera glides to each chapter's regions and finally home to Shanghai.
// Below 960 px: the same stage is pinned to the top of the screen and the chapters scroll beneath it. The
// chapters and cards are the text equivalent of the map (the stage is aria-hidden).
import { ref } from 'vue'
import { HOME, CHAPTERS, REGIONS } from './home.content.ts'
import type { RegionId } from './home.content.ts'
import { chapterHighlights } from './lib/derive.ts'
import { useHome } from './lib/useHome.ts'
import { data as atlas } from './atlas.data'
import SectionHead from './ui/SectionHead.vue'
import ArrowIcon from './ui/ArrowIcon.vue'
import AtlasStage from './atlas/AtlasStage.vue'
import AtlasChapter from './atlas/AtlasChapter.vue'
import { useAtlasCamera } from './atlas/useAtlasCamera.ts'

const { t, href } = useHome()
const A = HOME.atlas
const label = Object.fromEntries(REGIONS.map((r) => [r.id, t(r.id === 'shanghai' ? HOME.hero.homeLabel : r.label)])) as Record<RegionId, string>

const grid = ref<HTMLElement | null>(null)
const stage = ref<InstanceType<typeof AtlasStage> | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const hot = ref<RegionId[]>([])
const { active, sides, hidden, origin, glow } = useAtlasCamera({
  root: grid,
  stage: stageEl,
  map: () => stage.value?.map() ?? null,
  atlas,
  text: (id) => label[id],
})
const setStage = (c: unknown) => {
  stage.value = c as InstanceType<typeof AtlasStage> | null
  stageEl.value = (c as { el?: HTMLElement } | null)?.el ?? null
}
</script>

<template>
  <section id="findings" class="kl-band kl-atlas" aria-labelledby="findings-h">
    <div ref="grid" class="kl-container kl-atlas__grid">
      <div class="kl-atlas__intro" data-stop="intro">
        <a class="kl-sr kl-atlas__skip" href="#campus">{{ t(A.skip) }}</a>
        <SectionHead id="findings-h" :kicker="A.kicker" :title="A.h2" :lede="A.lede" />
      </div>
      <AtlasStage :ref="setStage" :stop="active" :hot="hot" :sides="sides" :hidden="hidden" :origin="origin" :glow="glow" />
      <AtlasChapter v-for="c in CHAPTERS" :key="c.id" class="kl-atlas__stop" :stop="c.id" :n="c.n" :title="c.title"
                    :body="c.blurb" :papers="chapterHighlights(c.id)" @hot="(r) => (hot = r)" />
      <AtlasChapter class="kl-atlas__stop kl-atlas__home" stop="home" :n="A.home.n" :title="A.home.title" :body="A.home.body">
        <a class="kl-btn kl-btn--secondary kl-atlas__all" :href="href(A.allPapers.href)">{{ t(A.allPapers) }} <ArrowIcon /></a>
      </AtlasChapter>
    </div>
  </section>
</template>

<style scoped>
.kl-atlas__grid { position: relative; }
.kl-atlas__intro { position: relative; }
/* Keyboard only: the skip link shows in the band's top padding, above the kicker, never over it. */
.kl-atlas__skip:focus {
  z-index: 2; top: -52px; left: 0; width: auto; height: auto; margin: 0; padding: 8px 14px;
  clip: auto; clip-path: none; overflow: visible; white-space: nowrap; border-radius: 999px;
  background: var(--kl-surface); border: 1px solid var(--kl-line); box-shadow: var(--kl-shadow);
  font-size: .875rem; line-height: 1.4; font-weight: 600; color: var(--kl-accent); outline-offset: 2px;
}
.kl-atlas__stop { margin-top: 64px; }
.kl-atlas__all { margin-top: 28px; align-self: flex-start; justify-self: start; }
@media (max-width: 959px) {
  /* The nav scrolls away below 960 px, so the stage pins to the very top. Its 10px bg-coloured halo hides the
     cards sliding underneath; the chapters keep enough height to hold each view while they are read. */
  .kl-atlas__intro { margin-bottom: 28px; }
  .kl-atlas__stage { position: sticky; top: 10px; z-index: 3; height: clamp(220px, 64vw, 42svh); margin-bottom: 8px; border-radius: 16px; }
  .kl-atlas__stop { margin-top: 0; padding-block: 44px; min-height: 52svh; }
  .kl-atlas__home { min-height: 40svh; }
}
@media (min-width: 960px) {
  .kl-atlas__grid {
    --gap: clamp(40px, 4vw, 56px);
    --stage-h: min(calc((min(100vw, var(--kl-max)) - 2 * var(--kl-gutter) - var(--gap)) / 2), calc(100vh - var(--vp-nav-height, 64px) - 64px), 600px);
    --pad: clamp(48px, 9vh, 96px);
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: var(--gap); align-items: start;
  }
  .kl-atlas__grid > * { grid-column: 1; }
  .kl-atlas__stage {
    grid-column: 2; grid-row: 1 / span 7; position: sticky; height: var(--stage-h);
    top: calc(var(--vp-nav-height, 64px) + (100vh - var(--vp-nav-height, 64px) - var(--stage-h)) / 2);
  }
  /* The intro is a stop of its own: the overview holds while the heading is read (and after the hero's door). */
  .kl-atlas__intro { min-height: calc(var(--stage-h) * .9); display: flex; flex-direction: column; justify-content: center; }
  .kl-atlas__stop {
    margin: 0; min-height: 56vh; box-sizing: border-box; padding-block: var(--pad);
    display: flex; flex-direction: column; justify-content: center;
  }
  /* The last stop keeps the map in view to the end, its content in the same rhythm as the chapters above. */
  .kl-atlas__home { min-height: var(--stage-h); justify-content: flex-start; padding-bottom: 0; }
}
</style>

<style>
/* The map panel (the sticky stage at every width): a bg-2 plate whose dot land keeps its share of the
   grid at every zoom (a constant size in map units, so a close view still draws coasts), dissolves into the
   plate's edge instead of being cut by it, and lets context marks recede to a faint dot. */
.kl-home .kl-atlas__stage {
  --kl-map-bg: var(--kl-bg-2); --kl-land: rgba(30, 58, 138, .3);
  overflow: hidden; background: var(--kl-bg-2); border: 1px solid var(--kl-line); box-shadow: var(--kl-shadow);
}
.dark .kl-home .kl-atlas__stage { --kl-land: rgba(148, 163, 184, .4); }
/* Phones: the pinned stage wears a bg-coloured halo (12 px all round, deeper below) so nothing that scrolls
   beneath it shows at its edges. (Here, not in the scoped block: it must win over the panel shadow above.) */
@media (max-width: 959px) {
  .kl-home .kl-atlas__stage.kl-atlas__stage { box-shadow: 0 0 0 12px var(--kl-bg), 0 22px 18px 4px var(--kl-bg), var(--kl-shadow); }
}
.kl-home .kl-atlas__stage .kl-map { height: 100%; }
.kl-home .kl-atlas__stage .kl-map__land { stroke-width: max(2.5px, calc(var(--kl-u, 1) * var(--dot, 1.6px))) !important; }
.kl-home .kl-atlas__stage::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  box-shadow: inset 0 0 var(--fade) calc(var(--fade) / 4) var(--kl-bg-2);
}
/* Context endpoints (Steppe, Central Plains, …) are named more quietly than the study sites. */
.kl-home .kl-atlas__stage .kl-mark--endpoint .kl-map-label { font-size: 12px; font-weight: 500; fill: var(--kl-ink-3); }
.kl-home .kl-atlas__stage .kl-mark__ring { transition: opacity var(--kl-t-base) var(--kl-ease-std); }
.kl-home .kl-atlas__stage .kl-mark.is-dim:not(.is-active, .is-hot) .kl-mark__ring { opacity: 0; }
</style>
