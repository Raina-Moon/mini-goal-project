// store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/utils/api";
import { fetchApi } from "@/utils/api/fetch";

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getProfile: (userId: number) => Promise<void>;
  updateProfile: (userId: number, username: string) => Promise<void>;
  updateProfileImage: (userId: number, file: File) => Promise<void>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ resetToken: string; message: string }>;
  verifyResetCode: (
    email: string,
    reset_token: number
  ) => Promise<{ message: string }>;
  resetPassword: (
    email: string,
    enteredCode: number,
    newPassword: string
  ) => Promise<{ message: string }>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      // login
      login: async (email: string, password: string) => {
        const userData = await fetchApi<{ token: string; user: User }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );
        set({
          token: userData.token,
          user: userData.user,
          isLoggedIn: true,
        });
      },

      // logout
      logout: () => {
        set({ token: null, user: null, isLoggedIn: false });
      },

      // fetch user profile
      getProfile: async (userId: number) => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        const userProfile = await fetchApi<User>(`/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: userProfile });
      },

      // update username
      updateProfile: async (userId: number, username: string) => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        const updatedUser = await fetchApi<User>(`/profile/${userId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username }),
        });
        set({ user: updatedUser });
      },

      // update profile image
      updateProfileImage: async (userId: number, file: File) => {
        const token = useAuthStore.getState().token;
        if (!token) return;
        const formData = new FormData();
        formData.append("profileImage", file);
        const updatedUser = await fetchApi<User>(
          `/profile/${userId}/image-upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        set({ user: updatedUser });
      },

      // request password reset
      requestPasswordReset: async (email: string) => {
        return fetchApi<{ resetToken: string; message: string }>(
          "/auth/forgot-password",
          {
            method: "POST",
            body: JSON.stringify({ email }),
          }
        );
      },

      // verify reset code
      verifyResetCode: async (email: string, reset_token: number) => {
        return fetchApi<{ message: string }>("/auth/verify-code", {
          method: "POST",
          body: JSON.stringify({ email, reset_token }),
        });
      },

      // reset password
      resetPassword: async (
        email: string,
        enteredCode: number,
        newPassword: string
      ) => {
        return fetchApi<{ message: string }>("/auth/reset-password", {
          method: "PATCH",
          body: JSON.stringify({
            email,
            reset_token: enteredCode,
            newPassword,
          }),
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;
