
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ShowSearchBar from '../../../components/search/ShowSearchBar.vue'
import { useShowStore } from '../../../stores/showStore'

const mockUseDebounce = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useDebounce', () => ({
  useDebounce: mockUseDebounce
}))

describe('ShowSearchBar', () => {
  let wrapper: any
  let store: ReturnType<typeof useShowStore>
  let debounceMock: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    store = useShowStore()
    
    debounceMock = {
      debounced: vi.fn(),
      cancel: vi.fn()
    }
    mockUseDebounce.mockReturnValue(debounceMock)
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders input with correct placeholder', () => {
    wrapper = mount(ShowSearchBar)
    const input = wrapper.find('input#showSearch')
    expect(input.exists()).toBe(true)
    expect(input.attributes('type')).toBe('search')
    expect(input.attributes('placeholder')).toContain('Type a show name...')
  })

  it('shows Clear button only when input has value', async () => {
    wrapper = mount(ShowSearchBar)
    expect(wrapper.find('button').exists()).toBe(false)

    await wrapper.find('input').setValue('test')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button').exists()).toBe(true)
  })

  // ✅ FIXED: Use stored debounceMock.debounced
  it('triggers debounced search on input change', async () => {
    wrapper = mount(ShowSearchBar)
    const input = wrapper.find('input')
    
    await input.setValue('Breaking Bad')
    await wrapper.vm.$nextTick()
    
    expect(debounceMock.debounced).toHaveBeenCalledWith('Breaking Bad')
  })

  it('clearSearch clears input and calls cancel', async () => {
    vi.spyOn(store, 'showSearch')
    
    wrapper = mount(ShowSearchBar)
    await wrapper.find('input').setValue('test')
    await wrapper.vm.$nextTick()
    
    await wrapper.find('button').trigger('click')
    
    expect(debounceMock.cancel).toHaveBeenCalled()
    expect(store.showSearch).toHaveBeenCalledWith('')
    expect(wrapper.find('input').element.value).toBe('')
  })

  it('shows loading status', () => {
    store.isShowSearchLoading = true
    wrapper = mount(ShowSearchBar)
    expect(wrapper.find('#searchStatus .text-secondary').text()).toContain('Searching...')
  })

  it('shows error status', () => {
    store.showSearchError = 'Network error'
    wrapper = mount(ShowSearchBar)
    expect(wrapper.find('#searchStatus .text-danger').text()).toContain('Error: Network error')
  })

  it('shows no results status', () => {
    store.showSearchQuery = 'nothing'
    store.showSearchResults = []
    wrapper = mount(ShowSearchBar)
    expect(wrapper.find('#searchStatus .text-muted').text()).toContain('No results found.')
  })

  it('has correct ARIA attributes', () => {
    wrapper = mount(ShowSearchBar)
    expect(wrapper.find('input').attributes('aria-describedby')).toBe('searchStatus')
    expect(wrapper.find('#searchStatus').attributes('aria-live')).toBe('polite')
  })
})
