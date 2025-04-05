import { useState } from "react";
import ExternalLink from "../../../public/icons/ExternalLink";
import { toast } from "sonner";

interface PostContentProps {
  title: string;
  duration: number;
  imageUrl?: string;
  description: string;
}

const PostContent = ({
  title,
  duration,
  imageUrl,
  description,
}: PostContentProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link.");
    }
  };

  const handleShare = (platform: string) => {
    let url = "";
    const encodedUrl = encodeURIComponent(shareUrl);
    const message = encodeURIComponent(`Check out this post: ${title}`);

    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${message}%20${encodedUrl}`;
        break;
      case "instagram":
        url = `https://www.instagram.com/direct/inbox/?url=${encodedUrl}`;
        break;
      case "kakaotalk":
        url = `https://story.kakao.com/s/share?url=${encodedUrl}&text=${message}`;
        break;
      case "line":
        url = `https://line.me/R/msg/text/?${message}%20${encodedUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/messages/t/?url=${encodedUrl}&text=${message}`;
        break;
      default:
        return;
    }
    window.open(url, "_blank");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-gray-900">title : {title}</h2>
        <button onClick={() => setIsShareModalOpen(true)}>
          <ExternalLink />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">duration: {duration} min</p>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post Image"
          className="w-full max-w-[600px] max-h-[750px] object-cover rounded-lg mb-2 mx-auto block"
        />
      )}
      <p className="text-sm text-gray-900">{description}</p>

      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share this post</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full px-2 py-1 text-sm border rounded bg-gray-100"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Share
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleShare("whatsapp")}
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                WhatsApp
              </button>
              <button
                onClick={() => handleShare("instagram")}
                className="px-2 py-1 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                Instagram DM
              </button>
              <button
                onClick={() => handleShare("kakaotalk")}
                className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                KakaoTalk
              </button>
              <button
                onClick={() => handleShare("line")}
                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                LINE
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Facebook Msg
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostContent;
