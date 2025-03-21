// components/GlobalModal.tsx
"use client";

import React, { useEffect } from "react";
import { useModal } from "@/stores/useModal";

const GlobalModal = () => {
  const { isOpen, content, close } = useModal();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
        >
          ×
        </button>
        {content}
      </div>
    </div>
  );
};

export default GlobalModal;
