"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertActor } from "@/lib/auth-server";
import type { ActionResult } from "./courses";
import { createNotification } from "./notifications";

export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<ActionResult<{ following: boolean; followerCount: number }>> {
  await assertActor(followerId);

  if (followerId === followingId) {
    return { success: false, error: "You cannot follow yourself." };
  }

  const target = await db.user.findUnique({
    where: { id: followingId },
    select: { id: true, username: true, fullName: true },
  });
  if (!target) return { success: false, error: "User not found." };

  const existing = await db.userFollow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await db.userFollow.delete({ where: { id: existing.id } });
    const followerCount = await db.userFollow.count({ where: { followingId } });
    revalidatePath(`/profile/${target.username}`);
    return { success: true, data: { following: false, followerCount } };
  }

  const follower = await db.user.findUnique({
    where: { id: followerId },
    select: { username: true, fullName: true },
  });

  await db.userFollow.create({ data: { followerId, followingId } });

  if (follower) {
    await createNotification(followingId, {
      type: "SYSTEM",
      title: "New follower",
      message: `${follower.fullName} started following you on UjuziLab.`,
      href: `/profile/${follower.username}`,
    });
  }

  const followerCount = await db.userFollow.count({ where: { followingId } });
  revalidatePath(`/profile/${target.username}`);
  return { success: true, data: { following: true, followerCount } };
}

export async function getFollowState(viewerId: string | null, profileUserId: string) {
  const [followerCount, followingCount, isFollowing] = await Promise.all([
    db.userFollow.count({ where: { followingId: profileUserId } }),
    db.userFollow.count({ where: { followerId: profileUserId } }),
    viewerId && viewerId !== profileUserId
      ? db.userFollow
          .findUnique({
            where: { followerId_followingId: { followerId: viewerId, followingId: profileUserId } },
          })
          .then((r) => !!r)
      : Promise.resolve(false),
  ]);

  return { followerCount, followingCount, isFollowing };
}

export async function isFollowingUser(followerId: string, followingId: string) {
  const row = await db.userFollow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!row;
}
