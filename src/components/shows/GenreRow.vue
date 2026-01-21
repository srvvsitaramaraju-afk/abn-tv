<script setup lang="ts">
import type { Show } from '@/types/shows';
import ShowCard from './ShowCard.vue';

defineProps<{
  genreName: string;
  shows: Show[];
}>();
</script>

<template>
  <section v-if="shows.length" class="mb-4">
    <h2 class="app-section-title">
      {{ genreName }}
    </h2>

    <div class="horizontal-scroll">
      <ShowCard
        v-for="show in shows"
        :key="show.id"
        :show="show"
      />
    </div>
  </section>
</template>