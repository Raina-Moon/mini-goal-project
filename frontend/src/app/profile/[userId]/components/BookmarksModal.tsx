"use client";

import React from "react";
import GoBackArrow from "../../../../../public/icons/GoBackArrow";
import { Post } from "@/utils/api";

interface BookmarksModalProps {
  bookmarkedPosts: Post[];
  onClose: () => void;
  onSelectPost: (post: Post) => void;
}

const BookmarksModal: React.FC<BookmarksModalProps> = ({
  bookmarkedPosts,
  onClose,
  onSelectPost,
}) => {
  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex flex-col z-10">
      <div className="flex items-center justify-start p-4 border-b border-gray-200">
        <button className="text-zinc-600" onClick={onClose}>
          <GoBackArrow />
        </button>
        <h2 className="text-lg font-semibold ml-4">Saved Posts</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {bookmarkedPosts.map((post) => (
            <img
              key={post.id}
              src={post.image_url}
              alt="Bookmarked Post"
              className="w-full h-auto aspect-square object-cover"
              onClick={() => onSelectPost(post)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookmarksModal;