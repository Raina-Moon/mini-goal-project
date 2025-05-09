"use client";

import { useRef, useState } from "react";
import GlobalButton from "@/components/ui/GlobalButton";
import { toast } from "sonner";
import ImageUpload from "/public/images/ImageUpload.png";
import { useAppDispatch } from "@/stores/hooks";
import { uploadPostImage } from "@/stores/slices/postSlice";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  duration: number;
  onSubmit: (data: { imageUrl: string; description: string }) => void;
}

export const PostModal = ({
  isOpen,
  onClose,
  title,
  duration,
  onSubmit,
}: PostModalProps) => {
  const dispatch = useAppDispatch();
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => fileInputRef.current?.click();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!image || !description) {
      toast.message("don’t ghost us—drop an image and some words");
      return;
    }

    try {
      const imageUrl = await dispatch(uploadPostImage(image)).unwrap();
      onSubmit({ imageUrl, description });
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("yikes! your pic didn’t make it");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-medium mb-4 text-center">you nailed it!</h2>
        <p className="text-sm mb-2 text-gray-700">
          <strong className="text-gray-900">Title:</strong> {title}
        </p>
        <p className="text-sm mb-4 text-gray-700">
          <strong className="text-gray-900">Duration:</strong> {duration} minutes
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />

        <div className="mb-3">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded-md border"
            />
          ) : (
            <img
              src={ImageUpload.src}
              alt="Upload an image"
              onClick={handleImageClick}
              className="w-full max-w-[200px] h-auto rounded-md cursor-pointer mx-auto block"
            />
          )}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="So, what's the vibe after nailing it?"
          className="w-full border-t p-2 mb-4 border-primary-200 focus:outline-none resize-none"
        />
        <div className="flex justify-center">
          <GlobalButton onClick={handleSubmit}>Post it</GlobalButton>
        </div>
      </div>
    </div>
  );
};
