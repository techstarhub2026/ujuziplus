"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { useAppStore } from "@/store/appStore";

export function CourseWishlistButton({
  userId,
  courseId,
  initialWishlisted,
}: {
  userId: string | null;
  courseId: string;
  initialWishlisted: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [busy, setBusy] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  if (!userId) return null;

  async function handleClick() {
    setBusy(true);
    const res = await toggleWishlist(userId!, courseId);
    setBusy(false);
    if (res.success && res.data) {
      setWishlisted(res.data.added);
      showToast(res.data.added ? "Added to wishlist" : "Removed from wishlist", "info");
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      size="lg"
      onClick={handleClick}
      disabled={busy}
    >
      <Heart className={`h-4 w-4 mr-2 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
      {wishlisted ? "In wishlist" : "Add to wishlist"}
    </Button>
  );
}
