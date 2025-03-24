import { useState } from "react";
import { likePost, unlikePost, addComment, Post } from "@/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface NailedPostsTabProps {
  posts: Post[];
  userId: number | null;
}

const NailedPostsTab = ({ posts, userId }: NailedPostsTabProps) => {
  const [sortBy, setSortBy] = useState("latest");
  const [likeStatus, setLikeStatus] = useState<{ [key: number]: boolean }>(
    posts.reduce((acc, post) => ({ ...acc, [post.post_id]: post.liked_by_me }), {})
  );
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>(
    posts.reduce((acc, post) => ({ ...acc, [post.post_id]: post.like_count }), {})
  );
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});
  const [updatedPosts, setUpdatedPosts] = useState<Post[]>(posts);

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
      if (alreadyLiked) {
        await unlikePost(userId, postId);
        setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 1) - 1 }));
      } else {
        await likePost(userId, postId);
        setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      }
      setLikeStatus((prev) => ({ ...prev, [postId]: !alreadyLiked }));
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const submitComment = async (postId: number) => {
    if (!userId || !newComments[postId]) return;
    try {
      const comment = await addComment(userId, postId, newComments[postId]);
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
      setUpdatedPosts((prev) =>
        prev.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                comments: [
                  ...(post.comments || []),
                  { ...comment, username: comment.username || "Anonymous" },
                ],
              }
            : post
        )
      );
    } catch (err) {
      console.error("Comment failed:", err);
    }
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
            <h2 className="text-lg font-semibold text-emerald-700">{post.title}</h2>
            <p className="text-sm text-gray-600 mb-2">Duration: {post.duration} min</p>
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
            </div>
            <div className="mt-4">
              <input
                value={newComments[post.post_id] || ""}
                onChange={(e) =>
                  setNewComments((prev) => ({ ...prev, [post.post_id]: e.target.value }))
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
                {(post.comments || []).map((c) => (
                  <li key={c.id}>
                    <strong>{c.username}:</strong> {c.content}
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