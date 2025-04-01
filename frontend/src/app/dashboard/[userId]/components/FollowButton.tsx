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
  const { followUser, unfollowUser, fetchFollowers } = useFollowers();

  const handleFollowToggle = async () => {
    if (!storedId) return;

    const newState = !isFollowing;
    setIsFollowing(newState);

    try {
      if (newState) {
        await followUser(storedId, userId);
        console.log(`Followed ${userId}`);
      } else {
        await unfollowUser(storedId, userId);
        console.log(`Unfollowed ${userId}`);
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
      alert(`Failed to update follow status: ${err.message || "Unknown error"}`);
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
