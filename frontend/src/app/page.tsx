"use client";

import { useCallback, useEffect, useState } from "react";
import { Post } from "@/utils/api";
import GoalForm from "../components/GoalForm";
import PostsList from "@/components/PostsList";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { fetchAllPosts } from "@/stores/slices/postSlice";

const Page = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const allPosts = useAppSelector((state) => state.posts.allPosts);

  const [posts, setPosts] = useState<Post[]>([]);

  const fetchAndShufflePosts = useCallback(async () => {
    try {
      const viewerId = user ? Number(user.id) : undefined;
      await dispatch(fetchAllPosts(viewerId)).unwrap();
      const shuffledPosts = [...allPosts].sort(() => Math.random() - 0.5);
      setPosts(shuffledPosts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }, [allPosts, user]);

  useEffect(() => {
    fetchAndShufflePosts();
  }, [fetchAndShufflePosts]);

  return (
    <>
      <GoalForm />
      <hr className="mb-5 border-t mx-5 border-primary-200" />
      <PostsList posts={posts} userId={user ? Number(user.id) : null} />
    </>
  );
};

export default Page;
