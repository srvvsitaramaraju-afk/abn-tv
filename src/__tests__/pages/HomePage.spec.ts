import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { reactive } from 'vue'
import HomePage from '../../pages/HomePage.vue'
import GenreRow from '../../components/shows/GenreRow.vue'
import type { Show } from '../../types/show'

// Reactive mock store
const mockStore = reactive({
  loadShowIndexPages: vi.fn().mockResolvedValue(undefined),
  showsGroupedByGenre: {},
  showSearchQuery: '',
  showSearchResults: [] as Show[],
  isLoading: false,
  error: null,
  isShowSearchLoading: false,
  showSearchError: null,
  $reset: vi.fn()
})


vi.mock('../../stores/showStore', () => ({
  useShowStore: vi.fn(() => mockStore)
}))

describe('HomePage.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    // Reset reactive state
    mockStore.showSearchQuery = ''
    mockStore.showSearchResults = []
    mockStore.isLoading = false
    mockStore.error = null
    mockStore.isShowSearchLoading = false
    mockStore.showSearchError = null
    mockStore.showsGroupedByGenre = {}
    mockStore.loadShowIndexPages.mockClear()

    wrapper = mount(HomePage, {
      global: {
        stubs: {
          ShowSearchBar: true
        }
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  it('calls loadShowIndexPages on mount with correct pages', async () => {
    await flushPromises()
    expect(mockStore.loadShowIndexPages).toHaveBeenCalledTimes(1)
    expect(mockStore.loadShowIndexPages).toHaveBeenCalledWith([0, 1, 2, 4, 5])
  })

  it('shows loading message when isLoading is true', async () => {
    mockStore.isLoading = true
    await flushPromises()

    expect(wrapper.text()).toContain('Loading shows...')
    expect(wrapper.findComponent(GenreRow).exists()).toBe(false)
  })

  it('shows error message when error is set', async () => {
    mockStore.error = 'Failed to load shows'
    await flushPromises()

    expect(wrapper.text()).toContain('Error: Failed to load shows')
    expect(wrapper.findComponent(GenreRow).exists()).toBe(false)
  })

  it('renders GenreRow components when genres are present', async () => {
    mockStore.showsGroupedByGenre = {
      Drama: [
        { id: 1, name: 'Breaking Bad' },
        { id: 2, name: 'The Wire' }
      ],
      Comedy: [{ id: 3, name: 'The Office' }]
    }

    await flushPromises()

    const rows = wrapper.findAllComponents(GenreRow)
    expect(rows.length).toBe(2)

    expect(rows[0].props('genreName')).toBe('Drama')
    expect(rows[0].props('shows').length).toBe(2)

    expect(rows[1].props('genreName')).toBe('Comedy')
    expect(rows[1].props('shows').length).toBe(1)
  })

  it('shows search results heading when query exists', async () => {
    mockStore.showSearchQuery = 'breaking'
    await flushPromises()

    const heading = wrapper.find('h2')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toContain('Search Results')
  })

  it('shows searching indicator during search', async () => {
    mockStore.showSearchQuery = 'walter'
    mockStore.isShowSearchLoading = true
    await flushPromises()

    expect(wrapper.text()).toContain('Searching...')
  })

  it('shows error message when search fails', async () => {
    mockStore.showSearchQuery = 'test'
    mockStore.showSearchError = 'API error'
    await flushPromises()

    expect(wrapper.text()).toContain('Please Try after SomeTime')
  })

  it('shows no-results message when search returns empty', async () => {
    mockStore.showSearchQuery = 'xyz'
    mockStore.showSearchResults = []
    await flushPromises()

    expect(wrapper.text()).toContain('No results found.')
  })

  it('does not render search UI when no query is active', () => {
    const heading = wrapper.find('h2')
    expect(heading.exists()).toBe(false)  // ← key change: check existence, not text on empty
  })
})
