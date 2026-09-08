import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { getWishlist } from "@/lib/actions/wishlist";
import { WishlistGrid } from "@/components/courses/WishlistGrid";
import { Heart } from "lucide-react";
import { getAuthSession } from "@/lib/auth-server";

export default async function WishlistPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login?callbackUrl=/dashboard/wishlist");

  const items = await getWishlist(session.user.id);

  return (
    <div className="animate-fade-in">
      <PageHeader
        variant="hero"
        banner="cart"
        title="Wishlist"
        description={`${items.length} course${items.length !== 1 ? "s" : ""} saved for later`}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8 text-brand" />}
          title="Your wishlist is empty"
          description="Browse courses and tap the heart to save them here."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
      ) : (
        <WishlistGrid items={items} userId={session.user.id} />
      )}
    </div>
  );
}
