import { useRouter } from "next/navigation";

interface PostHeaderProps {
  userId: number | null;
  username: string;
  profileImage?: string;
}

const PostHeader = ({ userId, username, profileImage }: PostHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-row items-center gap-2 mb-2">
      <button onClick={() => router.push(`/dashboard/${userId}`)}>
        <img
          src={profileImage || "/images/DefaultProfile.png"}
          alt={`${username}'s profile`}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-gray-800">
          {username || "Unknown User"}
        </span>
      </button>
    </div>
  );
};

export default PostHeader;
