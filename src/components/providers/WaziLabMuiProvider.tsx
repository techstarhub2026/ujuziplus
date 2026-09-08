"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ujuziMuiTheme } from "@/theme/wazilab-mui-theme";

export function WaziLabMuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={ujuziMuiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
