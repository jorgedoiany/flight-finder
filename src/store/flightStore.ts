import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { flightService } from '@/services/flightService'
import type { 
  Flight, 
  Airport, 
  LegacySearchParams,
  SearchParams,
  FlightSearchResponse,
  FilterOptions 
} from '@/types'

// Extended filter options
export interface AdvancedFiltersState extends FilterOptions {
  sortBy: 'price' | 'duration' | 'departure' | 'arrival' | 'airline'
  sortOrder: 'asc' | 'desc'
  selectedAirlines: string[]
  selectedAirports: string[]
  timePreferences: {
    departureTime: 'morning' | 'afternoon' | 'evening' | 'night' | 'all'
    arrivalTime: 'morning' | 'afternoon' | 'evening' | 'night' | 'all'
  }
  priceRange: [number, number]
  durationRange: [number, number] // in minutes
  maxLayovers: number
  preferredClass: 'economy' | 'business' | 'first' | 'all'
}

// Comparison feature
export interface FlightComparison {
  flights: Flight[]
  isComparing: boolean
}

// Search history
export interface SearchHistory {
  id: string
  searchParams: LegacySearchParams
  timestamp: Date
  resultsCount: number
}

// Global app state
interface FlightAppState {
  // Search & Results
  searchParams: LegacySearchParams | null
  flights: Flight[]
  filteredFlights: Flight[]
  allAirports: Airport[]
  
  // UI State
  isLoading: boolean
  error: string | null
  currentPage: number
  totalResults: number
  
  // Advanced Filters
  filters: AdvancedFiltersState
  isFiltersOpen: boolean
  
  // Flight Comparison
  comparison: FlightComparison
  
  // Search History
  searchHistory: SearchHistory[]
  
  // Actions - Search
  setSearchParams: (params: LegacySearchParams | null) => void
  searchFlights: (params: LegacySearchParams) => Promise<void>
  clearResults: () => void
  searchAirports: (query: string) => Promise<void>
  
  // Actions - Filters
  updateFilters: (filters: Partial<AdvancedFiltersState>) => void
  resetFilters: () => void
  toggleFilters: () => void
  applyFilters: () => void
  
  // Actions - Comparison
  addToComparison: (flight: Flight) => void
  removeFromComparison: (flightId: string) => void
  clearComparison: () => void
  toggleComparison: () => void
  
  // Actions - History
  saveSearchToHistory: () => void
  loadSearchFromHistory: (historyItem: SearchHistory) => void
  clearSearchHistory: () => void
  
  // Actions - Pagination & Sorting
  setCurrentPage: (page: number) => void
  sortFlights: (sortBy: AdvancedFiltersState['sortBy'], sortOrder: AdvancedFiltersState['sortOrder']) => void
}

// Default filter state
const defaultFilters: AdvancedFiltersState = {
  sortBy: 'price',
  sortOrder: 'asc',
  selectedAirlines: [],
  selectedAirports: [],
  airlines: [],
  priceRange: [0, 2000],
  durationRange: [0, 1440], // 0-24 hours
  maxLayovers: 3,
  timePreferences: {
    departureTime: 'all',
    arrivalTime: 'all'
  },
  departureTime: 'all',
  preferredClass: 'all',
  maxStops: 3
}

// Helper functions
const convertLegacyToSearchParams = (legacyParams: LegacySearchParams): SearchParams => ({
  from: legacyParams.origin.skyId || legacyParams.origin.entityId || '',
  to: legacyParams.destination.skyId || legacyParams.destination.entityId || '',
  departDate: legacyParams.departureDate,
  returnDate: legacyParams.returnDate || undefined,
  passengers: {
    adults: legacyParams.passengers || 1,
    children: 0,
    infants: 0
  },
  class: (legacyParams.cabinClass as 'economy' | 'business' | 'first') || 'economy'
})

const applyAdvancedFilters = (flights: Flight[], filters: AdvancedFiltersState): Flight[] => {
  let filtered = [...flights]
  
  // Airline filter
  if (filters.selectedAirlines.length > 0) {
    filtered = filtered.filter(flight => 
      filters.selectedAirlines.includes(flight.airline)
    )
  }
  
  // Price range filter
  filtered = filtered.filter(flight => {
    const price = typeof flight.price === 'object' ? flight.price.raw || 0 : flight.price
    return price >= filters.priceRange[0] && price <= filters.priceRange[1]
  })
  
  // Duration filter
  filtered = filtered.filter(flight => {
    const [hours, minutes] = flight.duration.match(/(\d+)h\s*(\d+)?m?/) || ['0', '0', '0']
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes || '0')
    return totalMinutes >= filters.durationRange[0] && totalMinutes <= filters.durationRange[1]
  })
  
  // Stops filter
  filtered = filtered.filter(flight => flight.stops <= filters.maxLayovers)
  
  // Class filter
  if (filters.preferredClass !== 'all') {
    filtered = filtered.filter(flight => flight.class === filters.preferredClass)
  }
  
  // Time preferences
  if (filters.timePreferences.departureTime !== 'all') {
    filtered = filtered.filter(flight => {
      const hour = parseInt(flight.departure.time.split(':')[0])
      const timeSlot = getTimeSlot(hour)
      return timeSlot === filters.timePreferences.departureTime
    })
  }
  
  // Sort flights
  filtered.sort((a, b) => {
    let comparison = 0
    
    switch (filters.sortBy) {
      case 'price': {
        const priceA = typeof a.price === 'object' ? a.price.raw || 0 : a.price
        const priceB = typeof b.price === 'object' ? b.price.raw || 0 : b.price
        comparison = priceA - priceB
        break
      }
      case 'duration': {
        const durationA = parseDurationToMinutes(a.duration)
        const durationB = parseDurationToMinutes(b.duration)
        comparison = durationA - durationB
        break
      }
      case 'departure': {
        comparison = a.departure.time.localeCompare(b.departure.time)
        break
      }
      case 'arrival': {
        comparison = a.arrival.time.localeCompare(b.arrival.time)
        break
      }
      case 'airline': {
        comparison = a.airline.localeCompare(b.airline)
        break
      }
    }
    
    return filters.sortOrder === 'asc' ? comparison : -comparison
  })
  
  return filtered
}

