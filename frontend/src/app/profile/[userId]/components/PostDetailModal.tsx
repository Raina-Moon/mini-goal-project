"use client";

import React from "react";
import { Post } from "@/utils/api";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  return (
    <div className="fixed top-16 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <h2 className="text-lg font-semibold">{post.title}</h2>
        <img src={post.image_url} alt="Post" className="w-full h-auto object-cover" />
        <p>{post.description}</p>
        <button className="mt-2 text-zinc-600 text-xs" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PostDetailModal;