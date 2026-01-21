import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useShowStore } from '../../stores/showStore'
import * as showsService from '../../services/shows'
import type { Show, Episode } from '../../types/show'

vi.mock('../../services/shows')

describe('useShowStore', () => {
  let store: ReturnType<typeof useShowStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useShowStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct default values', () => {
      expect(store.showsById).toEqual({})
      expect(store.genreToShowIds).toEqual({})
      expect(store.loadedIndexPages).toEqual([])

      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()

      expect(store.showSearchQuery).toBe('')
      expect(store.showSearchResults).toEqual([])
      expect(store.isShowSearchLoading).toBe(false)
      expect(store.showSearchError).toBeNull()

      expect(store.episodesByShowId).toEqual({})
      expect(store.isEpisodesLoading).toBe(false)
      expect(store.episodesError).toBeNull()

      expect(store.castByShowId).toEqual({})
      expect(store.isCastLoading).toBe(false)
      expect(store.castError).toBeNull()
    })
  })

  describe('getters', () => {
    it('showsGroupedByGenre returns empty object when no data', () => {
      expect(store.showsGroupedByGenre).toEqual({})
    })

    it('showsGroupedByGenre groups and sorts shows by rating descending', () => {
      const fakeShows: Record<number, Show> = {
        101: {
          id: 101,
          name: 'Alpha',
          genres: ['Drama'],
          rating: { average: 8.4 },
        },
        102: {
          id: 102,
          name: 'Beta',
          genres: ['Drama'],
          rating: { average: 9.1 },
        },
        103: {
          id: 103,
          name: 'Gamma',
          genres: ['Comedy'],
          rating: { average: 7.2 },
        },
      }

      store.showsById = fakeShows
      store.genreToShowIds = {
        Drama: [101, 102],
        Comedy: [103],
      }

      const grouped = store.showsGroupedByGenre

      expect(grouped.Drama).toHaveLength(2)
      expect(grouped.Drama?.[0].name).toBe('Beta')   // higher rating first
      expect(grouped.Drama?.[1].name).toBe('Alpha')
      expect(grouped.Comedy?.[0].name).toBe('Gamma')
    })

    it('showsForGenre returns sorted shows or empty array', () => {
      const fakeShows: Record<number, Show> = {
        201: {
          id: 201,
          name: 'Low',
          genres: [],
          rating: { average: 6.5 },
        },
        202: {
          id: 202,
          name: 'High',
          genres: [],
          rating: { average: 9.0 },
        },
      }

      store.showsById = fakeShows
      store.genreToShowIds = { Thriller: [201, 202] }

      const shows = store.showsForGenre('Thriller')
      expect(shows).toHaveLength(2)
      expect(shows[0].name).toBe('High')
      expect(shows[1].name).toBe('Low')

      expect(store.showsForGenre('NonExistent')).toEqual([])
    })

    it('episodesBySeason groups and sorts episodes (number & string season)', () => {
      const fakeEpisodes: Episode[] = [
        {
          id: 1,
          name: 'E2',
          season: 1,
          number: 2,
        },
        {
          id: 2,
          name: 'E1',
          season: 1,
          number: 1,
        },
        {
          id: 3,
          name: 'S2E1',
          season: 2,
          number: 1,
        },
        {
          id: 4,
          name: 'S2E3',
          season: 2,
          number: 3,
        },
      ]

      store.episodesByShowId = { 300: fakeEpisodes }

      const seasons = store.episodesBySeason(300)

      expect(seasons[1]).toHaveLength(2)
      expect(seasons[1][0].name).toBe('E1')
      expect(seasons[1][1].name).toBe('E2')

      expect(seasons[2]).toHaveLength(2)
      expect(seasons[2][0].name).toBe('S2E1')
      expect(seasons[2][1].name).toBe('S2E3')
    })
  })

  describe('actions', () => {
    it('showSearch clears results on empty/whitespace query', async () => {
      await store.showSearch('     ')
      expect(store.showSearchResults).toEqual([])
      expect(store.showSearchError).toBeNull()
      expect(showsService.searchShows).not.toHaveBeenCalled()
    })

    it('showSearch calls service and updates state on valid query', async () => {
      const mockResponse = [
        {
          show: {
            id: 501,
            name: 'Mocked Drama',
            genres: ['Drama'],
            rating: { average: 8.3 },
          } satisfies Show,
        },
      ]

      vi.mocked(showsService.searchShows).mockResolvedValue(mockResponse)

      await store.showSearch('drama')

      expect(showsService.searchShows).toHaveBeenCalledWith('drama')
      expect(store.showSearchQuery).toBe('drama')
      expect(store.showSearchResults).toHaveLength(1)
      expect(store.showSearchResults[0].name).toBe('Mocked Drama')
      expect(store.showsById[501]).toBeDefined()
    })

    it('fetchShowDetails uses cache when show exists', async () => {
      const cachedShow: Show = {
        id: 600,
        name: 'Cached Show',
        genres: ['Action'],
        rating: { average: 8.0 },
      }

      store.showsById[600] = cachedShow

      const result = await store.fetchShowDetails(600)

      expect(result).toStrictEqual(cachedShow)
      expect(showsService.getShow).not.toHaveBeenCalled()
    })

    it('fetchShowDetails fetches and caches new show', async () => {
      const fetchedShow: Show = {
        id: 700,
        name: 'New Show',
        genres: ['Sci-Fi'],
        rating: { average: 7.9 },
      }

      vi.mocked(showsService.getShow).mockResolvedValue(fetchedShow)

      const result = await store.fetchShowDetails(700)

      expect(showsService.getShow).toHaveBeenCalledWith(700)
      expect(store.showsById[700]).toStrictEqual(fetchedShow)
      expect(result).toBe(fetchedShow)
    })

    it('fetchShowEpisodes returns cached episodes when available', async () => {
      const cachedEpisodes: Episode[] = [
        { id: 801, name: 'Pilot', season: 1, number: 1 },
      ]

      store.episodesByShowId[800] = cachedEpisodes

      const episodes = await store.fetchShowEpisodes(800)

      expect(episodes).toStrictEqual(cachedEpisodes)
      expect(showsService.getShowEpisodes).not.toHaveBeenCalled()
    })
  })
})