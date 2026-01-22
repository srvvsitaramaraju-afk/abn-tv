<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useShowStore } from '@/stores/showStore'
import CastStrip from '@/components/cast/CastStrip.vue'
import EpisodesList from '@/components/shows/EpisodesList.vue'
import {useSanitize } from '@/composables/useSanitize'

const route = useRoute()
const router = useRouter()
const store = useShowStore()

const id = Number(route.params.id)

const loading = ref<boolean>(true)
const err = ref<string | null>(null)

onMounted(async () => {
  try {
    await store.fetchShowDetails(id)
    await Promise.all([
      store.fetchShowEpisodes(id),
      store.fetchShowCast(id)
    ])
  } catch (e: any) {
    err.value = e?.message ?? 'Unable to load show'
  } finally {
    loading.value = false
  }
})

const show = computed(() => store.showsById[id])

const imageUrl = computed(() => 
  show.value?.image?.original ?? show.value?.image?.medium ?? ''
)

const summaryText = computed(() => show.value?.summary ?? '')

const castList = computed(() => store.castByShowId[id] ?? [])


const episodesBySeason = computed(() => store.episodesBySeason(id))
const goBack = () => router.back()
</script>

<template>
  <section class="container">
  <button 
      @click="goBack"
      class="btn btn-sm btn-tv mb-4 d-inline-flex align-items-center gap-2"
      type="button"
    >
      ← Back
    </button>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-light" role="status"></div>
      <p class="mt-3 text-secondary">Loading show details...</p>
    </div>

    <div v-else-if="err" class="alert alert-danger">
      {{ err }}
    </div>

    <div v-else-if="!show" class="alert alert-warning">
      Show not found
    </div>

    <div v-else class="row g-5">
      <div class="col-12 col-md-4 col-lg-3">
        <div class="tile rounded-3 overflow-hidden shadow-strong mb-4">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            class="w-100 object-cover"
            alt=""
          />
          <div
            v-else
            class="ratio ratio-2x3 bg-dark d-flex align-items-center justify-content-center"
          >
            No Image
          </div>
        </div>

        <div class="small fs-8 text-center">
          <div v-if="show.status">Status • {{ show.status }}</div>
          <div v-if="show.language">Language • {{ show.language }}</div>
          <div v-if="show.premiered">Premiered • {{ show.premiered?.slice(0,4) }}</div>
          <div v-if="show.genres?.length">
            {{ show.genres.slice(0,5).join(' • ') }}
          </div>
          

        <div v-if="show.officialSite" class="mt-2">
          <a
            :href="show.officialSite"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-tv-yellow btn-sm"
          >
            Official Site ↗
          </a>
        </div>
        </div>
      </div>

      <!-- Right column - Main content -->
      <div class="col-12 col-md-8 col-lg-9">
        <h1 class="display-6 fw-bold mb-2">{{ show.name }}</h1>

        <div class="d-flex flex-wrap gap-3 mb-4 small yellow-text">
          <span>★ {{ show.rating?.average?.toFixed(1) ?? 'N/A' }}</span>
          <span v-if="show.runtime">{{ show.runtime }} min</span>
        </div>

        <div v-html="useSanitize(summaryText).value" class="mb-5 fs-8 text-light"></div>

        <!-- Cast -->
        <div class="mb-5">
          <h3 class="h4 mb-3 fw-semibold">Cast</h3>
          <CastStrip :cast="castList" />

          <div v-if="store.isCastLoading" class="text-secondary mt-3 small">
            Loading cast...
          </div>
          <div v-else-if="store.castError" class="alert alert-danger mt-3 small">
            {{ store.castError }}
          </div>
        </div>

            <EpisodesList
            :episodes-by-season="episodesBySeason"
            :is-loading="store.isEpisodesLoading"
            :error="store.episodesError"
            />
      </div>
    </div>
  </section>
</template>

<style scoped>
.tile {
  background: var(--app-tile-bg);
  border: 1px solid var(--app-surface);
}
</style>