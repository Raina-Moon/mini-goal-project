"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Post } from "@/utils/api";
import { useLikes } from "@/app/contexts/LikesContext";
import { useComments } from "@/app/contexts/CommentsContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import HeartEmpty from "../../public/icons/HeartEmpty";
import HeartFull from "../../public/icons/HeartFull";
import MessageIcon from "../../public/icons/MessageIcon";
import BookmarkEmpty from "../../public/icons/BookmarkEmpty";
import BookmarkFull from "../../public/icons/BookmarkFull";
import PaperPlaneIcon from "../../public/icons/PaperPlaneIcon";
import VerticalDots from "../../public/icons/VerticalDots";

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
  const [bookmarkStatus, setBookmarkStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [modalPostId, setModalPostId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  const filteredPosts = userId
    ? posts.filter((post) => Number(post.user_id) !== userId)
    : posts;

  const initializeData = useCallback(async () => {
    // if (!userId) return;

    const status: { [key: number]: boolean } = {};
    const counts: { [key: number]: number } = {};
    const bookmarkStatusTemp: { [key: number]: boolean } = {};

    try {
      await Promise.all(
        filteredPosts.map(async (post) => {
          await fetchComments(post.post_id);
          counts[post.post_id] = await fetchLikeCount(post.post_id);

          if (userId) {
            status[post.post_id] = await getLikeStatus(post.post_id, userId);
            const bookmarkedPosts = await fetchBookmarkedPosts(userId);
            bookmarkStatusTemp[post.post_id] = bookmarkedPosts.some(
              (bp) => bp.id === post.post_id
            );
          } else {
            status[post.post_id] = false;
            bookmarkStatusTemp[post.post_id] = false;
          }
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
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [editTextMap, setEditTextMap] = useState<{ [key: number]: string }>(
      {}
    );

    const closeModal = () => {
      setModalPostId(null);
      setDropdownOpen(null);
      setEditingCommentId(null);
      setDeleteConfirmId(null);
      setEditText("");
    };

    const submitComment = async () => {
      if (!userId || !newComment.trim()) return;
      try {
        await addComment(userId, postId, newComment);
        setNewComment("");
      } catch (err) {
        console.error("Failed to submit comment:", err);
      }
    };

    const handleEditComment = async (commentId: number) => {
      const newContent = editTextMap[commentId];

      if (!userId || !editText.trim()) return;
      try {
        await editComment(postId, commentId, newContent);
        setEditingCommentId(null);
        setEditTextMap((prev) => ({ ...prev, [commentId]: "" }));
      } catch (err) {
        console.error("Failed to edit comment:", err);
      }
    };

    const handleDeleteComment = async (commentId: number) => {
      if (!userId) return;
      try {
        await deleteComment(postId, commentId);
        setDeleteConfirmId(null);
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    };

    const toggleDropdown = (commentId: number) => {
      setDropdownOpen(dropdownOpen === commentId ? null : commentId);
    };

    const startEditing = (commentId: number, content: string) => {
      //Debugging log
      console.log(
        "Start editing - Comment ID:",
        commentId,
        "Content:",
        content
      );
      setEditText(content);
      setEditingCommentId(commentId);
      setDropdownOpen(null);
    };

    const confirmDelete = (commentId: number) => {
      setDeleteConfirmId(commentId);
      setDropdownOpen(null);
    };

    useEffect(() => {
      if (editingCommentId && inputRef.current) {
        inputRef.current.focus();
        //Debugging log
        console.log(
          "Editing comment ID:",
          editingCommentId,
          "editText:",
          editText
        );
      }
    }, [editingCommentId]);

    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg w-[90%] min-w-[300px] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg text-gray-900 font-semibold mb-2">
              comments{" "}
              {commentsByPost[postId]?.length > 0 && (
                <span>{commentsByPost[postId].length}</span>
              )}
            </h2>
            <hr className="border-t border-primary-200 mb-1" />
            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {commentsByPost[postId]?.length > 0 ? (
                commentsByPost[postId].map((c) => (
                  <li key={c.id} className="text-sm py-1 relative">
                    <div className="flex flex-row gap-2 items-center">
                      <img
                        src={c.profile_image || "/images/DefaultProfile.png"}
                        alt={`${c.username}'s profile`}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-medium">{c.username}</span>
                      {userId === c.user_id && (
                        <button
                          onClick={() => toggleDropdown(c.id)}
                          className="ml-2"
                        >
                          <VerticalDots />
                        </button>
                      )}
                    </div>
                    {editingCommentId === c.id ? (
                      <div className="pl-8 flex items-center gap-2">
                        <textarea
                          ref={inputRef}
                          value={editTextMap[c.id] ?? c.content}
                          onChange={(e) =>
                            setEditTextMap((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border rounded"
                        />

                        <button
                          onClick={() => handleEditComment(c.id)}
                          className="text-green-500 hover:text-green-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="pl-8">{c.content}</div>
                    )}
                    {dropdownOpen === c.id && userId === c.user_id && (
                      <div className="absolute right-2 top-8 bg-white border rounded shadow-lg z-10">
                        <button
                          onClick={() => startEditing(c.id, c.content)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(c.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
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
            <div className="border-t border-primary-200 mb-4 flex flex-row items-center gap-2 mt-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Leave a comment..."
                className="w-full px-2 py-1 text-sm mt-2 focus:outline-none"
                disabled={!userId}
              />
              <button onClick={submitComment} disabled={!userId}>
                <PaperPlaneIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <p className="text-sm mb-4">say bye-bye to this comment? </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-1 text-sm text-gray-700 border rounded hover:bg-gray-100"
                >
                  Nah
                </button>
                <button
                  onClick={() => handleDeleteComment(deleteConfirmId)}
                  className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Bet
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const openCommentsModal = (postId: number) => {
    setModalPostId(postId);
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
                    src={post.profile_image || "/images/DefaultProfile.png"}
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
      {modalPostId && <CommentsModalContent postId={modalPostId} />}
    </>
  );
};

export default PostsList;
