export type DiscoveryItem = {
  key: string;
  kind: "course" | "kit" | "program" | "competition";
  title: string;
  href: string;
  imageUrl?: string | null;
  metaPrimary: string;
  metaSecondary?: string;
  highlight?: string;
};

/** Round-robin interleave so types alternate along the rail. */
export function interleaveDiscovery(groups: DiscoveryItem[][]): DiscoveryItem[] {
  const out: DiscoveryItem[] = [];
  const queues = groups.map((g) => [...g]).filter((g) => g.length > 0);
  while (queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
}
