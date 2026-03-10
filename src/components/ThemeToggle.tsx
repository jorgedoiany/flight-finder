import { useFlightStore } from "@/store/flightStore";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import React from "react";

export const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { themeMode, toggleTheme } = useFlightStore();

  const isDarkMode = themeMode === "dark";

  return (
    <Tooltip title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        size="large"
        sx={{
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "rotate(180deg)",
          },
        }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
