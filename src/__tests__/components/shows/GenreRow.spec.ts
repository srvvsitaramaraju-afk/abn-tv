import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GenreRow from '../../../components/shows/GenreRow.vue'
import ShowCard from '../../../components/shows/ShowCard.vue'
import type { Show } from '../../../types/show'
import { createPinia, setActivePinia } from 'pinia'
import { useRouter } from 'vue-router'

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

describe('GenreRow', () => {
  let wrapper: ReturnType<typeof mount<typeof GenreRow>>
  let mockPush: ReturnType<typeof vi.fn>

  const mockShows: Show[] = [
    { id: 1, name: 'Breaking Bad', genres: ['Drama'], rating: { average: 9.5 } },
    { id: 2, name: 'Better Call Saul', genres: ['Drama', 'Crime'], rating: { average: 9.0 } }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

it('does not render section or any content when shows is empty (covers v-if false branch)', () => {
  wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: [] } })

  expect(wrapper.find('section').exists()).toBe(false)
  expect(wrapper.find('h2').exists()).toBe(false)
  expect(wrapper.find('button').exists()).toBe(false)
  expect(wrapper.find('.horizontal-scroll').exists()).toBe(false)
  expect(wrapper.text()).toBe('') // no visible text
  expect(wrapper.html()).toMatch(/<!--v-if-->/) // Vue comment when v-if false
})

  it('renders section, title, button and horizontal scroll when shows exist', () => {
    wrapper = mount(GenreRow, { props: { genreName: 'Sci-Fi', shows: mockShows } })

    expect(wrapper.find('section').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Sci-Fi')
    expect(wrapper.find('button.view-more-btn').exists()).toBe(true)
    expect(wrapper.find('.horizontal-scroll').exists()).toBe(true)
  })

  it('renders correct number of ShowCard components', () => {
    wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: mockShows } })
    expect(wrapper.findAllComponents(ShowCard)).toHaveLength(2)
  })

  it('renders View All button with correct text, title and classes', () => {
    wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: mockShows } })
    const btn = wrapper.find('button.view-more-btn')
    expect(btn.text()).toBe('All →')
    expect(btn.attributes('title')).toBe('View All')
    expect(btn.classes()).toContain('btn-tv')
    expect(btn.classes()).toContain('btn-sm')
    expect(btn.classes()).toContain('view-more-btn')
  })

  describe('goToGenre navigation', () => {
    it('navigates to genre page when View All is clicked', async () => {
      wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: mockShows } })

      await wrapper.find('button.view-more-btn').trigger('click')
      await flushPromises()

      expect(mockPush).toHaveBeenCalledExactlyOnceWith({
        name: 'genre',
        params: { genre: 'Drama' }
      })
    })

    it('encodes special characters in genre param', async () => {
      wrapper = mount(GenreRow, { props: { genreName: 'Sci-Fi & Fantasy', shows: mockShows } })

      await wrapper.find('button.view-more-btn').trigger('click')
      await flushPromises()

      expect(mockPush).toHaveBeenCalledExactlyOnceWith({
        name: 'genre',
        params: { genre: 'Sci-Fi%20%26%20Fantasy' }
      })
    })

    it('supports keyboard navigation via Enter key on article', async () => {
      wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: mockShows } })

      await wrapper.find('article[role="button"]').trigger('keyup.enter')
      await flushPromises()

      expect(mockPush).toHaveBeenCalled()
    })

    it('has correct accessibility attributes on article', () => {
      wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: mockShows } })

      const article = wrapper.find('article')
      expect(article.attributes('role')).toBe('button')
      expect(article.attributes('tabindex')).toBe('0')
      expect(article.attributes('aria-label')).toBe('Open details for Breaking Bad')
    })
  })

  it('matches snapshot for visual regression', () => {
    wrapper = mount(GenreRow, { props: { genreName: 'Drama', shows: mockShows } })
    expect(wrapper.html()).toMatchSnapshot()
  })
})