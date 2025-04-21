<template>
  <div 
    @click="openLink(post.url)"
    :class="[
      'group bg-white dark:bg-slate-800/90 rounded-lg overflow-hidden',
      'border border-stone-200 dark:border-slate-700',
      'transition-all duration-300 ease-out',
      'hover:border-amber-400 hover:scale-[1.01] dark:hover:border-amber-500/70',
      'hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-900/30',
      featured ? 'ring-2 ring-amber-400/30 dark:ring-amber-600/30' : '',
      flow ? 'mb-0 break-inside-avoid' : '',
      'h-full flex flex-col'
    ]"
  >
    <div class="relative p-6 flex flex-col flex-grow">
      <!-- Top pattern for featured posts -->
      <div 
        v-if="featured" 
        class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"
      ></div>
      
      <!-- Date badge with improved design -->
      <div class="flex items-center mb-3">
        <div class="w-2 h-2 mr-2 bg-amber-400 dark:bg-amber-500 rounded-full"></div>
        <span class="text-xs font-medium text-stone-500 dark:text-slate-400">{{ post.date.string }}</span>
      </div>
      
      <!-- Title with DNA icon and better hover effect -->
      <h2 :class="[
        'font-semibold mb-3 group-hover:text-amber-800 dark:group-hover:text-amber-300',
        'transition-all duration-300 leading-tight',
        featured ? 'text-xl' : 'text-lg'
      ]">
        <span class="inline-block w-5 mr-1.5 text-amber-600 dark:text-amber-400 opacity-80">🧬</span>
        {{ getTitle(post) }}
      </h2>
      
      <!-- Description with better spacing -->
      <p class="mb-5 text-sm leading-relaxed text-stone-600 dark:text-slate-300 line-clamp-3 flex-grow">
        {{ post.frontmatter.desc }}
      </p>
      
      <!-- Tags with improved visual design -->
      <div class="flex flex-wrap gap-2 mt-auto">
        <span 
          v-for="(tag, tagIndex) in getTags(post)"
          :key="tagIndex"
          class="px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100/70 rounded-full dark:bg-amber-900/40 dark:text-amber-300 transition-all hover:bg-amber-200 dark:hover:bg-amber-800/50"
        >
          #{{ tag }}
        </span>
      </div>
      
      <!-- Read more indicator -->
      <div class="flex justify-end items-center mt-4 text-xs text-amber-700 dark:text-amber-400 font-medium transition-all opacity-0 group-hover:opacity-100">
        Read more
        <svg class="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vitepress";
import { ref, onMounted } from "vue";

// Define proper types for Post 
interface Frontmatter {
  title?: string;
  desc?: string;
  tags?: string;
}

interface PostDate {
  time: number;
  string: string;
}

interface Post {
  url: string;
  date: PostDate;
  frontmatter: Frontmatter;
}

// Setup translations with reactive reference
const fileName2Title = ref<Record<string, string>>({});

// Load translations when component is mounted

const router = useRouter();
const props = defineProps<{
  post: Post;
  flow?: boolean;
  featured?: boolean;
}>();

// Get article title from custom title or filename
const getTitle = (post: Post): string => {
  if (!post) return "Unknown Title";
  
  const userTitle = post.frontmatter?.title;
  if (userTitle) return userTitle;

  const { url } = post;
  if (!url) return "Missing URL";
  
  const matches = url.match(/.*\/(.*.html)/);
  let fileName = matches && matches[1].replace(".html", "");
  if (fileName) return fileName2Title.value[fileName] || fileName;
  return "Untitled";
};

// Get first two tags
const getTags = (post: Post) => {
  if (!post?.frontmatter?.tags) return [];
  return post.frontmatter.tags.split("/").slice(0, 2);
};

// Open article link with proper router navigation
const openLink = (link: string) => {
  if (!link) return;
  
  if (router) {
    // Use go for relative paths, otherwise use the appropriate router method
    if (link.startsWith('/')) {
      router.go(link);
    } else {
      // For absolute URLs or external links
      window.open(link, '_blank');
    }
  } else {
    window.location.href = link;
  }
};
</script>

<style scoped>
.post-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 24px -8px rgba(0, 0, 0, 0.05), 
              0 1px 6px -1px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dark .post-card {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 24px -8px rgba(0, 0, 0, 0.2),
              0 1px 6px -1px rgba(0, 0, 0, 0.1);
}

.post-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1),
              0 4px 8px rgba(0, 0, 0, 0.05);
}

.dark .post-card:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25),
              0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: rgba(56, 189, 248, 0.3);
}

.post-card.flow {
  margin-bottom: 1.5rem;
  page-break-inside: avoid;
  break-inside: avoid;
}

.post-card.featured {
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.dark .post-card.featured {
  border: 1px solid rgba(217, 119, 6, 0.3);
}

.post-card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.post-meta {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.post-date {
  font-size: 0.875rem;
  color: #64748b;
  position: relative;
  padding-left: 0.75rem;
}

.post-date::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0.25rem;
  height: 0.25rem;
  background: #0ea5e9;
  border-radius: 50%;
}

.featured .post-date::before {
  background: #f59e0b;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  color: #0f172a;
  background: linear-gradient(45deg, #0f172a, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dark .post-title {
  color: #f8fafc;
  background: linear-gradient(45deg, #f8fafc, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.featured .post-title {
  background: linear-gradient(45deg, #0284c7, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.5rem;
}

.dark .featured .post-title {
  background: linear-gradient(45deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.post-excerpt {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  color: #475569;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dark .post-excerpt {
  color: #cbd5e1;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: rgba(186, 230, 253, 0.4);
  color: #0284c7;
  transition: all 0.2s ease;
}

.dark .tag {
  background-color: rgba(12, 74, 110, 0.4);
  color: #38bdf8;
}

.tag:hover {
  background-color: rgba(186, 230, 253, 0.6);
}

.dark .tag:hover {
  background-color: rgba(12, 74, 110, 0.6);
}

.featured .tag {
  background-color: rgba(254, 215, 170, 0.4);
  color: #d97706;
}

.dark .featured .tag {
  background-color: rgba(120, 53, 15, 0.4);
  color: #f59e0b;
}

.featured .tag:hover {
  background-color: rgba(254, 215, 170, 0.6);
}

.dark .featured .tag:hover {
  background-color: rgba(120, 53, 15, 0.6);
}
</style>
