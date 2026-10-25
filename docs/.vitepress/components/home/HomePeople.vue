<script setup lang="ts">
// STUB (foundation v2). Owned and fully replaced by the PEOPLE workstream.
import { HOME } from './home.content.ts'
import SectionHead from './ui/SectionHead.vue'
</script>

<template>
  <section id="people" class="kl-band" aria-labelledby="people-h">
    <div class="kl-container">
      <SectionHead id="people-h" :kicker="HOME.people.kicker" :title="HOME.people.h2" />
    </div>
  </section>
</template>
