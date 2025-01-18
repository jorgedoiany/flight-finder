import { useState } from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import useGetSearchFlightComplete from "../hooks/useGetSearchFlightComplete";
import { useSearchFlights } from "../context/FlightContext";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import styles from "./ResultsPage.module.css";

const ResultsPage = () => {
  const [showAll, setShowAll] = useState(false);
  const { searchParams } = useSearchFlights();

  const { flights, loading, error } = useGetSearchFlightComplete(searchParams);

  const displayedFlights = Array.isArray(flights)
    ? showAll
      ? flights
      : flights.slice(0, 7)
    : [];

  return (
    <div>
      <Header />
      <Banner />
      <div className={styles.resultsPage}>
        <Typography variant="h4" gutterBottom>
          Top Departing Flights
        </Typography>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="50vh"
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        ) : Array.isArray(displayedFlights) && displayedFlights.length > 0 ? (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow style={{ backgroundColor: "#1976d2" }}>
                    <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                      Airline
                    </TableCell>
                    <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                      Travel Time
                    </TableCell>
                    <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                      Stops
                    </TableCell>
                    <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                      Departure
                    </TableCell>
                    <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                      Arrival
                    </TableCell>
                    <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                      Price
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedFlights.map((flight, index) => {
                    const leg = flight.legs[0];
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <img
                              src={leg.carriers.marketing[0]?.logoUrl || ""}
                              alt={`${
                                leg.carriers.marketing[0]?.name ||
                                "Unknown Airline"
                              } Logo`}
                              style={{
                                width: "30px",
                                height: "30px",
                                objectFit: "contain",
                              }}
                            />
                            <Typography variant="body2">
                              {leg.carriers.marketing[0]?.name || "Unknown"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent={"space-between"}
                          >
                            <Typography style={{ fontSize: "0.9rem" }}>
                              {leg.durationInMinutes
                                ? `${Math.floor(
                                    leg.durationInMinutes / 60
                                  )} hr ${leg.durationInMinutes % 60} min`
                                : "Unknown"}
                            </Typography>
                            <Typography
                              style={{ fontSize: "0.70rem", color: "gray" }}
                            >
                              {`${leg.origin.displayCode} - ${leg.destination.displayCode}`}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          {leg.stopCount === 0
                            ? "Direct"
                            : leg.stopCount > 0
                            ? `${leg.stopCount} stop${
                                leg.stopCount > 1 ? "s" : ""
                              }`
                            : "Unknown"}
                        </TableCell>

                        <TableCell>{leg.origin.city || "Unknown"}</TableCell>
                        <TableCell>
                          {leg.destination.city || "Unknown"}
                        </TableCell>
                        <TableCell align="right">
                          {flight.price.formatted || "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {flights.length > 7 && (
              <Box textAlign="center" marginTop={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? "Show Less" : "Show More"}
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Typography>No information found.</Typography>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
