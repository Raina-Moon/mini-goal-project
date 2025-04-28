import { useAppDispatch } from "@/stores/hooks";
import { followUser, unfollowUser } from "@/stores/slices/followSlice";
import { toast } from "sonner";

interface FollowButtonProps {
  storedId: number | null;
  userId: number;
  isFollowing: boolean;
}

const FollowButton = ({ storedId, userId, isFollowing }: FollowButtonProps) => {
  const dispatch = useAppDispatch();

  const handleFollowToggle = async () => {
    if (!storedId) {
      toast.error("Yo must be logged in to follow someone.");
      return;
    }

    try {
      if (isFollowing) {
        await dispatch(
          unfollowUser({ followerId: storedId, followingId: userId })
        ).unwrap();
      } else {
        await dispatch(
          followUser({ followerId: storedId, followingId: userId })
        ).unwrap();
      }
    } catch (err: any) {
      console.error("Follow toggle error:", err);
      toast.error(
        `Couldn’t ${isFollowing ? "unfollow" : "follow"}: ${
          err.message || "Unknown error"
        }`
      );
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      className={`px-[6px] py-[6px] rounded-[100px] text-white text-xs ${
        isFollowing
          ? "bg-gray-500 hover:bg-gray-600"
          : "bg-primary-500 hover:bg-primary-600"
      }`}
    >
      {isFollowing ? "bye-bye vibe" : "vibe with you"}
    </button>
  );
};

export default FollowButton;
