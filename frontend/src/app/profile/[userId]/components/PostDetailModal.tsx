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
import { formatTimeAgo } from "@/utils/formatTimeAgo";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  user: { id: number; username: string; profile_image?: string | null };
  onBookmarkChange?: (postId: number, isBookmarked: boolean) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post: initialPost,
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
  const { bookmarkPost, unbookmarkPost, fetchBookmarkedPostDetail } =
    useBookmarks();
  const router = useRouter();

  const [post, setPost] = useState<Post>(initialPost);
  const [isLiked, setIsLiked] = useState(initialPost.liked_by_me || false);
  const [likeCount, setLikeCount] = useState(initialPost.like_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(
    initialPost.bookmarked_by_me || false
  );
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("Post in PostDetailModal:", post);

  useEffect(() => {
    // Fetch initial data when the component mounts or user changes
    const initializeData = async () => {
      try {
        const bookmarkedPosts = await fetchBookmarkedPostDetail(user.id);
        const detailedPost = bookmarkedPosts.find(
          (bp) => bp.post_id === initialPost.id
        );
        if (detailedPost) {
          setPost(detailedPost);
          setIsLiked(detailedPost.liked_by_me || false);
          setLikeCount(detailedPost.like_count || 0);
          setIsBookmarked(detailedPost.bookmarked_by_me || false);
        }

        const likeStatus = await getLikeStatus(initialPost.id, user.id);
        const count = await fetchLikeCount(initialPost.id);
        await fetchComments(initialPost.id);

        setIsLiked(likeStatus);
        setLikeCount(count);
      } catch (err) {
        console.error("Failed to initialize post data:", err);
        setError("Failed to load post data");
      }
    };

    if (user.id && initialPost.id) {
      initializeData();
    }
  }, [
    initialPost.id,
    user.id,
    fetchBookmarkedPostDetail,
    getLikeStatus,
    fetchLikeCount,
    fetchComments,
  ]);

  const handleProfileClick = useCallback(() => {
    if (post.user_id !== undefined) {
      router.push(`/dashboard/${post.user_id}`);
    }
  }, [router, post.user_id]);

  const handleLike = async () => {
    if (!user.id) {
      router.push("/login");
      return;
    }
    try {
      setError(null);
      const newCount = isLiked
        ? await unlikePost(user.id, post.post_id)
        : await likePost(user.id, post.post_id);
      const newLikeStatus = await getLikeStatus(post.post_id, user.id);
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
      const newState = !isBookmarked;
      newState
        ? await bookmarkPost(user.id, post.post_id)
        : await unbookmarkPost(user.id, post.post_id);
      setIsBookmarked(newState);
      onBookmarkChange?.(post.post_id, newState); // Notify parent component if provided
    } catch (err) {
      console.error("Bookmark action failed:", err);
      setError("Failed to update bookmark status");
    }
  };

  const handleCommentClick = () => {
    if (!post.post_id) {
      setError("Cannot load comments: Post ID is missing");
      return;
    }
    setShowCommentsModal(true);
  };

  return (
    <div
      className="fixed top-16 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded-lg max-w-md w-[85%]"
        onClick={(e) => e.stopPropagation()}
      >
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
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">
                {post.username || "Unknown User"}
              </span>
              <div className="text-xs text-gray-500">
                <span>{post.title}</span> • <span>{post.duration} min</span>
              </div>
            </div>
          </button>
        </div>

        {post.created_at && (
          <p className="text-xs text-gray-500">
            {formatTimeAgo(String(post.created_at))}
          </p>
        )}

        <h2 className="text-lg font-semibold">{post.title}</h2>
        <img
          src={post.image_url}
          alt="Post"
          className="w-full max-w-[600px] max-h-[750px] object-cover rounded-lg mb-2 mx-auto block"
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
      </div>

      {showCommentsModal && (
        <CommentsModal
          postId={post.post_id}
          userId={user.id}
          comments={commentsByPost[post.post_id] || []}
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
