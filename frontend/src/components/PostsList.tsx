"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Post } from "@/utils/api";
import { useLikes } from "@/app/contexts/LikesContext";
import { useComments } from "@/app/contexts/CommentsContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import PostItem from "./PostsList/PostItem";
import CommentsModal from "./PostsList/CommentsModal";

interface PostsListProps {
  posts: Post[];
  userId: number | null;
}

const POSTS_PER_PAGE = 10;

const PostsList = ({ posts, userId }: PostsListProps) => {
  const { likePost, unlikePost, getLikeStatus, fetchLikeCount } = useLikes();
  const {
    commentsByPost,
    fetchComments,
    addComment,
    editComment,
    deleteComment,
  } = useComments();
  const { bookmarkPost, unbookmarkPost, fetchBookmarkedPosts } = useBookmarks();
  const router = useRouter();

  const [likeStatus, setLikeStatus] = useState<{ [key: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [bookmarkStatus, setBookmarkStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [modalPostId, setModalPostId] = useState<number | null>(null);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const filteredPosts = useMemo(
    () =>
      userId ? posts.filter((post) => Number(post.user_id) !== userId) : posts,
    [posts, userId]
  );

  const initializeData = useCallback(async () => {
    const status: { [key: number]: boolean } = {};
    const counts: { [key: number]: number } = {};
    const bookmarkStatusTemp: { [key: number]: boolean } = {};

    try {
      await Promise.all(
        filteredPosts.map(async (post) => {
          await fetchComments(post.post_id);
          counts[post.post_id] = await fetchLikeCount(post.post_id);
          if (userId) {
            status[post.post_id] = await getLikeStatus(post.post_id, userId);
            const bookmarkedPosts = await fetchBookmarkedPosts(userId);
            bookmarkStatusTemp[post.post_id] = bookmarkedPosts.some(
              (bp) => bp.id === post.post_id
            );
          } else {
            status[post.post_id] = false;
            bookmarkStatusTemp[post.post_id] = false;
          }
        })
      );
      setLikeStatus(status);
      setLikeCounts(counts);
      setBookmarkStatus(bookmarkStatusTemp);
    } catch (err) {
      console.error("Failed to initialize data:", err);
    }
  }, [userId, filteredPosts]);

  // Load more posts when the user scrolls to the bottom of the page
  const loadPosts = useCallback(() => {
    const start = (page - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const newPosts = filteredPosts.slice(0, end);
    setDisplayedPosts(newPosts);
  }, [page, filteredPosts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading && displayedPosts.length < filteredPosts.length) {
        setIsLoading(true);
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, displayedPosts.length, filteredPosts.length]
  );

  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        threshold: 0.1, // Trigger when 10% of the target is visible
      });
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [handleObserver]);

  useEffect(() => {
    if (isLoading) {
      loadPosts();
      setIsLoading(false);
    }
  }, [isLoading, loadPosts]);

  const handleLike = async (postId: number) => {
    if (!userId) {
      return toast("log in to spread the love ❤️", {
        action: { label: "login", onClick: () => router.push("/login") },
      });
    }
    const alreadyLiked = likeStatus[postId] || false;
    try {
      const newCount = alreadyLiked
        ? await unlikePost(userId, postId)
        : await likePost(userId, postId);
      const newLikeStatus = await getLikeStatus(postId, userId);
      setLikeStatus((prev) => ({ ...prev, [postId]: newLikeStatus }));
      setLikeCounts((prev) => ({ ...prev, [postId]: newCount }));
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleBookmark = async (postId: number) => {
    if (!userId) {
      return toast("wanna save that gem? gotta log in first 💎", {
        action: { label: "login", onClick: () => router.push("/login") },
      });
    }
    const isBookmarked = bookmarkStatus[postId] || false;
    const newState = !isBookmarked;
    setBookmarkStatus((prev) => ({ ...prev, [postId]: newState }));
    try {
      if (isBookmarked) {
        await unbookmarkPost(userId, postId);
      } else {
        await bookmarkPost(userId, postId);
      }
    } catch (err) {
      console.error("Bookmark action failed:", err);
      setBookmarkStatus((prev) => ({ ...prev, [postId]: isBookmarked }));
    }
  };

  const openCommentsModal = (postId: number) => setModalPostId(postId);
  const closeCommentsModal = () => setModalPostId(null);

  return (
    <>
      <div className="px-[27px]">
        <ul className="space-y-9">
          {displayedPosts.map((post) => (
            <PostItem
              key={post.post_id}
              post={post}
              userId={userId}
              likeStatus={likeStatus[post.post_id] || false}
              likeCount={likeCounts[post.post_id] || post.like_count}
              commentCount={
                (commentsByPost[post.post_id] || post.comments || []).length
              }
              bookmarkStatus={bookmarkStatus[post.post_id] || false}
              onLike={handleLike}
              onCommentClick={openCommentsModal}
              onBookmark={handleBookmark}
            />
          ))}
        </ul>

        {displayedPosts.length < filteredPosts.length && (
          <div ref={loadMoreRef} className="py-4 text-center">
            {isLoading ? "Loading more posts..." : "Scroll to load more"}
          </div>
        )}
        
      </div>
      {modalPostId && (
        <CommentsModal
          postId={modalPostId}
          userId={userId}
          comments={commentsByPost[modalPostId] || []}
          onClose={closeCommentsModal}
          addComment={addComment}
          editComment={editComment}
          deleteComment={deleteComment}
        />
      )}
    </>
  );
};

export default PostsList;
