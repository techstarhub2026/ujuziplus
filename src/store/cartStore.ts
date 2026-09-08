import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/app";
import { validateCoupon } from "@/lib/coupons";

function itemKey(item: CartItem): string {
  return item.kind === "course" ? `course:${item.courseId}` : `kit:${item.kitId}`;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  applyCoupon: (code: string) => boolean;
  clearCart: () => void;
  subtotal: () => number;
  total: () => number;
  courseIds: () => string[];
  kitIds: () => string[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountPercent: 0,
      addItem: (item) =>
        set((s) => {
          const key = itemKey(item);
          if (s.items.some((i) => itemKey(i) === key)) return s;
          return { items: [...s.items, item] };
        }),
      removeItem: (key) =>
        set((s) => ({ items: s.items.filter((i) => itemKey(i) !== key) })),
      applyCoupon: (code) => {
        const { valid, discountPercent } = validateCoupon(code);
        if (valid) {
          set({ couponCode: code.toUpperCase(), discountPercent });
          return true;
        }
        return false;
      },
      clearCart: () => set({ items: [], couponCode: null, discountPercent: 0 }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price, 0),
      total: () => {
        const sub = get().subtotal();
        return sub - (sub * get().discountPercent) / 100;
      },
      courseIds: () =>
        get().items.filter((i) => i.kind === "course").map((i) => i.courseId),
      kitIds: () => get().items.filter((i) => i.kind === "kit").map((i) => i.kitId),
    }),
    { name: "ujuzi-cart" }
  )
);

export { itemKey as cartItemKey };
