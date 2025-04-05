import PaperPlaneIcon from "../../../public/icons/PaperPlaneIcon";

interface CommentFormProps {
  newComment: string;
  setNewComment: (text: string) => void;
  submitComment: () => void;
  userId: number | null;
}

const CommentForm = ({ newComment, setNewComment, submitComment, userId }: CommentFormProps) => (
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
);

export default CommentForm;