import { flightService } from "@/services/flightService";
import type { Airport } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseSearchAirportsReturn {
  airports: Airport[];
  loading: boolean;
  error: string | null;
  fetchAirports: (query: string) => Promise<void>;
  clearAirports: () => void;
}

const useGetSearchAirports = (): UseSearchAirportsReturn => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAirports = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setAirports([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const airportsData = await flightService.searchAirports(query);
      setAirports(airportsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error fetching airport data";
      setError(errorMessage);
      setAirports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAirports = useCallback(() => {
    setAirports([]);
    setError(null);
  }, []);

  // Populate first time the select with popular destinations
  useEffect(() => {
    fetchAirports("new york");
  }, [fetchAirports]);

  return {
    airports,
    loading,
    error,
    fetchAirports,
    clearAirports,
  };
};

export default useGetSearchAirports;
