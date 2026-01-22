<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShowStore } from '@/stores/showStore'
import ShowCard from '@/components/shows/ShowCard.vue'

const route = useRoute()
const store = useShowStore()

const genreName = computed(() => route.params.genre as string)

const genreShows = computed(() => store.showsForGenre(genreName.value))

const genreFilteredSearchResults = computed(() => {
  if (!store.showSearchQuery || !store.showSearchResults.length) return []
  
  return store.showSearchResults.filter(show => 
    show.genres && show.genres.includes(genreName.value)
  )
})

const hasQuery = computed(() => !!store.showSearchQuery)
const isLoading = computed(() => store.isLoading)
const hasMore = computed(() => store.hasMorePages)

const nextPage = computed(() => {
  return store.loadedIndexPages.length > 0
    ? Math.max(...store.loadedIndexPages) + 1
    : 0
})

onMounted(async () => {
  await store.searchAndAddToGenre(genreName.value)
  
  if (genreShows.value.length <= 10) {
    await store.loadShowIndexPages([nextPage.value])
  }
})

async function loadMoreShows() {
  if (store.isLoading) return
  await store.loadShowIndexPages([nextPage.value])
}
</script>

<template>
  <div class="container">
    <div v-if="hasQuery && store.showSearchResults.length > 0">
      <h1 class="mb-4 fw-bold">
        "{{ store.showSearchQuery }}" in {{ genreName }}
      </h1>

      <div v-if="store.isShowSearchLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Searching...</span>
        </div>
      </div>
      
      <div v-else-if="genreFilteredSearchResults.length === 0" class="text-center py-5">
        No {{ genreName.toLowerCase() }} shows match "{{ store.showSearchQuery }}"
      </div>
      
      <div v-else class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-4">
        <div class="col" v-for="show in genreFilteredSearchResults" :key="show.id">
          <ShowCard :show="show" />
        </div>
      </div>

      <div v-if="hasMore && !store.isShowSearchLoading" class="text-center mt-4">
        <button
          @click="loadMoreShows"
          class="btn btn-tv btn-sm px-3 py-1"
          :disabled="store.isLoading"
        >
          {{ store.isLoading ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </div>

    <div v-else>
      <h1 class="mb-4 fw-bold">
        {{ genreName }} Shows
      </h1>

      <div v-if="isLoading && genreShows.length === 0" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading {{ genreName }} shows...</span>
        </div>
      </div>

      <div v-else-if="genreShows.length === 0" class="text-center py-5">
        No shows found in this genre yet.
      </div>

      <div v-else class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-4">
        <div class="col" v-for="show in genreShows" :key="show.id">
          <ShowCard :show="show" />
        </div>
      </div>
      <div v-if="hasMore" class="text-center mt-4">
        <button
          v-if="!store.isLoading"
          @click="loadMoreShows"
          class="btn btn-tv btn-sm px-3 py-1"
        >
          Load More
        </button>
        <div v-else class="text-center py-3">
          Loading more...
        </div>
      </div>
    </div>

    <div v-if="store.error" class="alert alert-danger mt-4 text-center">
      {{ store.error }}
    </div>
  </div>
</template>