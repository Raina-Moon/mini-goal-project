"use client";

import { useRouter } from "next/navigation";
import GoalForm from "../components/GoalForm";
import { useAuth } from "./contexts/AuthContext";
import { usePosts } from "./contexts/PostContext";
import { useCallback, useEffect, useState } from "react";
import { Post } from "@/utils/api";
import PostsList from "@/components/PostsList";

const Page = () => {
  const { user } = useAuth();
  const { fetchAllPosts } = usePosts();

  const [posts, setPosts] = useState<Post[]>([]);

  const fetchAndShufflePosts = useCallback(async () => {
    try {
      const allPosts = await fetchAllPosts();
      const shuffledPosts = [...allPosts].sort(() => Math.random() - 0.5);
      setPosts(shuffledPosts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }, [fetchAllPosts]);

  useEffect(() => {
    fetchAndShufflePosts();
  }, [fetchAndShufflePosts]);

  const router = useRouter();
  const handleGoalCreated = () => {
    if (user) {
      router.push(`/dashboard/${user.id}`);
    }
  };

  return (
    <>
      <GoalForm onGoalCreated={handleGoalCreated} />
      <PostsList posts={posts} userId={user?.id || null} />
    </>
  );
};

export default Page;