"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedPostRef = useRef<HTMLDivElement>(null);

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
  }, [userId, postId, fetchNailedPosts]);

  useEffect(() => {
    if (hasAutoScrolled) return;
    if (posts.length > 0 && selectedPostRef.current && containerRef.current) {
      const container = containerRef.current;
      const selectedEl = selectedPostRef.current;
      const containerHeight = container.clientHeight;
      const elTop = selectedEl.offsetTop;
      const elHeight = selectedEl.clientHeight;
      const scrollPos = elTop - containerHeight / 2 + elHeight / 2;
      container.scrollTo({ top: scrollPos, behavior: "smooth" });
      setHasAutoScrolled(true);
    }
  }, [posts, selectedIndex, hasAutoScrolled]);

  // Handle vertical scroll to navigate between posts

  if (posts.length === 0) return <div>Loading...</div>;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-white overflow-y-auto">
      {posts.map((post, index) => (
        <div
          key={post.post_id}
          ref={index === selectedIndex ? selectedPostRef : null}
          className="mb-4"
        >
          <PostDetail post={post} />
        </div>
      ))}
    </div>
  );
};

export default PostDetailPage;
