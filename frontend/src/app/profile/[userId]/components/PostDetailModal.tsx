"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Post } from "@/utils/api";
import { useRouter } from "next/navigation";
import HeartFull from "../../../../../public/icons/HeartFull";
import HeartEmpty from "../../../../../public/icons/HeartEmpty";
import MessageIcon from "../../../../../public/icons/MessageIcon";
import BookmarkFull from "../../../../../public/icons/BookmarkFull";
import BookmarkEmpty from "../../../../../public/icons/BookmarkEmpty";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

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
  fetchBookmarkedPostDetail,
  bookmarkPost,
  unbookmarkPost,
} from "@/stores/slices/bookmarksSlice";
import CommentsModal from "@/components/PostsList/CommentsModal";

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
  const dispatch = useAppDispatch();
  const router = useRouter();

  const likedPosts = useAppSelector((state) => state.likes.likedPosts);
  const commentsByPost = useAppSelector(
    (state) => state.comments.commentsByPost[initialPost.post_id] || []
  );
  const bookmarkedPosts = useAppSelector((state) => state.bookmarks.bookmarked);
  const detailedBookmarked = useAppSelector((state) =>
    state.bookmarks.detailed.find((p) => p.post_id === initialPost.post_id)
  );

  const isLiked = likedPosts.some((lp) => lp.post_id === initialPost.post_id);
  const isBookmarked = bookmarkedPosts.some(
    (bp) => bp.post_id === initialPost.post_id
  );

  const [likeCount, setLikeCount] = useState(initialPost.like_count);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const initializeData = useCallback(async () => {
    if (!user.id || initialized) return;

    try {
      await dispatch(fetchLikedPosts(user.id)).unwrap();
      await dispatch(fetchBookmarkedPostDetail(user.id)).unwrap();
      await dispatch(fetchComments(initialPost.post_id)).unwrap();
      setInitialized(true);
    } catch (err) {
      console.error("Init failed:", err);
      setError("Failed to load post data");
    }
  }, [user.id, initialPost.post_id, initialized, dispatch]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleProfileClick = () => {
    router.push(`/dashboard/${initialPost.user_id}`);
  };

  const handleLike = async () => {
    if (!user.id) {
      router.push("/login");
      return;
    }
    setError(null);
    try {
      const action = isLiked
        ? dispatch(unlikePost({ userId: user.id, postId: initialPost.post_id }))
        : dispatch(likePost({ userId: user.id, postId: initialPost.post_id }));
      const newCount = await action.unwrap();
      setLikeCount(newCount);
    } catch (err) {
      console.error("Like failed:", err);
      setError("Failed to update like status");
    }
  };

  const handleBookmark = async () => {
    if (!user.id) {
      router.push("/login");
      return;
    }
    setError(null);
    try {
      if (isBookmarked) {
        await dispatch(unbookmarkPost({ userId: user.id, postId: initialPost.post_id })).unwrap();
      } else {
        await dispatch(bookmarkPost({ userId: user.id, postId: initialPost.post_id })).unwrap();
      }
      onBookmarkChange?.(initialPost.post_id, !isBookmarked);
    } catch (err) {
      console.error("Bookmark failed:", err);
      setError("Failed to update bookmark status");
    }
  };

  const handleCommentClick = () => setShowCommentsModal(true);

  const postData = detailedBookmarked ?? initialPost;

  return (
    <div
      className="fixed top-16 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded-lg max-w-md w-[85%]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-end gap-2 mb-2">
          <button onClick={handleProfileClick} className="flex items-center gap-2">
            <img
              src={postData.profile_image || "/images/DefaultProfile.png"}
              alt={`${postData.username || "User"}'s profile`}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-900">
              {postData.username || "User"}
            </span>
          </button>
        </div>

        <div className="mb-2">
          <span className="font-semibold text-gray-900">
            title: {postData.title}
          </span>
          <div className="flex justify-between items-center w-full text-sm text-gray-600">
            <span>duration: {postData.duration} min</span>
            {postData.created_at && (
              <span className="text-xs text-gray-500">
                {formatTimeAgo(String(postData.created_at))}
              </span>
            )}
          </div>
        </div>

        <img
          src={postData.image_url}
          alt="Post"
          className="w-full object-cover rounded-lg mb-2"
        />
        <p>{postData.description}</p>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}

        <div className="mt-2 flex justify-end gap-4">
          <button onClick={handleLike} className="flex items-center gap-1">
            {isLiked ? <HeartFull /> : <HeartEmpty />}
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          <button onClick={handleCommentClick} className="flex items-center gap-1">
            <MessageIcon />
            {commentsByPost.length > 0 && <span>{commentsByPost.length}</span>}
          </button>

          <button onClick={handleBookmark} className="flex items-center">
            {isBookmarked ? <BookmarkFull /> : <BookmarkEmpty />}
          </button>
        </div>
      </div>

      {showCommentsModal && (
        <CommentsModal
          postId={initialPost.post_id}
          userId={user.id}
          comments={commentsByPost}
          onClose={() => setShowCommentsModal(false)}
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
    </div>
  );
};

export default PostDetailModal;