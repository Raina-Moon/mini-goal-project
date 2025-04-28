"use client";

import { useCallback, useEffect, useState } from "react";
import { Post } from "@/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
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

interface NailedPostsTabProps {
  posts: Post[];
  userId: number | null;
}

const NailedPostsTab = ({ posts, userId }: NailedPostsTabProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Redux state
  const likedPosts = useAppSelector((state) => state.likes.likedPosts);
  const commentsByPost = useAppSelector((state) => state.comments.commentsByPost);
  const bookmarkedPosts = useAppSelector((state) => state.bookmarks.bookmarked);
  const likesStatus = useAppSelector((state) => state.likes.status);
  const commentsStatus = useAppSelector((state) => state.comments.status);
  const bookmarksStatus = useAppSelector((state) => state.bookmarks.status);
  const likesError = useAppSelector((state) => state.likes.error);
  const commentsError = useAppSelector((state) => state.comments.error);
  const bookmarksError = useAppSelector((state) => state.bookmarks.error);

  // Local state
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [likeStatus, setLikeStatus] = useState<{ [key: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [bookmarkStatus, setBookmarkStatus] = useState<{ [key: number]: boolean }>({});
  const [commentEdit, setCommentEdit] = useState<{ [key: number]: string }>({});

  const initializeData = useCallback(async () => {
    if (!userId) return;
    const status: { [key: number]: boolean } = {};
    const counts: { [key: number]: number } = {};
    const bookmarkStatusTemp: { [key: number]: boolean } = {};

    try {
      // Fetch liked posts
      await dispatch(fetchLikedPosts(userId)).unwrap();

      // Fetch bookmarked posts
      await dispatch(fetchBookmarkedPosts(userId)).unwrap();

      for (const post of posts) {
        // Like status from likedPosts
        status[post.post_id] = likedPosts.some((lp) => lp.post_id === post.post_id);

        // Like count (use initial post.like_count, updated by like/unlike)
        counts[post.post_id] = post.like_count;

        // Bookmark status
        bookmarkStatusTemp[post.post_id] = bookmarkedPosts.some(
          (bp) => bp.post_id === post.post_id
        );

        // Fetch comments
        await dispatch(fetchComments(post.post_id)).unwrap();
      }

      setLikeStatus(status);
      setLikeCounts(counts);
      setBookmarkStatus(bookmarkStatusTemp);
    } catch (err) {
      console.error("Failed to initialize data:", err);
    }
  }, [userId, posts, dispatch, likedPosts, bookmarkedPosts]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const sortedPosts = [...posts].sort((a, b) => {
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
    if (!userId) return;
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

  const submitComment = async (postId: number) => {
    if (!userId || !newComments[postId]) return;
    try {
      // Assuming username and profileImage are available (e.g., from auth state)
      const username = "user"; // Replace with actual username from auth state
      const profileImage = ""; // Replace with actual profileImage
      await dispatch(
        addComment({ userId, postId, content: newComments[postId], username, profileImage })
      ).unwrap();
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleEditComment = async (postId: number, commentId: number, content: string) => {
    try {
      await dispatch(editComment({ postId, commentId, content })).unwrap();
      setCommentEdit((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await dispatch(deleteComment({ postId, commentId })).unwrap();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const closePostModal = () => setSelectedPostIndex(null);

  const handleScroll = (e: React.WheelEvent) => {
    if (selectedPostIndex === null) return;
    if (e.deltaY > 0 && selectedPostIndex < sortedPosts.length - 1) {
      setSelectedPostIndex(selectedPostIndex + 1);
    } else if (e.deltaY < 0 && selectedPostIndex > 0) {
      setSelectedPostIndex(selectedPostIndex - 1);
    }
  };

  const handlePostClick = useCallback(
    (userId: number, postId: number) => {
      router.push(`${userId}/post/${postId}`);
    },
    [router]
  );

  return (
    <>
      {/* filter section */}
      <div className="flex justify-end mb-4">
        <Select onValueChange={setSortBy} defaultValue="latest">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Latest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most-time">Most Time</SelectItem>
            <SelectItem value="least-time">Shortest Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 3row grid */}
      <div className="grid grid-cols-3 gap-1">
        {sortedPosts.map((post) => (
          <div
            key={post.post_id}
            className="aspect-square cursor-pointer"
            onClick={() => handlePostClick(post.user_id ?? 0, post.post_id)}
          >
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* posts modal */}
      {selectedPostIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onWheel={handleScroll}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">
                {sortedPosts[selectedPostIndex].title}
              </h2>
              <button
                onClick={closePostModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {sortedPosts[selectedPostIndex].image_url && (
                <img
                  src={sortedPosts[selectedPostIndex].image_url}
                  alt={sortedPosts[selectedPostIndex].title}
                  className="w-full max-h-96 object-cover rounded mb-4"
                />
              )}
              <p className="text-sm text-gray-600 mb-2">
                Duration: {sortedPosts[selectedPostIndex].duration} min
              </p>
              <p className="text-sm text-gray-800 mb-4 whitespace-pre-wrap">
                {sortedPosts[selectedPostIndex].description}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() =>
                    handleLike(sortedPosts[selectedPostIndex].post_id)
                  }
                  className="text-pink-600 hover:underline"
                >
                  {likeStatus[sortedPosts[selectedPostIndex].post_id]
                    ? "❤️ Liked"
                    : "🤍 Like"}{" "}
                  (
                  {likeCounts[sortedPosts[selectedPostIndex].post_id] ||
                    sortedPosts[selectedPostIndex].like_count}
                  )
                </button>
                <button
                  onClick={() =>
                    handleBookmark(sortedPosts[selectedPostIndex].post_id)
                  }
                  className="text-yellow-500 hover:underline"
                >
                  {bookmarkStatus[sortedPosts[selectedPostIndex].post_id]
                    ? "⭐ Bookmarked"
                    : "☆ Bookmark"}
                </button>
              </div>
              <div>
                <input
                  value={
                    newComments[sortedPosts[selectedPostIndex].post_id] || ""
                  }
                  onChange={(e) =>
                    setNewComments((prev) => ({
                      ...prev,
                      [sortedPosts[selectedPostIndex].post_id]: e.target.value,
                    }))
                  }
                  placeholder="Add a comment..."
                  className="w-full border rounded px-2 py-1 text-sm mb-2"
                />
                <button
                  onClick={() =>
                    submitComment(sortedPosts[selectedPostIndex].post_id)
                  }
                  className="text-blue-500 text-sm"
                >
                  Post
                </button>
                <ul className="mt-2 space-y-2 text-sm">
                  {(
                    commentsByPost[sortedPosts[selectedPostIndex].post_id] || []
                  ).map((c) => (
                    <li key={c.id} className="flex items-center gap-2">
                      <strong>{c.username}:</strong>
                      <input
                        value={commentEdit[c.id] ?? c.content}
                        onChange={(e) =>
                          setCommentEdit((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        className="border rounded px-1 flex-1"
                      />
                      <button
                        onClick={() =>
                          handleEditComment(
                            sortedPosts[selectedPostIndex].post_id,
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
                          handleDeleteComment(
                            sortedPosts[selectedPostIndex].post_id,
                            c.id
                          )
                        }
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NailedPostsTab;