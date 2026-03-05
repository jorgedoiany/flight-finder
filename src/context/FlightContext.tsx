import type { LegacySearchParams } from "@/types";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface FlightContextType {
  searchParams: LegacySearchParams | null;
  setSearchParams: (params: LegacySearchParams | null) => void;
}

const SearchFlightsContext = createContext<FlightContextType | undefined>(
  undefined,
);

interface SearchFlightsProviderProps {
  children: ReactNode;
}

const SearchFlightsProvider: React.FC<SearchFlightsProviderProps> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useState<LegacySearchParams | null>(
    null,
  );

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

export const useSearchFlights = (): FlightContextType => {
  const context = useContext(SearchFlightsContext);
  if (context === undefined) {
    throw new Error(
      "useSearchFlights must be used within a SearchFlightsProvider",
    );
  }
  return context;
};
