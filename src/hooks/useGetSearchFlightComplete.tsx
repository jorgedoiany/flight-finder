import { flightService } from "@/services/flightService";
import type {
  Flight,
  FlightSearchResponse,
  LegacySearchParams,
  SearchParams,
} from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseFlightSearchReturn {
  flights: Flight[];
  loading: boolean;
  error: string | null;
  searchFlights: (params: LegacySearchParams) => Promise<void>;
  clearFlights: () => void;
  totalResults: number;
}

const useGetSearchFlightComplete = (
  searchParams?: LegacySearchParams | null,
): UseFlightSearchReturn => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const transformLegacyParams = (
    legacyParams: LegacySearchParams,
  ): SearchParams => {
    console.log('🔄 Transforming legacy params:', legacyParams)
    
    const result = {
      from: legacyParams.origin.skyId || legacyParams.origin.entityId || "",
      to:
        legacyParams.destination.skyId ||
        legacyParams.destination.entityId ||
        "",
      departDate: legacyParams.departureDate,
      returnDate: legacyParams.returnDate || undefined,
      passengers: {
        adults: legacyParams.passengers || 1,
        children: 0,
        infants: 0,
      },
      class:
        (legacyParams.cabinClass as "economy" | "business" | "first") ||
        "economy",
    };
    
    console.log('✅ Transformed to SearchParams:', result)
    return result
  };

  const searchFlights = useCallback(async (params: LegacySearchParams) => {
    const hasOrigin = params?.origin?.skyId || params?.origin?.entityId;
    const hasDestination =
      params?.destination?.skyId || params?.destination?.entityId;

    if (!hasOrigin || !hasDestination || !params.departureDate) {
      setError(
        "Please select both origin and destination airports and departure date",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setFlights([]);

    try {
      const transformedParams = transformLegacyParams(params);
      const response: FlightSearchResponse =
        await flightService.searchFlights(transformedParams);

      if (response.flights && response.flights.length > 0) {
        setFlights(response.flights);
        setTotalResults(response.total);
      } else {
        setFlights([]);
        setTotalResults(0);
        setError("No flights found for the selected criteria");
      }
    } catch (err) {
      console.error("Error in flight search:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Flights could not be loaded. Please try again.";
      setError(errorMessage);
      setFlights([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearFlights = useCallback(() => {
    setFlights([]);
    setError(null);
    setTotalResults(0);
  }, []);

  // Auto-search when searchParams change
  useEffect(() => {
    if (searchParams) {
      searchFlights(searchParams);
    }
  }, [searchParams, searchFlights]);

  return {
    flights,
    loading,
    error,
    searchFlights,
    clearFlights,
    totalResults,
  };
};

export default useGetSearchFlightComplete;
