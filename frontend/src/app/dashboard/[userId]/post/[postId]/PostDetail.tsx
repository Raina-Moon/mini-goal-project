"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/utils/api";
import { useLikes } from "@/app/contexts/LikesContext";
import { useComments } from "@/app/contexts/CommentsContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import CommentsModal from "@/components/PostsList/CommentsModal";

import HeartFull from "../../../../../../public/icons/HeartFull";
import HeartEmpty from "../../../../../../public/icons/HeartEmpty";
import MessageIcon from "../../../../../../public/icons/MessageIcon";
import BookmarkFull from "../../../../../../public/icons/BookmarkFull";
import BookmarkEmpty from "../../../../../../public/icons/BookmarkEmpty";

interface PostDetailProps {
  post: Post;
  userId: number | null;
}

const PostDetail = ({ post, userId }: PostDetailProps) => {
  const router = useRouter();

  const { likePost, unlikePost, getLikeStatus, fetchLikeCount } = useLikes();
  const {
    commentsByPost,
    fetchComments,
    addComment,
    editComment,
    deleteComment,
  } = useComments();
  const {
    bookmarkPost,
    unbookmarkPost,
    fetchBookmarkedPosts,
  } = useBookmarks();

  const [likeStatus, setLikeStatus] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkStatus, setBookmarkStatus] = useState(false);
  const [modalPostId, setModalPostId] = useState<number | null>(null);

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchComments(post.post_id);
        const count = await fetchLikeCount(post.post_id);
        setLikeCount(count);

        if (userId) {
          const liked = await getLikeStatus(post.post_id, userId);
          setLikeStatus(liked);

          const bookmarkedPosts = await fetchBookmarkedPosts(userId);
          const isBookmarked = bookmarkedPosts.some(
            (bp) => bp.id === post.post_id
          );
          setBookmarkStatus(isBookmarked);
        }
      } catch (err) {
        console.error("Failed to load post interaction data:", err);
      }
    };

    initialize();
  }, [post, userId]);

  const handleLike = async () => {
    if (!userId) {
      return router.push("/login");
    }

    try {
      const newCount = likeStatus
        ? await unlikePost(userId, post.post_id)
        : await likePost(userId, post.post_id);
      const newStatus = await getLikeStatus(post.post_id, userId);
      setLikeStatus(newStatus);
      setLikeCount(newCount);
    } catch (err) {
      console.error("Failed to update like status:", err);
    }
  };

  const handleBookmark = async () => {
    if (!userId) {
      return router.push("/login");
    }

    const newState = !bookmarkStatus;
    setBookmarkStatus(newState);

    try {
      if (newState) {
        await bookmarkPost(userId, post.post_id);
      } else {
        await unbookmarkPost(userId, post.post_id);
      }
    } catch (err) {
      console.error("Failed to update bookmark status:", err);
      setBookmarkStatus(!newState); // rollback
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-4">
        <div className="border border-primary-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between mb-2">
            <h2 className="font-semibold text-gray-900">{post.title}</h2>
            <p className="text-sm text-gray-600">
              Duration: {post.duration} min
            </p>
          </div>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post Image"
              className="w-full max-w-[600px] max-h-[750px] object-cover rounded-lg mb-2 mx-auto block"
            />
          )}

          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {post.description}
          </p>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-900"
            >
              {likeStatus ? <HeartFull /> : <HeartEmpty />}
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            <button
              onClick={() => setModalPostId(post.post_id)}
              className="flex items-center gap-1"
            >
              <MessageIcon />
              {commentsByPost[post.post_id]?.length > 0 && (
                <span>{commentsByPost[post.post_id].length}</span>
              )}
            </button>

            <button
              onClick={handleBookmark}
              className="text-primary-400 hover:underline"
            >
              {bookmarkStatus ? <BookmarkFull /> : <BookmarkEmpty />}
            </button>
          </div>
        </div>
      </div>

      {modalPostId !== null && userId !== null && (
        <CommentsModal
          postId={modalPostId}
          userId={userId}
          comments={commentsByPost[modalPostId] || []}
          onClose={() => setModalPostId(null)}
          addComment={addComment}
          editComment={editComment}
          deleteComment={deleteComment}
        />
      )}
    </>
  );
};

export default PostDetail;
