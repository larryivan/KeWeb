<script setup lang="ts">
// PaperLink — "Read the paper ↗" (ui.readPaper) to the DOI, new tab, rel=noopener. The `title` attribute is the
// exact English title (tooltip). Renders nothing for a paper without a DOI.
import type { Paper } from '../home.content.ts'
import { HOME } from '../home.content.ts'
import { doiUrl } from '../lib/derive.ts'
import { useHome } from '../lib/useHome.ts'
import ArrowIcon from './ArrowIcon.vue'

defineProps<{ paper: Paper }>()
const { t } = useHome()
const ui = HOME.ui
</script>

<template>
  <a v-if="paper.doi" class="kl-link kl-paperlink" :href="doiUrl(paper.doi)" target="_blank" rel="noopener"
     :title="paper.title">{{ t(ui.readPaper) }}<ArrowIcon dir="upRight" /><span class="kl-sr">{{ ' ' + t(ui.newTab) }}</span></a>
</template>
