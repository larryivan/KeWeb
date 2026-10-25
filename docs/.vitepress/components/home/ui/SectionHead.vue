<script setup lang="ts">
// SectionHead — optional kicker, <h2|h3 :id> (.kl-h2 / .kl-h3), optional lede; `center` centres the block.
// Pair it with <section :id aria-labelledby="<this id>">.
import type { L } from '../home.content.ts'
import { useHome } from '../lib/useHome.ts'

withDefaults(defineProps<{ id: string; kicker?: L; title: L; lede?: L; level?: 2 | 3; center?: boolean }>(), { level: 2, center: false })
const { t } = useHome()
</script>

<template>
  <div class="kl-section-head" :class="{ 'kl-section-head--center': center }">
    <span v-if="kicker" class="kl-kicker">{{ t(kicker) }}</span>
    <h3 v-if="level === 3" :id="id" class="kl-h3">{{ t(title) }}</h3>
    <h2 v-else :id="id" class="kl-h2">{{ t(title) }}</h2>
    <p v-if="lede" class="kl-lede">{{ t(lede) }}</p>
  </div>
</template>
