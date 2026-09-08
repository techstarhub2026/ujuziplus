"use client";

import { createTheme } from "@mui/material/styles";
import { UJUZI } from "@/lib/ujuzi-brand";

export const ujuziMuiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: UJUZI.orange,
      dark: UJUZI.orangeDark,
      light: UJUZI.orangeLight,
      contrastText: UJUZI.textOnPrimary,
    },
    secondary: {
      main: UJUZI.navy,
      dark: UJUZI.navyDark,
      light: UJUZI.navyLight,
      contrastText: UJUZI.textOnSecondary,
    },
    background: {
      default: UJUZI.surface,
      paper: UJUZI.white,
    },
    text: {
      primary: UJUZI.text,
      secondary: UJUZI.textMuted,
    },
    divider: UJUZI.border,
  },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    h1: { fontSize: "1.75rem", fontWeight: 600, color: UJUZI.navy },
    h2: { fontSize: "1.25rem", fontWeight: 600, color: UJUZI.navy },
    h3: { fontSize: "1.125rem", fontWeight: 600, color: UJUZI.navy },
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.8125rem" },
    button: {
      fontWeight: 600,
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "0.01em",
      textTransform: "none",
    },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: UJUZI.surface } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: UJUZI.sidebar,
          color: UJUZI.textOnPrimary,
          borderRight: `1px solid ${UJUZI.sidebarBorder}`,
          boxShadow: "none",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: "2px 8px",
          "&.Mui-selected": {
            backgroundColor: "rgba(255, 255, 255, 0.18)",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.24)" },
          },
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { color: "inherit", minWidth: 40 } },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          lineHeight: 1.5,
          letterSpacing: "0.01em",
          "&.MuiButton-containedSecondary": {
            backgroundColor: UJUZI.navy,
            color: "#fff",
            "&:hover": { backgroundColor: UJUZI.navyDark },
          },
          "&.MuiButton-textSecondary": {
            color: UJUZI.navy,
          },
        },
        outlined: {
          border: `1px solid rgba(243, 146, 35, 0.7)`,
          color: UJUZI.orange,
          "&:hover": {
            border: `1px solid ${UJUZI.orangeDark}`,
            backgroundColor: UJUZI.orangeLight,
          },
        },
        contained: {
          backgroundColor: UJUZI.orange,
          color: "#fff",
          "&:hover": { backgroundColor: UJUZI.orangeDark },
        },
        text: { color: UJUZI.orange },
        sizeSmall: { padding: "3px 9px", minWidth: 64 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: UJUZI.white,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          border: `1px solid ${UJUZI.border}`,
          borderRadius: 16,
          padding: 8,
          marginBottom: 16,
          overflow: "hidden",
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
        },
      },
    },
    MuiCardActions: { styleOverrides: { root: { padding: "8px 8px 4px" } } },
    MuiTabs: {
      styleOverrides: { indicator: { backgroundColor: UJUZI.orange } },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          "&.Mui-selected": { color: UJUZI.orange },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        bar: { backgroundColor: UJUZI.orange },
      },
    },
  },
});

export const wazilabMuiTheme = ujuziMuiTheme;

export const DRAWER_WIDTH = UJUZI.sidebarWidth;
export const DRAWER_COLLAPSED = UJUZI.sidebarCollapsed;
