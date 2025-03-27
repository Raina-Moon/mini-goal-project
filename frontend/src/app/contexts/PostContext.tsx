"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Post } from "@/utils/api";
import { fetchApi } from "@/utils/api/fetch";
import { useAuth } from "./AuthContext";

interface PostState {
  nailedPosts: Post[];
  fetchNailedPosts: (
    profileUserId: number,
    viewerUserId: number
  ) => Promise<void>;
  createPost: (
    userId: number,
    goalId: number,
    imageUrl: string,
    description: string
  ) => Promise<void>;
  uploadPostImage: (imageFile: File) => Promise<string>;
}

const PostContext = createContext<PostState | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [nailedPosts, setNailedPosts] = useState<Post[]>([]);

  const fetchNailedPosts = async (
    profileUserId: number,
    viewerUserId: number
  ) => {
    if (!token) return;
    const posts = await fetchApi<Post[]>(
      `/posts/nailed/${profileUserId}?viewerId=${viewerUserId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setNailedPosts(posts);
  };

  const createPost = async (
    userId: number,
    goalId: number,
    imageUrl: string,
    description: string
  ) => {
    if (!token) return;
    const newPost = await fetchApi<{
      id: number;
      user_id: number;
      goal_id: number;
      image_url: string;
      description: string;
    }>("/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        user_id: userId,
        goal_id: goalId,
        image_url: imageUrl,
        description,
      }),
    });
    const formattedPost: Post = {
      post_id: newPost.id,
      goal_id: newPost.goal_id,
      image_url: newPost.image_url,
      description: newPost.description,
      title: "",
      duration: 0,
      like_count: 0,
      liked_by_me: false,
      comments: [],
    };
    setNailedPosts((prev) => [...prev, formattedPost]);
  };

  const uploadPostImage = async (imageFile: File) => {
    if (!token) return "";
    const formData = new FormData();
    formData.append("image", imageFile);
    const data = await fetchApi<{ imageUrl: string }>("/posts/upload-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return data.imageUrl;
  };

  const value = {
    nailedPosts,
    fetchNailedPosts,
    createPost,
    uploadPostImage,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) throw new Error("usePosts must be used within a PostProvider");
  return context;
};
