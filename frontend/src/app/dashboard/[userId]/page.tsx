"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getStoredUserId,
  getStoredToken,
  getProfile,
  getGoals,
  getFollowers,
  getNailedPosts,
  Goal,
  User,
  Post,
} from "@/utils/api";
import ProfileHeader from "./components/ProfileHeader";
import FollowButton from "./components/FollowButton";
import FollowersList from "./components/FollowersList";
import GoalsTab from "./components/GoalsTab";
import NailedPostsTab from "./components/NailedPostsTab";
import FailedGoalsTab from "./components/FailedGoalsTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Dashboard = () => {
  const { userId } = useParams();
  const [storedId, setStoredId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [nailedPosts, setNailedPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStoredId(getStoredUserId());
    setToken(getStoredToken());
  }, []);

  const fetchData = async () => {
    if (!userId || !storedId || !token) return;
    try {
      const [profileData, goalsData, followersData, postsData] = await Promise.all([
        getProfile(token, Number(userId)),
        getGoals(Number(userId)),
        getFollowers(Number(userId)),
        getNailedPosts(Number(userId), storedId),
      ]);

      setUsername(profileData.username);
      setProfileImage(profileData.profile_image ?? null);
      setGoals(goalsData);
      setFollowers(followersData);
      setNailedPosts(postsData);
      setIsFollowing(followersData.some((f) => f.id === storedId));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storedId && token) fetchData();
  }, [userId, storedId, token]);

  return (
    <div className="p-6">
      <ProfileHeader userId={Number(userId)} storedId={storedId} username={username} profileImage={profileImage} />
      {storedId !== Number(userId) && (
        <FollowButton
          storedId={storedId}
          userId={Number(userId)}
          isFollowing={isFollowing}
          setIsFollowing={setIsFollowing}
        />
      )}
      <button
        onClick={() => setShowFollowers(!showFollowers)}
        className="mb-4 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
      >
        {showFollowers ? "Hide Followers" : "Show Followers"}
      </button>
      {showFollowers && (
        <FollowersList
          followers={followers.map((follower) => ({
            ...follower,
            profile_image: follower.profile_image ?? null,
          }))}
        />
      )}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="nailed">Nailed It</TabsTrigger>
          <TabsTrigger value="failed">Failed It</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <GoalsTab goals={goals} loading={loading} />
        </TabsContent>
        <TabsContent value="nailed">
          <NailedPostsTab posts={nailedPosts} userId={storedId} />
        </TabsContent>
        <TabsContent value="failed">
          <FailedGoalsTab goals={goals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;