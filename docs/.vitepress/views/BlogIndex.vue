<template>
  <div class="max-w-5xl px-4 mx-auto pb-16 sm:px-6">
    <!-- Improved hero section with DNA animation -->
    <div class="relative overflow-hidden bg-gradient-to-r from-amber-50 to-stone-100 dark:from-slate-900 dark:to-stone-800 rounded-xl shadow-md mb-16 mt-8">
      <div class="absolute inset-0 dna-helix-pattern opacity-10"></div>
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-radial from-transparent via-transparent to-amber-200/20 dark:to-amber-900/20"></div>
      
      <div class="relative z-10 px-6 py-20 text-center sm:py-24 sm:px-12">
        <div class="inline-block p-3 mb-5 rounded-full bg-amber-100/80 dark:bg-amber-900/50 shadow-inner">
          <span class="text-3xl">🧬</span>
        </div>
        <h1 class="text-4xl font-extrabold text-amber-800 dark:text-amber-300 md:text-5xl lg:text-6xl leading-tight">
          Ancient Human DNA
        </h1>
        <p class="max-w-lg mx-auto mt-5 text-lg text-stone-600 dark:text-slate-400">
          Exploring our ancestral genetic legacy through research and discoveries
        </p>
        <div class="flex justify-center mt-6">
          <a href="#categories" class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-amber-700 hover:bg-amber-800 dark:bg-amber-700/80 dark:hover:bg-amber-600/90 transition-all">
            Explore Research
            <svg class="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Categories section with improved spacing -->
    <div id="categories" class="space-y-20">
      <BlogPart
        v-for="(item, index) in sidebarData.items"
        :key="index"
        :columnData="item"
      ></BlogPart>
    </div>
  </div>
</template>

<script setup>
import { VPTeamPage } from "vitepress/theme";
import { useData } from "vitepress";
import BlogPart from "./BlogPart.vue";

const { site } = useData();
const sidebarData = site.value.themeConfig.sidebar["/Notes/"];

/** TODO:
 * Rewrite archive page, refer to official documentation API:
 * https://skewb.gitee.io/vitepress/guide/data-loading.html#createcontentloader
 */
</script>

<style scoped>
.dna-helix-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-rule='nonzero'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: scrollPattern 40s linear infinite;
}

@keyframes scrollPattern {
  0% { 
    background-position: 0% 0%;
  }
  100% { 
    background-position: 200% 200%;
  }
}

/* Gradient background for hero */
.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%);
}
</style>
