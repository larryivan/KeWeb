<template>
  <footer class="relative px-6 py-10 border-t dark:border-zinc-800 text-black/60 dark:text-zinc-300/80">
    <div class="max-w-4xl mx-auto">
      <!-- Contact Information -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Email Section -->
        <div class="flex flex-col items-center md:items-start">
          <h4 class="text-sm font-semibold mb-3 text-black dark:text-white">{{ footer.contactTitle }}</h4>
          <div class="flex items-center gap-2 transition-colors hover:text-black dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <a href="mailto:ke_wang@fudan.edu.cn" class="hover:underline text-sm">ke_wang@fudan.edu.cn</a>
          </div>
        </div>

        <!-- Address Section -->
        <div class="flex flex-col items-center md:items-start">
          <h4 class="text-sm font-semibold mb-3 text-black dark:text-white">{{ footer.locationTitle }}</h4>
          <div class="flex items-center gap-2 transition-colors hover:text-black dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <div class="flex flex-col">
              <span class="text-sm">{{ footer.addressLine1 }}</span>
              <span class="text-xs opacity-80">{{ footer.addressLine2 }}</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div class="flex flex-col items-center md:items-start">
          <h4 class="text-sm font-semibold mb-3 text-black dark:text-white">{{ footer.linksTitle }}</h4>
          <div class="flex items-center gap-4">
            <a href="https://github.com/wangke16" aria-label="GitHub" class="transition-colors hover:text-black dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </div>
        </div>
      </div>
      
      <!-- Simplified DNA-themed divider & Copyright -->
      <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p class="text-sm font-medium flex items-center justify-center gap-1">
          <span>{{ footer.copyright }}</span> |
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.47V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.53"/><path d="M4 9.53V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3.53"/><path d="M10.46 6.21 4.7 12l5.76 5.79"/><path d="m13.54 17.79 5.76-5.79-5.76-5.79"/></svg>
          <span class="text-emerald-600 dark:text-emerald-400">{{ footer.researchFocus }}</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";

const { theme } = useData();

// Use computed for the footer object
const footer = computed(() => theme.value.footer || {});
</script>
