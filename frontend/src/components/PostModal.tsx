import { useState } from "react";
import GlobalButton from "@/components/ui/GlobalButton";

const PostModal = ({ isOpen, onClose, title, duration, onSubmit }: any) => {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = () => {
    if (!image || !description) {
      alert("Please provide image and description!");
      return;
    }

    onSubmit({ image, description });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          🎉 Post Your Success!
        </h2>
        <p className="text-sm mb-2 text-gray-700">
          <strong>Title:</strong> {title}
        </p>
        <p className="text-sm mb-4 text-gray-700">
          <strong>Duration:</strong> {duration} minutes
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-3"
        />

        {previewImage && (
          <div className="mb-3">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded-md border"
            />
          </div>
        )}

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write something about this win..."
          className="w-full border rounded p-2 mb-4"
        />
        <div className="flex justify-between">
          <GlobalButton onClick={handleSubmit}>Post</GlobalButton>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-black"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
