import { fetchApi } from "./fetch";
import { safeLocalStorage } from "./localStorage";
import { User } from "./types";

export const signup = (username: string, email: string, password: string) =>
  fetchApi<User>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

export const login = async (email: string, password: string) => {
  const userData = await fetchApi<{
    username: any; token: string; user: User 
}>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  safeLocalStorage.setItem("token", userData.token);
  safeLocalStorage.setItem("userId", JSON.stringify(userData.user.id));
  return userData;
};

export const logout = () => {
  safeLocalStorage.removeItem("token");
  safeLocalStorage.removeItem("userId");
};

export const getStoredToken = () => safeLocalStorage.getItem("token");

export const getStoredUserId = () => {
  const id = safeLocalStorage.getItem("userId");
  return id ? JSON.parse(id) : null;
};

export const getProfile = (token: string, userId: number) =>
  fetchApi<User>(`/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (token: string, userId: number, username: string) =>
  fetchApi<User>(`/profile/${userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ username }),
  });

export const updateProfileImage = async (token: string, userId: number, file: File) => {
  const formData = new FormData();
  formData.append("profileImage", file);
  return fetchApi<User>(`/profile/${userId}/image-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
};

export const requestPasswordReset = (email: string) =>
  fetchApi<{ resetToken: string; message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const verifyResetCode = (email: string, reset_token: number) =>
  fetchApi<{ message: string }>("/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, reset_token }),
  });

export const resetPassword = (email: string, enteredCode: number, newPassword: string) =>
  fetchApi<{ message: string }>("/auth/reset-password", {
    method: "PATCH",
    body: JSON.stringify({ email, newPassword }),
  });