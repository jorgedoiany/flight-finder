import type {
  Airport,
  Flight,
  FlightSearchResponse,
  SearchParams,
} from "@/types";

// Mock airport data
export const mockAirports: Airport[] = [
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    skyId: "JFK",
    entityId: "jfk-entity-id",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
    skyId: "LAX",
    entityId: "lax-entity-id",
  },
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    skyId: "LHR",
    entityId: "lhr-entity-id",
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    skyId: "CDG",
    entityId: "cdg-entity-id",
  },
  {
    code: "NRT",
    name: "Narita International Airport",
    city: "Tokyo",
    country: "Japan",
    skyId: "NRT",
    entityId: "nrt-entity-id",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    skyId: "DXB",
    entityId: "dxb-entity-id",
  },
  {
    code: "SYD",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    country: "Australia",
    skyId: "SYD",
    entityId: "syd-entity-id",
  },
  {
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    country: "United States",
    skyId: "MIA",
    entityId: "mia-entity-id",
  },
];

// Mock flight data
export const mockFlights: Flight[] = [
  {
    id: "flight-1",
    airline: "American Airlines",
    flightNumber: "AA1234",
    departure: {
      airport: mockAirports[0], // JFK
      time: "08:00",
      date: "2026-03-15",
    },
    arrival: {
      airport: mockAirports[1], // LAX
      time: "11:30",
      date: "2026-03-15",
    },
    price: 299,
    currency: "USD",
    duration: "5h 30m",
    stops: 0,
    aircraft: "Boeing 737",
    class: "economy",
  },
  {
    id: "flight-2",
    airline: "Delta Air Lines",
    flightNumber: "DL5678",
    departure: {
      airport: mockAirports[0], // JFK
      time: "14:15",
      date: "2026-03-15",
    },
    arrival: {
      airport: mockAirports[1], // LAX
      time: "17:45",
      date: "2026-03-15",
    },
    price: 345,
    currency: "USD",
    duration: "5h 30m",
    stops: 0,
    aircraft: "Airbus A320",
    class: "economy",
  },
  {
    id: "flight-3",
    airline: "United Airlines",
    flightNumber: "UA9012",
    departure: {
      airport: mockAirports[0], // JFK
      time: "18:30",
      date: "2026-03-15",
    },
    arrival: {
      airport: mockAirports[1], // LAX
      time: "22:00",
      date: "2026-03-15",
    },
    price: 285,
    currency: "USD",
    duration: "5h 30m",
    stops: 1,
    aircraft: "Boeing 777",
    class: "economy",
  },
  {
    id: "flight-4",
    airline: "JetBlue Airways",
    flightNumber: "B61234",
    departure: {
      airport: mockAirports[0], // JFK
      time: "06:00",
      date: "2026-03-15",
    },
    arrival: {
      airport: mockAirports[1], // LAX
      time: "09:30",
      date: "2026-03-15",
    },
    price: 399,
    currency: "USD",
    duration: "5h 30m",
    stops: 0,
    aircraft: "Airbus A321",
    class: "business",
  },
  {
    id: "flight-5",
    airline: "Southwest Airlines",
    flightNumber: "WN5555",
    departure: {
      airport: mockAirports[0], // JFK
      time: "12:00",
      date: "2026-03-15",
    },
    arrival: {
      airport: mockAirports[1], // LAX
      time: "15:30",
      date: "2026-03-15",
    },
    price: 259,
    currency: "USD",
    duration: "5h 30m",
    stops: 1,
    aircraft: "Boeing 737",
    class: "economy",
  },
];

export class MockFlightService {
  static async searchAirports(query: string): Promise<Airport[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase();
    return mockAirports.filter(
      (airport) =>
        airport.code.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm),
    );
  }

  static async searchFlights(
    params: SearchParams,
  ): Promise<FlightSearchResponse> {
    console.log('🎭 MockFlightService.searchFlights called with:', params)
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Filter flights based on mock logic
    let filteredFlights = mockFlights;

    // Simple filtering - in real app this would be more sophisticated
    if (params.class !== "economy") {
      filteredFlights = filteredFlights.filter(
        (flight) => flight.class === params.class,
      );
    }

    // Generate some variety in results
    const randomFlights = [...filteredFlights]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, filteredFlights.length))
      .map((flight) => ({
        ...flight,
        id: `${flight.id}-${Date.now()}`,
        price:
          (typeof flight.price === "number"
            ? flight.price
            : flight.price.raw || 299) +
          Math.floor(Math.random() * 100) -
          50, // Random price variation
        departure: {
          ...flight.departure,
          date: params.departDate,
        },
        arrival: {
          ...flight.arrival,
          date: params.departDate,
        },
      }));

    const result = {
      flights: randomFlights,
      total: randomFlights.length,
      page: 1,
      totalPages: 1,
    };
    
    console.log('📊 MockFlightService returning:', result)
    return result
  }

  static async getFlightDetails(flightId: string): Promise<Flight> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const flight = mockFlights.find((f) => flightId.includes(f.id));
    if (!flight) {
      throw new Error("Flight not found");
    }

    return flight;
  }
}
