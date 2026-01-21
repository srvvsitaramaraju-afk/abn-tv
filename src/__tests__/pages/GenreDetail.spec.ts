import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import GenreDetail from '../../pages/GenreDetail.vue'
import { useShowStore } from '../../stores/showStore'

const tick = (wrapper: VueWrapper) => wrapper.vm.$nextTick()

vi.mock('../../stores/showStore', () => ({
  useShowStore: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: { genre: 'Drama' } }))
}))

describe('GenreDetail', () => {
  let wrapper: VueWrapper
  let mockStore: any

  beforeEach(async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    
    mockStore = {
      showsForGenre: vi.fn().mockReturnValue([]),
      searchAndAddToGenre: vi.fn().mockResolvedValue(undefined),
      loadShowIndexPages: vi.fn().mockResolvedValue(undefined),
      isLoading: false,
      hasMorePages: false,
      loadedIndexPages: [],
      error: null,
      showSearchQuery: '',
      showSearchResults: [],
      isShowSearchLoading: false
    }
    
    vi.mocked(useShowStore).mockReturnValue(mockStore)
    
    wrapper = mount(GenreDetail, {
      global: { plugins: [pinia] }
    })
    
    await tick(wrapper)
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  it('renders genre heading', () => {
    expect(wrapper.get('h1.mb-4').text()).toContain('Drama Shows')
  })

  it('calls searchAndAddToGenre on mount', () => {
    expect(mockStore.searchAndAddToGenre).toHaveBeenCalledWith('Drama')
  })

  it('shows genre loading when empty', async () => {
    mockStore.isLoading = true
    mockStore.showsForGenre.mockReturnValue([])
    await tick(wrapper)
    expect(wrapper.find('.spinner-border.text-primary').exists()).toBe(false)
  })

  it('shows no shows message', async () => {
    mockStore.isLoading = false
    mockStore.showsForGenre.mockReturnValue([])
    await tick(wrapper)
    expect(wrapper.find('.text-center.py-5').text()).toContain('No shows found')
  })

  it('renders search heading', async () => {
    mockStore.showSearchQuery = 'test'
    await tick(wrapper)
    expect(wrapper.get('h1.mb-4').text()).toContain('Drama Shows')
  })


  it('shows no search matches', async () => {
    mockStore.showSearchQuery = 'xyz'
    mockStore.showSearchResults = [{ id: 1, name: 'Test', genres: ['Comedy'] }]
    await tick(wrapper)
    expect(wrapper.find('.text-center.py-5').text()).toContain('No shows found in this genre yet')
  })
})