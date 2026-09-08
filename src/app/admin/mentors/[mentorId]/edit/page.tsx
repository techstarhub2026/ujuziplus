import { notFound } from "next/navigation";
import {
  getMentorById,
  getMentorUsersForLinking,
  getCoursesForMentorLinking,
  getKitsForMentorLinking,
  getAdminCohorts,
} from "@/lib/actions/mentors";
import { AdminMentorForm } from "@/components/admin/AdminMentorForm";
import { AdminMentorExtras } from "@/components/admin/AdminMentorExtras";

interface Props {
  params: { mentorId: string };
}

export default async function AdminEditMentorPage({ params }: Props) {
  const [mentor, linkableUsers, courses, kits, cohorts] = await Promise.all([
    getMentorById(params.mentorId),
    getMentorUsersForLinking(),
    getCoursesForMentorLinking(),
    getKitsForMentorLinking(),
    getAdminCohorts(params.mentorId),
  ]);

  if (!mentor) notFound();

  const { officeHours, groupSessions, ...formData } = mentor;

  const initial = {
    displayName: formData.displayName,
    userId: formData.userId,
    title: formData.title ?? undefined,
    company: formData.company ?? undefined,
    companyLogoUrl: formData.companyLogoUrl,
    avatarUrl: formData.avatarUrl,
    bio: formData.bio ?? undefined,
    hook: formData.hook ?? undefined,
    quote: formData.quote ?? undefined,
    videoIntroUrl: formData.videoIntroUrl ?? undefined,
    city: formData.city ?? undefined,
    country: formData.country ?? undefined,
    expertiseTags: formData.expertiseTags,
    tracks: formData.tracks,
    languages: formData.languages,
    yearsExperience: formData.yearsExperience,
    linkedin: formData.linkedin ?? undefined,
    github: formData.github ?? undefined,
    learningPath: formData.learningPath,
    recommendedCourseIds: formData.recommendedCourseIds,
    recommendedKitSlugs: formData.recommendedKitSlugs,
    officeHoursNote: formData.officeHoursNote ?? undefined,
    bookingUrl: formData.bookingUrl ?? undefined,
    isFeatured: formData.isFeatured,
    isAcceptingRequests: formData.isAcceptingRequests,
    studentsHelped: formData.studentsHelped,
    sortOrder: formData.sortOrder,
    status: formData.status,
    mentorType: formData.mentorType,
    agreedToCodeOfConduct: formData.agreedToCodeOfConduct ?? false,
  };

  return (
    <>
      <AdminMentorForm
        mentorId={params.mentorId}
        initial={initial}
        linkableUsers={linkableUsers}
        courses={courses}
        kits={kits}
      />
      <AdminMentorExtras
        mentorId={params.mentorId}
        officeHours={officeHours}
        groupSessions={groupSessions}
        cohorts={cohorts}
      />
    </>
  );
}
