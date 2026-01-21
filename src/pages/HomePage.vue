<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useShowStore } from '@/stores/showStore'

import GenreRow from '@/components/shows/GenreRow.vue'
import ShowCard from '@/components/shows/ShowCard.vue'

const store = useShowStore()

onMounted(async () => {
  await store.loadShowIndexPages([0, 1, 2, 4, 5])
})

const showsGroupedByGenre = computed(() => store.showsGroupedByGenre)
const hasQuery = computed(() => !!store.showSearchQuery)
const searchResults = computed(() => store.showSearchResults)
</script>

<template>
  <section class="py-6">
    <!-- Search bar now lives in App.vue (above) -->

    <div v-if="hasQuery">
      <h2 class="h3 mb-4 fw-bold text-uppercase">Search Results</h2>
      <div v-if="store.isShowSearchLoading" class="text-center py-8">
        Searching...
      </div>
      <div v-else-if="store.showSearchError" class="text-center py-8 text-danger">
        Please Try after SomeTime
      </div>
      <div v-else-if="searchResults.length === 0" class="text-center py-8">
        No results found.
      </div>
      <div v-else class="horizontal-scroll">
        <ShowCard
          v-for="show in searchResults"
          :key="show.id"
          :show="show"
        />
      </div>
    </div>

    <div v-else>
      <div v-if="store.isLoading" class="text-center py-10">
        Loading shows...
      </div>
      <div v-else-if="store.error" class="text-center py-10 text-danger">
        Error: {{ store.error }}
      </div>
      <div v-else>
        <GenreRow
          v-for="(shows, genre) in showsGroupedByGenre"
          :key="genre"
          :genreName="genre"
          :shows="shows"
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