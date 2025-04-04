"use client";

import { useState, useCallback, useEffect } from "react";
import { Post } from "@/utils/api";
import { useLikes } from "@/app/contexts/LikesContext";
import { useComments } from "@/app/contexts/CommentsContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import HeartEmpty from "../../public/icons/HeartEmpty";
import HeartFull from "../../public/icons/HeartFull";
import MessageIcon from "../../public/icons/MessageIcon";
import BookmarkEmpty from "../../public/icons/BookmarkEmpty";
import BookmarkFull from "../../public/icons/BookmarkFull";
import { useModal } from "@/stores/useModal";

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
  const { open } = useModal();

  const [likeStatus, setLikeStatus] = useState<{ [key: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
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

      await Promise.all(
        filteredPosts.map(async (post) => {
          status[post.post_id] = userId
            ? await getLikeStatus(post.post_id, userId)
            : false;
          counts[post.post_id] = await fetchLikeCount(post.post_id);
          bookmarkStatusTemp[post.post_id] = userId
            ? bookmarkedPosts.some((bp) => bp.id === post.post_id)
            : false;
          await fetchComments(post.post_id);
        })
      );

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

  const CommentsModalContent = ({ postId }: { postId: number }) => {
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
      fetchComments(postId);
    }, [postId, fetchComments]);

    const submitComment = async () => {
      if (!userId || !newComment.trim()) return;
      try {
        await addComment(userId, postId, newComment);
        setNewComment("");
        await fetchComments(postId);
      } catch (err) {
        console.error("Failed to submit comment:", err);
      }
    };

    const handleEditComment = async (commentId: number, content: string) => {
      try {
        await editComment(postId, commentId, content);
        setCommentEdit((prev) => ({ ...prev, [commentId]: "" }));
        await fetchComments(postId);
      } catch (err) {
        console.error("Failed to edit comment:", err);
      }
    };

    const handleDeleteComment = async (commentId: number) => {
      try {
        await deleteComment(postId, commentId);
        await fetchComments(postId);
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    };

    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
          {commentsByPost[postId]?.length > 0 ? (
            commentsByPost[postId].map((c) => (
              <li key={c.id} className="text-sm">
                <strong>{c.username}:</strong> {c.content}
                {userId === c.user_id && (
                  <div className="mt-1">
                    <input
                      value={commentEdit[c.id] ?? c.content}
                      onChange={(e) =>
                        setCommentEdit((prev) => ({
                          ...prev,
                          [c.id]: e.target.value,
                        }))
                      }
                      className="border rounded px-1 mr-2 text-sm"
                    />
                    <button
                      onClick={() =>
                        handleEditComment(c.id, commentEdit[c.id] || c.content)
                      }
                      className="text-green-500 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500">No comments yet.</li>
          )}
        </ul>
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => {
              console.log("Textarea value:", e.target.value);
              setNewComment(e.target.value);
            }}
            placeholder="Leave a comment..."
            className="w-full border rounded px-2 py-1 text-sm"
            disabled={!userId}
          />
          <button
            onClick={submitComment}
            className="text-blue-500 text-sm mt-1"
            disabled={!userId}
          >
            Submit
          </button>
        </div>
      </div>
    );
  };

  const openCommentsModal = (postId: number) => {
    open(<CommentsModalContent postId={postId} />);
  };

  return (
    <>
      <div className="px-[27px]">
        <ul className="space-y-9">
          {filteredPosts.map((post) => {
            const commentCount = (
              commentsByPost[post.post_id] ||
              post.comments ||
              []
            ).length;

            return (
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
                  <p className="text-sm text-gray-900">{post.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleLike(post.post_id)}
                      className="text-gray-900 flex flex-row gap-1"
                    >
                      {likeStatus[post.post_id] ? (
                        <HeartFull />
                      ) : (
                        <HeartEmpty />
                      )}{" "}
                      {(likeCounts[post.post_id] || post.like_count) > 0 && (
                        <span>
                          {likeCounts[post.post_id] || post.like_count}
                        </span>
                      )}{" "}
                    </button>
                    <button
                      onClick={() => openCommentsModal(post.post_id)}
                      className="flex flex-row gap-1 items-center"
                    >
                      <MessageIcon />
                      {commentCount > 0 && <span>{commentCount}</span>}
                    </button>
                    <button
                      onClick={() => handleBookmark(post.post_id)}
                      className="text-primary-400 hover:underline"
                    >
                      {bookmarkStatus[post.post_id] ? (
                        <BookmarkFull />
                      ) : (
                        <BookmarkEmpty />
                      )}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default PostsList;
