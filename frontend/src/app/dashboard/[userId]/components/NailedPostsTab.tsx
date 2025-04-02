import { useCallback, useEffect, useState } from "react";
import { Post } from "@/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useLikes } from "@/app/contexts/LikesContext";
import { useComments } from "@/app/contexts/CommentsContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";

interface NailedPostsTabProps {
  posts: Post[];
  userId: number | null;
}

const NailedPostsTab = ({ posts, userId }: NailedPostsTabProps) => {
  const { likePost, unlikePost, getLikeStatus, fetchLikeCount } = useLikes();
  const {
    commentsByPost,
    fetchComments,
    addComment,
    editComment,
    deleteComment,
  } = useComments();
  const { bookmarkPost, unbookmarkPost, fetchBookmarkedPosts } = useBookmarks();

  const [sortBy, setSortBy] = useState("latest");
  const [likeStatus, setLikeStatus] = useState<{ [key: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [bookmarkStatus, setBookmarkStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [updatedPosts, setUpdatedPosts] = useState<Post[]>(posts);
  const [commentEdit, setCommentEdit] = useState<{ [key: number]: string }>({});

  const initializeData = useCallback(async () => {
    if (!userId) return;
    const status: { [key: number]: boolean } = {};
    const counts: { [key: number]: number } = {};
    const bookmarkStatusTemp: { [key: number]: boolean } = {};

    try {
      const bookmarkedPosts = await fetchBookmarkedPosts(userId);

      for (const post of posts) {
        status[post.post_id] = await getLikeStatus(post.post_id, userId);
        counts[post.post_id] = await fetchLikeCount(post.post_id);
        bookmarkStatusTemp[post.post_id] = bookmarkedPosts.some((bp) => {
          const match = bp.id === post.post_id;
          return match;
        });
        await fetchComments(post.post_id); // Fetch comments for each post
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

  const sortedPosts = [...updatedPosts].sort((a, b) => {
    if (sortBy === "latest") return b.goal_id - a.goal_id;
    if (sortBy === "oldest") return a.goal_id - b.goal_id;
    if (sortBy === "most-time") return b.duration - a.duration;
    if (sortBy === "least-time") return a.duration - b.duration;
    return 0;
  });

  const handleLike = async (postId: number) => {
    if (!userId) return;
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
    if (!userId) return;
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
      <div className="flex justify-end mb-2">
        <Select onValueChange={setSortBy} defaultValue="latest">
          <SelectTrigger className="w-40" />
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most-time">Most Time</SelectItem>
            <SelectItem value="least-time">Shortest Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ul className="space-y-3">
        {sortedPosts.map((post) => (
          <li
            key={post.goal_id}
            className="border border-emerald-300 bg-emerald-50 rounded-lg p-4"
          >
            <h2 className="text-lg font-semibold text-emerald-700">
              {post.title}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Duration: {post.duration} min
            </p>
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post Image"
                className="w-full max-h-64 object-cover rounded mb-2"
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
                {(commentsByPost[post.post_id] || []).map((c) => (
                  <li key={c.id}>
                    <strong>{c.username}:</strong> {c.content}
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
                      onClick={() => handleDeleteComment(post.post_id, c.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default NailedPostsTab;
