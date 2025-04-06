"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post } from "@/utils/api";
import PostDetail from "./postDetail";
import { usePosts } from "@/app/contexts/PostContext";

const PostDetailPage = () => {
  const { fetchNailedPosts } = usePosts();
  const { userId, postId } = useParams() as { userId: string; postId: string };
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Fetch all posts for the user and set the selected index based on postId
  useEffect(() => {
    if (!userId) return;
    const numericUserId = Number(userId);
    fetchNailedPosts(numericUserId)
      .then((data) => {
        setPosts(data);
        const index = data.findIndex((p) => p.post_id === Number(postId));
        if (index !== -1) {
          setSelectedIndex(index);
        }
      })
      .catch((err) => {
        console.error("Error fetching posts", err);
      });
  }, [userId, postId]);

  // Memoize the selected post for rendering
  const selectedPost = useMemo(
    () => posts[selectedIndex],
    [posts, selectedIndex]
  );

  // Handle vertical scroll to navigate between posts
  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0 && selectedIndex < posts.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      router.push(`/dashboard/${userId}/post/${posts[newIndex].post_id}`);
    } else if (e.deltaY < 0 && selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      router.push(`/dashboard/${userId}/post/${posts[newIndex].post_id}`);
    }
  };

  if (posts.length === 0) return <div>Loading...</div>;

  return (
    <div
      className="fixed inset-0 bg-white overflow-y-auto"
      onWheel={handleScroll}
    >
      <PostDetail post={selectedPost} />
    </div>
  );
};

export default PostDetailPage;
