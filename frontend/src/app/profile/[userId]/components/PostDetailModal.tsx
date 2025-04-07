"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Post } from "@/utils/api";
import { useRouter } from "next/navigation";
import HeartFull from "../../../../../public/icons/HeartFull";
import HeartEmpty from "../../../../../public/icons/HeartEmpty";
import MessageIcon from "../../../../../public/icons/MessageIcon";
import BookmarkFull from "../../../../../public/icons/BookmarkFull";
import BookmarkEmpty from "../../../../../public/icons/BookmarkEmpty";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import { useLikes } from "@/app/contexts/LikesContext";
import { useComments } from "@/app/contexts/CommentsContext";
import CommentsModal from "@/components/PostsList/CommentsModal";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  user: { id: number; username: string; profile_image?: string | null };
  onBookmarkChange?: (postId: number, isBookmarked: boolean) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  user,
  onBookmarkChange,
}) => {
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

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Post in PostDetailModal:", post); // Debugging line
    if (!post.id) {
      setError("Post ID is missing");
      return;
    }

  // Fetch initial data when the component mounts or user changes
    const initializeData = async () => {
      try {
        const likeStatus = await getLikeStatus(post.id, user.id);
        const count = await fetchLikeCount(post.id);
        const bookmarkedPosts = await fetchBookmarkedPosts(user.id);
        const bookmarkStatus = bookmarkedPosts.some(
          (bp) => bp.id === post.id
        );
        await fetchComments(post.id);

        setIsLiked(likeStatus);
        setLikeCount(count);
        setIsBookmarked(bookmarkStatus);
      } catch (err) {
        console.error("Failed to initialize post data:", err);
        setError("Failed to load post data");
      }
    };

    if (user.id) {
      initializeData();
    }
  }, [
    post.id,
    user.id,
   
  ]);

  const handleProfileClick = useCallback(() => {
    router.push(`/dashboard/${post.user_id}`);
  }, [router, post.user_id]);

  const handleLike = async () => {
    if (!user.id) {
      router.push("/login");
      return;
    }
    try {
      setError(null);
      console.log("Liking post:", post.id); // Debugging line
      const newCount = isLiked
        ? await unlikePost(user.id, post.id)
        : await likePost(user.id, post.id);
      const newLikeStatus = await getLikeStatus(post.id, user.id);
      setIsLiked(newLikeStatus);
      setLikeCount(newCount);
    } catch (err) {
      console.error("Like action failed:", err);
      setError("Failed to update like status");
    }
  };

  const handleBookmark = async () => {
    if (!user.id) {
      router.push("/login");
      return;
    }
    try {
      setError(null);
      console.log("Bookmarking post:", post.id); // Debugging line
      const newState = !isBookmarked;
      newState
        ? await bookmarkPost(user.id, post.id)
        : await unbookmarkPost(user.id, post.id);
      setIsBookmarked(newState);
      onBookmarkChange?.(post.id, newState); // Notify parent component if provided
    } catch (err) {
      console.error("Bookmark action failed:", err);
      setError("Failed to update bookmark status");
    }
  };

  const handleCommentClick = () => {
    if (!post.id) {
      setError("Cannot load comments: Post ID is missing");
      return;
    }
    setShowCommentsModal(true);
  };

  return (
    <div className="fixed top-16 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleProfileClick}
            className="flex flex-row items-center gap-2"
          >
            <img
              src={post.profile_image || "/images/DefaultProfile.png"}
              alt={`${post.username || "Unknown User"}'s profile`}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-800">
              {post.username || "Unknown User"}
            </span>
          </button>
        </div>

        <h2 className="text-lg font-semibold">{post.title}</h2>
        <img
          src={post.image_url}
          alt="Post"
          className="w-full h-auto object-cover"
        />
        <p>{post.description}</p>

        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={handleLike}
            className="text-gray-900 flex flex-row gap-1"
          >
            {isLiked ? <HeartFull /> : <HeartEmpty />}
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button
            onClick={handleCommentClick}
            className="flex flex-row gap-1 items-center"
          >
            <MessageIcon />
            {commentsByPost[post.id]?.length > 0 && (
              <span>{commentsByPost[post.id].length}</span>
            )}
          </button>
          <button
            onClick={handleBookmark}
            className="text-primary-400 hover:underline"
          >
            {isBookmarked ? <BookmarkFull /> : <BookmarkEmpty />}
          </button>
        </div>

        <button className="mt-2 text-zinc-600 text-xs" onClick={onClose}>
          Close
        </button>
      </div>

      {showCommentsModal && (
        <CommentsModal
          postId={post.id}
          userId={user.id}
          comments={commentsByPost[post.id] || []}
          onClose={() => setShowCommentsModal(false)}
          addComment={addComment}
          editComment={editComment}
          deleteComment={deleteComment}
        />
      )}
    </div>
  );
};

export default PostDetailModal;
