import type { AdvancedFiltersState } from "@/store/flightStore";
import { useFlightStore } from "@/store/flightStore";
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Flight as FlightIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React from "react";

interface AdvancedFiltersComponentProps {
  open: boolean;
  onClose: () => void;
}

const timeOptions = [
  { value: "all", label: "Any time" },
  { value: "morning", label: "Morning (6am-12pm)" },
  { value: "afternoon", label: "Afternoon (12pm-6pm)" },
  { value: "evening", label: "Evening (6pm-10pm)" },
  { value: "night", label: "Night (10pm-6am)" },
];

const classOptions = [
  { value: "all", label: "All classes" },
  { value: "economy", label: "Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

const AdvancedFiltersComponent: React.FC<AdvancedFiltersComponentProps> = ({
  open,
  onClose,
}) => {
  const { filters, flights, updateFilters, resetFilters, applyFilters } =
    useFlightStore();

  // Get unique airlines from current flights
  const availableAirlines = React.useMemo(() => {
    const airlines = new Set(flights.map((flight) => flight.airline));
    return Array.from(airlines).sort();
  }, [flights]);

  const handleFilterChange = (key: keyof AdvancedFiltersState, value: any) => {
    updateFilters({ [key]: value });
  };

  const handlePriceRangeChange = (_: Event, newValue: number | number[]) => {
    updateFilters({ priceRange: newValue as [number, number] });
  };

  const handleDurationRangeChange = (_: Event, newValue: number | number[]) => {
    updateFilters({ durationRange: newValue as [number, number] });
  };

  const handleAirlineToggle = (airline: string) => {
    const currentAirlines = filters.selectedAirlines;
    const newAirlines = currentAirlines.includes(airline)
      ? currentAirlines.filter((a) => a !== airline)
      : [...currentAirlines, airline];

    updateFilters({ selectedAirlines: newAirlines });
  };

  const handleReset = () => {
    resetFilters();
  };

  const handleApply = () => {
    applyFilters();
    onClose();
  };

  // Price range display
  const formatPrice = (value: number) => `$${value}`;
  const formatDuration = (value: number) =>
    `${Math.floor(value / 60)}h ${value % 60}m`;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: 400 },
          maxWidth: "100vw",
        },
      }}
    >
      <Box
        sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <FilterIcon />
            Advanced Filters
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Filters Content - Scrollable */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {/* Sort Options */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ScheduleIcon fontSize="small" />
                Sort & Order
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    label="Sort by"
                  >
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="duration">Duration</MenuItem>
                    <MenuItem value="departure">Departure Time</MenuItem>
                    <MenuItem value="arrival">Arrival Time</MenuItem>
                    <MenuItem value="airline">Airline</MenuItem>
                  </Select>
                </FormControl>

                <ToggleButtonGroup
                  value={filters.sortOrder}
                  exclusive
                  onChange={(_, value) =>
                    value && handleFilterChange("sortOrder", value)
                  }
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="asc">Ascending</ToggleButton>
                  <ToggleButton value="desc">Descending</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Price Range */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <MoneyIcon fontSize="small" />
                Price Range
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 1 }}>
                <Typography gutterBottom>
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </Typography>
                <Slider
                  value={filters.priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatPrice}
                  min={0}
                  max={2000}
                  step={50}
                  marks={[
                    { value: 0, label: "$0" },
                    { value: 500, label: "$500" },
                    { value: 1000, label: "$1000" },
                    { value: 1500, label: "$1500" },
                    { value: 2000, label: "$2000" },
                  ]}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Duration */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TimeIcon fontSize="small" />
                Flight Duration
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 1 }}>
                <Typography gutterBottom>
                  {formatDuration(filters.durationRange[0])} -{" "}
                  {formatDuration(filters.durationRange[1])}
                </Typography>
                <Slider
                  value={filters.durationRange}
                  onChange={handleDurationRangeChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatDuration}
                  min={0}
                  max={1440} // 24 horas
                  step={30}
                  marks={[
                    { value: 0, label: "0h" },
                    { value: 360, label: "6h" },
                    { value: 720, label: "12h" },
                    { value: 1080, label: "18h" },
                    { value: 1440, label: "24h" },
                  ]}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Airlines */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FlightIcon fontSize="small" />
                Airlines ({filters.selectedAirlines.length} selected)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {availableAirlines.map((airline) => (
                  <Chip
                    key={airline}
                    label={airline}
                    onClick={() => handleAirlineToggle(airline)}
                    color={
                      filters.selectedAirlines.includes(airline)
                        ? "primary"
                        : "default"
                    }
                    variant={
                      filters.selectedAirlines.includes(airline)
                        ? "filled"
                        : "outlined"
                    }
                    size="small"
                  />
                ))}
                {availableAirlines.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No airlines available in current results
                  </Typography>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Time Preferences */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ScheduleIcon fontSize="small" />
                Time Preferences
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Departure Time</InputLabel>
                  <Select
                    value={filters.timePreferences.departureTime}
                    onChange={(e) =>
                      handleFilterChange("timePreferences", {
                        ...filters.timePreferences,
                        departureTime: e.target.value,
                      })
                    }
                    label="Departure Time"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Arrival Time</InputLabel>
                  <Select
                    value={filters.timePreferences.arrivalTime}
                    onChange={(e) =>
                      handleFilterChange("timePreferences", {
                        ...filters.timePreferences,
                        arrivalTime: e.target.value,
                      })
                    }
                    label="Arrival Time"
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Stops & Class */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Other Options</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Max Layovers"
                  type="number"
                  value={filters.maxLayovers}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxLayovers",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  inputProps={{ min: 0, max: 5 }}
                  size="small"
                  fullWidth
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Preferred Class</InputLabel>
                  <Select
                    value={filters.preferredClass}
                    onChange={(e) =>
                      handleFilterChange("preferredClass", e.target.value)
                    }
                    label="Preferred Class"
                  >
                    {classOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={1}>
            <Button onClick={handleReset} variant="outlined" fullWidth>
              Reset All
            </Button>
            <Button onClick={handleApply} variant="contained" fullWidth>
              Apply Filters
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AdvancedFiltersComponent;
