"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
} from "@mui/material";
import { SeatMeter } from "@/components/motion/SeatMeter";

const cardSx = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  cursor: "default",
  overflow: "hidden",
  borderRadius: 3,
  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 28px -8px rgba(243, 146, 35, 0.16), 0 4px 12px -4px rgba(0, 0, 0, 0.06)",
    borderColor: "rgba(243, 146, 35, 0.28)",
  },
} as const;

export function WaziLabContentCard({
  title,
  subtitle,
  imageUrl,
  href,
  primaryLabel = "Join Course",
  secondaryLabel = "Learn More",
  onPrimary,
  badge,
  seats,
}: {
  title: string;
  subtitle: string;
  imageUrl?: string;
  href: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  badge?: string;
  seats?: { enrolled: number; total: number };
}) {
  return (
    <Card sx={cardSx}>
      {imageUrl && (
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <CardMedia
            component="img"
            height="148"
            image={imageUrl}
            alt={title}
            sx={{
              objectFit: "cover",
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              ".MuiCard-root:hover &": { transform: "scale(1.04)" },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)",
              pointerEvents: "none",
            }}
          />
        </Box>
      )}
      <CardContent sx={{ flex: 1, pt: 1.75, pb: 0.75, px: 2.125, "&:last-child": { pb: 0.75 } }}>
        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              mb: 1.25,
              height: 22,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "capitalize",
              bgcolor: "rgba(243, 146, 35, 0.12)",
              color: "primary.main",
              border: "1px solid rgba(243, 146, 35, 0.2)",
            }}
          />
        )}
        <Typography
          component={Link}
          href={href}
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: "0.9375rem",
            letterSpacing: "-0.02em",
            lineHeight: 1.35,
            color: "text.primary",
            textDecoration: "none",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            transition: "color 0.2s",
            "&:hover": { color: "primary.main" },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.875,
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {subtitle}
        </Typography>
        {seats && seats.total > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <SeatMeter enrolled={seats.enrolled} total={seats.total} />
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ px: 2.125, pb: 2, pt: 0.375, gap: 0.625, flexWrap: "wrap" }}>
        {onPrimary ? (
          <Button variant="contained" color="primary" size="small" onClick={onPrimary}>
            {primaryLabel}
          </Button>
        ) : (
          <Button component={Link} href={href} variant="contained" color="primary" size="small">
            {primaryLabel}
          </Button>
        )}
        <Button
          component={Link}
          href={href}
          color="primary"
          size="small"
          sx={{ textTransform: "none", fontWeight: 600, opacity: 0.9 }}
        >
          {secondaryLabel}
        </Button>
      </CardActions>
    </Card>
  );
}
