import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ShowCard from '../../../components/shows/ShowCard.vue'
import { router } from '../../../router/index'
import type { Show } from '../../../types/show'

const mockShow: Show = {
  id: 1,
  name: 'Breaking Bad',
  genres: ['Drama', 'Crime', 'Thriller'],
  rating: { average: 9.5 },
  image: { medium: 'breaking-bad.jpg' }
}

const mockShowNoImage: Show = {
  id: 2,
  name: 'No Image Show',
  genres: ['Comedy'],
  rating: { average: null }
}

describe('ShowCard', () => {
  let wrapper: any

  beforeEach(() => {
    // Mock router.push to spy on navigation
    vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve(true))
    wrapper = null
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
  })

  it('renders show name and rating correctly', () => {
    wrapper = mount(ShowCard, {
      global: {
        plugins: [router]
      },
      props: { show: mockShow }
    })
    
    expect(wrapper.find('.fw-semibold').text()).toBe('Breaking Bad')
    expect(wrapper.find('.rating-badge').text()).toBe('★ 9.5')
  })

  it('shows image when medium exists', () => {
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: mockShow }
    })
    
    expect(wrapper.find('img[src="breaking-bad.jpg"]').exists()).toBe(true)
    expect(wrapper.find('.poster-portrait-md').exists()).toBe(false)
  })

  it('shows "No Image" placeholder when no image', () => {
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: mockShowNoImage }
    })
    
    expect(wrapper.find('.poster-portrait-md').text()).toContain('No Image')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('displays first 3 genres joined by •', () => {
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: mockShow }
    })
    
    expect(wrapper.find('.opacity-75').text()).toBe('Drama • Crime • Thriller')
  })

  it('shows N/A rating when no rating exists', () => {
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: mockShowNoImage }
    })
    
    expect(wrapper.find('.rating-badge').text()).toBe('★ N/A')
  })

  it('navigates to show detail on click', async () => {
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: mockShow }
    })
    
    await wrapper.trigger('click')
    expect(router.push).toHaveBeenCalledWith({
      name: 'show-detail',
      params: { id: 1 }
    })
  })

  it('navigates to show detail on Enter keyup', async () => {
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: mockShow }
    })
    
    await wrapper.trigger('keyup.enter')
    expect(router.push).toHaveBeenCalledWith({
      name: 'show-detail',
      params: { id: 1 }
    })
  })

  it('has correct accessibility attributes', () => {
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: mockShow }
    })
    
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('aria-label')).toContain('Open details for Breaking Bad')
  })

  it('uses correct CSS classes for styling', () => {
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: mockShow }
    })
    
    expect(wrapper.classes()).toContain('tile')
    expect(wrapper.classes()).toContain('card-compact')
    expect(wrapper.classes()).toContain('card-hover')
    expect(wrapper.find('.tile-overlay').exists()).toBe(true)
  })

  it('handles empty genres array', () => {
    const showNoGenres = { ...mockShow, genres: [] }
    
    wrapper = mount(ShowCard, {
      global: { plugins: [router] },
      props: { show: showNoGenres }
    })
    
    expect(wrapper.find('.opacity-75').exists()).toBe(false)
  })
})
