import { useEffect, useRef } from "react";
import CommentItem from "./CommentItem";

interface CommentListProps {
  comments: any[];
  userId: number | null;
  editingCommentId: number | null;
  dropdownOpen: number | null;
  editTextMap: { [key: number]: string };
  setEditTextMap: (map: any) => void;
  setEditingCommentId: (id: number | null) => void;
  setDropdownOpen: (id: number | null) => void;
  setDeleteConfirmId: (id: number | null) => void;
  handleEditComment: (commentId: number) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const CommentList = ({
  comments,
  userId,
  editingCommentId,
  dropdownOpen,
  editTextMap,
  setEditTextMap,
  setEditingCommentId,
  setDropdownOpen,
  setDeleteConfirmId,
  handleEditComment,
  inputRef,
}: CommentListProps) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownOpen !== null &&
        listRef.current &&
        !listRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <ul ref={listRef} className="space-y-2 max-h-[400px] overflow-y-auto">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            userId={userId}
            isEditing={editingCommentId === comment.id}
            isDropdownOpen={dropdownOpen === comment.id}
            editText={editTextMap[comment.id] ?? comment.content}
            setEditTextMap={setEditTextMap}
            onEdit={() => setEditingCommentId(comment.id)}
            onDelete={() => setDeleteConfirmId(comment.id)}
            onToggleDropdown={() =>
              setDropdownOpen(dropdownOpen === comment.id ? null : comment.id)
            }
            onSaveEdit={handleEditComment}
            inputRef={inputRef}
          />
        ))
      ) : (
        <li className="text-sm text-gray-500">No comments yet.</li>
      )}
    </ul>
  );
};

export default CommentList;
