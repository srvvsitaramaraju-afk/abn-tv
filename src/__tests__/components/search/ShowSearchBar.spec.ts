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
  let wrapper: ReturnType<typeof mount>
  let debounceMock: { debounced: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    debounceMock = {
      debounced: vi.fn(),
      cancel: vi.fn()
    }
    mockUseDebounce.mockReturnValue(debounceMock)
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders search input with correct attributes', () => {
    wrapper = mount(ShowSearchBar)
    const input = wrapper.get('input#showSearch')
    
    expect(input.exists()).toBe(true)
    expect(input.attributes()).toMatchObject({
      type: 'search',
      placeholder: 'Type a show name...',
      'aria-describedby': 'searchStatus'
    })
  })

  it('shows/hides clear button based on input value', async () => {
    wrapper = mount(ShowSearchBar)
    
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(false)
    
    await wrapper.get('input').setValue('test')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.get('[aria-label="Clear search"]').exists()).toBe(true)
  })

  it('triggers debounced search on input change', async () => {
    wrapper = mount(ShowSearchBar)
    const input = wrapper.get('input')
    
    await input.setValue('Breaking Bad')
    await wrapper.vm.$nextTick()
    
    expect(debounceMock.debounced).toHaveBeenCalledTimes(1)
    expect(debounceMock.debounced).toHaveBeenCalledWith('Breaking Bad')
  })

  it('clears search on button click', async () => {
    const store = useShowStore()
    const showSearchSpy = vi.spyOn(store, 'showSearch')
    
    wrapper = mount(ShowSearchBar)
    const input = wrapper.get('input')
    
    await input.setValue('test')
    await wrapper.vm.$nextTick()
    
    await wrapper.get('[aria-label="Clear search"]').trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(debounceMock.cancel).toHaveBeenCalledTimes(1)
    expect(showSearchSpy).toHaveBeenCalledWith('')
    expect(input.element.value).toBe('')
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(false)
  })

  it('has correct ARIA attributes', () => {
    wrapper = mount(ShowSearchBar)
    
    expect(wrapper.get('input').attributes('aria-describedby')).toBe('searchStatus')
    const status = wrapper.get('#searchStatus')
    expect(status.attributes('role')).toBe('status')
    expect(status.attributes('aria-live')).toBe('polite')
  })
})