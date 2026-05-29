import { create } from "zustand";
import api from "../api/axios";
import { devtools, persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        register: async (name, email, password) => {
          set({ isLoading: true, error: null });
          try {
            const { data } = await api.post("/auth/register", {
              name,
              email,
              password,
            });
            set({ user: data.data, isAuthenticated: true, isLoading: false });
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Registeration failed";
            set({ error: message, isLoading: false });
            throw error;
          }
        },

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const { data } = await api.post("/auth/login", { email, password });
            set({ user: data.data, isAuthenticated: true, isLoading: false });
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Login failed";
            set({ error: message, isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          try {
            await api.post("/auth/logout");
          } finally {
            set({ user: null, isAuthenticated: false });
          }
        },

        getMe: async () => {
          set({ isLoading: true });
          try {
            const { data } = await api.get("/auth/me");
            set({ user: data.data, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: "auth-storage",
        partialize(state) {
          return { user: state.user, isAuthenticated: state.isAuthenticated };
        },
      },
    ),
  ),
);

export default useAuthStore;
