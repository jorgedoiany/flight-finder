import { vi } from 'vitest'

// Mock flight service for testing
export const mockFlightService = {
  searchFlights: vi.fn().mockResolvedValue([
    {
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
    {
      id: '2',
      airline: 'Delta Airlines',
      flightNumber: 'DL456',
      origin: 'NYC',
      destination: 'LAX',
      departureTime: '14:00',
      arrivalTime: '17:30',
      duration: '5h 30m',
      price: 349,
      stops: 0,
      aircraft: 'Airbus A320',
    },
  ]),

  searchAirports: vi.fn().mockResolvedValue([
    { iata: 'NYC', name: 'New York City', city: 'New York', country: 'USA' },
    { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
    { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
  ]),
}

// Mock API responses
export const mockApiResponses = {
  searchFlightsSuccess: {
    data: {
      flights: mockFlightService.searchFlights(),
    },
  },
  searchAirportsSuccess: {
    data: {
      airports: mockFlightService.searchAirports(),
    },
  },
  apiError: new Error('API Error'),
}