"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { usePosts } from "./contexts/PostContext";
import { Post } from "@/utils/api";
import GoalForm from "../components/GoalForm";
import PostsList from "@/components/PostsList";

const Page = () => {
  const { user } = useAuth();
  const { fetchAllPosts } = usePosts();

  const [posts, setPosts] = useState<Post[]>([]);

  const fetchAndShufflePosts = useCallback(async () => {
    try {
      const allPosts = await fetchAllPosts();
      console.log("Fetched Posts:", allPosts); // Debugging line
      const shuffledPosts = [...allPosts].sort(() => Math.random() - 0.5);
      setPosts(shuffledPosts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }, [fetchAllPosts]);

  useEffect(() => {
    fetchAndShufflePosts();
  }, [fetchAndShufflePosts, user]);

  return (
    <>
      <GoalForm />
      <hr className="mb-5 border-t mx-5 border-primary-200" />
      <PostsList posts={posts} userId={user ? Number(user.id) : null} />
    </>
  );
};

export default Page;
