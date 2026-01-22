import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GenreRow from '../../../components/shows/GenreRow.vue'
import ShowCard from '../../../components/shows/ShowCard.vue'
import type { Show } from '../../../types/show'
import { createPinia, setActivePinia } from 'pinia'
import { useRouter } from 'vue-router'
import { useShowStore } from '../../../stores/showStore'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

vi.mock('../../../stores/showStore', () => ({
  useShowStore: vi.fn()
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

const mockShows: Show[] = [
  { id: 1, name: 'Breaking Bad', genres: ['Drama'], rating: { average: 9.5 } },
  { id: 2, name: 'Better Call Saul', genres: ['Drama', 'Crime'], rating: { average: 9.0 } }
]

describe('GenreRow', () => {
  let wrapper: ReturnType<typeof mount>
  let mockRouterPush: ReturnType<typeof vi.fn>
  let mockStoreLoad: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockRouterPush = vi.fn()
    mockStoreLoad = vi.fn().mockResolvedValue(undefined)
    
    ;(vi.mocked(useRouter) as any).mockReturnValue({
      push: mockRouterPush
    })
    
    ;(vi.mocked(useShowStore) as any).mockReturnValue({
      loadShowIndexPages: mockStoreLoad
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  it('renders nothing when empty', () => {
    wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: [] } })
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('renders with shows', () => {
    wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: mockShows } })
    expect(wrapper.find('section').exists()).toBe(true)
  })

  it('renders ShowCards', () => {
    wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: mockShows } })
    expect(wrapper.findAllComponents(ShowCard)).toHaveLength(2)
  })

  describe('goToGenre', () => {
    it('calls store when <= 4 shows', async () => {
      wrapper = mount(GenreRow, {
        props: { genreName: 'Drama', shows: [mockShows[0]] }
      })

      await wrapper.get('[title="View All"]').trigger('click')
      
      expect(mockStoreLoad).toHaveBeenCalledWith([0, 1, 2, 3])
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'genre',
        params: { genre: 'Drama' }
      })
    })

    it('skips store when > 4 shows', async () => {
      const manyShows = Array(5).fill(mockShows[0]).map((s, i) => ({ ...s, id: i }))
      
      wrapper = mount(GenreRow, {
        props: { genreName: 'Drama', shows: manyShows }
      })

      await wrapper.get('[title="View All"]').trigger('click')
      
      expect(mockStoreLoad).not.toHaveBeenCalled()
      expect(mockRouterPush).toHaveBeenCalled()
    })

    it('handles store error', async () => {
      mockStoreLoad.mockRejectedValue(new Error('API fail'))
      
      wrapper = mount(GenreRow, {
        props: { genreName: 'Drama', shows: [mockShows[0]] }
      })

      await wrapper.get('[title="View All"]').trigger('click')
      
      expect(mockStoreLoad).toHaveBeenCalled()
      expect(mockRouterPush).toHaveBeenCalled()
    })

    it('encodes special chars', async () => {
      wrapper = mount(GenreRow, {
        props: { genreName: 'Sci-Fi & Fantasy', shows: [mockShows[0]] }
      })

      await wrapper.get('[title="View All"]').trigger('click')
      
      expect(mockRouterPush).toHaveBeenCalledWith({
        name: 'genre',
        params: { genre: 'Sci-Fi%20%26%20Fantasy' }
      })
    })
  })
})