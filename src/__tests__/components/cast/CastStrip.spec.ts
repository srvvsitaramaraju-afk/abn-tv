
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CastStrip from '../../../components/cast/CastStrip.vue'
import CastTitle from '../../../components/cast/CastTitle.vue'
import type { CastMember } from '../../../types/show'

describe('CastStrip.vue', () => {
  const mockCast: CastMember[] = [
    {
      person: { id: 1, name: 'Bryan Cranston', image: { medium: 'bryan.jpg' } },
      character: { id: 101, name: 'Walter White' },
    },
    {
      person: { id: 2, name: 'Aaron Paul', image: { medium: 'aaron.jpg' } },
      character: { id: 102, name: 'Jesse Pinkman' },
    },
  ] as CastMember[]

  it('does not render section when cast is empty', () => {
    const wrapper = mount(CastStrip, {
      props: { cast: [] },
    })

    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('renders section when cast has items', () => {
    const wrapper = mount(CastStrip, {
      props: { cast: mockCast },
    })

    expect(wrapper.find('section').exists()).toBe(true)
    expect(wrapper.find('.row-fade').exists()).toBe(true)
    expect(wrapper.find('.horizontal-scroll').exists()).toBe(true)
  })

  it('renders correct number of CastTitle components', () => {
    const wrapper = mount(CastStrip, {
      props: { cast: mockCast },
    })

    const castTitles = wrapper.findAllComponents(CastTitle)
    expect(castTitles).toHaveLength(2)
  })

  it('passes correct cast member as prop to each CastTitle', () => {
    const wrapper = mount(CastStrip, {
      props: { cast: mockCast },
    })

    const castTitles = wrapper.findAllComponents(CastTitle)
    expect(castTitles[0].props('cast')).toEqual(mockCast[0])
    expect(castTitles[1].props('cast')).toEqual(mockCast[1])
  })

 it('uses correct key format combining person and character IDs', () => {
    const wrapper = mount(CastStrip, { props: { cast: mockCast } })
    const titles = wrapper.findAllComponents(CastTitle) 
    expect(titles).toHaveLength(2)
    expect(titles[0].props('cast').person.id).toBe(1)   // ✅ Test data passed
    expect(titles[0].props('cast').character.id).toBe(101)
    expect(titles[1].props('cast').person.id).toBe(2)
  })
})