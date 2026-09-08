/**
 * Showcase — submit, browse, and like learner projects
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, requireAdmin, assertSelfOrAdmin } from "@/lib/auth-server";
import type { ActionResult } from "./courses";
import { ShowcaseStatus } from "@prisma/client";
import { createNotification } from "./notifications";

// ─── Public catalog ────────────────────────────────────────────────────────────

export async function getShowcaseProjects(track?: string) {
  return getShowcaseProjectsCached(track ?? null);
}

const getShowcaseProjectsCached = unstable_cache(
  async (track: string | null) => {
    const projects = await db.showcaseProject.findMany({
      where: {
        status: "PUBLISHED",
        ...(track ? { track } : {}),
      },
      include: {
        user: { select: { fullName: true, username: true, avatarUrl: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { likeCount: "desc" }, { createdAt: "desc" }],
    });

    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      thumbnailUrl: p.thumbnailUrl,
      demoUrl: p.demoUrl,
      repoUrl: p.repoUrl,
      videoUrl: p.videoUrl,
      techStack: Array.isArray(p.techStack) ? (p.techStack as string[]) : [],
      track: p.track,
      isFeatured: p.isFeatured,
      viewCount: p.viewCount,
      likeCount: p.likeCount,
      createdAt: p.createdAt.toISOString(),
      user: p.user,
    }));
  },
  ["showcase-projects"],
  { revalidate: 60, tags: ["showcase-projects"] }
);

// ─── Submit a project ──────────────────────────────────────────────────────────

export async function submitShowcaseProject(input: {
  title: string;
  tagline?: string;
  description: string;
  thumbnailUrl?: string;
  demoUrl?: string;
  repoUrl?: string;
  videoUrl?: string;
  techStack: string[];
  track?: string;
}): Promise<ActionResult<{ projectId: string }>> {
  const { user } = await requireUser();

  const title = input.title.trim();
  if (!title) {
    return { success: false, error: "Project title is required." };
  }
  const description = input.description.trim();
  if (description.length < 30) {
    return { success: false, error: "Description must be at least 30 characters." };
  }

  const project = await db.showcaseProject.create({
    data: {
      userId: user.id,
      title,
      tagline: input.tagline?.trim() || null,
      description,
      thumbnailUrl: input.thumbnailUrl?.trim() || null,
      demoUrl: input.demoUrl?.trim() || null,
      repoUrl: input.repoUrl?.trim() || null,
      videoUrl: input.videoUrl?.trim() || null,
      techStack: input.techStack,
      track: input.track?.trim() || null,
      status: "PENDING_REVIEW",
    },
  });

  // Notify admins
  const admins = await db.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  await Promise.all(
    admins.map((a) =>
      createNotification(a.id, {
        type: "SYSTEM",
        title: "New showcase project submitted",
        message: `${user.fullName} submitted: ${title}`,
        href: `/admin/showcase`,
        prefCategory: "General",
      })
    )
  );

  revalidatePath("/dashboard/showcase");
  return { success: true, data: { projectId: project.id } };
}

// ─── Edit a project ────────────────────────────────────────────────────────────

export async function updateShowcaseProject(
  projectId: string,
  input: {
    title?: string;
    tagline?: string;
    description?: string;
    thumbnailUrl?: string;
    demoUrl?: string;
    repoUrl?: string;
    videoUrl?: string;
    techStack?: string[];
    track?: string;
  }
): Promise<ActionResult> {
  const { user } = await requireUser();

  const project = await db.showcaseProject.findFirst({
    where: { id: projectId, userId: user.id },
  });
  if (!project) {
    return { success: false, error: "Project not found." };
  }
  if (!["DRAFT", "REJECTED"].includes(project.status)) {
    return { success: false, error: "You can only edit projects that are in draft or rejected status." };
  }

  await db.showcaseProject.update({
    where: { id: projectId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.tagline !== undefined ? { tagline: input.tagline.trim() || null } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.thumbnailUrl !== undefined ? { thumbnailUrl: input.thumbnailUrl.trim() || null } : {}),
      ...(input.demoUrl !== undefined ? { demoUrl: input.demoUrl.trim() || null } : {}),
      ...(input.repoUrl !== undefined ? { repoUrl: input.repoUrl.trim() || null } : {}),
      ...(input.videoUrl !== undefined ? { videoUrl: input.videoUrl.trim() || null } : {}),
      ...(input.techStack !== undefined ? { techStack: input.techStack } : {}),
      ...(input.track !== undefined ? { track: input.track.trim() || null } : {}),
      status: "PENDING_REVIEW",
    },
  });

  revalidateTag("showcase-projects");
  revalidatePath("/dashboard/showcase");
  return { success: true, data: undefined };
}

// ─── Toggle like ───────────────────────────────────────────────────────────────

export async function toggleShowcaseLike(
  projectId: string
): Promise<ActionResult<{ liked: boolean }>> {
  const { user } = await requireUser();

  const existing = await db.showcaseLike.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });

  if (existing) {
    await db.showcaseLike.delete({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    await db.showcaseProject.update({
      where: { id: projectId },
      data: { likeCount: { decrement: 1 } },
    });
    revalidateTag("showcase-projects");
    return { success: true, data: { liked: false } };
  } else {
    await db.showcaseLike.create({
      data: { projectId, userId: user.id },
    });
    await db.showcaseProject.update({
      where: { id: projectId },
      data: { likeCount: { increment: 1 } },
    });
    revalidateTag("showcase-projects");
    return { success: true, data: { liked: true } };
  }
}

// ─── Learner's own projects ────────────────────────────────────────────────────

export async function getLearnerShowcaseProjects(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  return db.showcaseProject.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Admin: all projects ───────────────────────────────────────────────────────

export async function getAdminShowcaseProjects() {
  await requireAdmin();
  return db.showcaseProject.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Admin: approve / reject / feature ────────────────────────────────────────

export async function adminUpdateShowcaseProject(
  projectId: string,
  updates: { status?: ShowcaseStatus; isFeatured?: boolean }
): Promise<ActionResult> {
  await requireAdmin();

  const project = await db.showcaseProject.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true, title: true, status: true },
  });
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  await db.showcaseProject.update({
    where: { id: projectId },
    data: {
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.isFeatured !== undefined ? { isFeatured: updates.isFeatured } : {}),
    },
  });

  // Notify the owner when their project is approved (published)
  if (updates.status === "PUBLISHED" && project.status !== "PUBLISHED") {
    await createNotification(project.userId, {
      type: "SYSTEM",
      title: "Your project was approved!",
      message: `Your showcase project "${project.title}" has been published.`,
      href: `/showcase`,
      prefCategory: "General",
    });
  }

  revalidateTag("showcase-projects");
  revalidatePath("/showcase");
  return { success: true, data: undefined };
}

export async function adminDeleteShowcaseProject(projectId: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.showcaseProject.delete({ where: { id: projectId } });
  } catch {
    return { success: false, error: "Project not found." };
  }

  revalidateTag("showcase-projects");
  revalidatePath("/showcase");
  revalidatePath("/admin/showcase");
  return { success: true, data: undefined };
}

/** Owner deletes their own draft or rejected showcase project */
export async function deleteShowcaseProject(projectId: string): Promise<ActionResult> {
  const { user } = await requireUser();

  const project = await db.showcaseProject.findFirst({
    where: { id: projectId, userId: user.id },
  });
  if (!project) return { success: false, error: "Project not found." };
  if (!["DRAFT", "REJECTED"].includes(project.status)) {
    return { success: false, error: "You can only delete projects that are in draft or rejected status." };
  }

  await db.showcaseProject.delete({ where: { id: projectId } });

  revalidateTag("showcase-projects");
  revalidatePath("/dashboard/showcase");
  return { success: true, data: undefined };
}
