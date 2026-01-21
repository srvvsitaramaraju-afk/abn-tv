import { defineStore } from 'pinia'
import type { Show, Episode, CastMember } from '@/types/show'
import {
    fetchShowsPage,
    getShow,
    searchShows,
    getShowEpisodes,
    getShowCast,
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
        castError: null as string | null,
    }),

    getters: {
        showsGroupedByGenre(state): ShowsGroupedByGenre {
            const grouped: ShowsGroupedByGenre = {}

            for (const [genreName, showIds] of Object.entries(state.genreToShowIds)) {
                const showsForGenre = showIds
                    .map(id => state.showsById[id])
                    .filter((s): s is Show => !!s)
                    .sort((a, b) => {
                        const ratingA = a.rating?.average ?? -1
                        const ratingB = b.rating?.average ?? -1
                        return ratingB - ratingA
                    })

                if (showsForGenre.length > 0) {
                    grouped[genreName] = showsForGenre
                }
            }

            return grouped
        },

        showsForGenre: (state) => (name: string): Show[] => {
            const ids = state.genreToShowIds[name] ?? []
            const shows = ids
                .map(id => state.showsById[id])
                .filter((show): show is Show => !!show)

            return shows.sort((a, b) => {
                const ratingA = a.rating?.average ?? -1
                const ratingB = b.rating?.average ?? -1
                return ratingB - ratingA
            })
        },

        episodesBySeason: (state) => (showId: number): Record<number, Episode[]> => {
            const allEpisodes = state.episodesByShowId[showId] ?? []
            const episodesBySeason: Record<number, Episode[]> = {}

            for (const episode of allEpisodes) {
                // Handle season being number OR string
                const seasonRaw = episode.season
                let seasonNum: number | null = null

                if (typeof seasonRaw === 'number') {
                    seasonNum = seasonRaw
                } else if (typeof seasonRaw === 'string') {
                    seasonNum = Number(seasonRaw)
                }

                if (seasonNum !== null && !isNaN(seasonNum)) {
                    if (!episodesBySeason[seasonNum]) {
                        episodesBySeason[seasonNum] = []
                    }
                    episodesBySeason[seasonNum].push(episode)
                }
            }

            // Sort episodes in each season by episode number
            for (const seasonKey of Object.keys(episodesBySeason)) {
                const season = Number(seasonKey)
                episodesBySeason[season]!.sort((a, b) => {
                    const numA = typeof a.number === 'number' ? a.number : 9999
                    const numB = typeof b.number === 'number' ? b.number : 9999
                    return numA - numB
                })
            }

            return episodesBySeason
        },
    },

    actions: {
        async loadShowIndexPages(pages: number[] = [0, 1, 2]) {
            this.isLoading = true
            this.error = null

            try {
                for (const page of pages) {
                    if (this.loadedIndexPages.includes(page)) continue

                    const pageItems = await fetchShowsPage(page)

                    for (const show of pageItems) {
                        this.showsById[show.id] = show

                        const genres = show.genres?.length ? show.genres : ['Other']

                        for (const genre of genres) {
                            const genreName = genre || 'Other'
                            this.genreToShowIds[genreName] ??= []
                            if (!this.genreToShowIds[genreName].includes(show.id)) {
                                this.genreToShowIds[genreName].push(show.id)
                            }
                        }
                    }

                    this.loadedIndexPages.push(page)
                }
            } catch (e: any) {
                this.error = e?.message ?? 'Failed to load show index pages'
            } finally {
                this.isLoading = false
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
            this.showSearchQuery = query

            if (!query.trim()) {
                this.showSearchResults = []
                this.showSearchError = null
                return
            }

            this.isShowSearchLoading = true
            this.showSearchError = null

            try {
                const response = await searchShows(query)
                const foundShows = response.map(r => r.show)

                this.showSearchResults = foundShows

                for (const show of foundShows) {
                    this.showsById[show.id] = show
                }
            } catch (e: any) {
                this.showSearchError = e?.message ?? 'Show search failed'
            } finally {
                this.isShowSearchLoading = false
            }
        },

        async fetchShowEpisodes(showId: number) {
            if (this.episodesByShowId[showId]?.length) {
                return this.episodesByShowId[showId]
            }

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
            if (this.castByShowId[showId]?.length) {
                return this.castByShowId[showId]
            }

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
        },
    },
})