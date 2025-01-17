import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchFlightsProvider from "./context/FlightContext";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";

const App = () => {
  return (
    <SearchFlightsProvider>
      <Router>
        {/* Rutas de la aplicación */}
        <Routes>
          {/* Página principal (Búsqueda) */}
          <Route path="/" element={<SearchPage />} />

          {/* Página de resultados */}
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Router>
    </SearchFlightsProvider>
  );
};

export default App;
