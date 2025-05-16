<template>
  <div class="blog-post-header">
    <div class="compact-header">
      <!-- Title with refined typography (using div instead of h1) -->
      <div class="title" role="heading" aria-level="1">{{ frontmatter.title }}</div>
      
      <!-- Subtle separator line -->
      <div class="separator"></div>
      
      <!-- Compact metadata row -->
      <div class="metadata">
        <span v-if="frontmatter.author" class="author">{{ frontmatter.author }}</span>
        <span v-if="frontmatter.author && frontmatter.authorTitle" class="bullet">•</span>
        <span v-if="frontmatter.authorTitle" class="affiliation">{{ frontmatter.authorTitle }}</span>
        <span class="bullet">•</span>
        <span class="date">{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress';
import { computed } from 'vue';

const { frontmatter } = useData();

// Format the date
const formattedDate = computed(() => {
  if (!frontmatter.value.date) return '';
  
  try {
    const date = new Date(frontmatter.value.date);
    // 使用中文日期格式
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return frontmatter.value.date; // Return as-is if parsing fails
  }
});
</script>

<style scoped>
.compact-header {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  padding: 1.5rem 0 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(214, 211, 209, 0.3);
}

.dark .compact-header {
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
}

.title {
  font-size: 3 rem;  /* Increased from 1.9rem */
  line-height: 1.3;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: rgba(28, 25, 23, 0.95);
  letter-spacing: -0.01em;
  /* Add display block to ensure it behaves like a heading */
  display: block;
}

.dark .title {
  color: rgba(248, 250, 252, 0.95);
}

.separator {
  width: 2rem;
  height: 2px;
  background-color: rgba(180, 83, 9, 0.7);
  margin-bottom: 0.75rem;
}

.dark .separator {
  background-color: rgba(217, 119, 6, 0.7);
}

.metadata {
  font-size: 0.875rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
  color: rgba(87, 83, 78, 0.9);
}

.dark .metadata {
  color: rgba(148, 163, 184, 0.9);
}

.author {
  font-weight: 500;
}

.affiliation {
  font-style: italic;
}

.bullet {
  color: rgba(120, 113, 108, 0.6);
  margin: 0 0.125rem;
}

.dark .bullet {
  color: rgba(148, 163, 184, 0.6);
}

@media (min-width: 640px) {
  .title {
    font-size: 2.5rem;  /* Increased from 2.1rem */
  }
}
</style> 