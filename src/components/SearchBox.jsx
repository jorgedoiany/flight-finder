import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Autocomplete,
} from "@mui/material";
import useGetSearchAirport from "../hooks/useGetSearchAirports";
import { useSearchFlights } from "../context/FlightContext";
import styles from "./SearchBox.module.css";

const SearchBox = () => {
  const [localSearchData, setLocalSearchData] = useState({
    flightType: "round-trip",
    passengers: 1,
    cabinClass: "economy",
    origin: { entityId: null, skyId: null },
    destination: { entityId: null, skyId: null },
    departureDate: "",
    returnDate: "",
  });

  const { airports, fetchAirports } = useGetSearchAirport();
  const { setSearchParams } = useSearchFlights();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLocalSearchData((curr) => {
      const updatedData = { ...curr, [name]: value };

      if (updatedData.flightType === "round-trip") {
        if (name === "departureDate" && updatedData.returnDate) {
          if (new Date(value) > new Date(updatedData.returnDate)) {
            updatedData.returnDate = "";
          }
        } else if (name === "returnDate" && updatedData.departureDate) {
          if (new Date(value) < new Date(updatedData.departureDate)) {
            updatedData.returnDate = "";
          }
        }
      }

      return updatedData;
    });
  };

  const handleAutocompleteChange = (name, value) => {
    setLocalSearchData((curr) => ({
      ...curr,
      [name]: value
        ? { entityId: value.entityId, skyId: value.skyId.toUpperCase() }
        : { entityId: null, skyId: null },
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = {
      ...localSearchData,
      returnDate:
        localSearchData.flightType === "round-trip"
          ? localSearchData.returnDate
          : null,
    };
    setSearchParams(searchParams);
    navigate("/results");
  };

  return (
    <form className={styles.searchBox} onSubmit={handleSearch}>
      <Box className={styles.searchRow} display="flex" gap={2}>
        <Select
          name="flightType"
          value={localSearchData.flightType}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="round-trip">Round trip</MenuItem>
          <MenuItem value="one-way">One way</MenuItem>
          <MenuItem value="multi-city">Multi-city</MenuItem>
        </Select>
        <TextField
          name="passengers"
          type="number"
          label="Passengers"
          value={localSearchData.passengers}
          onChange={handleChange}
          InputProps={{ inputProps: { min: 1 } }}
          fullWidth
        />
        <Select
          name="cabinClass"
          value={localSearchData.cabinClass}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="economy">Economy</MenuItem>
          <MenuItem value="premium-economy">Premium economy</MenuItem>
          <MenuItem value="business">Business</MenuItem>
          <MenuItem value="first">First</MenuItem>
        </Select>
      </Box>

      <Box className={styles.searchRow} display="flex" gap={2}>
        <Autocomplete
          options={airports}
          getOptionLabel={(option) => option.skyId || ""}
          onInputChange={(_, value) => fetchAirports(value.toUpperCase())}
          onChange={(_, value) => handleAutocompleteChange("origin", value)}
          renderInput={(params) => (
            <TextField {...params} label="From" variant="outlined" fullWidth />
          )}
        />
        <Autocomplete
          options={airports}
          getOptionLabel={(option) => option.skyId || ""}
          onInputChange={(_, value) => fetchAirports(value.toUpperCase())}
          onChange={(_, value) =>
            handleAutocompleteChange("destination", value)
          }
          renderInput={(params) => (
            <TextField {...params} label="To" variant="outlined" fullWidth />
          )}
        />
      </Box>

      <Box className={styles.searchRow} display="flex" gap={2}>
        <TextField
          name="departureDate"
          type="date"
          label="Departure Date"
          value={localSearchData.departureDate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        {localSearchData.flightType === "round-trip" && (
          <TextField
            name="returnDate"
            type="date"
            label="Return Date"
            value={localSearchData.returnDate}
            onChange={handleChange}
            InputProps={{
              inputProps: {
                min: localSearchData.departureDate || undefined,
              },
            }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        )}
      </Box>

      <Box textAlign="center" mt={2}>
        <Button
          className={styles.searchButton}
          variant="contained"
          color="primary"
          type="submit"
        >
          Explore
        </Button>
      </Box>
    </form>
  );
};

export default SearchBox;
