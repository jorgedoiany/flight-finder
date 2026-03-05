import type {
  Airport,
  FilterOptions,
  Flight,
  FlightSearchResponse,
  SearchParams,
} from "@/types";
import { apiClient } from "./api";
import { MockFlightService } from "./mockService";

class FlightService {
  private static instance: FlightService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

  private constructor() {
    console.log('🔧 FlightService - Environment Variables:', {
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
      USE_MOCK: this.USE_MOCK
    })
    if (this.USE_MOCK) {
      console.log('🎭 Using Mock Flight Service for development')
    } else {
      console.log('🌐 Using Real API for production')
    }
  }

  public static getInstance(): FlightService {
    if (!FlightService.instance) {
      FlightService.instance = new FlightService();
    }
    return FlightService.instance;
  }

  private getCacheKey(params: any): string {
    return JSON.stringify(params);
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  public async searchAirports(query: string): Promise<Airport[]> {
    if (!query || query.length < 2) return [];

    // Use mock service in development
    if (this.USE_MOCK) {
      return MockFlightService.searchAirports(query);
    }

    const cacheKey = this.getCacheKey({ type: "airports", query });
    const cached = this.getCache<Airport[]>(cacheKey);
    if (cached) return cached;

    try {
      const airports = await apiClient.get<Airport[]>(
        "/v1/flights/searchAirport",
        {
          query,
          locale: "en-US",
        },
      );

      this.setCache(cacheKey, airports);
      return airports;
    } catch (error) {
      console.error("Error searching airports:", error);

      // Fallback to mock data if API fails
      console.log("🔄 Falling back to mock data due to API error");
      return MockFlightService.searchAirports(query);
    }
  }

  public async searchFlights(
    params: SearchParams,
  ): Promise<FlightSearchResponse> {
    console.log('🔍 FlightService.searchFlights called with:', params)
    
    // Use mock service in development
    if (this.USE_MOCK) {
      console.log('🎭 Using MockFlightService.searchFlights')
      const result = await MockFlightService.searchFlights(params)
      console.log('📊 Mock service returned:', result)
      return result
    }

    const cacheKey = this.getCacheKey({ type: "flights", params });
    const cached = this.getCache<FlightSearchResponse>(cacheKey);
    if (cached) return cached;

    try {
      // Transform SearchParams to API format
      const apiParams = this.transformSearchParams(params);

      const flightData = await apiClient.get<FlightSearchResponse>(
        "/v2/flights/searchFlights",
        apiParams,
      );

      // Transform API response to our Flight interface
      const transformedData = this.transformFlightResponse(flightData);

      this.setCache(cacheKey, transformedData);
      return transformedData;
    } catch (error) {
      console.error("Error searching flights:", error);

      // Fallback to mock data if API fails
      console.log("🔄 Falling back to mock data due to API error");
      return MockFlightService.searchFlights(params);
    }
  }

  public async getFlightDetails(flightId: string): Promise<Flight> {
    // Use mock service in development
    if (this.USE_MOCK) {
      return MockFlightService.getFlightDetails(flightId);
    }

    const cacheKey = this.getCacheKey({ type: "flightDetails", flightId });
    const cached = this.getCache<Flight>(cacheKey);
    if (cached) return cached;

    try {
      const flight = await apiClient.get<Flight>(`/v1/flights/${flightId}`);
      this.setCache(cacheKey, flight);
      return flight;
    } catch (error) {
      console.error("Error getting flight details:", error);

      // Fallback to mock data if API fails
      console.log("🔄 Falling back to mock data due to API error");
      return MockFlightService.getFlightDetails(flightId);
    }
  }

  public applyFilters(flights: Flight[], filters: FilterOptions): Flight[] {
    return flights.filter((flight) => {
      const flightPrice =
        typeof flight.price === "object" ? flight.price.raw || 0 : flight.price;

      // Airline filter
      if (
        filters.airlines.length > 0 &&
        !filters.airlines.includes(flight.airline)
      ) {
        return false;
      }

      // Price range filter
      if (
        flightPrice < filters.priceRange[0] ||
        flightPrice > filters.priceRange[1]
      ) {
        return false;
      }

      // Stops filter
      if (flight.stops > filters.maxStops) {
        return false;
      }

      // Departure time filter
      if (filters.departureTime !== "all") {
        const hour = new Date(`2000-01-01T${flight.departure.time}`).getHours();
        const timeSlot = this.getTimeSlot(hour);
        if (timeSlot !== filters.departureTime) {
          return false;
        }
      }

      // Duration filter
      if (filters.duration) {
        const durationMinutes = this.parseDurationToMinutes(flight.duration);
        if (
          durationMinutes < filters.duration[0] ||
          durationMinutes > filters.duration[1]
        ) {
          return false;
        }
      }

      return true;
    });
  }

  public sortFlights(
    flights: Flight[],
    sortBy: "price" | "duration" | "departure",
  ): Flight[] {
    return [...flights].sort((a, b) => {
      switch (sortBy) {
        case "price":
          const priceA =
            typeof a.price === "object" ? a.price.raw || 0 : a.price;
          const priceB =
            typeof b.price === "object" ? b.price.raw || 0 : b.price;
          return priceA - priceB;
        case "duration":
          return (
            this.parseDurationToMinutes(a.duration) -
            this.parseDurationToMinutes(b.duration)
          );
        case "departure":
          return (
            new Date(`${a.departure.date}T${a.departure.time}`).getTime() -
            new Date(`${b.departure.date}T${b.departure.time}`).getTime()
          );
        default:
          return 0;
      }
    });
  }

  private transformSearchParams(params: SearchParams): Record<string, any> {
    return {
      originSkyId: params.from,
      destinationSkyId: params.to,
      originEntityId: params.from,
      destinationEntityId: params.to,
      date: params.departDate,
      returnDate: params.returnDate,
      adults: params.passengers.adults,
      children: params.passengers.children,
      infants: params.passengers.infants,
      cabinClass: params.class.toLowerCase(),
      currency: "USD",
      market: "en-US",
      countryCode: "US",
    };
  }

  private transformFlightResponse(apiData: any): FlightSearchResponse {
    // This would need to be customized based on the actual API response structure
    return {
      flights: apiData.data?.itineraries?.map(this.transformFlight) || [],
      total: apiData.data?.total || 0,
      page: 1,
      totalPages: 1,
    };
  }

  private transformFlight(apiFlightData: any): Flight {
    // Transform API flight data to our Flight interface
    // This would need to be customized based on actual API response
    const leg = apiFlightData.legs?.[0];

    return {
      id: apiFlightData.id || `flight_${Date.now()}`,
      airline: leg?.carriers?.marketing?.[0]?.name || "Unknown",
      flightNumber: leg?.segments?.[0]?.flightNumber || "TBD",
      departure: {
        airport: {
          code: leg?.origin?.id || "",
          name: leg?.origin?.name || "",
          city: leg?.origin?.city || "",
          country: leg?.origin?.country || "",
        },
        time: this.formatTime(leg?.departure),
        date: this.formatDate(leg?.departure),
      },
      arrival: {
        airport: {
          code: leg?.destination?.id || "",
          name: leg?.destination?.name || "",
          city: leg?.destination?.city || "",
          country: leg?.destination?.country || "",
        },
        time: this.formatTime(leg?.arrival),
        date: this.formatDate(leg?.arrival),
      },
      price: apiFlightData.price?.raw || 0,
      currency: "USD",
      duration: this.formatDuration(leg?.durationInMinutes || 0),
      stops: (leg?.segments?.length || 1) - 1,
      aircraft: leg?.segments?.[0]?.operatingCarrier?.name || "TBD",
      class: "economy",
    };
  }

  private getTimeSlot(hour: number): FilterOptions["departureTime"] {
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    if (hour >= 18 && hour < 22) return "evening";
    return "night";
  }

  private parseDurationToMinutes(duration: string): number {
    const match = duration.match(/(\d+)h\s*(\d+)?m?/);
    if (!match) return 0;
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
  }

  private formatTime(datetime: string): string {
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private formatDate(datetime: string): string {
    return new Date(datetime).toISOString().split("T")[0];
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const flightService = FlightService.getInstance();
export default flightService;
