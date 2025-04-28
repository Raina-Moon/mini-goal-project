"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Post } from "@/utils/api";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  fetchLikedPosts,
  likePost,
  unlikePost,
} from "@/stores/slices/likesSlice";
import {
  fetchComments,
  addComment,
  editComment,
  deleteComment,
} from "@/stores/slices/commentsSlice";
import {
  fetchBookmarkedPosts,
  bookmarkPost,
  unbookmarkPost,
} from "@/stores/slices/bookmarksSlice";
import PostItem from "./PostsList/PostItem";
import CommentsModal from "./PostsList/CommentsModal";

interface PostsListProps {
  posts: Post[];
  userId: number | null;
}

const POSTS_PER_PAGE = 10;

const PostsList = ({ posts, userId }: PostsListProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const likedPosts = useAppSelector((state) => state.likes.likedPosts);
  const commentsByPost = useAppSelector((state) => state.comments.commentsByPost);
  const bookmarkedPosts = useAppSelector((state) => state.bookmarks.bookmarked);


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
      if (userId) {
        // Fetch liked posts
        await dispatch(fetchLikedPosts(userId)).unwrap();

        // Fetch bookmarked posts
        await dispatch(fetchBookmarkedPosts(userId)).unwrap();
      }

      await Promise.all(
        filteredPosts.map(async (post) => {
          // Fetch comments
          await dispatch(fetchComments(post.post_id)).unwrap();

          // Like count
          counts[post.post_id] = post.like_count;

          // Like status
          status[post.post_id] = userId
            ? likedPosts.some((lp) => lp.post_id === post.post_id)
            : false;

          // Bookmark status
          bookmarkStatusTemp[post.post_id] = userId
            ? bookmarkedPosts.some((bp) => bp.post_id === post.post_id)
            : false;
        })
      );

      setLikeStatus(status);
      setLikeCounts(counts);
      setBookmarkStatus(bookmarkStatusTemp);
    } catch (err) {
      console.error("Failed to initialize data:", err);
    }
  }, [userId, filteredPosts, dispatch, likedPosts, bookmarkedPosts]);

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
      if (
        target.isIntersecting &&
        !isLoading &&
        displayedPosts.length < filteredPosts.length
      ) {
        setIsLoading(true);
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, displayedPosts.length, filteredPosts.length]
  );

  useEffect(() => {
    if (loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        threshold: 0.1,
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
      const action = alreadyLiked
        ? dispatch(unlikePost({ userId, postId }))
        : dispatch(likePost({ userId, postId }));
      const result = await action.unwrap();
      setLikeStatus((prev) => ({ ...prev, [postId]: !alreadyLiked }));
      setLikeCounts((prev) => ({ ...prev, [postId]: result }));
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
        await dispatch(unbookmarkPost({ userId, postId })).unwrap();
      } else {
        await dispatch(bookmarkPost({ userId, postId })).unwrap();
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
          addComment={async (userId, postId, content, username, profileImage) =>
            await dispatch(
              addComment({ userId, postId, content, username, profileImage })
            ).unwrap()
          }
          editComment={async (postId, commentId, content) =>
            await dispatch(editComment({ postId, commentId, content })).unwrap()
          }
          deleteComment={async (postId, commentId) =>
            await dispatch(deleteComment({ postId, commentId })).unwrap()
          }
        />
      )}
    </>
  );
};

export default PostsList;