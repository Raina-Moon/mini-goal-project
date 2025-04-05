import VerticalDots from "../../../public/icons/VerticalDots";

interface CommentItemProps {
  comment: any;
  userId: number | null;
  isEditing: boolean;
  isDropdownOpen: boolean;
  editText: string;
  setEditTextMap: (map: any) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleDropdown: () => void;
  onSaveEdit: (commentId: number) => void;
  onCancelEdit: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

const CommentItem = ({
  comment,
  userId,
  isEditing,
  isDropdownOpen,
  editText,
  setEditTextMap,
  onEdit,
  onDelete,
  onToggleDropdown,
  onSaveEdit,
  onCancelEdit,
  inputRef,
}: CommentItemProps) => {
  const handleEditClick = () => {
    setEditTextMap((prev: any) => ({ ...prev, [comment.id]: comment.content }));
    onEdit();
    onToggleDropdown();
  };

  const handleDeleteClick = () => {
    onDelete();
    onToggleDropdown();
  };

  const handleCancelClick = () => {
    onCancelEdit();
  };

  return (
    <li className="text-sm py-1 relative">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <img
            src={comment.profile_image || "/images/DefaultProfile.png"}
            alt={`${comment.username}'s profile`}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="font-medium">{comment.username}</span>
        </div>
        {userId === comment.user_id && (
          <button onClick={onToggleDropdown} className="ml-2">
            <VerticalDots />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="pl-8 flex items-center gap-2">
          <textarea
            ref={inputRef}
            value={editText}
            onChange={(e) =>
              setEditTextMap((prev: any) => ({
                ...prev,
                [comment.id]: e.target.value,
              }))
            }
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none resize-none"
          />
          <button
            onClick={() => onSaveEdit(comment.id)}
            className="text-green-500 hover:text-green-700"
          >
            save
          </button>
          <button
            onClick={handleCancelClick}
            className="text-gray-500 hover:text-gray-700"
          >
            cancel
          </button>
        </div>
      ) : (
        <div className="pl-8">{comment.content}</div>
      )}

      {isDropdownOpen && userId === comment.user_id && (
        <div className="absolute right-2 top-8 bg-white border rounded shadow-lg z-10">
          <button
            onClick={handleEditClick}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
};

export default CommentItem;
