import { useFlightStore } from "@/store/flightStore";
import type { Flight } from "@/types";
import {
  AirlineSeatReclineNormal as ClassIcon,
  Close as CloseIcon,
  Flight as FlightIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  ConnectingAirports as StopsIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

interface FlightComparisonProps {
  open: boolean;
  onClose: () => void;
}

const ComparisonRow: React.FC<{
  label: string;
  icon?: React.ReactNode;
  flights: Flight[];
}> = ({ label, icon, flights }) => (
  <TableRow sx={{ height: "60px" }}>
    <TableCell
      sx={{
        fontWeight: "medium",
        verticalAlign: "middle",
        padding: "16px",
        minHeight: "60px",
        height: "60px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        {label}
      </Box>
    </TableCell>
    {flights.map((flight, index) => (
      <TableCell
        key={index}
        align="center"
        sx={{
          verticalAlign: "middle",
          padding: "16px",
          minHeight: "60px",
          height: "60px",
        }}
      >
        <ComparisonValue
          flight={flight}
          field={label.toLowerCase().replace(" ", "")}
        />
      </TableCell>
    ))}
  </TableRow>
);

const ComparisonValue: React.FC<{
  flight: Flight;
  field: string;
}> = ({ flight, field }) => {
  switch (field) {
    case "price":
      const price =
        typeof flight.price === "object" ? flight.price.raw || 0 : flight.price;
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" color="primary" fontWeight="bold">
            ${price}
          </Typography>
        </Box>
      );
    case "duration":
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Chip
            label={flight.duration}
            size="small"
            variant="outlined"
            color="info"
          />
        </Box>
      );
    case "stops":
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Chip
            label={
              flight.stops === 0
                ? "Direct"
                : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`
            }
            size="small"
            color={
              flight.stops === 0
                ? "success"
                : flight.stops === 1
                  ? "warning"
                  : "default"
            }
          />
        </Box>
      );
    case "departuretime":
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{ lineHeight: 1.2 }}
          >
            {flight.departure.time}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1 }}
          >
            {flight.departure.date}
          </Typography>
        </Box>
      );
    case "arrivaltime":
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{ lineHeight: 1.2 }}
          >
            {flight.arrival.time}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1 }}
          >
            {flight.arrival.date}
          </Typography>
        </Box>
      );
    case "airline":
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{ lineHeight: 1.2 }}
          >
            {flight.airline}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1 }}
          >
            {flight.flightNumber}
          </Typography>
        </Box>
      );
    case "class":
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Chip
            label={flight.class.charAt(0).toUpperCase() + flight.class.slice(1)}
            size="small"
            color={
              flight.class === "first"
                ? "primary"
                : flight.class === "business"
                  ? "secondary"
                  : "default"
            }
          />
        </Box>
      );
    case "aircraft":
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {flight.aircraft}
          </Typography>
        </Box>
      );
    default:
      return (
        <Box
          textAlign="center"
          sx={{
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2">-</Typography>
        </Box>
      );
  }
};

const FlightComparisonCard: React.FC<{
  flight: Flight;
  onRemove: () => void;
  isBest?: { price: boolean; duration: boolean; stops: boolean };
}> = ({ flight, onRemove, isBest }) => {
  const price =
    typeof flight.price === "object" ? flight.price.raw || 0 : flight.price;

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        border: isBest?.price ? 2 : 1,
        borderColor: isBest?.price ? "success.main" : "divider",
      }}
    >
      <IconButton
        onClick={onRemove}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {isBest?.price && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(45deg, #4caf50 30%, #81c784 90%)",
            color: "white",
            py: 0.5,
            textAlign: "center",
            zIndex: 2,
          }}
        >
          <Typography variant="caption" fontWeight="bold">
            BEST PRICE
          </Typography>
        </Box>
      )}

      <CardContent sx={{ pt: isBest?.price ? 4 : 2 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {flight.airline}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flight.flightNumber} • {flight.aircraft}
            </Typography>
          </Box>

          {/* Price */}
          <Box textAlign="center">
            <Typography
              variant="h4"
              color="primary"
              fontWeight="bold"
              sx={{
                background: isBest?.price
                  ? "linear-gradient(45deg, #4caf50 30%, #81c784 90%)"
                  : undefined,
                WebkitBackgroundClip: isBest?.price ? "text" : undefined,
                WebkitTextFillColor: isBest?.price ? "transparent" : undefined,
              }}
            >
              ${price}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flight.currency}
            </Typography>
          </Box>

          <Divider />

          {/* Flight Details */}
          <Stack spacing={1}>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <ScheduleIcon fontSize="small" />
                DEPARTURE
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {flight.departure.time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {flight.departure.airport.code} -{" "}
                {flight.departure.airport.name}
              </Typography>
            </Box>

            <Box textAlign="center">
              <Chip
                label={flight.duration}
                size="small"
                color={isBest?.duration ? "success" : "default"}
                variant={isBest?.duration ? "filled" : "outlined"}
              />
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                {flight.stops === 0
                  ? "Direct"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <ScheduleIcon fontSize="small" />
                ARRIVAL
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {flight.arrival.time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {flight.arrival.airport.code} - {flight.arrival.airport.name}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          {/* Additional Info */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Chip
              label={
                flight.class.charAt(0).toUpperCase() + flight.class.slice(1)
              }
              size="small"
              color={
                flight.class === "first"
                  ? "primary"
                  : flight.class === "business"
                    ? "secondary"
                    : "default"
              }
            />
            <Chip
              label={
                flight.stops === 0
                  ? "Direct"
                  : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`
              }
              size="small"
              color={
                flight.stops === 0
                  ? "success"
                  : flight.stops === 1
                    ? "warning"
                    : "default"
              }
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const FlightComparison: React.FC<FlightComparisonProps> = ({
  open,
  onClose,
}) => {
  const { comparison, removeFromComparison, clearComparison } =
    useFlightStore();
  const flights = comparison.flights;

  // Calculate best options
  const bestOptions = React.useMemo(() => {
    if (flights.length === 0) return {};

    const prices = flights.map((f) =>
      typeof f.price === "object" ? f.price.raw || 0 : f.price,
    );
    const durations = flights.map((f) => {
      const match = f.duration.match(/(\d+)h\s*(\d+)?m?/);
      if (!match) return 0;
      return parseInt(match[1]) * 60 + parseInt(match[2] || "0");
    });
    const stops = flights.map((f) => f.stops);

    const minPrice = Math.min(...prices);
    const minDuration = Math.min(...durations);
    const minStops = Math.min(...stops);

    return {
      price: flights.map((_, i) => prices[i] === minPrice),
      duration: flights.map((_, i) => durations[i] === minDuration),
      stops: flights.map((_, i) => stops[i] === minStops),
    };
  }, [flights]);

  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");

  if (flights.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Flight Comparison</DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={4}>
            <FlightIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No flights selected for comparison
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add flights to your comparison by clicking the compare button on
              flight results
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          height: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography>Compare Flights ({flights.length}/3)</Typography>
        <Box>
          <Button
            size="small"
            variant={viewMode === "cards" ? "contained" : "outlined"}
            onClick={() => setViewMode("cards")}
            sx={{ mr: 1 }}
          >
            Cards
          </Button>
          <Button
            size="small"
            variant={viewMode === "table" ? "contained" : "outlined"}
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {viewMode === "cards" ? (
          <Grid container spacing={2}>
            {flights.map((flight, index) => (
              <Grid item xs={12} md={4} key={flight.id}>
                <FlightComparisonCard
                  flight={flight}
                  onRemove={() => removeFromComparison(flight.id)}
                  isBest={{
                    price: bestOptions.price?.[index] || false,
                    duration: bestOptions.duration?.[index] || false,
                    stops: bestOptions.stops?.[index] || false,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
            <Table stickyHeader sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow sx={{ height: "60px" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      verticalAlign: "middle",
                      padding: "16px",
                      minHeight: "60px",
                      height: "60px",
                      width: "160px",
                    }}
                  >
                    Feature
                  </TableCell>
                  {flights.map((flight, index) => (
                    <TableCell
                      key={index}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        verticalAlign: "middle",
                        padding: "16px",
                        minHeight: "60px",
                        height: "60px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          Flight {index + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeFromComparison(flight.id)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <ComparisonRow
                  label="Price"
                  icon={<MoneyIcon fontSize="small" />}
                  flights={flights}
                />
                <ComparisonRow
                  label="Duration"
                  icon={<ScheduleIcon fontSize="small" />}
                  flights={flights}
                />
                <ComparisonRow
                  label="Stops"
                  icon={<StopsIcon fontSize="small" />}
                  flights={flights}
                />
                <ComparisonRow
                  label="Departure Time"
                  icon={<ScheduleIcon fontSize="small" />}
                  flights={flights}
                />
                <ComparisonRow
                  label="Arrival Time"
                  icon={<ScheduleIcon fontSize="small" />}
                  flights={flights}
                />
                <ComparisonRow
                  label="Airline"
                  icon={<FlightIcon fontSize="small" />}
                  flights={flights}
                />
                <ComparisonRow
                  label="Class"
                  icon={<ClassIcon fontSize="small" />}
                  flights={flights}
                />
                <ComparisonRow label="Aircraft" flights={flights} />
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={clearComparison} color="error">
          Clear All
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlightComparison;
