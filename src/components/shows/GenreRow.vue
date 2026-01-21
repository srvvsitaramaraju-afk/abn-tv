<script setup lang="ts">
import type { Show } from '@/types/show'
import ShowCard from './ShowCard.vue'
import { useRouter } from 'vue-router'
import { useShowStore } from '@/stores/showStore'

const props = defineProps<{
  genreName: string
  shows: Show[]
}>()

const router = useRouter()
const store = useShowStore()

async function goToGenre() {
  if (props.shows.length <= 4) {
    try {
      await store.loadShowIndexPages([0, 1, 2, 3])
    } catch {}
  }

  router.push({
    name: 'genre',
    params: { genre: props.genreName }
  })
}
</script>

<template>
  <section v-if="shows.length" class="mb-4">
    <div class="d-flex align-items-center justify-content-between mb-3 flex-nowrap">
      <h2 class="h2 mb-0 fw-bold flex-grow-1 me-3">{{ genreName }}</h2>
      <button
        @click="goToGenre"
        class="btn btn-tv btn-sm px-3 py-1 ms-auto view-more-btn"
        title="View All"
      >
        All →
      </button>
    </div>

    <div class="horizontal-scroll">
      <ShowCard
        v-for="show in shows"
        :key="show.id"
        :show="show"
      />
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


.view-more-btn:hover {
  position: relative;
}
</style>