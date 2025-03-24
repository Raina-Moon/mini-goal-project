interface Follower {
    id: number;
    username: string;
    profile_image: string | null;
  }
  
  interface FollowersListProps {
    followers: Follower[];
  }
  
  const FollowersList = ({ followers }: FollowersListProps) => (
    followers.length > 0 && (
      <ul className="mb-6 space-y-2">
        {followers.map((follower) => (
          <li key={follower.id} className="flex items-center gap-3">
            <img
              src={follower.profile_image ?? "/default-profile.png"}
              alt={follower.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-700">{follower.username}</span>
          </li>
        ))}
      </ul>
    )
  );
  
  export default FollowersList;