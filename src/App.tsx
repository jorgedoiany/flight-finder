import AppThemeProvider from "@/components/AppThemeProvider";
import ResultsPage from "@/pages/ResultsPage";
import SearchPage from "@/pages/SearchPage";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const App: React.FC = () => {
  return (
    <AppThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Router>
    </AppThemeProvider>
  );
};

export default App;
