import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";

export function WaziLabSection({
  title,
  description,
  seeAllHref,
  seeAllLabel = "See all",
  children,
}: {
  title: string;
  description?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Box component="section" sx={{ mb: 5 }} className="animate-fade-in">
      <header className="home-section-header">
        <div className="home-section-header__top">
          <Typography className="wazilab-section-title home-section-header__title" component="h2">
            {title}
          </Typography>
          {seeAllHref && (
            <Link href={seeAllHref} className="home-section-link">
              {seeAllLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {description && (
          <Typography className="wazilab-section-desc home-section-header__desc" component="p">
            {description}
          </Typography>
        )}
      </header>
      {children}
    </Box>
  );
}
