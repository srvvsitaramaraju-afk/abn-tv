<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useShowStore } from '@/stores/showStore'

import ShowSearchBar from '@/components/search/ShowSearchBar.vue'
import GenreRow from '@/components/shows/GenreRow.vue'
import ShowCard from '@/components/shows/ShowCard.vue'

const store = useShowStore()

onMounted(() => {
  // Preload the first few genre/index pages
  store.loadShowIndexPages([0, 1, 2])
})

const showsGroupedByGenre = computed(() => store.showsGroupedByGenre)

const hasQuery = computed(() => !!store.showSearchQuery)

const searchResults = computed(() => store.showSearchResults)
</script>

<template>
  <section>
    <ShowSearchBar />

    <!-- Search mode -->
    <div v-if="hasQuery">
      <h2 class="h6 text-uppercase text-muted mb-2">Results</h2>

      <div v-if="store.isShowSearchLoading" class="text-secondary">
        Searching...
      </div>
      <div
        v-else-if="store.showSearchError"
        class="alert alert-danger"
      >
        Error: {{ store.showSearchError }}
      </div>
      <div v-else>
        <div class="horizontal-scroll">
          <ShowCard
            v-for="s in searchResults"
            :key="s.id"
            :show="s"
          />
        </div>
      </div>
    </div>

    <!-- Genre rows (default view when no search query) -->
    <div v-else>
      <div v-if="store.isLoading" class="text-secondary">
        Loading shows...
      </div>
      <div
        v-else-if="store.error"
        class="alert alert-danger"
      >
        Error: {{ store.error }}
      </div>
      <div v-else>
        <GenreRow
          v-for="(list, genre) in showsGroupedByGenre"
          :key="genre"
          :genreName="genre"
          :shows="list"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>

.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding-bottom: 1rem;
}

.horizontal-scroll::-webkit-scrollbar {
  height: 6px;
}
.horizontal-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}
</style>