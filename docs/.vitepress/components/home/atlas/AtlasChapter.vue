<script setup lang="ts">
// AtlasChapter — one stop of the Findings tour: number, title, one line, then its highlight cards
// (chapters) or a slot (the home stop). Below 960 px it opens with its MiniMap (beside the heading on tablets).
import type { L, Paper, RegionId } from '../home.content.ts'
import { useHome } from '../lib/useHome.ts'
import { vReveal } from '../lib/reveal.ts'
import MiniMap from './MiniMap.vue'
import PaperCard from './PaperCard.vue'
import type { StopId } from './useAtlasCamera.ts'

defineProps<{ stop: Exclude<StopId, 'intro'>; n: string; title: L; body: L; papers?: Paper[] }>()
const emit = defineEmits<{ hot: [regions: RegionId[]] }>()
const { t } = useHome()
</script>

<template>
  <section :id="`findings-${stop}`" class="kl-atlas-ch" :data-stop="stop" :aria-labelledby="`findings-${stop}-h`">
    <MiniMap :stop="stop" />
    <div v-reveal class="kl-atlas-ch__head">
      <span class="kl-atlas-ch__n" aria-hidden="true">{{ n }}</span>
      <h3 :id="`findings-${stop}-h`" class="kl-h3">{{ t(title) }}</h3>
      <p class="kl-body">{{ t(body) }}</p>
    </div>
    <ol v-if="papers?.length" class="kl-atlas-ch__cards">
      <PaperCard v-for="(p, i) in papers" :key="p.id" :paper="p" :i="i + 1" @hot="(r) => emit('hot', r)" />
    </ol>
    <slot />
  </section>
</template>

<style scoped>
.kl-atlas-ch__head { display: flex; flex-direction: column; gap: 6px; }
.kl-atlas-ch__n {
  display: flex; align-items: center; gap: 12px; margin-bottom: 4px;
  font-size: 13px; line-height: 1.4; font-weight: 700; letter-spacing: .12em; font-variant-numeric: tabular-nums; color: var(--kl-accent);
}
.kl-atlas-ch__n::after { content: ''; width: 28px; height: 1px; background: currentColor; opacity: .45; }
.kl-atlas-ch__cards { display: grid; gap: 12px; margin-top: 24px; }
.kl-atlas-ch :deep(.kl-minimap) { margin-bottom: 24px; }
/* Tablets: the mini map sits beside the heading (a phone-sized map, not a 700 px one), cards run full width. */
@media (min-width: 640px) and (max-width: 959px) {
  .kl-atlas-ch { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 32px; align-items: center; }
  .kl-atlas-ch > * { grid-column: 1 / -1; }
  .kl-atlas-ch__head { grid-column: 1; grid-row: 1; }
  .kl-atlas-ch :deep(.kl-minimap) { grid-column: 2; grid-row: 1; margin: 0; }
  .kl-atlas-ch__cards { margin-top: 28px; }
}
@media (min-width: 960px) { .kl-atlas-ch :deep(.kl-minimap) { display: none; } }
</style>
