import type { Flight } from "@/types";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import Banner from "../components/Banner";
import Header from "../components/Header";
import { useSearchFlights } from "../context/FlightContext";
import useGetSearchFlightComplete from "../hooks/useGetSearchFlightComplete";
import styles from "./ResultsPage.module.css";

const ResultsPage: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const { searchParams } = useSearchFlights();

  const { flights, loading, error } = useGetSearchFlightComplete(searchParams);

  const displayedFlights: Flight[] = Array.isArray(flights)
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
                    return (
                      <TableRow key={flight.id || index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                backgroundColor: '#1976d2',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {flight.airline.substring(0, 2).toUpperCase()}
                            </Box>
                            <Typography variant="body2">
                              {flight.airline}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexDirection="column">
                            <Typography variant="body2" fontWeight="medium">
                              {flight.duration}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {`${flight.departure.airport.code} - ${flight.arrival.airport.code}`}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {flight.stops === 0
                              ? "Direct"
                              : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {flight.departure.airport.city}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {flight.arrival.airport.city}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" flexDirection="column" alignItems="flex-end">
                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                              {typeof flight.price === "object"
                                ? flight.price.formatted || `$${flight.price.raw}`
                                : `$${flight.price}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {flight.class}
                            </Typography>
                          </Box>
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
