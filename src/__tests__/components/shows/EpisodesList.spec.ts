import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import EpisodesList from '../../../components/shows/EpisodesList.vue'
import type { Episode } from '../../../types/show'
import type { Episode } from '../../../types/show'

vi.mock('../../../composables/useSanitize', () => ({
  useSanitize: vi.fn((html: string) => ({ value: html.replace(/<[^>]*>/g, '') }))
}))

const mockEpisodesSeason1: Episode[] = [
  {
    id: 1,
    name: 'Pilot',
    season: 1,
    number: 1,
    airdate: '2020-01-01',
    runtime: 45,
    summary: '<p>First <b>episode</b> summary.</p>',
    image: { medium: 'ep1.jpg' },
    rating: { average: 8.2 }
  },
  {
    id: 2,
    name: 'Episode Two',
    season: 1,
    number: 2,
    airdate: '2020-01-08',
    runtime: 42,
    summary: 'Second episode summary.',
    image: null,
    rating: { average: null }
  }
]

const mockEpisodesSeason2: Episode[] = [
  {
    id: 3,
    name: 'Season Premiere',
    season: 2,
    number: 1,
    airdate: '2021-01-05',
    runtime: 50,
    summary: 'New season starts.',
    image: { medium: 'ep3.jpg' }
  }
]

describe('EpisodesList', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(EpisodesList, {
      props: {
        episodesBySeason: { 1: mockEpisodesSeason1 },
        isLoading: false,
        error: null
      }
    })
  })

  it('renders loading state correctly', () => {
    wrapper = mount(EpisodesList, {
      props: { episodesBySeason: {}, isLoading: true, error: null }
    })
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading episodes...')
  })

  it('renders error message when error prop is set', () => {
    wrapper = mount(EpisodesList, {
      props: { episodesBySeason: {}, isLoading: false, error: 'Network error' }
    })
    const alert = wrapper.find('.alert-danger')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Network error')
  })

  it('shows "No episodes available" when episodesBySeason is empty', () => {
    wrapper = mount(EpisodesList, {
      props: { episodesBySeason: {}, isLoading: false, error: null }
    })
    expect(wrapper.text()).toContain('No episodes available')
  })

  it('auto-selects the highest season number on mount', async () => {
    wrapper = mount(EpisodesList, {
      props: {
        episodesBySeason: {
          1: mockEpisodesSeason1,
          2: mockEpisodesSeason2
        },
        isLoading: false,
        error: null
      }
    })
    await flushPromises()
    expect(wrapper.vm.selectedSeason).toBe(2)
  })

  it('renders season buttons in descending order', () => {
    wrapper = mount(EpisodesList, {
      props: {
        episodesBySeason: { 3: [], 1: [], 2: [] },
        isLoading: false,
        error: null
      }
    })
    const buttons = wrapper.findAll('button.rounded-pill')
    expect(buttons.map(b => b.text())).toEqual(['Season 3', 'Season 2', 'Season 1'])
  })

  it('renders mobile dropdown and selects correct season', async () => {
    wrapper = mount(EpisodesList, {
      props: {
        episodesBySeason: { 1: mockEpisodesSeason1, 2: mockEpisodesSeason2 },
        isLoading: false,
        error: null
      }
    })
    await flushPromises()

    const select = wrapper.find('select.form-select')
    expect(select.exists()).toBe(true)
    expect(select.element.value).toBe('2') // highest season

    await select.setValue('1')
    expect(wrapper.vm.selectedSeason).toBe(1)
  })

  it('switches episodes when clicking season button', async () => {
    wrapper = mount(EpisodesList, {
      props: {
        episodesBySeason: { 1: mockEpisodesSeason1, 2: mockEpisodesSeason2 },
        isLoading: false,
        error: null
      }
    })
    await flushPromises()

    const buttons = wrapper.findAll('button.rounded-pill')
    await buttons[1].trigger('click') // Season 1

    expect(wrapper.vm.selectedSeason).toBe(1)
    expect(wrapper.findAll('.tile')).toHaveLength(2)
    expect(wrapper.find('.tile').text()).toContain('Pilot')
  })

  it('applies active class to selected season button', () => {
    wrapper = mount(EpisodesList, {
      props: {
        episodesBySeason: { 1: [], 2: [] },
        isLoading: false,
        error: null
      }
    })
    const buttons = wrapper.findAll('button.rounded-pill')
    expect(buttons[0].classes()).toContain('btn-tv')
    expect(buttons[1].classes()).toContain('btn-outline-light')
  })

  it('renders episode with image, rating, airdate and runtime', () => {
    const tile = wrapper.find('.tile')
    expect(tile.find('img').attributes('src')).toBe('ep1.jpg')
    expect(tile.find('.h6').text()).toContain('E1 · Pilot')
    expect(tile.find('.badge').text()).toContain('★ 8.2')
    expect(tile.text()).toContain('2020-01-01 · 45 min')
  })

  it('renders "No Preview" when episode has no image', () => {
    wrapper = mount(EpisodesList, {
      props: {
        episodesBySeason: { 1: [mockEpisodesSeason1[1]] },
        isLoading: false,
        error: null
      }
    })
    expect(wrapper.find('.bg-secondary').text()).toContain('No Preview')
  })

  it('handles missing name/number/airdate/runtime gracefully', () => {
    const brokenEpisode: Episode = {
      id: 999,
      name: '',
      season: 1,
      number: null,
      airdate: null,
      runtime: null,
      summary: null,
      image: null,
      rating: { average: null }
    }

    wrapper = mount(EpisodesList, {
      props: { episodesBySeason: { 1: [brokenEpisode] }, isLoading: false, error: null }
    })

    expect(wrapper.find('.h6').text()).toBe('E– · Untitled')
    expect(wrapper.text()).not.toContain('min')
    expect(wrapper.find('.badge').exists()).toBe(false)
  })

  it('sanitizes and renders summary HTML safely', () => {
    const summaryText = wrapper.find('.line-clamp-3').text()
    expect(summaryText).toBe('First episode summary.')
    expect(summaryText).not.toContain('<b>')
  })


  it('does not crash when selectedSeason is invalid after prop change', async () => {
    await wrapper.setProps({
      episodesBySeason: { 5: [] }
    })
    await flushPromises()
    expect(wrapper.vm.selectedSeason).toBe(5)
  })

})