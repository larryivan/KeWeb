<script setup lang="ts">
// Picture — <picture> with AVIF + WebP sources and a JPEG/PNG fallback from img/index.ts (image host URLs,
// lead decision D1). Always sets width/height, decoding="async" and the placeholder colour (on the <img>,
// so it shows until the image paints). Add class "kl-pic--flat" to skip the dark-mode photo dimming
// (QR code, logo).
import { computed } from 'vue'
import type { Pic, PicSource } from '../img/index.ts'

const props = withDefaults(
  defineProps<{
    pic: Pic
    alt: string
    sizes?: string
    loading?: 'lazy' | 'eager'
    fetchpriority?: 'high' | 'low' | 'auto'
    objectPosition?: string
    imgClass?: string
  }>(),
  { loading: 'lazy' },
)

const srcset = (list: PicSource[]) => list.map((s) => `${s.url} ${s.w}w`).join(', ')
const imgStyle = computed(() => ({
  backgroundColor: props.pic.placeholder,
  ...(props.objectPosition ? { objectPosition: props.objectPosition } : {}),
}))
</script>

<template>
  <picture class="kl-pic">
    <source v-if="pic.avif.length" type="image/avif" :srcset="srcset(pic.avif)" :sizes="sizes" />
    <source v-if="pic.webp.length" type="image/webp" :srcset="srcset(pic.webp)" :sizes="sizes" />
    <img :class="imgClass" :src="pic.src" :width="pic.width" :height="pic.height" :alt="alt" :loading="loading"
         decoding="async" :fetchpriority="fetchpriority" :style="imgStyle" />
  </picture>
</template>
