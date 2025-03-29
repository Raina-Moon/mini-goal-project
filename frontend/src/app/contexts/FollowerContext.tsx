"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/utils/api";
import { fetchApi } from "@/utils/api/fetch";
import { useAuth } from "./AuthContext";

interface FollowerState {
  followers: User[];
  fetchFollowers: (userId: number) => Promise<void>;
  followUser: (followerId: number, followingId: number) => Promise<void>;
  unfollowUser: (followerId: number, followingId: number) => Promise<void>;
}

const FollowerContext = createContext<FollowerState | undefined>(undefined);

export const FollowerProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [followers, setFollowers] = useState<User[]>([]);

  const fetchFollowers = async (userId: number) => {
    if (!token) return;
    const followersData = await fetchApi<User[]>(`/followers/followers/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFollowers(followersData);
  };

  const followUser = async (followerId: number, followingId: number) => {
    if (!token) return;
    await fetchApi<{ follower_id: number; following_id: number }>("/followers", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
    });
    await fetchFollowers(followingId);
  };

  const unfollowUser = async (followerId: number, followingId: number) => {
    if (!token) return;
    await fetchApi<{ message: string }>("/followers", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
    });
    await fetchFollowers(followingId);
  };

  const value = {
    followers,
    fetchFollowers,
    followUser,
    unfollowUser,
  };

  return <FollowerContext.Provider value={value}>{children}</FollowerContext.Provider>;
};

export const useFollowers = () => {
  const context = useContext(FollowerContext);
  if (!context) throw new Error("useFollowers must be used within a FollowerProvider");
  return context;
};