import type { Airport, LegacySearchParams } from "@/types";
import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlightStore } from '@/store/flightStore';
import styles from "./SearchBox.module.css";

const SearchBox: React.FC = () => {
  const [localSearchData, setLocalSearchData] = useState<LegacySearchParams>({
    flightType: "round-trip",
    passengers: 1,
    cabinClass: "economy",
    origin: { entityId: "", skyId: "" },
    destination: { entityId: "", skyId: "" },
    departureDate: "",
    returnDate: "",
  });

  const { allAirports, searchAirports, searchFlights } = useFlightStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setLocalSearchData((curr) => ({ ...curr, [name!]: value }));
  };

  const handleAutocompleteChange = (name: string, value: Airport | null) => {
    setLocalSearchData((curr) => ({
      ...curr,
      [name]: value
        ? {
            entityId: value.entityId || "",
            skyId: value.skyId?.toUpperCase() || "",
          }
        : { entityId: "", skyId: "" },
    }));
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchParams: LegacySearchParams = {
      ...localSearchData,
      returnDate:
        localSearchData.flightType === "round-trip" && localSearchData.returnDate
          ? localSearchData.returnDate
          : "",
    };
    
    // Start the search using Zustand store
    await searchFlights(searchParams);
    navigate("/results");
  };

  return (
    <form className={styles.searchBox} onSubmit={handleSearch}>
      <Box className={styles.searchRow} display="flex" gap={2}>
        <Select
          name="flightType"
          value={localSearchData.flightType}
          onChange={handleSelectChange}
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
          onChange={handleSelectChange}
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
          options={allAirports}
          getOptionLabel={(option: Airport) =>
            `${option.code} - ${option.name}` || ""
          }
          onInputChange={(_, value: string) =>
            searchAirports(value.toUpperCase())
          }
          onChange={(_, value: Airport | null) =>
            handleAutocompleteChange("origin", value)
          }
          renderInput={(params) => (
            <TextField {...params} label="From" variant="outlined" fullWidth />
          )}
        />
        <Autocomplete
          options={allAirports}
          getOptionLabel={(option: Airport) =>
            `${option.code} - ${option.name}` || ""
          }
          onInputChange={(_, value: string) =>
            searchAirports(value.toUpperCase())
          }
          onChange={(_, value: Airport | null) =>
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
            value={localSearchData.returnDate || ""}
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
