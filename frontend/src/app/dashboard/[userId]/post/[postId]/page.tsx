"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Post } from "@/utils/api";
import { usePosts } from "@/app/contexts/PostContext";
import { useAuth } from "@/app/contexts/AuthContext";
import PostDetail from "./PostDetail";

const PostDetailPage = () => {
  const { user } = useAuth();
  const { fetchNailedPosts } = usePosts();
  const { userId, postId } = useParams() as { userId: string; postId: string };

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [initialScrollDone, setInitialScrollDone] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    if (initialScrollDone || posts.length === 0 || !containerRef.current)
      return;
    const container = containerRef.current;
    const selectedEl = postRefs.current[selectedIndex];
    if (!selectedEl) return;
    const containerHeight = container.clientHeight;
    const elTop = selectedEl.offsetTop;
    const elHeight = selectedEl.clientHeight;
    const scrollPos = elTop - containerHeight / 2 + elHeight / 2;
    container.scrollTo({ top: scrollPos, behavior: "smooth" });
    setInitialScrollDone(true);
  }, [posts, selectedIndex, initialScrollDone]);

  if (posts.length === 0) return <div>Loading...</div>;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-white overflow-y-auto">
      {posts.map((post, index) => (
        <div
          key={post.post_id}
          ref={(el) => {
            postRefs.current[index] = el;
          }}
        >
          <PostDetail post={post} userId={user?.id ?? null} />
        </div>
      ))}
    </div>
  );
};

export default PostDetailPage;
