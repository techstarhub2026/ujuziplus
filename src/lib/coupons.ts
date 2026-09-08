/** Shared coupon codes — safe to import from client or server (not a server action file). */

export const COUPONS: Record<string, number> = {
  UJUZI20: 20,
  UJUZI50: 50,
};

export function validateCoupon(code: string): { valid: boolean; discountPercent: number } {
  const pct = COUPONS[code.toUpperCase()];
  return pct ? { valid: true, discountPercent: pct } : { valid: false, discountPercent: 0 };
}
