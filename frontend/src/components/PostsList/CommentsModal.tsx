import { useState, useEffect, useRef } from "react";
import { Comment } from "@/utils/api";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface CommentsModalProps {
  postId: number;
  userId: number | null;
  comments: Comment[];
  onClose: () => void;
  addComment: (
    userId: number,
    postId: number,
    content: string,
    username: string,
    profileImage: string
  ) => Promise<Comment>;
  editComment: (postId: number, commentId: number, content: string) => Promise<Comment>;
  deleteComment: (postId: number, commentId: number) => Promise<{ postId: number; commentId: number }>;
}

const CommentsModal = ({
  postId,
  userId,
  comments,
  onClose,
  addComment,
  editComment,
  deleteComment,
}: CommentsModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [editTextMap, setEditTextMap] = useState<{ [key: number]: string }>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submitComment = async () => {
    if (!userId || !newComment.trim()) return;
    try {
      const username = "user"; 
      const profileImage = ""; // Fetch from auth state or props
      await addComment(userId, postId, newComment, username, profileImage);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleEditComment = async (commentId: number) => {
    const newContent = editTextMap[commentId];
    if (!userId || !newContent?.trim()) return;
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

  useEffect(() => {
    if (editingCommentId && inputRef.current) inputRef.current.focus();
  }, [editingCommentId]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white p-4 rounded-lg shadow-lg w-[90%] min-w-[300px] max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg text-gray-900 font-semibold mb-2">
            comments {comments.length > 0 && <span>{comments.length}</span>}
          </h2>
          <hr className="border-t border-primary-200 mb-1" />
          <CommentList
            comments={comments}
            userId={userId}
            editingCommentId={editingCommentId}
            dropdownOpen={dropdownOpen}
            editTextMap={editTextMap}
            setEditTextMap={setEditTextMap}
            setEditingCommentId={setEditingCommentId}
            setDropdownOpen={setDropdownOpen}
            setDeleteConfirmId={setDeleteConfirmId}
            handleEditComment={handleEditComment}
            inputRef={inputRef}
          />
          <CommentForm
            newComment={newComment}
            setNewComment={setNewComment}
            submitComment={submitComment}
            userId={userId}
          />
        </div>
      </div>
      {deleteConfirmId && (
        <DeleteConfirmModal
          onConfirm={() => handleDeleteComment(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </>
  );
};

export default CommentsModal;