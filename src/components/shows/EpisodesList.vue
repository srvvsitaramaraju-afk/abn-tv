<!-- EpisodesList.vue -->
<script setup lang="ts">
import { ref, computed,watch } from 'vue'
import type { Episode } from '@/types/show'
import { useSanitize } from '@/composables/useSanitize'

const props = defineProps<{
  episodesBySeason: Record<number, Episode[]>
  isLoading: boolean
  error: string | null
}>()

const selectedSeason = ref<number | null>(null)


const seasons = computed(() =>
  Object.keys(props.episodesBySeason)
    .map(Number)
    .sort((a, b) => b - a)
)


watch(() => props.episodesBySeason, () => {
  if (seasons.value.length > 0 && selectedSeason.value === null) {
    if(seasons.value[0]){
    selectedSeason.value = seasons.value[0]
    }
  }
}, { immediate: true })

const currentEpisodes = computed(() =>
  selectedSeason.value ? props.episodesBySeason[selectedSeason.value] ?? [] : []
)
</script>

<template>
  <div class="episodes-section mt-5">
    <h2 class="h4 mb-4 fw-semibold">Episodes</h2>

    <!-- Loading / Error -->
    <div v-if="isLoading" class="text-center py-5 text-secondary">
      <div class="spinner-border spinner-border-sm me-2" role="status"></div>
      Loading episodes...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="seasons.length === 0" class="text-secondary py-5 text-center">
      No episodes available
    </div>

    <div v-else>
      <div class="mb-4">
        <div class="d-none d-md-flex gap-2 flex-wrap">
          <button
            v-for="season in seasons"
            :key="season"
            class="btn btn-sm px-4 py-2 rounded-pill fw-medium"
            :class="{
              'btn-tv': selectedSeason === season,
              'btn-outline-light': selectedSeason !== season
            }"
            @click="selectedSeason = season"
          >
            Season {{ season }}
          </button>
        </div>

        <!-- Mobile: Dropdown -->
        <div class="d-md-none">
          <select
            v-model="selectedSeason"
            class="form-select bg-dark text-light border-secondary"
          >
            <option v-for="season in seasons" :key="season" :value="season">
              Season {{ season }}
            </option>
          </select>
        </div>
      </div>

      <!-- Episodes grid / list -->
      <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
        <div v-for="ep in currentEpisodes" :key="ep.id" class="col">
          <div class="tile card-hover h-100 rounded-3 overflow-hidden bg-dark border-0 shadow-sm">
            <div v-if="ep.image?.medium" class="ratio ratio-16x9 bg-black">
              <img
                :src="ep.image.medium"
                class="object-cover w-100 h-100"
                alt=""
                loading="lazy"
              />
            </div>
            <div v-else class="ratio ratio-16x9 bg-secondary d-flex align-items-center justify-content-center small">
              No Preview
            </div>

            <!-- Content -->
            <div class="p-3 d-flex flex-column h-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h4 class="h6 fw-semibold mb-0 text-truncate pe-2">
                  E{{ ep.number ?? '–' }} · {{ ep.name || 'Untitled' }}
                </h4>
                <div v-if="ep.rating?.average" class="badge bg-warning text-dark small">
                  ★ {{ ep.rating.average.toFixed(1) }}
                  {{ ep.rating }}
                </div>
              </div>

              <div class="small mb-2">
                <span v-if="ep.airdate">{{ ep.airdate }}</span>
                <span v-if="ep.airdate && ep.runtime"> · </span>
                <span v-if="ep.runtime">{{ ep.runtime }} min</span>
              </div>

              <p v-if="ep.summary" class="small  mb-0 line-clamp-3">
                <span v-html="useSanitize(ep.summary).value"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tile:hover {
  transform: translateY(-4px);
  box-shadow: var(--app-tile-hover-shadow);
  transition: all var(--ease-fast);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Improve mobile stacking */
@media (max-width: 767px) {
  .row-cols-1 > * {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>