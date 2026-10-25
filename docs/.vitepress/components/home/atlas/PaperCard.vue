<script setup lang="ts">
// PaperCard — one highlight study: venue · year / plain-language headline / "Read the paper ↗" (DOI, new tab,
// title = the original English title). The whole card is the link's hit area; the link's accessible name is
// its own label followed by the headline, so a screen reader's link list tells the eight papers apart.
// Hover / keyboard focus lights up the paper's regions on the stage (emits `hot`).
import type { Paper, RegionId } from '../home.content.ts'
import { useHome } from '../lib/useHome.ts'
import { vReveal } from '../lib/reveal.ts'
import PaperLink from '../ui/PaperLink.vue'

const props = defineProps<{ paper: Paper; i?: number }>()
const emit = defineEmits<{ hot: [regions: RegionId[]] }>()
const { t } = useHome()
const on = () => emit('hot', props.paper.regions)
const off = () => emit('hot', [])
const id = `paper-${props.paper.id}`
</script>

<template>
  <li :id="id" v-reveal class="kl-card kl-card--hover kl-paper" :style="`--i:${i ?? 0}`"
      @mouseenter="on" @mouseleave="off" @focusin="on" @focusout="off">
    <p class="kl-meta"><strong>{{ paper.venue }}</strong> · {{ paper.year }}</p>
    <p :id="`${id}-h`" class="kl-headline">{{ paper.headline ? t(paper.headline) : paper.title }}</p>
    <PaperLink :id="`${id}-a`" :paper="paper" :aria-labelledby="`${id}-a ${id}-h`" />
  </li>
</template>

<style scoped>
.kl-paper { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 20px 22px; }
.kl-paper .kl-meta { font-variant-numeric: tabular-nums; }
.kl-paper strong { font-weight: 600; color: var(--kl-ink-2); }
.kl-paper :deep(.kl-paperlink) { margin-top: 8px; }
.kl-paper :deep(.kl-paperlink)::after { content: ''; position: absolute; inset: 0; border-radius: inherit; }
</style>
