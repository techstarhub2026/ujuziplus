import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { PLATFORM } from "@/lib/constants";

const FOOTER_LINKS = [
  { href: "/terms", label: "Terms and Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/about", label: "Imprint" },
  { href: "/pricing", label: "Plans and pricing" },
] as const;

export function LabFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        px: { xs: 2, sm: 3 },
        py: 3,
        background: "linear-gradient(to bottom, rgba(232,232,245,0.45), #fff)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
          © {new Date().getFullYear()} {PLATFORM.name} · {PLATFORM.tagline}
        </Typography>
        <Box component="ul" sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, listStyle: "none", m: 0, p: 0 }}>
          {FOOTER_LINKS.map((l) => (
            <Box component="li" key={l.href}>
              <Typography
                component={Link}
                href={l.href}
                variant="body2"
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "secondary.main",
                  textDecoration: "none",
                  "&:hover": { color: "primary.main", textDecoration: "underline" },
                }}
              >
                {l.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
