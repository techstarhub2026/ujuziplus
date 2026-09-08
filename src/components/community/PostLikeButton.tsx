"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

export function PostLikeButton({
  initialLiked,
  initialCount,
  onToggle,
  size = "md",
  label = "Like",
}: {
  initialLiked: boolean;
  initialCount: number;
  onToggle: () => Promise<{ liked: boolean } | null>;
  size?: "sm" | "md";
  label?: string;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    const res = await onToggle();
    setPending(false);
    if (res) {
      setLiked(res.liked);
      setCount((c) => Math.max(0, c + (res.liked ? 1 : -1)));
    }
  }

  const sm = size === "sm";

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={pending}
      whileTap={{ scale: 0.94 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition ${
        sm ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${
        liked
          ? "bg-orange-100 text-brand ring-1 ring-orange-200/80"
          : "bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-brand"
      }`}
      aria-pressed={liked}
    >
      <ThumbsUp className={`${sm ? "h-3.5 w-3.5" : "h-4 w-4"} ${liked ? "fill-current" : ""}`} />
      <span>{count}</span>
      {!sm && <span className="sr-only">{label}</span>}
    </motion.button>
  );
}
