// src/components/cast/CastTitle.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CastTitle from '../../../components/cast/CastTitle.vue'
import type { CastMember } from '../../../types/show'

describe('CastTitle.vue', () => {
  const mockCastMember: CastMember = {
    person: {
      id: 1,
      name: 'Bryan Cranston',
      image: { medium: 'https://example.com/bryan-medium.jpg' },
    },
    character: {
      id: 101,
      name: 'Walter White',
    },
  }

  it('renders person name and character name correctly', () => {
    const wrapper = mount(CastTitle, {
      props: { cast: mockCastMember },
    })

    const roleText = wrapper.find('.cast-role').text()
    expect(roleText).toBe('Bryan Cranston as Walter White')
  })

  it('sets title attribute on role text for truncation tooltip', () => {
    const wrapper = mount(CastTitle, {
      props: { cast: mockCastMember },
    })

    expect(wrapper.find('.cast-role').attributes('title')).toBe('Walter White')
  })

  it('renders image when person has medium image', () => {
    const wrapper = mount(CastTitle, {
      props: { cast: mockCastMember },
    })

    const img = wrapper.find('img.cast-photo')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/bryan-medium.jpg')
    expect(img.attributes('alt')).toBe('')
  })

  it('renders fallback "No Image" when no image exists', () => {
    const noImageCast: CastMember = {
      person: { id: 2, name: 'No Photo Actor', image: undefined },
      character: { id: 202, name: 'Unknown' },
    }

    const wrapper = mount(CastTitle, {
      props: { cast: noImageCast },
    })

    expect(wrapper.find('img').exists()).toBe(false)
    const fallback = wrapper.find('.cast-photo')
    expect(fallback.text()).toBe('No Image')
    expect(fallback.attributes('aria-label')).toBe('No photo')
  })

  it('prefers original image when medium is missing', () => {
    const castWithOnlyOriginal: CastMember = {
      person: {
        id: 3,
        name: 'Test Actor',
        image: { original: 'https://example.com/large.jpg' },
      },
      character: { id: 303, name: 'Test Role' },
    }

    const wrapper = mount(CastTitle, {
      props: { cast: castWithOnlyOriginal },
    })

    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/large.jpg')
  })

  it('renders fallback when both medium and original are missing', () => {
    const castNoImages: CastMember = {
      person: { id: 4, name: 'Invisible', image: {} },
      character: { id: 404, name: 'Ghost' },
    }

    const wrapper = mount(CastTitle, {
      props: { cast: castNoImages },
    })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.cast-photo').text()).toBe('No Image')
  })
})