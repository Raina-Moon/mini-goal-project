import BookmarkEmpty from "../../../public/icons/BookmarkEmpty";
import BookmarkFull from "../../../public/icons/BookmarkFull";
import HeartEmpty from "../../../public/icons/HeartEmpty";
import HeartFull from "../../../public/icons/HeartFull";
import MessageIcon from "../../../public/icons/MessageIcon";


interface PostActionsProps {
  postId: number;
  likeStatus: boolean;
  likeCount: number;
  commentCount: number;
  bookmarkStatus: boolean;
  onLike: (postId: number) => void;
  onCommentClick: (postId: number) => void;
  onBookmark: (postId: number) => void;
}

const PostActions = ({
  postId,
  likeStatus,
  likeCount,
  commentCount,
  bookmarkStatus,
  onLike,
  onCommentClick,
  onBookmark,
}: PostActionsProps) => (
<div className="mt-2 flex items-center justify-end gap-2">    <button onClick={() => onLike(postId)} className="text-gray-900 flex flex-row gap-1">
      {likeStatus ? <HeartFull /> : <HeartEmpty />}
      {likeCount > 0 && <span>{likeCount}</span>}
    </button>
    <button
      onClick={() => onCommentClick(postId)}
      className="flex flex-row gap-1 items-center"
    >
      <MessageIcon />
      {commentCount > 0 && <span>{commentCount}</span>}
    </button>
    <button onClick={() => onBookmark(postId)} className="text-primary-400 hover:underline">
      {bookmarkStatus ? <BookmarkFull /> : <BookmarkEmpty />}
    </button>
  </div>
);

export default PostActions;