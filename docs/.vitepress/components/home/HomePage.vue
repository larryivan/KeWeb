<script setup lang="ts">
import './styles/home.css'
import { ref } from 'vue'
import { LAND } from './land.generated'
import { provideHome } from './lib/useHome'
import { provideMotion } from './lib/useMotion'
import HomeHero from './HomeHero.vue'
import HomeAtlas from './HomeAtlas.vue'
import HomeCampus from './HomeCampus.vue'
import HomeMethods from './HomeMethods.vue'
import HomePeople from './HomePeople.vue'
import HomeJoin from './HomeJoin.vue'
const props = defineProps<{ locale: 'en' | 'zh' }>()
const root = ref<HTMLElement | null>(null)
provideHome(props.locale)
const motion = provideMotion(root)
</script>
<template>
  <main ref="root" class="kl-home" :class="`kl-home--${locale}`"
        :data-motion="motion.attr.value" :data-lite="motion.lite.value ? '' : undefined">
    <svg class="kl-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <path id="kl-land" :d="LAND.d" fill="none" stroke="currentColor" stroke-linecap="round" />
        <radialGradient id="kl-glow">
          <stop offset="0" class="kl-glow-stop" stop-opacity=".35" />
          <stop offset="1" class="kl-glow-stop" stop-opacity="0" />
        </radialGradient>
      </defs>
    </svg>
    <HomeHero /><HomeAtlas /><HomeCampus /><HomeMethods /><HomePeople /><HomeJoin />
  </main>
</template>
