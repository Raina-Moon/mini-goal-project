"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileHeader from "./components/ProfileHeader";
import FollowButton from "./components/FollowButton";
import FollowersList from "./components/FollowersList";
import GoalsTab from "./components/GoalsTab";
import NailedPostsTab from "./components/NailedPostsTab";
import FailedGoalsTab from "./components/FailedGoalsTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/app/contexts/AuthContext";
import { useGoals } from "@/app/contexts/GoalContext";
import { useFollowers } from "@/app/contexts/FollowerContext";
import { usePosts } from "@/app/contexts/PostContext";
import { useGlobalLoading } from "@/app/contexts/LoadingContext";

const Dashboard = () => {
  const { userId } = useParams();
  const { user, token, fetchViewUser, viewUser } = useAuth();
  const { goals, fetchGoals } = useGoals();
  const { nailedPosts, fetchNailedPosts } = usePosts();
  const { followers, fetchFollowers } = useFollowers();

  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { setLoading } = useGlobalLoading();

  const fetchData = async () => {
    if (!userId || !user?.id || !token) return;
    const profileId = Number(userId);
    const viewerId = user.id;

    setLoading(true);

    try {
      await Promise.all([
        fetchViewUser(profileId),
        fetchGoals(profileId),
        fetchNailedPosts(profileId),
        fetchFollowers(profileId),
      ]);
      const updatedFollowStatus = await fetchFollowers(profileId);
      const isFollowingNow = (updatedFollowStatus ?? []).some(
        (f) => f.id === viewerId
      );
      setIsFollowing(isFollowingNow);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchData();
  }, [userId, user, token]);

  if (!user || !token || !viewUser)
    return <div>Please log in to view the dashboard.</div>;

  return (
    <div className="p-6">
      <ProfileHeader
        userId={viewUser.id}
        storedId={user.id}
        username={viewUser.username}
        profileImage={viewUser.profile_image || "images/DefaultProfile.png"}
      />
      {user.id !== viewUser.id && (
        <FollowButton
          storedId={user.id}
          userId={viewUser.id}
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
          <GoalsTab goals={goals}/>
        </TabsContent>
        <TabsContent value="nailed">
          <NailedPostsTab posts={nailedPosts} userId={user.id} />
        </TabsContent>
        <TabsContent value="failed">
          <FailedGoalsTab goals={goals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
