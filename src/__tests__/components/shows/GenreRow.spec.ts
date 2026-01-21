import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GenreRow from '../../../components/shows/GenreRow.vue'
import ShowCard from '../../../components/shows/ShowCard.vue' // Adjust path as needed
import type { Show } from '../../../types/show'

const mockShows: Show[] = [
  {
    id: 1,
    name: 'Breaking Bad',
    genres: ['Drama'],
    rating: { average: 9.5 }
  },
  {
    id: 2,
    name: 'Better Call Saul',
    genres: ['Drama', 'Crime'],
    rating: { average: 9.0 }
  }
]

const mockProps = {
  genreName: 'Drama',
  shows: mockShows
}

describe('GenreRow', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders nothing when shows array is empty', () => {
    wrapper = mount(GenreRow, { 
      props: { genreName: 'Drama', shows: [] } 
    })
    
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('renders section with title when shows exist', () => {
    wrapper = mount(GenreRow, { props: mockProps })
    
    expect(wrapper.find('section').exists()).toBe(true)
    expect(wrapper.find('.app-section-title').text()).toBe('Drama')
    expect(wrapper.find('.horizontal-scroll').exists()).toBe(true)
  })

  it('renders correct number of ShowCard components', () => {
    wrapper = mount(GenreRow, { props: mockProps })
    
    const showCards = wrapper.findAllComponents(ShowCard)
    expect(showCards).toHaveLength(2)
  })

  it('passes correct show prop to each ShowCard', () => {
    wrapper = mount(GenreRow, { props: mockProps })
    
    const showCards = wrapper.findAllComponents(ShowCard)
    expect(showCards[0].props('show')).toEqual(mockShows[0])
    expect(showCards[1].props('show')).toEqual(mockShows[1])
  })

  it('uses show.id as key for v-for', () => {
    wrapper = mount(GenreRow, { props: mockProps })
    
    const showCards = wrapper.findAllComponents(ShowCard)
    expect(showCards).toHaveLength(2)
    expect(showCards[0].props('show').id).toBe(1)
  })

  it('renders genre title correctly with special characters', () => {
    wrapper = mount(GenreRow, { 
      props: { 
        genreName: 'Sci-Fi & Fantasy', 
        shows: mockShows 
      } 
    })
    
    expect(wrapper.find('.app-section-title').text()).toBe('Sci-Fi & Fantasy')
  })
})
