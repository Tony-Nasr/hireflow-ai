import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  fullName: string | null
  email: string | null
  role: string | null
  setAuth: (data: {
    accessToken: string
    refreshToken: string
    fullName: string
    email: string
    role: string
  }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      fullName: null,
      email: null,
      role: null,
      setAuth: (data) => set({ ...data }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          fullName: null,
          email: null,
          role: null,
        }),
    }),
    {
      name: "hireflow-auth", // localStorage key
    }
  )
)