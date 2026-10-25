<script setup lang="ts">
// STUB (foundation v2). Owned and fully replaced by the CAMPUS workstream.
import { HOME } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import SectionHead from './ui/SectionHead.vue'
import ArrowIcon from './ui/ArrowIcon.vue'
const { t, href } = useHome()
</script>

<template>
  <section id="campus" class="kl-band kl-band--alt" aria-labelledby="campus-h">
    <div class="kl-container">
      <SectionHead id="campus-h" :kicker="HOME.campus.kicker" :title="HOME.campus.h2" :lede="HOME.campus.body" />
      <p style="margin-top: 20px"><a class="kl-link" :href="href(HOME.campus.link.href)">{{ t(HOME.campus.link) }} <ArrowIcon /></a></p>
    </div>
  </section>
</template>
