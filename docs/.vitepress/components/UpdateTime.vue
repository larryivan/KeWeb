<template>
  <div v-if="lastUpdated && lastUpdatedText" class="py-1 text-sm font-medium">
    📝 {{ lastUpdatedText }}: {{ lastUpdated }}
  </div>
</template>

<script setup>
import { useData } from "vitepress";
import { computed } from "vue";
import dayjs from "dayjs";

const { frontmatter, page, theme } = useData();

const lastUpdated = computed(() => {
  // 禁用日期判定
  if (frontmatter.value.lastUpdated === false) return "";
  // 优先取博文前的自定义时间日期 `updateTime`
  else if (frontmatter.value.updateTime) return frontmatter.value.updateTime;
  // 取系统生成的 git 提交时间
  else return dayjs(page.value.lastUpdated).format("YYYY-MM-DD HH:mm") || "";
});

const lastUpdatedText = computed(() => theme.value.lastUpdatedText);

</script>
