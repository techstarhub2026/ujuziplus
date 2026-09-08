"use client";

import { Children, isValidElement } from "react";
import { RevealItem, RevealStagger } from "@/components/motion/RevealStagger";

export function WaziLabGrid({ children }: { children: React.ReactNode }) {
  return (
    <RevealStagger className="wazilab-catalog-grid">
      {Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <RevealItem key={child.key ?? i}>{child}</RevealItem>
        ) : null
      )}
    </RevealStagger>
  );
}

export function WaziLabGrid2Col({ children }: { children: React.ReactNode }) {
  return (
    <RevealStagger className="wazilab-catalog-grid wazilab-catalog-grid--2col">
      {Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <RevealItem key={child.key ?? i}>{child}</RevealItem>
        ) : null
      )}
    </RevealStagger>
  );
}
