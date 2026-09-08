/** Types aligned with UjuziLab Blueprint — backend should mirror these */

export type UserRole =
  | "student"
  | "instructor"
  | "organization_admin"
  | "moderator"
  | "super_admin";

export type CourseStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export type LessonType = "video" | "article" | "quiz" | "assignment" | "resource";

export type PaymentMethod = "mpesa" | "airtel_money" | "tigo_pesa" | "card" | "bank";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  roles: UserRole[];
  isVerifiedInstructor?: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  instructor: Pick<User, "id" | "fullName" | "avatarUrl" | "username">;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  price: number;
  discountPrice?: number;
  isFree: boolean;
  rating: number;
  totalReviews: number;
  totalEnrollments: number;
  durationHours: number;
  status: CourseStatus;
  whatYouLearn: string[];
  /** Kits recommended or required for hands-on lessons (UI prototype field) */
  linkedKitSlugs?: string[];
}

export type OrgKitRequestStatus = "pending" | "approved" | "fulfilled" | "rejected";

export interface OrgKitInventoryItem {
  id: string;
  orgSlug: string;
  kitId: string;
  kitSlug: string;
  kitTitle: string;
  quantityOnHand: number;
  quantityAllocated: number;
  reorderLevel: number;
}

export interface OrgKitRequest {
  id: string;
  orgSlug: string;
  kitId: string;
  kitSlug: string;
  kitTitle: string;
  requestedBy: string;
  quantity: number;
  status: OrgKitRequestStatus;
  notes?: string;
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  type: LessonType;
  durationMinutes: number;
  isFreePreview: boolean;
  isCompleted?: boolean;
}

export interface Enrollment {
  id: string;
  courseId: string;
  progressPercentage: number;
  lastAccessedAt: string;
  status: "active" | "completed" | "archived";
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  creators: Pick<User, "id" | "fullName" | "avatarUrl">[];
  likes: number;
  status: "idea" | "prototype" | "mvp" | "launched";
  githubUrl?: string;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  type: "university" | "school" | "hub" | "ngo" | "company";
  logoUrl: string;
  memberCount: number;
  isVerified: boolean;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  href?: string;
}

export type CartItem =
  | {
      kind: "course";
      courseId: string;
      title: string;
      price: number;
      thumbnailUrl: string;
    }
  | {
      kind: "kit";
      kitId: string;
      slug: string;
      title: string;
      price: number;
      thumbnailUrl: string;
    };

export type KitStatus = "draft" | "published" | "archived";
export type KitMaterialType = "guide" | "video" | "pdf" | "worksheet" | "project";

export interface KitComponent {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  imageUrl?: string;
}

export interface KitMaterial {
  id: string;
  title: string;
  type: KitMaterialType;
  description: string;
  url?: string;
  durationMinutes?: number;
  order: number;
}

export interface KitGalleryImage {
  id: string;
  url: string;
  caption: string;
  isPrimary?: boolean;
}

export interface Kit {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  gallery: KitGalleryImage[];
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  ageRange: string;
  price: number;
  isFree: boolean;
  status: KitStatus;
  components: KitComponent[];
  materials: KitMaterial[];
  learningOutcomes: string[];
  relatedCourseSlugs?: string[];
  projectIdeas: string[];
  inventoryCount: number;
  createdAt: string;
  updatedAt: string;
}

/** API contract placeholders for backend handoff */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: { page: number; total: number; perPage: number };
}