const getTimeSlot = (hour: number): AdvancedFiltersState['timePreferences']['departureTime'] => {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

const parseDurationToMinutes = (duration: string): number => {
  const match = duration.match(/(\d+)h\s*(\d+)?m?/)
  if (!match) return 0
  const hours = parseInt(match[1]) || 0
  const minutes = parseInt(match[2]) || 0
  return hours * 60 + minutes
}

// Create the Zustand store
export const useFlightStore = create<FlightAppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        searchParams: null,
        flights: [],
        filteredFlights: [],
        allAirports: [],
        
        isLoading: false,
        error: null,
        currentPage: 1,
        totalResults: 0,
        
        filters: defaultFilters,
        isFiltersOpen: false,
        
        comparison: {
          flights: [],
          isComparing: false
        },
        
        searchHistory: [],
        
        // Search actions
        setSearchParams: (params) => set({ searchParams: params }),
        
        searchFlights: async (params) => {
          set({ isLoading: true, error: null })
          
          try {
            const searchParams = convertLegacyToSearchParams(params)
            const response: FlightSearchResponse = await flightService.searchFlights(searchParams)
            
            if (response.flights && response.flights.length > 0) {
              const { filters } = get()
              const filteredFlights = applyAdvancedFilters(response.flights, filters)
              
              set({
                flights: response.flights,
                filteredFlights,
                totalResults: response.total,
                searchParams: params,
                isLoading: false,
                currentPage: 1
              })
              
              // Auto-save to history
              get().saveSearchToHistory()
            } else {
              set({
                flights: [],
                filteredFlights: [],
                totalResults: 0,
                error: 'No flights found for the selected criteria',
                isLoading: false
              })
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to search flights'
            set({
              error: errorMessage,
              flights: [],
              filteredFlights: [],
              totalResults: 0,
              isLoading: false
            })
          }
        },
        
        clearResults: () => set({
          flights: [],
          filteredFlights: [],
          totalResults: 0,
          error: null,
          currentPage: 1
        }),
        
        searchAirports: async (query) => {
          if (!query || query.length < 2) return
          
          try {
            const airports = await flightService.searchAirports(query)
            set({ allAirports: airports })
          } catch (error) {
            console.error('Error searching airports:', error)
          }
        },
        
        // Filter actions
        updateFilters: (newFilters) => {
          const updatedFilters = { ...get().filters, ...newFilters }
          const { flights } = get()
          const filteredFlights = applyAdvancedFilters(flights, updatedFilters)
          
          set({
            filters: updatedFilters,
            filteredFlights,
            currentPage: 1
          })
        },
        
        resetFilters: () => {
          const { flights } = get()
          const filteredFlights = applyAdvancedFilters(flights, defaultFilters)
          
          set({
            filters: defaultFilters,
            filteredFlights,
            currentPage: 1
          })
        },
        
        toggleFilters: () => set(state => ({ isFiltersOpen: !state.isFiltersOpen })),
        
        applyFilters: () => {
          const { flights, filters } = get()
          const filteredFlights = applyAdvancedFilters(flights, filters)
          set({ filteredFlights, currentPage: 1 })
        },
        
        // Comparison actions
        addToComparison: (flight) => {
          const { comparison } = get()
          if (comparison.flights.length >= 3) return // Max 3 flights
          
          const exists = comparison.flights.some(f => f.id === flight.id)
          if (!exists) {
            set({
              comparison: {
                ...comparison,
                flights: [...comparison.flights, flight]
              }
            })
          }
        },
        
        removeFromComparison: (flightId) => {
          const { comparison } = get()
          set({
            comparison: {
              ...comparison,
              flights: comparison.flights.filter(f => f.id !== flightId)
            }
          })
        },
        
        clearComparison: () => set({
          comparison: { flights: [], isComparing: false }
        }),
        
        toggleComparison: () => set(state => ({
          comparison: { ...state.comparison, isComparing: !state.comparison.isComparing }
        })),
        
        // History actions
        saveSearchToHistory: () => {
          const { searchParams, totalResults, searchHistory } = get()
          if (!searchParams) return
          
          const newHistoryItem: SearchHistory = {
            id: `search_${Date.now()}`,
            searchParams,
            timestamp: new Date(),
            resultsCount: totalResults
          }
          
          // Keep only last 10 searches
          const updatedHistory = [newHistoryItem, ...searchHistory].slice(0, 10)
          set({ searchHistory: updatedHistory })
        },
        
        loadSearchFromHistory: (historyItem) => {
          get().searchFlights(historyItem.searchParams)
        },
        
        clearSearchHistory: () => set({ searchHistory: [] }),
        
        // Pagination & Sorting
        setCurrentPage: (page) => set({ currentPage: page }),
        
        sortFlights: (sortBy, sortOrder) => {
          const updatedFilters = { ...get().filters, sortBy, sortOrder }
          get().updateFilters(updatedFilters)
        }
      }),
      {
        name: 'flight-app-storage',
        partialize: (state) => ({
          searchHistory: state.searchHistory,
          filters: state.filters
        })
      }
    ),
    { name: 'flight-store' }
  )
)