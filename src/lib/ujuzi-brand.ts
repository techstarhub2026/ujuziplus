import type { LabResourceType } from "@prisma/client";

/** UjuziLab brand colors — primary orange #f39223, secondary navy #00004D */
export const UJUZI = {
  orange: "#f39223",
  orangeLight: "#fef3e6",
  orangeDark: "#d97f12",
  orangeHover: "#e0831a",
  /** Secondary brand — deep navy (subordinate to orange) */
  navy: "#00004D",
  navyLight: "#e8e8f5",
  navyDark: "#000033",
  navyMuted: "#1a1a6b",
  /** Legacy name — same as orange (replaced former #2D3E33 green) */
  green: "#f39223",
  greenHover: "#d97f12",
  greenLight: "#fef3e6",
  sidebar: "#00004D",
  sidebarHover: "#1a1a6b",
  sidebarBorder: "rgba(255,255,255,0.18)",
  primary: "#f39223",
  primaryLight: "#fef3e6",
  secondary: "#00004D",
  secondaryLight: "#e8e8f5",
  secondaryDark: "#000033",
  accent: "#f39223",
  link: "#f39223",
  linkSecondary: "#00004D",
  text: "#212121",
  textHeading: "#00004D",
  textMuted: "#616161",
  textOnPrimary: "#FFFFFF",
  textOnSecondary: "#FFFFFF",
  border: "#D9D9D9",
  surface: "#F5F5F5",
  white: "#FFFFFF",
  sidebarWidth: 250,
  sidebarCollapsed: 112,
} as const;

export const WAZILAB = {
  sidebar: UJUZI.sidebar,
  sidebarHover: UJUZI.sidebarHover,
  sidebarBorder: UJUZI.sidebarBorder,
  primary: UJUZI.primary,
  primaryLight: UJUZI.primaryLight,
  secondary: UJUZI.secondary,
  secondaryLight: UJUZI.secondaryLight,
  accent: UJUZI.accent,
  link: UJUZI.link,
  linkSecondary: UJUZI.linkSecondary,
  muiBlue: UJUZI.orange,
  text: UJUZI.text,
  textHeading: UJUZI.textHeading,
  textMuted: UJUZI.textMuted,
  border: UJUZI.border,
  surface: UJUZI.surface,
  white: UJUZI.white,
  sidebarWidth: UJUZI.sidebarWidth,
  sidebarCollapsed: UJUZI.sidebarCollapsed,
} as const;

export const LAB_COURSE_FILTERS = [
  "IoT",
  "Electronics",
  "Hardware",
  "Edge Computing",
  "Communication",
  "Applications",
  "Data & AI",
  "Business",
  "Earth Observations",
  "Green Energy",
  "Others",
] as const;

export const LAB_RESOURCE_FILTERS: { value: LabResourceType; label: string }[] = [
  { value: "COMPONENT", label: "Component" },
  { value: "SENSOR", label: "Sensor" },
  { value: "BOARD", label: "Board" },
  { value: "TOOL", label: "Tool" },
  { value: "GUIDE", label: "Guide" },
  { value: "OTHER", label: "Other" },
];

export const WAZILAB_COURSE_FILTERS = LAB_COURSE_FILTERS;
export const WAZILAB_LAB_FILTERS = LAB_RESOURCE_FILTERS;
