<template>
  <!-- Full-width banner with improved design -->
  <div class="w-full bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950/80 dark:to-slate-900 border-b border-amber-200 dark:border-amber-900/30 mb-12">
    <div class="absolute inset-0 opacity-5 dna-pattern-enhanced"></div>
    <div class="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div class="flex flex-col items-center justify-center text-center">
        <div class="mb-4 inline-flex items-center justify-center rounded-full bg-amber-100 px-3 py-1 dark:bg-amber-900/50">
          <span class="mr-1.5 text-amber-600 dark:text-amber-400">🧬</span>
          <span class="text-sm font-medium text-amber-800 dark:text-amber-300">ARCHIVE</span>
        </div>
        <h1 class="text-4xl font-bold tracking-tight text-amber-900 dark:text-amber-200 md:text-5xl lg:text-6xl">
          {{ hero.title || "古DNA研究" }}
        </h1>
        <div class="mt-6 h-1 w-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></div>
      </div>
    </div>
  </div>

  <!-- Main content container -->
  <div class="max-w-6xl px-4 pb-12 mx-auto sm:px-6">
    <!-- Enhanced content area with better widescreen utilization -->
    <div class="space-y-12">
      <!-- Featured Posts - Enhanced for widescreen -->
      <section v-if="featuredPosts && featuredPosts.length > 0">
        <div class="flex items-center mb-6 border-b border-amber-100 dark:border-amber-900/30 pb-2">
          <h2 class="text-lg font-medium text-amber-700 dark:text-amber-400">推荐研究</h2>
        </div>
        
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <PostCard
            v-for="post of featuredPosts"
            :key="post.url"
            :post="post"
            :flow="false"
            featured
          ></PostCard>
        </div>
      </section>

      <!-- Recent Updates - Enhanced for widescreen -->
      <section>
        <div class="flex items-center mb-6 border-b border-amber-100 dark:border-amber-900/30 pb-2">
          <h2 class="text-lg font-medium text-amber-700 dark:text-amber-400">近期发现</h2>
        </div>
        
        <div :class="[
          flow ? 'sm:columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6' : 
                'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        ]">
          <PostCard
            v-for="post of filteredPosts"
            :key="post.url"
            :post="post"
            :flow="flow"
          ></PostCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from 'vue';
// 注意：这里的路径需要相对于当前文件 (docs/src/zh/components/BlogArchive.vue)
// 指向 docs/.vitepress/utils/article.data.js
import { data as allPosts } from "../../../.vitepress/utils/article.data.js"; 
import PostCard from "./BlogArchivePostCard.vue"; // Corrected path for zh version

// Get page data including title, categories, and featured posts
const { frontmatter: pageData, theme } = useData();
const hero = computed(() => pageData.value?.hero || {});
const types = computed(() => pageData.value?.types);
const features = computed(() => pageData.value?.features || []);
const flow = computed(() => pageData.value?.flow || false);

// Get sidebar data based on current page path and build categories
const pathname = typeof window !== 'undefined' ? window.location.pathname : '/zh/'; // Default to /zh/ for SSR
const sidebarData = computed(() => theme.value?.sidebar?.[pathname]);
const categories = computed(() => 
  types.value || sidebarData.value?.items?.map((item: any) => ({ name: item.text, link: item.link })) || []
);

// Fetch featured posts based on provided URLs
const featuredPosts = computed(() => {
  if (!features.value || !features.value.length) return null;
  return features.value
    .map((url: string) => allPosts.find((post) => post.url === url || post.url === `/zh${url.startsWith('/') ? url : '/' + url}`))
    .filter(Boolean);
});

// Filter out featured posts from regular posts list
const filteredPosts = computed(() => {
  if (!allPosts || allPosts.length === 0) return [];
  
  const featuredUrls = (featuredPosts.value || []).map(post => post.url);
  // 仅显示中文文章，或者如果文章有语言标记，则根据语言过滤
  return allPosts.filter(post => post.url.startsWith('/zh/') && !featuredUrls.includes(post.url));
});
</script>

<style scoped>
.dna-pattern-enhanced {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  animation: dnaFloat 120s linear infinite;
  pointer-events: none;
}

@keyframes dnaFloat {
  0% { background-position: 0 0; }
  100% { background-position: 300px 300px; }
}
</style> 