import { createContext, useContext, useState } from "react";

const SearchFlightsContext = createContext();

const SearchFlightsProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState(null); // Store search parameters

  return (
    <SearchFlightsContext.Provider
      value={{
        searchParams,
        setSearchParams,
      }}
    >
      {children}
    </SearchFlightsContext.Provider>
  );
};

export default SearchFlightsProvider;
export const useSearchFlights = () => useContext(SearchFlightsContext);
