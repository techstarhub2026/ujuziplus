import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "ujuzi-loader--sm",
  md: "ujuzi-loader--md",
  lg: "ujuzi-loader--lg",
} as const;

/**
 * Layered ring loader — adapted from Uiverse.io by uxRakhal.
 * Brand palette: orange, gold, blue, navy.
 */
export function UjuziLoader({
  size = "md",
  className,
  label = "Loading",
}: {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  /** Accessible name when no visible label is shown */
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={cn("ujuzi-loader", SIZE_CLASS[size], className)}
      role="img"
      aria-label={label}
    >
      <circle
        strokeLinecap="round"
        strokeDashoffset={-330}
        strokeDasharray="0 660"
        strokeWidth={20}
        fill="none"
        r={105}
        cy={120}
        cx={120}
        className="ujuzi-loader__ring ujuzi-loader__ring--a"
      />
      <circle
        strokeLinecap="round"
        strokeDashoffset={-110}
        strokeDasharray="0 220"
        strokeWidth={20}
        fill="none"
        r={35}
        cy={120}
        cx={120}
        className="ujuzi-loader__ring ujuzi-loader__ring--b"
      />
      <circle
        strokeLinecap="round"
        strokeDasharray="0 440"
        strokeWidth={20}
        fill="none"
        r={70}
        cy={120}
        cx={85}
        className="ujuzi-loader__ring ujuzi-loader__ring--c"
      />
      <circle
        strokeLinecap="round"
        strokeDasharray="0 440"
        strokeWidth={20}
        fill="none"
        r={70}
        cy={120}
        cx={155}
        className="ujuzi-loader__ring ujuzi-loader__ring--d"
      />
    </svg>
  );
}
