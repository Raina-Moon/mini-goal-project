"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { fetchApi } from "@/utils/api/fetch";
import { Post } from "@/utils/api";
import { useAuth } from "./AuthContext";

interface PostState {
  nailedPosts: Post[];
  fetchNailedPosts: (userId: number) => Promise<Post[]>;
  fetchAllPosts: () => Promise<Post[]>;
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
  const [nailedPosts, setNailedPosts] = useState<Post[]>([]);
  const { user } = useAuth();

  const fetchNailedPosts = async (userId: number) => {
    const posts = await fetchApi<Post[]>(`/posts/nailed/${userId}`);
    setNailedPosts(posts);
    return posts;
  };

  const fetchAllPosts = async () => {
    const query = user?.id ? `?viewerId=${user.id}` : "";
    const posts = await fetchApi<Post[]>(`/posts${query}`);
    return posts;
  };

  const createPost = async (
    userId: number,
    goalId: number,
    imageUrl: string,
    description: string
  ) => {
    const newPost = await fetchApi<Post>("/posts", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        goal_id: goalId,
        image_url: imageUrl,
        description,
      }),
    });
    setNailedPosts((prev) => [...prev, newPost]);
  };

  const uploadPostImage = async (imageFile: File) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    const data = await fetchApi<{ imageUrl: string }>("/posts/upload-image", {
      method: "POST",
      body: formData,
    }).then((data) => data.imageUrl);
    return data;
  };

  const value: PostState = {
    nailedPosts,
    fetchNailedPosts,
    fetchAllPosts,
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
