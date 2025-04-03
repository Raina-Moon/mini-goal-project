"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/utils/api";
import { useLikes } from "@/app/contexts/LikesContext";
import { useComments } from "@/app/contexts/CommentsContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";

interface PostsListProps {
  posts: Post[];
  userId: number | null;
  likeStatus: { [key: number]: boolean };
  setLikeStatus: (status: { [key: number]: boolean }) => void;
  likeCounts: { [key: number]: number };
  setLikeCounts: (counts: { [key: number]: number }) => void;
  bookmarkStatus: { [key: number]: boolean };
  setBookmarkStatus: (status: { [key: number]: boolean }) => void;
}

const PostsList = ({
  posts,
  userId,
  likeStatus,
  setLikeStatus,
  likeCounts,
  setLikeCounts,
  bookmarkStatus,
  setBookmarkStatus,
}: PostsListProps) => {
  const router = useRouter();
  const { likePost, unlikePost, getLikeStatus, fetchLikeCount } = useLikes();
  const { commentsByPost, addComment, editComment, deleteComment } = useComments();
  const { bookmarkPost, unbookmarkPost } = useBookmarks();

  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [commentEdit, setCommentEdit] = useState<{ [key: number]: string }>({});

  // Handlers for interactivity
  const handleLike = useCallback(
    async (postId: number) => {
      if (!userId) return;
      const alreadyLiked = likeStatus[postId] || false;
      try {
        const newCount = alreadyLiked
          ? await unlikePost(userId, postId)
          : await likePost(userId, postId);
        const newLikeStatus = await getLikeStatus(postId, userId);
        setLikeStatus({ ...likeStatus, [postId]: newLikeStatus });
        setLikeCounts({ ...likeCounts, [postId]: newCount });
      } catch (err) {
        console.error("Like failed:", err);
      }
    },
    [userId, likeStatus, likePost, unlikePost, getLikeStatus, setLikeStatus, setLikeCounts]
  );

  const handleBookmark = useCallback(
    async (postId: number) => {
      if (!userId) return;
      const isBookmarked = bookmarkStatus[postId] || false;
      const newState = !isBookmarked;

    setBookmarkStatus({ ...bookmarkStatus, [postId]: newState });

      try {
        if (isBookmarked) {
          await unbookmarkPost(userId, postId);
        } else {
          await bookmarkPost(userId, postId);
        }
      } catch (err) {
        console.error("Bookmark action failed:", err);
        setBookmarkStatus({ ...bookmarkStatus, [postId]: isBookmarked }); // Revert on error
      }
    },
    [userId, bookmarkStatus, bookmarkPost, unbookmarkPost, setBookmarkStatus]
  );

  const submitComment = useCallback(
    async (postId: number) => {
      if (!userId || !newComments[postId]) return;
      await addComment(userId, postId, newComments[postId]);
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    },
    [userId, addComment, newComments]
  );

  const handleEditComment = useCallback(
    async (postId: number, commentId: number, content: string) => {
      await editComment(postId, commentId, content);
      setCommentEdit((prev) => ({ ...prev, [commentId]: "" }));
    },
    [editComment]
  );

  const handleDeleteComment = useCallback(
    async (postId: number, commentId: number) => {
      await deleteComment(postId, commentId);
    },
    [deleteComment]
  );

  return (
    <ul className="space-y-6">
      {posts.map((post) => (
        <li
          key={post.post_id}
          className="border border-emerald-300 bg-emerald-50 rounded-lg p-4"
        >
          <div className="flex items-center mb-2">
            <img
              src={post.profile_image || "/images/DefaultProfile.png"}
              alt="User Avatar"
              className="w-8 h-8 rounded-full mr-2"
            />
            <span
              className="font-semibold text-emerald-700 cursor-pointer"
              onClick={() => router.push(`/dashboard/${post.user_id}`)}
            >
              {post.username}
            </span>
          </div>
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post Image"
              className="w-full max-h-96 object-cover rounded mb-2"
            />
          )}
          <h2 className="text-lg font-semibold text-emerald-700">{post.title}</h2>
          <p className="text-sm text-gray-800 mb-2">{post.description}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(post.post_id)}
              className="text-pink-600 hover:underline"
            >
              {likeStatus[post.post_id] ? "❤️ Liked" : "🤍 Like"} (
              {likeCounts[post.post_id] || 0})
            </button>
            <button
              onClick={() => handleBookmark(post.post_id)}
              className="text-primary-400 hover:underline"
            >
              {bookmarkStatus[post.post_id] ? "⭐ Bookmarked" : "☆ Bookmark"}
            </button>
          </div>
          <div className="mt-4">
            <input
              value={newComments[post.post_id] || ""}
              onChange={(e) =>
                setNewComments((prev) => ({
                  ...prev,
                  [post.post_id]: e.target.value,
                }))
              }
              placeholder="Add a comment..."
              className="w-full border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={() => submitComment(post.post_id)}
              className="text-blue-500 text-sm mt-1"
            >
              Post
            </button>
            <ul className="mt-2 space-y-1 text-sm">
              {(commentsByPost[post.post_id] || []).map((c) => (
                <li key={c.id}>
                  <strong>{c.username}:</strong> {c.content}
                  {userId === c.user_id && (
                    <>
                      <input
                        value={commentEdit[c.id] ?? c.content}
                        onChange={(e) =>
                          setCommentEdit((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        className="border rounded px-1 mx-1"
                      />
                      <button
                        onClick={() =>
                          handleEditComment(post.post_id, c.id, commentEdit[c.id] || c.content)
                        }
                        className="text-green-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDeleteComment(post.post_id, c.id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PostsList;