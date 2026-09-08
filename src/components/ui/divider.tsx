import { cn } from "@/lib/utils";

export function Divider({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  if (label) {
    return (
      <div className={cn("relative flex items-center py-2", className)}>
        <div className="flex-grow border-t border-gray-200" />
        <span className="mx-3 shrink-0 text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </span>
        <div className="flex-grow border-t border-gray-200" />
      </div>
    );
  }

  return <hr className={cn("border-0 border-t border-gray-200", className)} />;
}
