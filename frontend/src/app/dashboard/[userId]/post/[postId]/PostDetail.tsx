"use client";

import { Post } from "@/utils/api";

interface PostDetailProps {
  post: Post;
}

const PostDetail = ({ post }: PostDetailProps) => {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full object-cover rounded mb-4"
        />
      )}
      <p className="text-gray-700 mb-4">{post.description}</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-1">⏱️</span> {post.duration} min
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-1">❤️</span> {post.like_count}
        </div>
      </div>
      {/* Optional: Comments Section */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Comments</h2>
          <ul className="space-y-2">
            {post.comments.map((c: any) => (
              <li key={c.id} className="text-sm">
                <strong>{c.username}: </strong>
                {c.content}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
