import { useFollowers } from "@/app/contexts/FollowerContext";

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
  const { followUser, unfollowUser } = useFollowers();
  const handleFollowToggle = async () => {
    if (!storedId) return;
    try {
      if (isFollowing) {
        await unfollowUser(storedId, userId);
      } else {
        await followUser(storedId, userId);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      alert("Failed to update follow status");
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      className={`mb-2 px-3 py-2 rounded text-white ${
        isFollowing
          ? "bg-gray-500 hover:bg-gray-600"
          : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;
