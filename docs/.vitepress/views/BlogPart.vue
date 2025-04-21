<template>
  <div>
    <!-- Improved Category Header with DNA icon -->
    <div class="flex items-center pb-3 mb-6 border-b border-amber-200/70 dark:border-amber-900/50">
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100/70 dark:bg-amber-900/40 mr-3">
        <span class="text-xl">🧬</span>
      </div>
      <h2 class="text-2xl font-medium text-amber-800 dark:text-amber-300">{{ columnData.text }}</h2>
    </div>
    
    <!-- Articles Grid with improved spacing -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Empty state with better design -->
      <div 
        v-if="!latestThreeArticle.length"
        class="sm:col-span-2 lg:col-span-3 p-10 text-center text-stone-500 rounded-lg bg-stone-50/80 dark:bg-slate-800/50 dark:text-slate-400 border border-dashed border-stone-200 dark:border-slate-700"
      >
        <div class="inline-block p-3 mb-3 rounded-full bg-amber-50 dark:bg-amber-900/20">
          <span class="text-2xl opacity-70">⏳</span>
        </div>
        <p class="text-lg font-medium">Research coming soon</p>
        <p class="mt-2 text-sm opacity-70">Check back later for updates</p>
      </div>
      
      <!-- Article cards with improved layout -->
      <div
        v-for="(item, index) in latestThreeArticle"
        :key="index"
        @click="openLink(item.link)"
        class="group cursor-pointer bg-white dark:bg-slate-800/90 rounded-lg border border-stone-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:border-amber-400 dark:hover:border-amber-500/70 hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-900/30 hover:-translate-y-1 flex flex-col"
      >
        <div class="p-6 flex flex-col flex-grow">
          <!-- Date badge -->
          <div class="flex items-center mb-3">
            <div class="w-2 h-2 mr-2 bg-amber-400 rounded-full"></div>
            <span class="text-xs font-medium text-stone-500 dark:text-slate-400">{{ getDateTime(item.updateTime) }}</span>
          </div>
          
          <!-- Title with better typography -->
          <h3 class="mb-3 text-lg font-medium group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors duration-300 leading-tight">
            {{ item.text }}
          </h3>
          
          <!-- Description with better spacing -->
          <p class="mb-5 text-sm leading-relaxed text-stone-600 dark:text-slate-300 line-clamp-3 flex-grow">
            {{ item.desc }}
          </p>
          
          <!-- Tags with better design -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(tag, tagIndex) in getTags(item)"
              :key="tagIndex"
              class="px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100/70 rounded-full dark:bg-amber-900/40 dark:text-amber-300 transition-all hover:bg-amber-200 dark:hover:bg-amber-800/50"
            >
              #{{ tag }}
            </span>
          </div>
          
          <!-- Read more indicator -->
          <div class="flex justify-end items-center mt-4 text-xs text-amber-700 dark:text-amber-400 font-medium opacity-0 group-hover:opacity-100 transition-all">
            Read more
            <svg class="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Improved View More Link -->
    <div v-if="latestThreeArticle.length" class="mt-8 text-center">
      <button
        @click="openLink(columnData.link)"
        class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-amber-800 transition-all bg-amber-100/80 rounded-lg border border-amber-200/50 hover:bg-amber-200/80 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-800/50 dark:border-amber-700/30"
      >
        View All Research
        <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vitepress";
import { computed } from "vue";

const { columnData } = defineProps(["columnData"]);
const router = useRouter();

// 计算最新三篇更新的文章
const latestThreeArticle = computed(() => {
  let res = [...columnData.items];
  res.sort((a, b) => {
    const av = a["updateTime"] ? new Date(a["updateTime"]).valueOf() : 0;
    const bv = b["updateTime"] ? new Date(b["updateTime"]).valueOf() : 0;
    return bv - av;
  });
  return res.slice(0, 3);
});

// 格式化文章更新时间
function getDateTime(item) {
  let date = new Date(item);
  let formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formattedDate;
}

// 获取文章的前两个tag
function getTags(item) {
  if (!item?.tags) return [];
  let tagsArr = item.tags.split("/").slice(0, 2);
  return tagsArr;
}
// 打开文章连接
function openLink(link) {
  router.go(link);
}
</script>

<style scoped>
*::-webkit-scrollbar {
  display: none;
}
</style>
