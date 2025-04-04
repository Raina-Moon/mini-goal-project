"use client";

import { useState, useCallback, useEffect } from "react";
import { Post } from "@/utils/api";
import { useLikes } from "@/app/contexts/LikesContext";
import { useComments } from "@/app/contexts/CommentsContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostsListProps {
  posts: Post[];
  userId: number | null;
}

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
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [bookmarkStatus, setBookmarkStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [commentEdit, setCommentEdit] = useState<{ [key: number]: string }>({});

  const filteredPosts = userId
    ? posts.filter((post) => Number(post.user_id) !== userId)
    : posts;

  const initializeData = useCallback(async () => {
    if (!userId) return;

    const status: { [key: number]: boolean } = {};
    const counts: { [key: number]: number } = {};
    const bookmarkStatusTemp: { [key: number]: boolean } = {};

    try {
      const bookmarkedPosts = await fetchBookmarkedPosts(userId);

      for (const post of filteredPosts) {
        if (post.user_id !== userId) {
          status[post.post_id] = await getLikeStatus(post.post_id, userId);
          counts[post.post_id] = await fetchLikeCount(post.post_id);
          bookmarkStatusTemp[post.post_id] = bookmarkedPosts.some((bp) => {
            const match = bp.id === post.post_id;
            return match;
          });
          await fetchComments(post.post_id); // Fetch comments for each post
        }
      }

      setLikeStatus(status);
      setLikeCounts(counts);
      setBookmarkStatus(bookmarkStatusTemp);
    } catch (err) {
      console.error("Failed to initialize data:", err);
    }
  }, [userId, posts]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleLike = async (postId: number) => {
    if (!userId) {
      return toast("log in to spread the love ❤️", {
        action: {
          label: "login",
          onClick: () => router.push("/login"),
        },
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
        action: {
          label: "login",
          onClick: () => router.push("/login"),
        },
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
      if (
        err instanceof Error &&
        err.message?.includes("Unexpected end of JSON input") &&
        isBookmarked
      ) {
      } else if (
        err instanceof Error &&
        err.message?.includes("Bookmark already exists")
      ) {
        setBookmarkStatus((prev) => ({ ...prev, [postId]: true }));
      } else {
        setBookmarkStatus((prev) => ({ ...prev, [postId]: isBookmarked }));
      }
    }
  };

  const submitComment = async (postId: number) => {
    if (!userId || !newComments[postId]) return;
    await addComment(userId, postId, newComments[postId]);
    setNewComments((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleEditComment = async (
    postId: number,
    commentId: number,
    content: string
  ) => {
    await editComment(postId, commentId, content);
    setCommentEdit((prev) => ({ ...prev, [commentId]: "" }));
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    await deleteComment(postId, commentId);
  };

  return (
    <>
      <div className="px-[27px]">
        <ul className="space-y-3">
          {filteredPosts.map((post) => (
            <li key={post.post_id} className="">
              <div className="flex flex-row items-center gap-2 mb-2">
                <img
                  src={post.profile_image || "/default-profile.png"}
                  alt={`${post.username}'s profile`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-800">
                  {post.username || "Unknown User"}
                </span>
              </div>

              <div className="border border-primary-200 rounded-lg p-4 bg-white shadow-sm">
                <h2 className="font-semibold text-gray-900">
                  title : {post.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  duration: {post.duration} min
                </p>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post Image"
                    className="w-full max-w-[600px] max-h-[750px] object-cover rounded-lg mb-2 mx-auto block"
                  />
                )}
                <p className="text-sm text-gray-800">{post.description}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleLike(post.post_id)}
                    className="text-pink-600 hover:underline"
                  >
                    {likeStatus[post.post_id] ? "❤️ Liked" : "🤍 Like"} (
                    {likeCounts[post.post_id] || post.like_count})
                  </button>
                  <button
                    onClick={() => handleBookmark(post.post_id)}
                    className="text-primary-400 hover:underline"
                  >
                    {bookmarkStatus[post.post_id]
                      ? "⭐ Bookmarked"
                      : "☆ Bookmark"}
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
                    placeholder="Leave a comment..."
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => submitComment(post.post_id)}
                    className="text-blue-500 text-sm mt-1"
                  >
                    Submit
                  </button>
                  <ul className="mt-2 space-y-1 text-sm">
                    {(commentsByPost[post.post_id] || post.comments || []).map(
                      (c) => (
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
                                  handleEditComment(
                                    post.post_id,
                                    c.id,
                                    commentEdit[c.id] || c.content
                                  )
                                }
                                className="text-green-500"
                              >
                                Save
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteComment(post.post_id, c.id)
                                }
                                className="text-red-500"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default PostsList;
