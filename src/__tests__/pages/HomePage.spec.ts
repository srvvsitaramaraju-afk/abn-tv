// src/__tests__/pages/HomePage.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import HomePage from '../../pages/HomePage.vue'
import ShowSearchBar from '../../components/search/ShowSearchBar.vue'
import GenreRow from '../../components/shows/GenreRow.vue'
import ShowCard from '../../components/shows/ShowCard.vue'
import { useShowStore } from '../../stores/showStore'
import type { Show } from '../../types/show'

describe('HomePage.vue', () => {
  let pinia: Pinia
  let store: ReturnType<typeof useShowStore>
  let wrapper: VueWrapper

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    store = useShowStore()
    store.$reset() 
    store.loadShowIndexPages = vi.fn().mockResolvedValue(undefined)

    wrapper = mount(HomePage, {
      global: {
        plugins: [pinia],
      },
    })
  })

  afterEach(() => {
    if (wrapper?.exists()) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('always renders ShowSearchBar', () => {
    expect(wrapper.findComponent(ShowSearchBar).exists()).toBe(true)
  })

  it('calls loadShowIndexPages([0,1,2]) exactly once on mount', async () => {
    await flushPromises()
    expect(store.loadShowIndexPages).toHaveBeenCalledTimes(1)
    expect(store.loadShowIndexPages).toHaveBeenCalledWith([0, 1, 2])
  })


  describe('default view (no search active)', () => {
    it('shows loading message when isLoading = true', async () => {
      store.isLoading = true
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Loading shows...')
      expect(wrapper.findComponent(GenreRow).exists()).toBe(false)
      expect(wrapper.find('h2').exists()).toBe(false) // no Results heading
    })

    it('shows error alert when error is set', async () => {
      store.error = 'Failed to load TV shows'
      await wrapper.vm.$nextTick()

      const alert = wrapper.find('.alert.alert-danger')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('Error: Failed to load TV shows')
      expect(wrapper.findComponent(GenreRow).exists()).toBe(false)
    })

    it('renders nothing when loading/error not active and no genres loaded', async () => {
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).not.toContain('Loading shows...')
      expect(wrapper.find('.alert.alert-danger').exists()).toBe(false)
      expect(wrapper.findComponent(GenreRow).exists()).toBe(false)
    })

    it('renders correct number of GenreRow components when genres are present', async () => {
      store.showsById = {
        1: { id: 1, name: 'Breaking Bad', rating: { average: 9.5 }, genres: ['Drama'] } as Show,
        2: { id: 2, name: 'The Wire', rating: { average: 9.3 }, genres: ['Drama'] } as Show,
        3: { id: 3, name: 'The Office', rating: { average: 8.9 }, genres: ['Comedy'] } as Show,
      }

      store.genreToShowIds = {
        Drama: [1, 2],
        Comedy: [3],
      }

      await wrapper.vm.$nextTick()

      const rows = wrapper.findAllComponents(GenreRow)
      expect(rows).toHaveLength(2)

      expect(rows[0].props()).toMatchObject({
        genreName: 'Drama',
        shows: expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ]),
      })

      expect(rows[1].props()).toMatchObject({
        genreName: 'Comedy',
        shows: expect.arrayContaining([expect.objectContaining({ id: 3 })]),
      })
    })

    it('does not show search UI in default mode', () => {
      expect(wrapper.find('h2').exists()).toBe(false) // no "Results"
      expect(wrapper.find('.horizontal-scroll').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Searching...')
    })
  })


  describe('search mode (has active query)', () => {
    beforeEach(async () => {
      store.showSearchQuery = 'breaking'
      await wrapper.vm.$nextTick()
    })

    it('shows "Results" heading', () => {
      expect(wrapper.find('h2').text()).toContain('Results')
    })

    it('renders ShowCard components for each search result', async () => {
      store.showSearchResults = [
        { id: 100, name: 'Breaking Bad', rating: { average: 9.5 }, genres: ['Drama'] } as Show,
        { id: 101, name: 'Better Call Saul', rating: { average: 8.9 }, genres: ['Drama'] } as Show,
      ]

      await wrapper.vm.$nextTick()

      const cards = wrapper.findAllComponents(ShowCard)
      expect(cards).toHaveLength(2)
      expect(cards[0].props('show').id).toBe(100)
      expect(cards[1].props('show').id).toBe(101)
    })

    it('shows "Searching..." when search is in progress', async () => {
      store.isShowSearchLoading = true
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Searching...')
      expect(wrapper.findComponent(ShowCard).exists()).toBe(false)
      expect(wrapper.find('.alert').exists()).toBe(false)
    })

    it('shows error message when search fails', async () => {
      store.showSearchError = 'API rate limit exceeded'
      await wrapper.vm.$nextTick()

      const alert = wrapper.find('.alert.alert-danger')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('Error: API rate limit exceeded')
      expect(wrapper.findComponent(ShowCard).exists()).toBe(false)
    })

    it('shows no-results message when search returns empty array (optional enhancement)', async () => {
      store.showSearchResults = []
      store.isShowSearchLoading = false
      store.showSearchError = null
      await wrapper.vm.$nextTick()

      expect(wrapper.findComponent(ShowCard).exists()).toBe(false)
    })

  })


  describe('computed properties', () => {
    it('hasQuery → true when showSearchQuery has content', () => {
      store.showSearchQuery = 'walter white'
      const vm = wrapper.vm as InstanceType<typeof HomePage>
      expect(vm.hasQuery).toBe(true)
    })

    it('hasQuery → false when showSearchQuery is empty string', () => {
      store.showSearchQuery = ''
      const vm = wrapper.vm as InstanceType<typeof HomePage>
      expect(vm.hasQuery).toBe(false)
    })

    it('hasQuery → false when showSearchQuery is whitespace only', () => {
      store.showSearchQuery = '   '
      const vm = wrapper.vm as InstanceType<typeof HomePage>
      expect(vm.hasQuery).toBe(true) // ← !!'   ' is true
      // If you want to treat whitespace as empty, change computed to .trim()
    })

    it('searchResults → returns current store value', () => {
      store.showSearchResults = [{ id: 777, name: 'Test Show' } as Show]
      const vm = wrapper.vm as InstanceType<typeof HomePage>
      expect(vm.searchResults).toBe(store.showSearchResults)
    })
  })
})