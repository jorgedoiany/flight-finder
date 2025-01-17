import { useState, useEffect } from "react";
import api from "../services/api";

const useGetSearchFlightComplete = (searchParams) => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!searchParams?.origin || !searchParams?.destination) {
        setError("Missing search parameters.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get("v2/flights/searchFlightsWebComplete", {
          params: {
            originSkyId: searchParams.origin.skyId,
            destinationSkyId: searchParams.destination.skyId,
            originEntityId: searchParams.origin.entityId,
            destinationEntityId: searchParams.destination.entityId,
            date: searchParams.departureDate,
            returnDate: searchParams.returnDate || undefined,
            cabinClass: searchParams.cabinClass,
            adults: searchParams.passengers || "1",
            sortBy: "best",
            currency: "USD",
            market: "en-US",
            countryCode: "US",
          },
        });

        console.log("API Response:", response.data.data);

        if (response.data.status) {
          setFlights(response.data.data.itineraries);
        } else {
          setFlights([]);
        }
      } catch (err) {
        console.error(
          "Error retrieving data from the API:",
          err.response || err
        );
        setError("Flights could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchParams]); // Fetch only once when the component mounts

  return { flights, loading, error };
};

export default useGetSearchFlightComplete;
