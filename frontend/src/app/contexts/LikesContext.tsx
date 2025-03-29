"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Like } from "@/utils/api";
import { fetchApi } from "@/utils/api/fetch";

interface LikeState {
  likedPosts: Like[];
  fetchLikedPosts: (userId: number) => Promise<Like[]>;
  getLikeStatus: (postId: number, userId: number) => Promise<boolean>;
  likePost: (userId: number, postId: number) => Promise<void>;
  unlikePost: (userId: number, postId: number) => Promise<void>;
}

const Likecontext = createContext<LikeState | undefined>(undefined);

export const LikesProvider = ({ children }: { children: ReactNode }) => {
  const [likedPosts, setLikedPosts] = useState<Like[]>([]);

  const fetchLikedPosts = async (userId: number) => {
    const posts = await fetchApi<Like[]>(`/likes/${userId}`);
    setLikedPosts(posts);
    return posts;
  };

  const getLikeStatus = async (postId: number, userId: number) => {
    const { liked } = await fetchApi<{ liked: boolean }>(
      `/likes/status/${postId}/${userId}`
    );
    return liked;
  };

  const likePost = async (userId: number, postId: number) => {
    const like = await fetchApi<{ user_id: number; post_id: number }>(
      "/likes",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId, post_id: postId }),
      }
    );
    setLikedPosts((prev) => [...prev, like]);
  };

  const unlikePost = async (userId: number, postId: number) => {
    await fetchApi<{ message: string }>("/likes", {
      method: "DELETE",
      body: JSON.stringify({ user_id: userId, post_id: postId }),
    });
    setLikedPosts((prev) => prev.filter((like) => like.post_id !== postId));
  };

  const value = {
    likedPosts,
    fetchLikedPosts,
    getLikeStatus,
    likePost,
    unlikePost,
  };

  return <Likecontext.Provider value={value}>{children}</Likecontext.Provider>;
};

export const useLikes = () => {
  const context = useContext(Likecontext);
  if (context === undefined) {
    throw new Error("useLikes must be used within a LikesProvider");
  }
  return context;
};
