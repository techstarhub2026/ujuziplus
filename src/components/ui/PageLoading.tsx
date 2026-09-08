import { cn } from "@/lib/utils";
import { UjuziLoader } from "@/components/ui/UjuziLoader";

type PageLoadingProps = {
  message?: string;
  size?: "md" | "lg";
  dark?: boolean;
  fullscreen?: boolean;
  className?: string;
};

/** Centered route / section loading state with the Ujuzi ring loader. */
export function PageLoading({
  message = "Loading…",
  size = "lg",
  dark = false,
  fullscreen = false,
  className,
}: PageLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "ujuzi-page-loading",
        fullscreen && "ujuzi-page-loading--fullscreen",
        dark && "ujuzi-page-loading--dark",
        className
      )}
    >
      <UjuziLoader size={size} />
      {message ? <p className="ujuzi-page-loading__message">{message}</p> : null}
    </div>
  );
}
