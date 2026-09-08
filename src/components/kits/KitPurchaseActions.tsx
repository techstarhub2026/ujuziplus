"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { claimFreeKit } from "@/lib/actions/orders";
import { useAppStore } from "@/store/appStore";
import { ShoppingCart, Check } from "lucide-react";

export function KitPurchaseActions({
  kit,
  owned,
}: {
  kit: {
    id: string;
    slug: string;
    title: string;
    price: number;
    isFree: boolean;
    thumbnailUrl: string | null;
    inventoryCount: number;
  };
  owned: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useAppStore((s) => s.showToast);
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const outOfStock = !kit.isFree && kit.inventoryCount <= 0;

  if (owned) {
    return (
      <Button variant="secondary" disabled className="gap-2">
        <Check className="h-4 w-4" /> You own this kit
      </Button>
    );
  }

  if (kit.isFree) {
    return (
      <Button
        disabled={isPending}
        onClick={() => {
          if (!session?.user?.id) {
            router.push(`/auth/login?callbackUrl=/kits/${kit.slug}`);
            return;
          }
          startTransition(async () => {
            const res = await claimFreeKit(session.user.id, kit.slug);
            if (res.success) {
              showToast("Kit added to your library!", "success");
              router.refresh();
            } else showToast(res.error ?? "Failed", "error");
          });
        }}
      >
        Claim free kit
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="primary"
        disabled={outOfStock || added}
        onClick={() => {
          if (!session?.user?.id) {
            router.push(`/auth/login?callbackUrl=/kits/${kit.slug}`);
            return;
          }
          addItem({
            kind: "kit",
            kitId: kit.id,
            slug: kit.slug,
            title: kit.title,
            price: kit.price,
            thumbnailUrl: kit.thumbnailUrl ?? "",
          });
          setAdded(true);
          showToast("Kit added to cart", "success");
        }}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {outOfStock ? "Out of stock" : added ? "In cart" : "Add to cart"}
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/cart")}
        disabled={!added}
      >
        View cart
      </Button>
    </div>
  );
}
