import { fetchApi } from "./fetch";
import { User } from "./types";

export const signup = (username: string, email: string, password: string) =>
  fetchApi<User>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

export const login = (email: string, password: string) =>
  fetchApi<{
    token: string;
    user: User;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getProfile = (token: string, userId: number) =>
  fetchApi<User>(`/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (
  token: string,
  userId: number,
  username: string
) =>
  fetchApi<User>(`/profile/${userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ username }),
  });

export const updateProfileImage = async (
  token: string,
  userId: number,
  file: File
) => {
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

export const resetPassword = (
  email: string,
  enteredCode: number,
  newPassword: string
) =>
  fetchApi<{ message: string }>("/auth/reset-password", {
    method: "PATCH",
    body: JSON.stringify({ email, newPassword, reset_token: enteredCode }),
  });
