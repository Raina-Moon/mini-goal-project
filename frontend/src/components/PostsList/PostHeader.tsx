interface PostHeaderProps {
    username: string;
    profileImage?: string;
  }
  
  const PostHeader = ({ username, profileImage }: PostHeaderProps) => (
    <div className="flex flex-row items-center gap-2 mb-2">
      <img
        src={profileImage || "/images/DefaultProfile.png"}
        alt={`${username}'s profile`}
        className="w-8 h-8 rounded-full object-cover"
      />
      <span className="text-sm font-medium text-gray-800">
        {username || "Unknown User"}
      </span>
    </div>
  );
  
  export default PostHeader;