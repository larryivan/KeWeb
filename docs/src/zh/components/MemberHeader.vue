<template>
  <div class="publications-full-width">
    <!-- Full-width banner with gradient design matching BlogArchive -->
    <div class="w-full bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950/80 dark:to-slate-900 border-b border-amber-200 dark:border-amber-900/30 mb-12 relative overflow-hidden">
      <!-- Add Fudan University image as background -->
      <div class="absolute inset-0 opacity-20 dark:opacity-10">
        <img src="https://larryivan.github.io/picx-images-hosting/20250507/7.2yykh6w1r0.jpg" alt="复旦大学" class="w-full h-full object-cover" />
      </div>
      <div class="absolute inset-0 opacity-5 dna-pattern-enhanced"></div>
      <div class="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div class="flex flex-col items-center justify-center text-center">
          <div class="mb-4 inline-flex items-center justify-center rounded-full bg-amber-100 px-3 py-1 dark:bg-amber-900/50">
            <span class="mr-1.5 text-amber-600 dark:text-amber-400">👬🏻</span>
            <span class="text-sm font-medium text-amber-800 dark:text-amber-300">MEMBERS</span>
          </div>
          <div class="text-4xl font-bold tracking-tight text-amber-900 dark:text-amber-200 md:text-5xl lg:text-6xl">
            团队成员
          </div>
          <div class="mt-6 h-1 w-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.publications-full-width {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

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