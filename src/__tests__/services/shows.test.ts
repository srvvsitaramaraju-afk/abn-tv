import { 
  describe, 
  it, 
  expect, 
  vi,
  beforeEach 
} from 'vitest'
import { 
  fetchShowsPage, 
  searchShows, 
  getShow, 
  getShowEpisodes, 
  getShowCast 
} from '../../services/shows'
import { http } from '../../services/http'

// ✅ FIXED: TypeScript-safe mock
vi.mock('../../services/http')

const mockGet = vi.mocked(http.get)

describe('TV Shows API Service', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchShowsPage', () => {
    it('should fetch shows for page 0 by default', async () => {
      // Arrange
      const mockShows = [{ id: 1, name: 'Show 1' }]
      mockGet.mockResolvedValue({ data: mockShows })

      // Act
      const result = await fetchShowsPage()

      // Assert ✅ Uses result!
      expect(mockGet).toHaveBeenCalledWith('/shows', {
        params: { page: 0 }
      })
      expect(result).toEqual(mockShows)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should fetch shows for specific page', async () => {
      // Arrange
      const mockShows = []
      mockGet.mockResolvedValue({ data: mockShows })
      
      // Act
      const result = await fetchShowsPage(2)

      // Assert ✅ Uses result!
      expect(mockGet).toHaveBeenCalledWith('/shows', {
        params: { page: 2 }
      })
      expect(result).toEqual(mockShows)
    })
  })

  describe('searchShows', () => {
    it('should search shows by query', async () => {
      // Arrange
      const mockResults = [{ show: { id: 1, name: 'Breaking Bad' } }]
      mockGet.mockResolvedValue({ data: mockResults })

      // Act
      const result = await searchShows('breaking')

      // Assert ✅ Uses result!
      expect(mockGet).toHaveBeenCalledWith('/search/shows', {
        params: { q: 'breaking' }
      })
      expect(result).toEqual(mockResults)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getShow', () => {
    it('should fetch single show by ID', async () => {
      // Arrange
      const mockShow = { id: 1, name: 'Test Show', summary: '<p>Summary</p>' }
      mockGet.mockResolvedValue({ data: mockShow })

      // Act
      const result = await getShow(1)

      // Assert ✅ Uses result!
      expect(mockGet).toHaveBeenCalledWith('/shows/1')
      expect(result).toEqual(mockShow)
    })
  })

  describe('getShowEpisodes', () => {
    it('should fetch episodes for show ID', async () => {
      // Arrange
      const mockEpisodes = [{ id: 1, name: 'Pilot', season: 1, number: 1 }]
      mockGet.mockResolvedValue({ data: mockEpisodes })

      // Act
      const result = await getShowEpisodes(1)

      // Assert ✅ Uses result! (FIXED)
      expect(mockGet).toHaveBeenCalledWith('/shows/1/episodes')
      expect(result).toEqual(mockEpisodes)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getShowCast', () => {
    it('should fetch cast for show ID', async () => {
      // Arrange
      const mockCast = [{ person: { id: 1, name: 'Actor 1' } }]
      mockGet.mockResolvedValue({ data: mockCast })

      // Act
      const result = await getShowCast(1)

      // Assert ✅ Uses result!
      expect(mockGet).toHaveBeenCalledWith('/shows/1/cast')
      expect(result).toEqual(mockCast)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should rethrow http errors', async () => {
      // Arrange
      mockGet.mockRejectedValue({ response: { status: 500 } })

      // Act & Assert
      await expect(fetchShowsPage()).rejects.toThrow()
    })
  })
})