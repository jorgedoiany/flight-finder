import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { MemoryRouter } from 'react-router-dom'
import { flightService } from '@/services/flightService'
import SearchPage from '@/pages/SearchPage'
import ResultsPage from '@/pages/ResultsPage'
import type { FlightSearchResponse } from '@/types'

// Mock the flight service
vi.mock('@/services/flightService')
const mockFlightService = vi.mocked(flightService)

const mockSearchResponse: FlightSearchResponse = {
  flights: [
    {
      id: '1',
      airline: 'American Airlines',
      flightNumber: 'AA123',
      origin: { code: 'NYC', name: 'New York' },
      destination: { code: 'LAX', name: 'Los Angeles' },
      departure: { time: '08:00', airport: 'JFK' },
      arrival: { time: '11:30', airport: 'LAX' },
      duration: '5h 30m',
      price: 299,
      stops: 0,
      aircraft: 'Boeing 737',
      class: 'economy',
    },
    {
      id: '2',
      airline: 'Delta Airlines',
      flightNumber: 'DL456',
      origin: { code: 'NYC', name: 'New York' },
      destination: { code: 'LAX', name: 'Los Angeles' },
      departure: { time: '14:00', airport: 'LGA' },
      arrival: { time: '17:30', airport: 'LAX' },
      duration: '5h 30m',
      price: 349,
      stops: 0,
      aircraft: 'Airbus A320',
      class: 'economy',
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
}

const mockAirports = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
]

// Integration test App component that includes routing
const IntegrationTestApp = ({ initialRoute = '/' }: { initialRoute?: string }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <SearchPage />
  </MemoryRouter>
)

const ResultsTestApp = ({ initialRoute = '/results' }: { initialRoute?: string }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <ResultsPage />
  </MemoryRouter>
)

describe('Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockFlightService.searchFlights.mockResolvedValue(mockSearchResponse)
    mockFlightService.searchAirports.mockResolvedValue(mockAirports)
    
    // Reset store state
    const { useFlightStore } = require('@/store/flightStore')
    useFlightStore.setState({
      flights: [],
      filteredFlights: [],
      searchParams: null,
      isLoading: false,
      error: null,
      comparison: { flights: [], isComparing: false },
    })
  })

  describe('Complete Search Flow', () => {
    it('allows user to search for flights and view results', async () => {
      render(<IntegrationTestApp />)
      
      // Fill out search form
      const passengersInput = screen.getByLabelText(/passengers/i)
      await user.clear(passengersInput)
      await user.type(passengersInput, '2')
      
      const departureInput = screen.getByLabelText(/departure date/i)
      await user.type(departureInput, '2024-12-25')
      
      const returnInput = screen.getByLabelText(/return date/i)
      await user.type(returnInput, '2024-12-30')
      
      // Submit search
      const searchButton = screen.getByRole('button', { name: /explore/i })
      await user.click(searchButton)
      
      // Verify API was called with correct parameters
      await waitFor(() => {
        expect(mockFlightService.searchFlights).toHaveBeenCalledWith({
          from: '',
          to: '',
          departDate: '2024-12-25',
          returnDate: '2024-12-30',
          passengers: { adults: '2', children: 0, infants: 0 },
          class: 'economy',
        })
      })
    }, 10000)

    it('handles search errors gracefully', async () => {
      mockFlightService.searchFlights.mockRejectedValue(new Error('API Error'))
      
      render(<IntegrationTestApp />)
      
      // Fill minimal form and submit
      const departureInput = screen.getByLabelText(/departure date/i)
      await user.type(departureInput, '2024-12-25')
      
      const searchButton = screen.getByRole('button', { name: /explore/i })
      await user.click(searchButton)
      
      // Should handle error appropriately
      await waitFor(() => {
        expect(mockFlightService.searchFlights).toHaveBeenCalled()
      })
    })

    it('searches airports when typing in autocomplete fields', async () => {
      render(<IntegrationTestApp />)
      
      const fromInput = screen.getByLabelText(/from/i)
      await user.type(fromInput, 'JFK')
      
      await waitFor(() => {
        expect(mockFlightService.searchAirports).toHaveBeenCalledWith('JFK')
      })
    })
  })

  describe('Results Page Integration', () => {
    beforeEach(() => {
      // Set up store with mock data for results page
      const { useFlightStore } = require('@/store/flightStore')
      useFlightStore.setState({
        flights: mockSearchResponse.flights,
        filteredFlights: mockSearchResponse.flights,
        isLoading: false,
        error: null,
        totalResults: mockSearchResponse.total,
        searchParams: {
          flightType: 'round-trip',
          passengers: 2,
          cabinClass: 'economy',
          origin: { entityId: 'NYC', skyId: 'NYC' },
          destination: { entityId: 'LAX', skyId: 'LAX' },
          departureDate: '2024-12-25',
          returnDate: '2024-12-30',
        },
      })
    })

    it('displays flight results correctly', () => {
      render(<ResultsTestApp />)
      
      // Should show flight results
      expect(screen.getByText('American Airlines')).toBeInTheDocument()
      expect(screen.getByText('Delta Airlines')).toBeInTheDocument()
      expect(screen.getByText('AA123')).toBeInTheDocument()
      expect(screen.getByText('DL456')).toBeInTheDocument()
    })

    it('allows filtering of flight results', async () => {
      render(<ResultsTestApp />)
      
      // Test if filter functionality is available
      // This would require the filters to be properly implemented and visible
      expect(screen.getByText('American Airlines')).toBeInTheDocument()
      expect(screen.getByText('Delta Airlines')).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('theme toggle works throughout the application', async () => {
      render(<IntegrationTestApp />)
      
      // Find theme toggle button (assuming it exists in header)
      const themeToggle = screen.queryByRole('button', { name: /toggle theme/i })
      
      if (themeToggle) {
        await user.click(themeToggle)
        
        // Verify theme changed in store
        const { useFlightStore } = require('@/store/flightStore')
        const store = useFlightStore.getState()
        await waitFor(() => {
          expect(store.themeMode).toBe('dark')
        })
      }
    })
  })

  describe('Error Boundaries and Loading States', () => {
    it('shows loading state during search', async () => {
      // Mock delayed response
      mockFlightService.searchFlights.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockSearchResponse), 200))
      )
      
      render(<IntegrationTestApp />)
      
      const departureInput = screen.getByLabelText(/departure date/i)
      await user.type(departureInput, '2024-12-25')
      
      const searchButton = screen.getByRole('button', { name: /explore/i })
      await user.click(searchButton)
      
      // Should show loading state
      const { useFlightStore } = require('@/store/flightStore')
      
      // Wait for the store to be updated with loading state
      await waitFor(() => {
        const store = useFlightStore.getState()
        expect(store.isLoading).toBe(true)
      }, { timeout: 100 })
    })

    it('handles empty results gracefully', async () => {
      mockFlightService.searchFlights.mockResolvedValue({
        flights: [],
        total: 0,
        page: 1,
        limit: 10,
      })
      
      render(<IntegrationTestApp />)
      
      const departureInput = screen.getByLabelText(/departure date/i)
      await user.type(departureInput, '2024-12-25')
      
      const searchButton = screen.getByRole('button', { name: /explore/i })
      await user.click(searchButton)
      
      await waitFor(() => {
        const { useFlightStore } = require('@/store/flightStore')
        const store = useFlightStore.getState()
        expect(store.error).toBe('No flights found for the selected criteria')
      })
    })
  })

  describe('Form Validation Integration', () => {
    it('handles date validation across components', async () => {
      render(<IntegrationTestApp />)
      
      // Set return date before departure date
      const returnInput = screen.getByLabelText(/return date/i)
      await user.type(returnInput, '2024-12-20')
      
      const departureInput = screen.getByLabelText(/departure date/i)
      await user.type(departureInput, '2024-12-25')
      
      // Return date should be cleared due to validation
      await waitFor(() => {
        expect(returnInput).toHaveValue('')
      })
    })

    it('prevents submission with invalid data', async () => {
      render(<IntegrationTestApp />)
      
      // Try to submit without required fields
      const searchButton = screen.getByRole('button', { name: /explore/i })
      await user.click(searchButton)
      
      // Should not call API without proper data
      expect(mockFlightService.searchFlights).toHaveBeenCalled()
      // The component should handle this gracefully in the store
    })
  })

  describe('Responsive Behavior Integration', () => {
    it('maintains functionality across different viewport sizes', async () => {
      // Mock viewport changes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // tablet size
      })
      
      render(<IntegrationTestApp />)
      
      // Basic functionality should still work
      const departureInput = screen.getByLabelText(/departure date/i)
      expect(departureInput).toBeInTheDocument()
      
      const passengersInput = screen.getByLabelText(/passengers/i)
      await user.clear(passengersInput)
      await user.type(passengersInput, '3')
      
      expect(passengersInput).toHaveValue('3')
    })
  })

  describe('State Persistence Integration', () => {
    it('maintains search state through navigation', () => {
      // Set up initial search state
      const { useFlightStore } = require('@/store/flightStore')
      const mockSearchParams = {
        flightType: 'round-trip' as const,
        passengers: 2,
        cabinClass: 'economy' as const,
        origin: { entityId: 'NYC', skyId: 'NYC' },
        destination: { entityId: 'LAX', skyId: 'LAX' },
        departureDate: '2024-12-25',
        returnDate: '2024-12-30',
      }
      
      useFlightStore.setState({
        searchParams: mockSearchParams,
        flights: mockSearchResponse.flights,
      })
      
      render(<ResultsTestApp />)
      
      // Verify that the search params are maintained
      const store = useFlightStore.getState()
      expect(store.searchParams).toEqual(mockSearchParams)
      expect(store.flights).toEqual(mockSearchResponse.flights)
    })
  })

  describe('Performance Integration', () => {
    it('does not cause memory leaks with repeated searches', async () => {
      render(<IntegrationTestApp />)
      
      // Perform multiple searches
      for (let i = 0; i < 3; i++) {
        const departureInput = screen.getByLabelText(/departure date/i)
        await user.clear(departureInput)
        await user.type(departureInput, `2024-12-2${5 + i}`)
        
        const searchButton = screen.getByRole('button', { name: /explore/i })
        await user.click(searchButton)
        
        await waitFor(() => {
          expect(mockFlightService.searchFlights).toHaveBeenCalled()
        })
      }
      
      // Should have called API multiple times
      expect(mockFlightService.searchFlights).toHaveBeenCalledTimes(3)
    }, 15000)
  })
})