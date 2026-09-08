import { LabShell } from "@/components/layout/wazilab/LabShell";

/** Shared chrome for public catalog + student dashboard — persists across both route groups. */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <LabShell>{children}</LabShell>;
}
