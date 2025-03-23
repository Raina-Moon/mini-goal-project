"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getFollowers,
  getGoals,
  getProfile,
  getStoredToken,
  getStoredUserId,
} from "@/utils/api";
import Link from "next/link";

interface Goal {
  id: number;
  title: string;
  duration: number;
  status: string;
  created_at: string;
}

interface Follower {
  id: number;
  username: string;
  profile_image: string | null;
}

const Dashboard = () => {
  const { userId } = useParams();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const storedId = getStoredUserId();
  const token = getStoredToken();
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!userId) return;
    try {
      const data = await getGoals(Number(userId));
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!userId || !token) return;
    try {
      const userData = await getProfile(token, Number(userId));
      setUsername(userData.username);
      setProfileImage(userData.profile_image);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleShowFollowers = async () => {
    if (!userId) return;
    const data = await getFollowers(Number(userId));
    setFollowers(data);
    setShowFollowers(true);
  };

  useEffect(() => {
    fetchGoals();
    fetchProfile();
  }, [userId]);

  return (
    <div className="p-6">
      {Number(userId) === storedId ? (
        <Link href={`/profile/${userId}`}>
          <img
            src={profileImage ?? "/default-profile.png"}
            className="w-[70px] h-[70px] rouded-full"
          />
        </Link>
      ) : (
        <img
          src={profileImage ?? "/default-profile.png"}
          className="w-[70px] h-[70px] rouded-full"
        />
      )}
      <h1 className="text-2xl font-bold mb-4 text-emerald-600">
        📋 {username}'s grab goals
      </h1>

      <button
        onClick={handleShowFollowers}
        className="mb-4 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
      >
        Show Followers
      </button>

      {/* ✅ Follower List */}
      {showFollowers && followers.length > 0 && (
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
      )}

      {loading ? (
        <p>Loading goals...</p>
      ) : goals.length === 0 ? (
        <p className="text-gray-500">No goals yet! Let's start one! 💡</p>
      ) : (
        <ul className="space-y-3">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className={`border rounded-lg p-4 ${
                goal.status === "nailed it"
                  ? "border-emerald-500 bg-emerald-50"
                  : goal.status === "failed out"
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{goal.title}</h2>
                  <p className="text-sm text-gray-600">
                    Duration: {goal.duration} min
                  </p>
                  <p className="text-sm text-gray-400">
                    Created: {new Date(goal.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    goal.status === "nailed it"
                      ? "bg-emerald-200 text-emerald-800"
                      : goal.status === "failed out"
                      ? "bg-red-200 text-red-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {goal.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
