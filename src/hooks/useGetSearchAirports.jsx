import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const useGetSearchAirport = () => {
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAirports = useCallback(async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("v1/flights/searchAirport", {
        params: { query, locale: "en-US" },
      });

      setAirports(response.data.data || []);
    } catch (err) {
      setError(err.message || "Error fetching airport data.");
    } finally {
      setLoading(false);
    }
  }, []);

  //populate first time the select
  useEffect(() => {
    fetchAirports("new");
  }, [fetchAirports]);

  return { airports, loading, error, fetchAirports };
};

export default useGetSearchAirport;
