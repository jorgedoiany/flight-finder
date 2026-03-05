import SearchFlightsProvider from "@/context/FlightContext";
import ResultsPage from "@/pages/ResultsPage";
import SearchPage from "@/pages/SearchPage";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const App: React.FC = () => {
  return (
    <SearchFlightsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Router>
    </SearchFlightsProvider>
  );
};

export default App;
