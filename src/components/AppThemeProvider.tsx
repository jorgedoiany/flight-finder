import { useFlightStore } from "@/store/flightStore";
import { getThemeByMode } from "@/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
}) => {
  const { themeMode } = useFlightStore();
  const theme = getThemeByMode(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
