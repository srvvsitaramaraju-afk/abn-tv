<script setup lang="ts">
import type { CastMember } from '@/types/shows';
import CastTitle from './CastTitle.vue';

defineProps<{
  cast: CastMember[];
}>();
</script>

<template>
  <section v-if="cast?.length">
    <div class="row-fade">
      <div class="horizontal-scroll">
        <CastTitle
          v-for="member in cast"
          :key="`${member.person.id}-${member.character.id}`"
          :cast="member"
        />
      </div>
    </div>
  </section>
</template>