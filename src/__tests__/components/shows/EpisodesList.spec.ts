import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EpisodesList from '../../../components/shows/EpisodesList.vue'
import type { Episode, Rating } from '../../../types/show'

const mockEpisodes: Episode[] = [
  {
    id: 1,
    name: 'Pilot',
    season: 1,
    number: 1,
    airdate: '2020-01-01',
    runtime: 45,
    summary: 'First episode summary.',
    image: { medium: 'episode1.jpg' }
  },
  {
    id: 2,
    name: 'Episode 2',
    season: 1,
    number: 2,
    airdate: '2020-01-08',
    runtime: 42,
    summary: 'Second episode.'
  }
]

const mockProps = {
  episodesBySeason: { 1: mockEpisodes },
  isLoading: false,
  error: null
}

describe('EpisodesList', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders loading spinner when isLoading is true', () => {
    wrapper = mount(EpisodesList, { 
      props: { ...mockProps, isLoading: true } 
    })
    
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.find('.text-center').text()).toContain('Loading episodes...')
  })

  it('renders error message when error exists', () => {
    wrapper = mount(EpisodesList, { 
      props: { ...mockProps, error: 'Failed to load episodes' } 
    })
    
    expect(wrapper.find('.alert-danger').exists()).toBe(true)
    expect(wrapper.find('.alert-danger').text()).toContain('Failed to load episodes')
  })

  it('renders "No episodes available" when no seasons', () => {
    wrapper = mount(EpisodesList, { 
      props: { episodesBySeason: {}, isLoading: false, error: null } 
    })
    
    expect(wrapper.find('.text-secondary').text()).toContain('No episodes available')
  })

  it('renders season buttons and auto-selects first season', () => {
    wrapper = mount(EpisodesList, { props: mockProps })
    
    const seasonBtns = wrapper.findAll('button.rounded-pill')
    expect(seasonBtns).toHaveLength(1)
    expect(seasonBtns[0].text()).toContain('Season 1')
    
    // First season auto-selected
    expect(wrapper.vm.selectedSeason).toBe(1)
  })

  it('renders mobile dropdown for seasons', () => {
    wrapper = mount(EpisodesList, { props: mockProps })
    
    const select = wrapper.find('select.form-select')
    expect(select.exists()).toBe(true)
    expect(select.element.value).toBe('1')
  })

  it('changes selected season when button clicked', async () => {
    const propsWithTwoSeasons = {
      episodesBySeason: { 
        2: mockEpisodes,
        1: [{ id: 3, name: 'S1E1', season: 1, number: 1 }]
      },
      isLoading: false,
      error: null
    }
    
    wrapper = mount(EpisodesList, { props: propsWithTwoSeasons })
    
    const seasonBtns = wrapper.findAll('button.rounded-pill')
    expect(seasonBtns).toHaveLength(2)
    
    await seasonBtns[1].trigger('click') // Click Season 1
    expect(wrapper.vm.selectedSeason).toBe(1)
    expect(wrapper.findAll('.tile').length).toBe(1)
  })

  it('renders episodes for selected season with correct structure', () => {
    wrapper = mount(EpisodesList, { props: mockProps })
    
    const episodeTile = wrapper.find('.tile')
    expect(episodeTile.exists()).toBe(true)
    
    expect(wrapper.find('img[src="episode1.jpg"]').exists()).toBe(true)
    expect(wrapper.find('.h6').text()).toContain('S1E1 · Pilot')
    expect(wrapper.find('.small').text()).toContain('2020-01-01 · 45 min')
  })

  it('renders no preview placeholder when no image', () => {
    const noImageEpisodes = [{
      id: 99,
      name: 'No Image',
      season: 1,
      number: 1
    }]
    
    wrapper = mount(EpisodesList, { 
      props: { episodesBySeason: { 1: noImageEpisodes }, isLoading: false, error: null } 
    })
    
    expect(wrapper.find('.bg-secondary').text()).toContain('No Preview')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('handles missing episode data gracefully', () => {
    const incompleteEpisodes = [{
      id: 100,
      name: '',
      season: 1,
      number: null as any
    }]
    
    wrapper = mount(EpisodesList, { 
      props: { episodesBySeason: { 1: incompleteEpisodes }, isLoading: false, error: null } 
    })
    
    expect(wrapper.find('.h6').text()).toContain('S1E– · Untitled')
  })

  it('displays summary with HTML stripped and line-clamp', () => {
    wrapper = mount(EpisodesList, { props: mockProps })
    
    expect(wrapper.find('.line-clamp-3').text()).toContain('First episode summary.')
  })

  it('applies correct responsive classes', () => {
    wrapper = mount(EpisodesList, { props: mockProps })
    
    expect(wrapper.find('.row-cols-1.row-cols-md-3.row-cols-lg-4').exists()).toBe(true)
    expect(wrapper.find('.d-none.d-md-flex').exists()).toBe(true)
    expect(wrapper.find('.d-md-none').exists()).toBe(true)
  })

  it('updates episodes when props change', async () => {
    wrapper = mount(EpisodesList, { 
      props: { episodesBySeason: { 1: [] }, isLoading: false, error: null } 
    })
    
    await wrapper.setProps({ episodesBySeason: { 1: mockEpisodes } })
    
    expect(wrapper.findAll('.tile')).toHaveLength(2)
    expect(wrapper.vm.selectedSeason).toBe(1)
  })
})
