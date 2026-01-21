<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ShowSearchBar from '@/components/search/ShowSearchBar.vue'

const route = useRoute()

const showSearchBar = computed(() => route.meta?.showSearch !== false)
</script>

<template>
  <div id="app">
    <header class="border-bottom" role="banner">
      <nav class="container d-flex align-items-center justify-content-between py-3" aria-label="Primary navigation">
        <RouterLink to="/" class="text-decoration-none">
          <span class="h4 m-0 logo fw-bold">
            ABN <span class="logo-text-light">TV</span>
          </span>
        </RouterLink>
      </nav>
    </header>

    <div class="container py-3">
      <ShowSearchBar v-if="showSearchBar" />
    </div>

    <main class="container py-3" role="main" aria-live="polite">
      <RouterView />
    </main>

    <footer class="border-top mt-4">
      <div class="container small py-3 text-center" role="contentinfo">
        ABN TV © {{ new Date().getFullYear() }}
      </div>
    </footer>
  </div>
</template>