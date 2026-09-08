"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toggleFollow } from "@/lib/actions/follows";

export function AuthorFollowButton({
  viewerId,
  authorId,
  authorUsername,
  initialFollowing,
  initialFollowerCount,
  size = "md",
}: {
  viewerId: string;
  authorId: string;
  authorUsername: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
  size?: "sm" | "md";
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [pending, setPending] = useState(false);

  if (viewerId === authorId) return null;

  async function handleClick() {
    if (pending) return;
    setPending(true);
    const res = await toggleFollow(viewerId, authorId);
    setPending(false);
    if (res.success) {
      setFollowing(res.data.following);
      setFollowerCount(res.data.followerCount);
    }
  }

  const sm = size === "sm";

  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={pending}
        whileTap={{ scale: 0.96 }}
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition ${
          sm ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
        } ${
          following
            ? "bg-navy/5 text-navy ring-1 ring-navy/15 hover:bg-navy/10"
            : "bg-brand text-white shadow-sm hover:bg-brand-dark"
        }`}
      >
        {pending ? (
          <Loader2 className={`${sm ? "h-3.5 w-3.5" : "h-4 w-4"} animate-spin`} />
        ) : following ? (
          <UserCheck className={sm ? "h-3.5 w-3.5" : "h-4 w-4"} />
        ) : (
          <UserPlus className={sm ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
        {following ? "Following" : "Follow"}
      </motion.button>
      <span className={`text-gray-500 ${sm ? "text-xs" : "text-sm"}`}>
        <span className="font-semibold text-gray-700">{followerCount}</span>{" "}
        {followerCount === 1 ? "follower" : "followers"}
      </span>
      <a
        href={`/profile/${authorUsername}`}
        className={`text-brand hover:underline ${sm ? "text-xs" : "text-sm"}`}
      >
        View profile
      </a>
    </div>
  );
}
