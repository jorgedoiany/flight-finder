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
  IconButton,
  Tooltip,
  Chip,
  Fab,
  Badge,
  Stack,
  Pagination,
  Alert,
  Container,
  Card,
  CardContent,
  Grid,
  Divider
} from "@mui/material";
import {
  Flight as FlightIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  FilterList as FilterIcon,
  Compare as CompareIcon,
  ArrowBack as ArrowBackIcon,
  SwapHoriz as SwapIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Banner from "../components/Banner";
import Header from "../components/Header";
import AdvancedFiltersComponent from '@/components/AdvancedFilters';
import FlightComparison from '@/components/FlightComparison';
import { useFlightStore } from '@/store/flightStore';
import styles from "./ResultsPage.module.css";

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const {
    filteredFlights,
    isLoading,
    error,
    searchParams,
    filters,
    comparison,
    currentPage,
    totalResults,
    addToComparison,
    removeFromComparison,
    toggleFilters,
    toggleComparison,
    setCurrentPage,
    sortFlights
  } = useFlightStore();

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredFlights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedFlights = filteredFlights.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCompareToggle = (flight: Flight) => {
    const isInComparison = comparison.flights.some(f => f.id === flight.id);
    if (isInComparison) {
      removeFromComparison(flight.id);
    } else {
      addToComparison(flight);
    }
  };

  const handleBackToSearch = () => {
    navigate('/');
  };

  // Flight Card Component for Cards View
  const FlightCard: React.FC<{ flight: Flight; index: number }> = ({ flight, index }) => {
    const price = typeof flight.price === "object" ? flight.price.raw || 0 : flight.price;
    const isInComparison = comparison.flights.some(f => f.id === flight.id);

    return (
      <Card sx={{ mb: 2, position: 'relative', '&:hover': { boxShadow: 4 } }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Flight Info */}
            <Grid item xs={12} md={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: '#1976d2',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {flight.airline.substring(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {flight.airline}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {flight.flightNumber} • {flight.aircraft}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Route */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {flight.departure.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flight.departure.airport.code}
                  </Typography>
                </Box>
                
                <Box textAlign="center" flex={1}>
                  <Chip 
                    label={flight.duration} 
                    size="small" 
                    variant="outlined"
                    color="info"
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </Typography>
                </Box>
                
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {flight.arrival.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flight.arrival.airport.code}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Price & Actions */}
            <Grid item xs={12} md={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    ${price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {flight.class} class
                  </Typography>
                </Box>
                
                <Stack direction="column" spacing={1}>
                  <Button variant="contained" size="small">
                    Select
                  </Button>
                  <Tooltip title={isInComparison ? "Remove from comparison" : "Add to comparison"}>
                    <IconButton 
                      size="small"
                      color={isInComparison ? "primary" : "default"}
                      onClick={() => handleCompareToggle(flight)}
                      disabled={!isInComparison && comparison.flights.length >= 3}
                    >
                      {isInComparison ? <RemoveIcon /> : <AddIcon />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Grid>

            {/* Additional Info */}
            <Grid item xs={12} md={2}>
              <Stack spacing={0.5}>
                <Chip 
                  label={flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  size="small"
                  color={flight.stops === 0 ? 'success' : flight.stops === 1 ? 'warning' : 'default'}
                />
                <Chip 
                  label={flight.class.charAt(0).toUpperCase() + flight.class.slice(1)}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (!searchParams) {
    return (
      <Container>
        <Box textAlign="center" py={8}>
          <FlightIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No search parameters found
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleBackToSearch}
            startIcon={<ArrowBackIcon />}
          >
            Back to Search
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <div>
      <Header />
      <Banner />
      <Container className={styles.resultsPage}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Flight Results
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchParams.origin.entityId} → {searchParams.destination.entityId} • {filteredFlights.length} flights
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={handleBackToSearch}
              startIcon={<ArrowBackIcon />}
            >
              New Search
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
          </Stack>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Results */}
        {!isLoading && !error && filteredFlights.length > 0 && (
          <>
            {/* Sort Controls */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="body2" color="text.secondary">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredFlights.length)} of {filteredFlights.length} flights
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">Sort by:</Typography>
                <Button
                  size="small"
                  variant={filters.sortBy === 'price' ? 'contained' : 'outlined'}
                  onClick={() => sortFlights('price', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  startIcon={<MoneyIcon />}
                >
                  Price {filters.sortBy === 'price' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  size="small"
                  variant={filters.sortBy === 'duration' ? 'contained' : 'outlined'}
                  onClick={() => sortFlights('duration', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  startIcon={<ScheduleIcon />}
                >
                  Duration {filters.sortBy === 'duration' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
              </Stack>
            </Box>

            {/* Flight Results - Table View */}
            {viewMode === 'table' && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow style={{ backgroundColor: "#1976d2" }}>
                      <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                        Airline
                      </TableCell>
                      <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                        Route & Duration
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
                      <TableCell style={{ color: "#fff", fontWeight: "bold" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedFlights.map((flight, index) => {
                      const price = typeof flight.price === "object" ? flight.price.raw || 0 : flight.price;
                      const isInComparison = comparison.flights.some(f => f.id === flight.id);

                      return (
                        <TableRow key={flight.id || index} hover>
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
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {flight.airline}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {flight.flightNumber}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {flight.duration}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {`${flight.departure.airport.code} → ${flight.arrival.airport.code}`}
                              </Typography>
                              <br />
                              <Chip
                                label={flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                                size="small"
                                color={flight.stops === 0 ? 'success' : flight.stops === 1 ? 'warning' : 'default'}
                              />
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {flight.departure.time}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {flight.departure.airport.city}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {flight.arrival.time}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {flight.arrival.airport.city}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Box display="flex" flexDirection="column" alignItems="flex-end">
                              <Typography variant="h6" color="primary.main" fontWeight="bold">
                                ${price}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {flight.class}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button variant="contained" size="small">
                                Select
                              </Button>
                              <Tooltip title={isInComparison ? "Remove from comparison" : "Add to comparison"}>
                                <IconButton 
                                  size="small"
                                  color={isInComparison ? "primary" : "default"}
                                  onClick={() => handleCompareToggle(flight)}
                                  disabled={!isInComparison && comparison.flights.length >= 3}
                                >
                                  {isInComparison ? <RemoveIcon /> : <AddIcon />}
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Flight Results - Cards View */}
            {viewMode === 'cards' && (
              <Box>
                {displayedFlights.map((flight, index) => (
                  <FlightCard key={flight.id || index} flight={flight} index={index} />
                ))}
              </Box>
            )}

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}

        {/* No Results State */}
        {!isLoading && !error && filteredFlights.length === 0 && (
          <Box textAlign="center" py={8}>
            <FlightIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No flights found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Try adjusting your search criteria or filters
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="outlined" 
                onClick={() => setShowFilters(true)}
                startIcon={<FilterIcon />}
              >
                Adjust Filters
              </Button>
              <Button 
                variant="contained" 
                onClick={handleBackToSearch}
                startIcon={<ArrowBackIcon />}
              >
                New Search
              </Button>
            </Stack>
          </Box>
        )}

        {/* Floating Action Buttons */}
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Tooltip title="Filters">
            <Fab
              color="primary"
              onClick={() => setShowFilters(true)}
            >
              <FilterIcon />
            </Fab>
          </Tooltip>
          
          <Tooltip title="Compare Flights">
            <Badge badgeContent={comparison.flights.length} color="error">
              <Fab
                color="secondary"
                onClick={() => setShowComparison(true)}
                disabled={comparison.flights.length === 0}
              >
                <CompareIcon />
              </Fab>
            </Badge>
          </Tooltip>
        </Box>

        {/* Advanced Filters Drawer */}
        <AdvancedFiltersComponent
          open={showFilters}
          onClose={() => setShowFilters(false)}
        />

        {/* Flight Comparison Dialog */}
        <FlightComparison
          open={showComparison}
          onClose={() => setShowComparison(false)}
        />
      </Container>
    </div>
  );
};

export default ResultsPage;
