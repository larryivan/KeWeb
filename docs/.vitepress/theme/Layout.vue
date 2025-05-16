<script setup>
import DefaultTheme from 'vitepress/theme'
// import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
  <Layout>
    <!-- <template #nav-bar-content-before>
      <LanguageSwitcher />
    </template> -->
  </Layout>
</template> 