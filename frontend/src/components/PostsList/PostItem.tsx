import { Post } from "@/utils/api";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";

interface PostItemProps {
  post: Post;
  userId: number | null;
  likeStatus: boolean;
  likeCount: number;
  commentCount: number;
  bookmarkStatus: boolean;
  onLike: (postId: number) => void;
  onCommentClick: (postId: number) => void;
  onBookmark: (postId: number) => void;
}

const PostItem = ({
  post,
  likeStatus,
  likeCount,
  commentCount,
  bookmarkStatus,
  onLike,
  onCommentClick,
  onBookmark,
}: PostItemProps) => (
  <li className="">
    <PostHeader userId={post.user_id ?? null} username={post.username} profileImage={post.profile_image} />
    <div className="border border-primary-200 rounded-lg p-4 bg-white shadow-sm">
      <PostContent
        title={post.title}
        duration={post.duration}
        imageUrl={post.image_url}
        description={post.description}
      />
      <PostActions
        postId={post.post_id}
        likeStatus={likeStatus}
        likeCount={likeCount}
        commentCount={commentCount}
        bookmarkStatus={bookmarkStatus}
        onLike={onLike}
        onCommentClick={onCommentClick}
        onBookmark={onBookmark}
      />
    </div>
  </li>
);

export default PostItem;