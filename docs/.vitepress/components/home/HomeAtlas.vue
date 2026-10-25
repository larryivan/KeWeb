<script setup lang="ts">
// STUB (foundation v2). Owned and fully replaced by the ATLAS workstream. It only exercises the card
// primitives (kl-card, kl-meta, kl-headline, PaperLink, kl-link) so the foundation can be checked visually.
import { HOME, CHAPTERS } from './home.content.ts'
import { chapterHighlights } from './lib/derive.ts'
import { useHome } from './lib/useHome.ts'
import SectionHead from './ui/SectionHead.vue'
import PaperLink from './ui/PaperLink.vue'
import ArrowIcon from './ui/ArrowIcon.vue'
const { t, href } = useHome()
</script>

<template>
  <section id="findings" class="kl-band" aria-labelledby="findings-h">
    <div class="kl-container">
      <SectionHead id="findings-h" :kicker="HOME.atlas.kicker" :title="HOME.atlas.h2" :lede="HOME.atlas.lede" />
      <ul class="kl-atlas-stub">
        <template v-for="c in CHAPTERS" :key="c.id">
          <li v-for="p in chapterHighlights(c.id)" :id="`paper-${p.id}`" :key="p.id" class="kl-card kl-card--pad kl-card--hover">
            <p class="kl-meta"><strong>{{ p.venue }}</strong> · {{ p.year }}</p>
            <p class="kl-headline">{{ p.headline ? t(p.headline) : p.title }}</p>
            <PaperLink :paper="p" />
          </li>
        </template>
      </ul>
      <a class="kl-link" :href="href(HOME.atlas.allPapers.href)">{{ t(HOME.atlas.allPapers) }} <ArrowIcon /></a>
    </div>
  </section>
</template>

<style scoped>
.kl-atlas-stub { display: grid; gap: 16px; margin: 40px 0 32px; }
.kl-atlas-stub li { display: flex; flex-direction: column; gap: 8px; }
.kl-atlas-stub strong { font-weight: 600; color: var(--kl-ink-2); }
@media (min-width: 768px) { .kl-atlas-stub { grid-template-columns: repeat(2, 1fr); } }
</style>
