<template>
  <div class="press-content">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <!-- Press Coverage Section -->
      <div class="mb-20">
        <h2 class="section-title">研究成果媒体报道</h2>
        
        <!-- Press articles grid -->
        <div class="grid grid-cols-1 gap-6">
          <div 
            v-for="(article, index) in pressArticles" 
            :key="index"
            class="bg-white dark:bg-slate-800/90 rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-amber-50 dark:border-slate-700/60 hover:shadow-xl hover:border-amber-200 dark:hover:border-slate-600 group"
          >
            <!-- Article content -->
            <div class="p-6">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <!-- Left side: Publication info -->
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <!-- Publication badge -->
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      {{ article.publication }}
                    </span>
                    <!-- Year badge -->
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-slate-700/60 dark:text-gray-300">
                      {{ article.year }}
                    </span>
                    <!-- Type badge -->
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {{ article.type }}
                    </span>
                  </div>
                  
                  <!-- Title with improved typography -->
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {{ article.title }}
                  </h3>
                </div>
                
                <!-- Right side: External link -->
                <div class="flex-shrink-0">
                  <a 
                    :href="article.url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg transition-colors font-medium"
                  >
                    <span>阅读文章</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Press coverage data
const pressArticles = [
  {
    publication: "Nature",
    type: "研究简报",
    year: "2025",
    title: "研究简报",
    url: "https://www.nature.com/articles/d41586-024-04150-2"
  },
  {
    publication: "Nature",
    type: "新闻",
    year: "2023",
    title: "新闻报道",
    url: "https://www.nature.com/articles/d41586-023-02562-0"
  },
  {
    publication: "Science",
    type: "新闻",
    year: "2023",
    title: "Ötzi the Tyrolean Iceman had dark skin and receding hairline",
    url: "https://www.science.org/content/article/otzi-tyrolean-iceman-had-dark-skin-and-receding-hairline"
  },
  {
    publication: "Science",
    type: "新闻",
    year: "2023",
    title: "Native Americans and their genes traveled back to Siberia, new genomes reveal",
    url: "https://www.science.org/content/article/native-americans-and-their-genes-traveled-back-siberia-new-genomes-reveal"
  },
  {
    publication: "Science",
    type: "新闻",
    year: "2020",
    title: "Horse mastery helped mysterious Mongolian warriors build multiethnic empires",
    url: "https://www.science.org/content/article/horse-mastery-helped-mysterious-mongolian-warriors-build-multiethnic-empires"
  },
  {
    publication: "CNN",
    type: "新闻",
    year: "2023",
    title: "Ötzi the Iceman had dark skin and was likely bald, study finds",
    url: "https://edition.cnn.com/2023/08/16/europe/otzi-the-iceman-physical-traits-scn"
  },
  {
    publication: "The Guardian",
    type: "新闻",
    year: "2023",
    title: "Ötzi iceman had receding hairline and dark skin tone, study reveals",
    url: "https://www.theguardian.com/science/2023/aug/16/otzi-iceman-receding-hairline-dark-skin-tone-study-reveals"
  }
];
</script>

<style scoped>
.section-title {
  @apply text-2xl font-bold text-amber-800 dark:text-amber-300 mb-8 relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-amber-400 before:to-amber-600 before:rounded-full;
}

.press-content {
  background-image: radial-gradient(circle at 1px 1px, rgba(217, 119, 6, 0.06) 1px, transparent 0);
  background-size: 40px 40px;
  background-position: -19px -19px;
}

.dark .press-content {
  background-image: radial-gradient(circle at 1px 1px, rgba(217, 119, 6, 0.04) 1px, transparent 0);
}

@media (max-width: 768px) {
  .press-content {
    background-size: 30px 30px;
  }
}
</style>
