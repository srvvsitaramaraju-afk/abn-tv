<script setup lang="ts">
import type { Show } from '@/types/show';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const props = defineProps<{
  show: Show;
}>();

const router = useRouter();

const imageUrl = computed(() => 
  props.show.image?.medium ?? 
  props.show.image?.original ?? 
  ''
);

const rating = computed(() => 
  props.show.rating?.average ?? null
);

const genres = computed(() => 
  (props.show.genres || []).slice(0, 3).join(' • ')
);

function openDetails() {
  router.push({ 
    name: 'show-detail', 
    params: { id: props.show.id } 
  });
}
</script>

<template>
  <article
    class="tile card-compact card-hover h-100 bg-dark border-0 position-relative"
    role="button"
    tabindex="0"
    :aria-label="`Open details for ${show.name}`"
    @click="openDetails"
    @keyup.enter="openDetails"
  >
    <!-- Poster image -->
    <img
      v-if="imageUrl"
      :src="imageUrl"
      class="card-img-top object-cover"
      alt=""
    />
    <div
      v-else
      class="poster-portrait-md d-flex align-items-center justify-content-center"
      aria-label="No image available"
    >
      No Image
    </div>

    <!-- Always-visible rating badge -->
    <div class="rating-badge" aria-label="Rating">
      ★ {{ rating ?? 'N/A' }}
    </div>

    <!-- Hover overlay (title + genres) -->
    <div class="tile-overlay">
      <div class="w-100">
        <div class="fw-semibold text-truncate mb-1">
          {{ show.name }}
        </div>
        <div v-if="genres" class="small opacity-75">
          {{ genres }}
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
</style>