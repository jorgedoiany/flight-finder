import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFlightStore } from '../flightStore'
import { flightService } from '@/services/flightService'
import type { Flight, LegacySearchParams, FlightSearchResponse } from '@/types'

// Mock the flight service
vi.mock('@/services/flightService')
const mockFlightService = vi.mocked(flightService)

const mockFlights: Flight[] = [
  {
    id: '1',
    airline: 'American Airlines',
    flightNumber: 'AA123',
    departure: {
      airport: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
      time: '08:00',
      date: '2024-12-25',
    },
    arrival: {
      airport: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
      time: '11:30',
      date: '2024-12-25',
    },
    duration: '5h 30m',
    price: 299,
    currency: 'USD',
    stops: 0,
    aircraft: 'Boeing 737',
    class: 'economy',
  },
  {
    id: '2',
    airline: 'Delta Airlines',
    flightNumber: 'DL456',
    departure: {
      airport: { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA' },
      time: '14:00',
      date: '2024-12-25',
    },
    arrival: {
      airport: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
      time: '17:30',
      date: '2024-12-25',
    },
    duration: '5h 30m',
    price: 349,
    currency: 'USD',
    stops: 0,
    aircraft: 'Airbus A320',
    class: 'economy',
  },
  {
    id: '3',
    airline: 'United Airlines',
    flightNumber: 'UA789',
    departure: {
      airport: { code: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA' },
      time: '18:00',
      date: '2024-12-25',
    },
    arrival: {
      airport: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
      time: '21:30',
      date: '2024-12-25',
    },
    duration: '5h 30m',
    price: 425,
    currency: 'USD',
    stops: 1,
    aircraft: 'Boeing 777',
    class: 'business',
  },
]

const mockSearchParams: LegacySearchParams = {
  flightType: 'round-trip',
  passengers: 2,
  cabinClass: 'economy',
  origin: { entityId: 'NYC', skyId: 'NYC' },
  destination: { entityId: 'LAX', skyId: 'LAX' },
  departureDate: '2024-12-25',
  returnDate: '2024-12-30',
}

const mockSearchResponse: FlightSearchResponse = {
  flights: mockFlights,
  total: mockFlights.length,
  page: 1,
  totalPages: 1,
}

describe('Flight Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state before each test
    useFlightStore.setState({
      searchParams: null,
      flights: [],
      filteredFlights: [],
      allAirports: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      totalResults: 0,
      themeMode: 'light',
      filters: {
        sortBy: 'price',
        sortOrder: 'asc',
        selectedAirlines: [],
        selectedAirports: [],
        airlines: [],
        priceRange: [0, 2000],
        durationRange: [0, 1440],
        maxLayovers: 3,
        timePreferences: {
          departureTime: 'all',
          arrivalTime: 'all',
        },
        departureTime: 'all',
        preferredClass: 'all',
        maxStops: 3,
      },
      isFiltersOpen: false,
      comparison: {
        flights: [],
        isComparing: false,
      },
      searchHistory: [],
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useFlightStore())
      
      expect(result.current.flights).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.themeMode).toBe('light')
      expect(result.current.currentPage).toBe(1)
      expect(result.current.comparison.flights).toEqual([])
      expect(result.current.isFiltersOpen).toBe(false)
    })
  })

  describe('Search Functionality', () => {
    it('should set search params', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.setSearchParams(mockSearchParams)
      })
      
      expect(result.current.searchParams).toEqual(mockSearchParams)
    })

    it('should search flights successfully', async () => {
      mockFlightService.searchFlights.mockResolvedValue(mockSearchResponse)
      
      const { result } = renderHook(() => useFlightStore())
      
      await act(async () => {
        await result.current.searchFlights(mockSearchParams)
      })
      
      expect(result.current.isLoading).toBe(false)
      expect(result.current.flights).toEqual(mockFlights)
      expect(result.current.filteredFlights).toEqual(mockFlights)
      expect(result.current.totalResults).toBe(mockFlights.length)
      expect(result.current.searchParams).toEqual(mockSearchParams)
      expect(result.current.error).toBe(null)
    })

    it('should handle search errors', async () => {
      const errorMessage = 'API Error'
      mockFlightService.searchFlights.mockRejectedValue(new Error(errorMessage))
      
      const { result } = renderHook(() => useFlightStore())
      
      await act(async () => {
        await result.current.searchFlights(mockSearchParams)
      })
      
      expect(result.current.isLoading).toBe(false)
      expect(result.current.flights).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })

    it('should handle empty search results', async () => {
      mockFlightService.searchFlights.mockResolvedValue({
        flights: [],
        total: 0,
        page: 1,
        totalPages: 1,
      })
      
      const { result } = renderHook(() => useFlightStore())
      
      await act(async () => {
        await result.current.searchFlights(mockSearchParams)
      })
      
      expect(result.current.flights).toEqual([])
      expect(result.current.error).toBe('No flights found for the selected criteria')
    })

    it('should clear results', () => {
      const { result } = renderHook(() => useFlightStore())
      
      // Set some initial data
      act(() => {
        useFlightStore.setState({
          flights: mockFlights,
          filteredFlights: mockFlights,
          totalResults: 10,
          error: 'Some error',
        })
      })
      
      act(() => {
        result.current.clearResults()
      })
      
      expect(result.current.flights).toEqual([])
      expect(result.current.filteredFlights).toEqual([])
      expect(result.current.totalResults).toBe(0)
      expect(result.current.error).toBe(null)
      expect(result.current.currentPage).toBe(1)
    })

    it('should search airports', async () => {
      const mockAirports = [
        { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
        { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
      ]
      mockFlightService.searchAirports.mockResolvedValue(mockAirports)
      
      const { result } = renderHook(() => useFlightStore())
      
      await act(async () => {
        await result.current.searchAirports('JFK')
      })
      
      expect(result.current.allAirports).toEqual(mockAirports)
      expect(mockFlightService.searchAirports).toHaveBeenCalledWith('JFK')
    })

    it('should not search airports with short queries', async () => {
      const { result } = renderHook(() => useFlightStore())
      
      await act(async () => {
        await result.current.searchAirports('J')
      })
      
      expect(mockFlightService.searchAirports).not.toHaveBeenCalled()
    })
  })

  describe('Filter Functionality', () => {
    beforeEach(() => {
      // Set up some initial flights for filter testing
      act(() => {
        useFlightStore.setState({
          flights: mockFlights,
          filteredFlights: mockFlights,
        })
      })
    })

    it('should update filters and apply them', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.updateFilters({
          selectedAirlines: ['American Airlines'],
          priceRange: [200, 400],
        })
      })
      
      expect(result.current.filters.selectedAirlines).toEqual(['American Airlines'])
      expect(result.current.filters.priceRange).toEqual([200, 400])
      // Should filter flights based on airline
      expect(result.current.filteredFlights).toHaveLength(1)
      expect(result.current.filteredFlights[0].airline).toBe('American Airlines')
    })

    it('should reset filters', () => {
      const { result } = renderHook(() => useFlightStore())
      
      // Set some filters first
      act(() => {
        result.current.updateFilters({
          selectedAirlines: ['American Airlines'],
          priceRange: [200, 400],
        })
      })
      
      // Reset filters
      act(() => {
        result.current.resetFilters()
      })
      
      expect(result.current.filters.selectedAirlines).toEqual([])
      expect(result.current.filters.priceRange).toEqual([0, 2000])
      expect(result.current.filteredFlights).toEqual(mockFlights)
    })

    it('should toggle filters panel', () => {
      const { result } = renderHook(() => useFlightStore())
      
      expect(result.current.isFiltersOpen).toBe(false)
      
      act(() => {
        result.current.toggleFilters()
      })
      
      expect(result.current.isFiltersOpen).toBe(true)
      
      act(() => {
        result.current.toggleFilters()
      })
      
      expect(result.current.isFiltersOpen).toBe(false)
    })

    it('should filter by price range', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.updateFilters({
          priceRange: [300, 500],
        })
      })
      
      // Should filter flights based on price range
      const filteredPrices = result.current.filteredFlights.map(f => {
        return typeof f.price === 'number' ? f.price : (f.price.raw || 0)
      })
      expect(filteredPrices.every(price => price >= 300 && price <= 500)).toBe(true)
    })

    it('should filter by number of stops', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.updateFilters({
          maxLayovers: 0, // Only direct flights
        })
      })
      
      // Should only include direct flights (0 stops)
      const directFlights = result.current.filteredFlights
      expect(directFlights.every(flight => flight.stops === 0)).toBe(true)
      expect(directFlights).toHaveLength(2) // AA123 and DL456
    })

    it('should sort flights by price', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.updateFilters({
          sortBy: 'price',
          sortOrder: 'asc',
        })
      })
      
      const prices = result.current.filteredFlights.map(f => f.price)
      expect(prices).toEqual([299, 349, 425]) // Sorted ascending
      
      act(() => {
        result.current.updateFilters({
          sortOrder: 'desc',
        })
      })
      
      const pricesDesc = result.current.filteredFlights.map(f => f.price)
      expect(pricesDesc).toEqual([425, 349, 299]) // Sorted descending
    })
  })

  describe('Flight Comparison', () => {
    it('should add flight to comparison', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.addToComparison(mockFlights[0])
      })
      
      expect(result.current.comparison.flights).toHaveLength(1)
      expect(result.current.comparison.flights[0]).toEqual(mockFlights[0])
    })

    it('should not add duplicate flights to comparison', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.addToComparison(mockFlights[0])
        result.current.addToComparison(mockFlights[0]) // Same flight
      })
      
      expect(result.current.comparison.flights).toHaveLength(1)
    })

    it('should not add more than 3 flights to comparison', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.addToComparison(mockFlights[0])
        result.current.addToComparison(mockFlights[1])
        result.current.addToComparison(mockFlights[2])
        result.current.addToComparison({
          ...mockFlights[0],
          id: '4', // Different ID but 4th flight
        })
      })
      
      expect(result.current.comparison.flights).toHaveLength(3)
    })

    it('should remove flight from comparison', () => {
      const { result } = renderHook(() => useFlightStore())
      
      // Add flights first
      act(() => {
        result.current.addToComparison(mockFlights[0])
        result.current.addToComparison(mockFlights[1])
      })
      
      // Remove one flight
      act(() => {
        result.current.removeFromComparison(mockFlights[0].id)
      })
      
      expect(result.current.comparison.flights).toHaveLength(1)
      expect(result.current.comparison.flights[0].id).toBe(mockFlights[1].id)
    })

    it('should clear all flights from comparison', () => {
      const { result } = renderHook(() => useFlightStore())
      
      // Add flights first
      act(() => {
        result.current.addToComparison(mockFlights[0])
        result.current.addToComparison(mockFlights[1])
      })
      
      // Clear comparison
      act(() => {
        result.current.clearComparison()
      })
      
      expect(result.current.comparison.flights).toHaveLength(0)
    })

    it('should toggle comparison mode', () => {
      const { result } = renderHook(() => useFlightStore())
      
      expect(result.current.comparison.isComparing).toBe(false)
      
      act(() => {
        result.current.toggleComparison()
      })
      
      expect(result.current.comparison.isComparing).toBe(true)
    })
  })

  describe('Theme Management', () => {
    it('should toggle theme', () => {
      const { result } = renderHook(() => useFlightStore())
      
      expect(result.current.themeMode).toBe('light')
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(result.current.themeMode).toBe('dark')
      
      act(() => {
        result.current.toggleTheme()
      })
      
      expect(result.current.themeMode).toBe('light')
    })

    it('should set theme mode directly', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.setThemeMode('dark')
      })
      
      expect(result.current.themeMode).toBe('dark')
      
      act(() => {
        result.current.setThemeMode('light')
      })
      
      expect(result.current.themeMode).toBe('light')
    })
  })

  describe('Pagination', () => {
    it('should set current page', () => {
      const { result } = renderHook(() => useFlightStore())
      
      act(() => {
        result.current.setCurrentPage(3)
      })
      
      expect(result.current.currentPage).toBe(3)
    })

    it('should reset page when filters change', () => {
      const { result } = renderHook(() => useFlightStore())
      
      // Set page to something other than 1
      act(() => {
        result.current.setCurrentPage(5)
      })
      
      expect(result.current.currentPage).toBe(5)
      
      // Update filters should reset page to 1
      act(() => {
        result.current.updateFilters({ selectedAirlines: ['Delta'] })
      })
      
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('Loading States', () => {
    it('should set loading state during search', async () => {
      // Mock a delayed response
      let resolve: (value: FlightSearchResponse) => void
      const promise = new Promise<FlightSearchResponse>(res => {
        resolve = res
      })
      mockFlightService.searchFlights.mockReturnValue(promise)
      
      const { result } = renderHook(() => useFlightStore())
      
      // Start search (don't await yet)
      act(() => {
        result.current.searchFlights(mockSearchParams)
      })
      
      // Should be loading immediately after starting
      expect(result.current.isLoading).toBe(true)
      
      // Resolve the promise and wait for completion
      act(() => {
        resolve!(mockSearchResponse)
      })
      
      await act(async () => {
        await promise
      })
      
      // Should not be loading after completion
      expect(result.current.isLoading).toBe(false)
    })
  })
})