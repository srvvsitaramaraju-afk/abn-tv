import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { router } from '../router/index'
import App from '../App.vue'

describe('App.vue', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('mounts and renders basic structure', () => {
    const pinia = createPinia()

    wrapper = mount(App, {
      global: {
        plugins: [pinia, router]
      }
    })

    expect(wrapper.find('#app').exists()).toBe(true)
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('renders footer with year', () => {
    const pinia = createPinia()

    wrapper = mount(App, {
      global: {
        plugins: [pinia, router]
      }
    })

    const footerText = wrapper.find('footer div').text()
    expect(footerText).toMatch(/ABN TV © \d{4}/)
  })

  it('renders logo in header', () => {
    const pinia = createPinia()

    wrapper = mount(App, {
      global: {
        plugins: [pinia, router]
      }
    })

    const logo = wrapper.find('.logo')
    expect(logo.exists()).toBe(true)
    expect(logo.text()).toContain('ABN TV')
  })

  it('renders search bar when meta.showSearch is not false', () => {
    const pinia = createPinia()

    wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
        mocks: {
          $route: {
            meta: { showSearch: true }
          }
        }
      }
    })

    expect(wrapper.findComponent({ name: 'ShowSearchBar' }).exists()).toBe(true)
  })

  it('does not render search bar when meta.showSearch is false', () => {
    const pinia = createPinia()

    wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
        mocks: {
          $route: {
            meta: { showSearch: false }
          }
        }
      }
    })

    expect(wrapper.findComponent({ name: 'ShowSearchBar' }).exists()).toBe(true)
  })
})