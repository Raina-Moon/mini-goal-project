"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/utils/api";
import { fetchApi } from "@/utils/api/fetch";

interface AuthState {
  token: string | null;
  user: User | null;
  viewUser: User | null;
  isLoggedIn: boolean;
  fetchViewUser: (id: number) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
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
  verifyCurrentPassword: (
    email: string,
    currentPassword: string
  ) => Promise<boolean>;
  changePassword: (
    email: string,
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const fetchViewUser = async (id: number) => {
    try {
      const data = await fetchApi<User>(`/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewUser(data);
    } catch (err) {
      console.error("Failed to fetch viewed user:", err);
    }
  };

  // Function to verify the token
  const verifyToken = async (storedToken: string) => {
    try {
      const response = await fetchApi<{ valid: boolean }>(
        "/auth/verify-token",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      return response.valid;
    } catch (err) {
      console.error("Token verification failed:", err);
      return false;
    }
  };

  // Function to verify the current password
  const verifyCurrentPassword = async (
    email: string,
    currentPassword: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/verify-current-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, currentPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Current password is incorrect");
      }
      return true;
    } catch (err: any) {
      throw new Error(err.message || "Error verifying current password");
    }
  };

  // Function to change the password
  const changePassword = async (
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }
    } catch (err: any) {
      throw new Error(err.message || "Error changing password");
    }
  };

  // Initialize state from localStorage on first render
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        const isValid = await verifyToken(storedToken);
        if (isValid) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const signup = async (username: string, email: string, password: string) => {
    try {
      const userData = await fetchApi<{ token: string; user: User }>(
        "/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        }
      );
      setToken(userData.token);
      setUser(userData.user);
      setIsLoggedIn(true);
      localStorage.setItem(TOKEN_KEY, userData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData.user));
    } catch (err: any) {
      if (err.message.includes("Username already exists")) {
        throw new Error("Username is already taken");
      }
      throw err; // Re-throw other errors
    }
  };

  const login = async (email: string, password: string) => {
    const userData = await fetchApi<{ token: string; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    setToken(userData.token);
    setUser(userData.user);
    setIsLoggedIn(true);
    localStorage.setItem(TOKEN_KEY, userData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const getProfile = async (userId: number) => {
    if (!token) return;
    const userProfile = await fetchApi<User>(`/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(userProfile);
    localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
  };

  const updateProfile = async (userId: number, username: string) => {
    if (!token) return;
    if (!username || username.trim() === "") {
      throw new Error("Username cannot be empty");
    }
    try {
      const updatedUser = await fetchApi<User>(`/profile/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (err: any) {
      if (err.message === "Username already exists") {
        throw new Error("Username is already taken");
      }
      throw new Error("Failed to update profile");
    }
  };

  const updateProfileImage = async (userId: number, file: File) => {
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
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  const requestPasswordReset = async (email: string) => {
    return fetchApi<{ resetToken: string; message: string }>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  };

  const verifyResetCode = async (email: string, reset_token: number) => {
    return fetchApi<{ message: string }>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, reset_token }),
    });
  };

  const resetPassword = async (
    email: string,
    enteredCode: number,
    newPassword: string
  ) => {
    return fetchApi<{ message: string }>("/auth/reset-password", {
      method: "PATCH",
      body: JSON.stringify({ email, newPassword, reset_token: enteredCode }),
    });
  };

  const value = {
    token,
    user,
    isLoggedIn,
    viewUser,
    fetchViewUser,
    signup,
    login,
    logout,
    getProfile,
    updateProfile,
    updateProfileImage,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    verifyCurrentPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
