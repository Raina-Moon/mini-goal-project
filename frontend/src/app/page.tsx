"use client";

import { useRouter } from "next/navigation";
import GoalForm from "../components/GoalForm";
import { useAuth } from "./contexts/AuthContext";
import { useLikes } from "./contexts/LikesContext";
import { useComments } from "./contexts/CommentsContext";
import { useBookmarks } from "./contexts/BookmarksContext";
import { useCallback, useEffect, useState } from "react";
import { Post } from "@/utils/api";
import { usePosts } from "./contexts/PostContext";
import PostsList from "@/components/PostsList";

const page = () => {
  const { user } = useAuth();
  const { getLikeStatus, fetchLikeCount } = useLikes();
  const { fetchComments } = useComments();
  const { fetchBookmarkedPosts } = useBookmarks();
  const { fetchAllPosts } = usePosts();

  const [posts, setPosts] = useState<Post[]>([]);
  const [likeStatus, setLikeStatus] = useState<{ [key: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [bookmarkStatus, setBookmarkStatus] = useState<{
    [key: number]: boolean;
  }>({});

  const fetchAndShufflePosts = useCallback(async () => {
    try {
      const allPosts = await fetchAllPosts();
      // Shuffle the remaining posts randomly
      const shuffledPosts = [...allPosts].sort(() => Math.random() - 0.5);
      setPosts(shuffledPosts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }, [fetchAllPosts]);

  // Initialize like, bookmark, and comment data for each post
  const initializeData = useCallback(async () => {
    if (!user?.id) return;
    const status: { [key: number]: boolean } = {};
    const counts: { [key: number]: number } = {};
    const bookmarkStatusTemp: { [key: number]: boolean } = {};

    try {
      const bookmarkedPosts = await fetchBookmarkedPosts(user.id);

      for (const post of posts) {
        status[post.post_id] = await getLikeStatus(post.post_id, user.id);
        counts[post.post_id] = await fetchLikeCount(post.post_id);
        bookmarkStatusTemp[post.post_id] = bookmarkedPosts.some(
          (bp) => bp.post_id === post.post_id
        );
        await fetchComments(post.post_id); // Fetch comments for each post
      }

      setLikeStatus(status);
      setLikeCounts(counts);
      setBookmarkStatus(bookmarkStatusTemp);
    } catch (err) {
      console.error("Failed to initialize data:", err);
    }
  }, [user, posts, getLikeStatus, fetchLikeCount, fetchComments, fetchBookmarkedPosts]);

  useEffect(() => {
    fetchAndShufflePosts();
  }, [fetchAndShufflePosts]);

  useEffect(() => {
    if (posts.length > 0) {
      initializeData();
    }
  }, [posts, initializeData])

  const router = useRouter();
  const handleGoalCreated = () => {
    if (user) {
      router.push(`/dashboard/${user.id}`);
    }
  };

  return (
    <>
      <GoalForm onGoalCreated={handleGoalCreated} />
      <PostsList
          posts={posts}
          userId={user?.id || null}
          likeStatus={likeStatus}
          setLikeStatus={setLikeStatus}
          likeCounts={likeCounts}
          setLikeCounts={setLikeCounts}
          bookmarkStatus={bookmarkStatus}
          setBookmarkStatus={setBookmarkStatus}
        />
    </>
  );
};

export default page;
