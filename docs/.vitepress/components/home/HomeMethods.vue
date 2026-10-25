<script setup lang="ts">
// STUB (foundation v2). Owned and fully replaced by the METHODS workstream.
import { HOME } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import SectionHead from './ui/SectionHead.vue'
const { t } = useHome()
</script>

<template>
  <section id="how" class="kl-band" aria-labelledby="how-h">
    <div class="kl-container">
      <SectionHead id="how-h" :kicker="HOME.methods.kicker" :title="HOME.methods.h2" />
    </div>
  </section>
  <section id="genomes" class="kl-band" aria-labelledby="genomes-h">
    <div class="kl-container">
      <SectionHead id="genomes-h" :title="HOME.methods.genomes.h3" :level="3" />
      <p class="kl-body" style="margin-top: 8px">{{ t(HOME.methods.genomes.body) }}</p>
    </div>
  </section>
</template>
