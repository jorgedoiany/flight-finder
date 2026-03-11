import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { lightTheme } from '@/theme'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Helper function to create mock flight data
export const mockFlightData = {
  searchQuery: {
    origin: 'NYC',
    destination: 'LAX',
    departureDate: '2024-03-15',
    returnDate: '2024-03-20',
    passengers: 1,
    classType: 'Economy' as const,
  },
  flight: {
    id: '1',
    airline: 'American Airlines',
    flightNumber: 'AA123',
    origin: 'NYC',
    destination: 'LAX',
    departureTime: '08:00',
    arrivalTime: '11:30',
    duration: '5h 30m',
    price: 299,
    stops: 0,
    aircraft: 'Boeing 737',
  },
}

// Helper to mock Zustand store
export const createMockStore = (initialState = {}) => {
  return {
    searchQuery: mockFlightData.searchQuery,
    searchResults: [mockFlightData.flight],
    isLoading: false,
    error: null,
    comparison: [],
    advancedFilters: {
      maxPrice: 1000,
      preferredAirlines: [],
      departureTimeRange: [0, 24],
      stops: 'any',
    },
    themeMode: 'light' as const,
    ...initialState,
  }
}