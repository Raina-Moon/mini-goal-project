"use client";

import { Follower, User } from "@/utils/api";
import { useRouter } from "next/navigation";

interface FollowersListProps {
  followers: Follower[];
}

const FollowersList = ({ followers }: FollowersListProps) => {
  const router = useRouter();

  const goToDashboard = (userId: number) => {
    router.push(`/dashboard/${userId}`);
  }

  return (
  followers.length > 0 && (
    <ul className="mb-6 space-y-2">
      {followers.map((follower) => (
        <li onClick={() => goToDashboard(follower.id)} key={follower.id} className="flex items-center gap-3">
          <img
            src={follower.profile_image ?? "/images/DefaultProfile.png"}
            alt={follower.username}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-gray-700">{follower.username}</span>
        </li>
      ))}
    </ul>
  )
  );
};

export default FollowersList;
