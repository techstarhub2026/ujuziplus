/**
 * Serialize Prisma values for React client components and unstable_cache.
 * Prisma Decimal instances cannot cross the server→client boundary.
 */

type DecimalLike = { toString(): string } | number | string | null | undefined;

export function decimalToNumber(value: DecimalLike): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  return Number(value.toString()) || 0;
}

export function decimalToNumberOrNull(value: DecimalLike): number | null {
  if (value == null) return null;
  return decimalToNumber(value);
}

export function serializeCourseForClient<
  C extends { price?: unknown; discountPrice?: unknown },
>(course: C) {
  return {
    ...course,
    price: course.price != null ? decimalToNumberOrNull(course.price as DecimalLike) : null,
    discountPrice:
      course.discountPrice != null
        ? decimalToNumberOrNull(course.discountPrice as DecimalLike)
        : null,
  };
}

export function serializeKitForClient<K extends { price?: unknown }>(kit: K) {
  return {
    ...kit,
    price: decimalToNumber(kit.price as DecimalLike),
  };
}

export function serializeProgramForClient<P extends { price?: unknown }>(program: P) {
  return {
    ...program,
    price: decimalToNumber(program.price as DecimalLike),
  };
}

export function serializePricingPlan<P extends { price?: unknown }>(plan: P) {
  return {
    ...plan,
    price: decimalToNumber(plan.price as DecimalLike),
  };
}

export function serializePayout<P extends { amount?: unknown }>(payout: P) {
  return {
    ...payout,
    amount: decimalToNumber(payout.amount as DecimalLike),
  };
}

/** Strip Decimal fields from admin course review rows passed to client components. */
export function serializeCourseReviewItem<
  C extends {
    id: string;
    title: string;
    slug: string;
    status: string;
    updatedAt: Date;
    instructor: {
      id: string;
      fullName: string;
      email: string;
      avatarUrl: string | null;
    };
    _count: { modules: number };
  },
>(course: C) {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    status: course.status,
    updatedAt: course.updatedAt,
    instructor: course.instructor,
    _count: course._count,
  };
}
