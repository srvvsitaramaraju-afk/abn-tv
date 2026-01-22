<script setup lang="ts">
import { ref, watch } from 'vue'
import { useShowStore } from '@/stores/showStore'
import { useDebounce } from '@/composables/useDebounce'

const query = ref<string>('')

const store = useShowStore()

const { debounced: debouncedSearch, cancel } = useDebounce(
  (value: string) => {
    store.showSearch(value)
  },
  450
)

watch(query, (val) => {
  debouncedSearch(val)
})

// Clear search (input + store)
function clearSearch() {
  cancel()
  query.value = ''
  store.showSearch('')
}
</script>

<template>
  <div class="mb-3">
    <div class="d-flex align-items-end justify-content-between mb-3">

      <button
        v-if="query"
        class="btn btn-sm btn-outline-light"
        type="button"
        @click="clearSearch"
        aria-label="Clear search"
      >
        Clear
      </button>
    </div>

    <input
      id="showSearch"
      v-model="query"
      class="form-control"
      type="search"
      placeholder="Type a show name..."
      aria-describedby="searchStatus"
    />

    <!-- Status region for a11y (polite announcements) -->
    <div
      id="searchStatus"
      class="mt-2 small"
      role="status"
      aria-live="polite"
    >
    </div>
  </div>
</template>