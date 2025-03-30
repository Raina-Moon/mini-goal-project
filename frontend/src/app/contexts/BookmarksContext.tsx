"use client";

import { createContext, useContext, ReactNode } from "react";
import { fetchApi } from "@/utils/api/fetch";
import { Post } from "@/utils/api";

interface BookmarksState {
  bookmarkPost: (userId: number, postId: number) => Promise<void>;
  unbookmarkPost: (userId: number, postId: number) => Promise<void>;
  fetchBookmarkedPosts: (userId: number) => Promise<Post[]>;
}

const BookmarksContext = createContext<BookmarksState | undefined>(undefined);

export const BookmarksProvider = ({ children }: { children: ReactNode }) => {
  const bookmarkPost = async (userId: number, postId: number) => {
    await fetchApi("/bookmarks", {
      method: "POST",
      body: JSON.stringify({ userId, postId }),
    });
  };

  const unbookmarkPost = async (userId: number, postId: number) => {
    await fetchApi(`/bookmarks/${userId}/${postId}`, {
      method: "DELETE",
    });
  };

  const fetchBookmarkedPosts = async (userId: number) => {
    return await fetchApi<Post[]>(`/bookmarks/${userId}`);
  };

  const value: BookmarksState = {
    bookmarkPost,
    unbookmarkPost,
    fetchBookmarkedPosts,
  };

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
};

export const useBookmarks = () => {
  const context = useContext(BookmarksContext);
  if (!context) throw new Error("useBookmarks must be used within a BookmarksProvider");
  return context;
};