import { useFollowers } from "@/app/contexts/FollowerContext";
import { toast } from "sonner";

interface FollowButtonProps {
  storedId: number | null;
  userId: number;
  isFollowing: boolean;
  setIsFollowing: (value: boolean) => void;
}

const FollowButton = ({
  storedId,
  userId,
  isFollowing,
  setIsFollowing,
}: FollowButtonProps) => {
  const { followUser, unfollowUser, fetchFollowers } = useFollowers();

  const handleFollowToggle = async () => {
    if (!storedId) return;

    const newState = !isFollowing;
    setIsFollowing(newState);

    try {
      if (newState) {
        await followUser(storedId, userId);
      } else {
        await unfollowUser(storedId, userId);
      }
      const updatedFollowers = await fetchFollowers(userId);
      const isNowFollowing = (updatedFollowers ?? []).some(
        (f) => f.id === storedId
      );
      setIsFollowing(isNowFollowing);
    } catch (err: any) {
      console.error("Toggle error:", err);
      if (err.message.includes("duplicate key value")) {
        setIsFollowing(true);
      } else if (err.message.includes("Not following")) {
        setIsFollowing(false); 
      } else {
        setIsFollowing(!newState); 
      }
      toast.error(`Failed to update follow status: ${err.message || "Unknown error"}`);
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
