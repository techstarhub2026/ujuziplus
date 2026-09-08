import { create } from "zustand";
import { currentUser } from "@/data/mock";
import type { User, UserRole } from "@/types/app";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  hasRole: (role: UserRole) => boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  hasRole: (role) => get().user?.roles.includes(role) ?? false,
  login: () => set({ user: currentUser, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
