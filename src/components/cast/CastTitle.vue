<script setup lang="ts">
import type { CastMember } from '@/types/show'

const props = defineProps<{
  cast: CastMember
}>()

const person = props.cast.person
const character = props.cast.character

const img = person.image?.medium ?? person.image?.original ?? ''
</script>

<template>
  <article class="card h-100 bg-dark border-0 card-hover cast-compact">
    <img
      v-if="img"
      class="cast-photo d-flex align-items-center justify-content-center"
      :src="img"
      alt=""
    />

    <div
      v-else
      class="cast-photo d-flex align-items-center justify-content-center"
      aria-label="No photo"
    >
      No Image
    </div>

    <div class="card-body p-2">

      <div
        class="cast-role text-truncate"
        :title="character.name"
      >
        {{ person.name }} as {{ character.name }}
      </div>
    </div>
  </article>
</template>