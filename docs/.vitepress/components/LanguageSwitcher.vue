<template>
  <div class="language-switcher">
    <a href="/" :class="{ active: currentLang === 'en-US' }">EN</a>
    <span>|</span>
    <a href="/zh/" :class="{ active: currentLang === 'zh-CN' }">中文</a>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vitepress'

const currentLang = ref('')
const router = useRouter()
const route = useRoute()

onMounted(() => {
  // 根据当前路径判断语言
  if (route.path.startsWith('/zh/')) {
    currentLang.value = 'zh-CN'
  } else {
    currentLang.value = 'en-US'
  }
})

// 监听路由变化
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/zh/')) {
    currentLang.value = 'zh-CN'
  } else {
    currentLang.value = 'en-US'
  }
})
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 0 8px;
}

.language-switcher a {
  font-size: 14px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.language-switcher a:hover {
  color: var(--vp-c-brand);
}

.language-switcher a.active {
  color: var(--vp-c-brand);
  font-weight: 600;
}
</style> 