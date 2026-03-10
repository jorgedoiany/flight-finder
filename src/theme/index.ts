import { createTheme, ThemeOptions } from "@mui/material/styles";

// Color palettes
const lightPalette = {
  mode: "light",
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#dc004e",
    light: "#ff5983",
    dark: "#9a0036",
    contrastText: "#ffffff",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
  },
  text: {
    primary: "#1a1a1a",
    secondary: "#666666",
  },
} as const;

const darkPalette = {
  mode: "dark",
  primary: {
    main: "#90caf9",
    light: "#e3f2fd",
    dark: "#42a5f5",
    contrastText: "#000000",
  },
  secondary: {
    main: "#f48fb1",
    light: "#ffc1e3",
    dark: "#bf5f82",
    contrastText: "#000000",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  text: {
    primary: "#ffffff",
    secondary: "#b3b3b3",
  },
} as const;

// Common theme options
const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
          padding: "8px 16px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
};

// Create themes
export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: lightPalette,
});

export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: darkPalette,
  components: {
    ...commonThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1e1e1e",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1e1e1e",
        },
      },
    },
  },
});

// Theme type
export type ThemeMode = "light" | "dark";

// Helper to get theme by mode
export const getThemeByMode = (mode: ThemeMode) => {
  return mode === "dark" ? darkTheme : lightTheme;
};
