import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import ShowDetailPage from '../../pages/ShowDetailsPage.vue'
import { useShowStore } from '../../stores/showStore'
import { nextTick } from 'vue'

const mockRoute = {
  params: { id: '123' },
}

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => mockRoute,
    RouterLink: {
      name: 'RouterLink',
      template: '<a><slot/></a>'
    }
  }
})

describe('ShowDetail.vue', () => {
  let pinia: Pinia
  let store: ReturnType<typeof useShowStore>
  let wrapper: VueWrapper

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useShowStore()
    store.$reset()
    
    store.fetchShowDetails = vi.fn().mockResolvedValue(undefined)
    store.fetchShowEpisodes = vi.fn().mockResolvedValue([])
    store.fetchShowCast = vi.fn().mockResolvedValue([])

    wrapper = mount(ShowDetailPage, {
      global: {
        plugins: [pinia],
        stubs: {
          CastStrip: true,
          EpisodesList: true
        }
      },
    })
  })

  afterEach(() => {
    if (wrapper?.exists()) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  it('renders back to home link', () => {
    const backLink = wrapper.findComponent({ name: 'RouterLink' })
    expect(backLink.exists()).toBe(true)
    expect(backLink.text()).toContain('← Back to Home')
  })

  it('calls store methods on mount', async () => {
    await nextTick()
    expect(store.fetchShowDetails).toHaveBeenCalledWith(123)
    expect(store.fetchShowEpisodes).toHaveBeenCalledWith(123)
    expect(store.fetchShowCast).toHaveBeenCalledWith(123)
  })



  it('renders complete show details', async () => {
    const mockShow = {
      id: 123,
      name: 'Breaking Bad',
      summary: '<p>High-tension drama</p>',
      image: { original: 'https://api.tvmaze.com/poster.jpg' },
      rating: { average: 9.5 },
      status: 'Ended',
      language: 'English',
      premiered: '2008-01-20',
      genres: ['Drama', 'Crime'],
      runtime: 47,
      officialSite: 'https://amc.com'
    }

    store.showsById[123] = mockShow
    await nextTick()

    expect(wrapper.find('h1.display-6').text()).toContain('Breaking Bad')
    expect(wrapper.find('img[src="https://api.tvmaze.com/poster.jpg"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('★ 9.5')
    expect(wrapper.text()).toContain('47 min')
    expect(wrapper.text()).toContain('Status • Ended')
    expect(wrapper.text()).toContain('Drama • Crime')
  })

  it('renders medium image fallback', async () => {
    const mockShow = {
      id: 123,
      name: 'Test Show',
      image: { medium: 'https://api.tvmaze.com/medium.jpg' }
    }

    store.showsById[123] = mockShow
    await nextTick()

    const img = wrapper.find('img.w-100')
    expect(img.attributes('src')).toBe('https://api.tvmaze.com/medium.jpg')
  })

  it('renders no image placeholder', async () => {
    const mockShow = { 
      id: 123, 
      name: 'No Image Show', 
      genres: [],
      image: null 
    }
    store.showsById[123] = mockShow
    await nextTick()

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.ratio-2x3').text()).toContain('No Image')
  })

  it('renders cast section', async () => {
    store.castByShowId[123] = [{ 
      person: { name: 'Bryan Cranston' }, 
      character: { name: 'Walter White' } 
    }]
    store.showsById[123] = { id: 123, name: 'Test', genres: [] }
    await nextTick()

    const castStrip = wrapper.findComponent({ name: 'CastStrip' })
    expect(castStrip.exists()).toBe(true)
  })

  it('shows cast loading state', async () => {
    store.showsById[123] = { id: 123, name: 'Test', genres: [] }
    store.isCastLoading = true
    await nextTick()

    expect(wrapper.text()).toContain('Loading cast...')
  })

  it('shows cast error state', async () => {
    store.showsById[123] = { id: 123, name: 'Test', genres: [] }
    store.castError = 'Failed to load cast'
    await nextTick()

    expect(wrapper.text()).toContain('Failed to load cast')
  })

  it('passes episodes props correctly', async () => {
    store.episodesByShowId[123] = [{ 
      id: 1, 
      name: 'Pilot', 
      season: 1, 
      number: 1 
    }]
    store.showsById[123] = { id: 123, name: 'Test', genres: [] }
    await nextTick()

    const episodesList = wrapper.findComponent({ name: 'EpisodesList' })
    expect(episodesList.exists()).toBe(true)
  })

  it('handles missing metadata gracefully', async () => {
    const mockShow = {
      id: 123,
      name: 'Minimal Show',
      genres: [],
      rating: { average: null }
    }

    store.showsById[123] = mockShow
    await nextTick()

    expect(wrapper.text()).toContain('★ N/A')
  })
})