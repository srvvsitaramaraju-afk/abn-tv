import { defineStore } from 'pinia'
import type { Show, Episode, CastMember } from '@/types/show'
import {
  fetchShowsPage,
  getShow,
  searchShows,
  getShowEpisodes,
  getShowCast
} from '@/services/shows'

type ShowByIdMap = Record<number, Show>
type GenreToShowIdsMap = Record<string, number[]>
export type ShowsGroupedByGenre = Record<string, Show[]>
type EpisodesByShowIdMap = Record<number, Episode[]>
type CastByShowIdMap = Record<number, CastMember[]>

export const useShowStore = defineStore('shows', {
  state: () => ({
    showsById: {} as ShowByIdMap,
    genreToShowIds: {} as GenreToShowIdsMap,
    loadedIndexPages: [] as number[],

    isLoading: false,
    error: null as string | null,

    showSearchQuery: '',
    showSearchResults: [] as Show[],
    isShowSearchLoading: false,
    showSearchError: null as string | null,

    episodesByShowId: {} as EpisodesByShowIdMap,
    isEpisodesLoading: false,
    episodesError: null as string | null,

    castByShowId: {} as CastByShowIdMap,
    isCastLoading: false,
    castError: null as string | null
  }),

  getters: {
    showsGroupedByGenre(state): ShowsGroupedByGenre {
      const grouped: ShowsGroupedByGenre = {}

      for (const [genreName, showIds] of Object.entries(state.genreToShowIds)) {
        const shows = showIds
          .map(id => state.showsById[id])
          .filter((s): s is Show => !!s)
          .sort((a, b) => (b.rating?.average ?? -1) - (a.rating?.average ?? -1))

        if (shows.length > 0) grouped[genreName] = shows
      }

      return grouped
    },

    showsForGenre: (state) => (name: string): Show[] => {
      const ids = state.genreToShowIds[name] ?? []
      return ids
        .map(id => state.showsById[id])
        .filter((show): show is Show => !!show)
        .sort((a, b) => (b.rating?.average ?? -1) - (a.rating?.average ?? -1))
    },

    hasMorePages: (state) => {
      const lastPage = Math.max(...state.loadedIndexPages, -1)
      return lastPage < 200 && !state.error
    },

    episodesBySeason: (state) => (showId: number): Record<number, Episode[]> => {
      const episodes = state.episodesByShowId[showId] ?? []
      const bySeason: Record<number, Episode[]> = {}

      for (const ep of episodes) {
        const season = Number(ep.season)
        if (!isNaN(season)) {
          bySeason[season] ??= []
          bySeason[season].push(ep)
        }
      }

      Object.values(bySeason).forEach(list =>
        list.sort((a, b) => (a.number ?? 9999) - (b.number ?? 9999))
      )

      return bySeason
    }
  },

  actions: {
    async loadShowIndexPages(pages: number[]) {
      this.isLoading = true
      this.error = null

      try {
        for (const page of pages) {
          if (this.loadedIndexPages.includes(page)) continue

          try {
            const items = await fetchShowsPage(page)

            for (const show of items) {
              this.showsById[show.id] = show

              const genres = show.genres?.length ? show.genres : ['Other']

              for (const g of genres) {
                const name = g || 'Other'
                this.genreToShowIds[name] ??= []
                if (!this.genreToShowIds[name].includes(show.id)) {
                  this.genreToShowIds[name].push(show.id)
                }
              }
            }

            this.loadedIndexPages.push(page)
          } catch (err: any) {
            if (err?.response?.status === 404) break
            throw err
          }
        }
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load shows'
      } finally {
        this.isLoading = false
      }
    },

    async searchAndAddToGenre(genre: string) {
      if (!genre) return

      try {
        const results = await searchShows(genre.toLowerCase())
        const matching = results
          .map(r => r.show)
          .filter(show => show.genres?.some(g => g.toLowerCase() === genre.toLowerCase()))

        matching.forEach(show => {
          if (!this.showsById[show.id]) {
            this.showsById[show.id] = show

            show.genres?.forEach(g => {
              const name = g || 'Other'
              this.genreToShowIds[name] ??= []
              if (!this.genreToShowIds[name].includes(show.id)) {
                this.genreToShowIds[name].push(show.id)
              }
            })
          }
        })
      } catch (err) {
        console.error('Genre search failed:', err)
      }
    },

    async fetchShowDetails(id: number): Promise<Show> {
      if (this.showsById[id]) return this.showsById[id]

      this.isLoading = true
      this.error = null

      try {
        const show = await getShow(id)
        this.showsById[show.id] = show
        return show
      } catch (e: any) {
        this.error = e?.message ?? 'Failed to load show details'
        throw e
      } finally {
        this.isLoading = false
      }
    },

    async showSearch(query: string) {
      this.showSearchQuery = query.trim()

      if (!this.showSearchQuery) {
        this.showSearchResults = []
        this.showSearchError = null
        return
      }

      this.isShowSearchLoading = true
      this.showSearchError = null

      try {
        const results = await searchShows(this.showSearchQuery)
        const shows = results.map(r => r.show)

        this.showSearchResults = shows

        for (const show of shows) {
          this.showsById[show.id] = show
        }
      } catch (e: any) {
        this.showSearchError = e?.message ?? 'Search failed'
      } finally {
        this.isShowSearchLoading = false
      }
    },

    async fetchShowEpisodes(showId: number) {
      if (this.episodesByShowId[showId]?.length) return this.episodesByShowId[showId]

      if (this.isEpisodesLoading) return []

      this.isEpisodesLoading = true
      this.episodesError = null

      try {
        const episodes = await getShowEpisodes(showId)
        this.episodesByShowId[showId] = episodes
        return episodes
      } catch (e: any) {
        this.episodesError = e.message ?? 'Failed to load episodes'
        throw e
      } finally {
        this.isEpisodesLoading = false
      }
    },

    async fetchShowCast(showId: number) {
      if (this.castByShowId[showId]?.length) return this.castByShowId[showId]

      if (this.isCastLoading) return []

      this.isCastLoading = true
      this.castError = null

      try {
        const cast = await getShowCast(showId)
        this.castByShowId[showId] = cast
        return cast
      } catch (e: any) {
        this.castError = e.message ?? 'Failed to load cast'
        throw e
      } finally {
        this.isCastLoading = false
      }
    }
  }
})