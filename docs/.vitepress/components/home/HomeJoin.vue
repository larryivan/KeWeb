<script setup lang="ts">
// STUB (foundation v2). Owned and fully replaced by the JOIN workstream. Exercises the two button styles.
import { HOME } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import SectionHead from './ui/SectionHead.vue'
import ArrowIcon from './ui/ArrowIcon.vue'
const { t, href } = useHome()
</script>

<template>
  <section id="join" class="kl-band kl-band--alt" aria-labelledby="join-h">
    <div class="kl-container">
      <SectionHead id="join-h" :kicker="HOME.join.kicker" :title="HOME.join.h2" :lede="HOME.join.body" />
      <p style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px">
        <a class="kl-btn kl-btn--primary" :href="`mailto:${HOME.join.email}`">{{ t(HOME.join.primary) }}</a>
        <a class="kl-btn kl-btn--secondary" :href="href(HOME.join.team.href)">{{ t(HOME.join.team) }} <ArrowIcon /></a>
      </p>
    </div>
  </section>
  <section id="outreach" class="kl-band kl-band--alt" aria-labelledby="outreach-h">
    <div class="kl-container">
      <SectionHead id="outreach-h" :title="HOME.outreach.h3" :level="3" />
    </div>
  </section>
</template>
