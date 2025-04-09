"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ProfileHeader from "./components/ProfileHeader";
import FollowButton from "./components/FollowButton";
import FollowersList from "./components/FollowersList";
import GoalsTab from "./components/GoalsTab";
import NailedPostsTab from "./components/NailedPostsTab";
import FailedGoalsTab from "./components/FailedGoalsTab";
import ChartComponent from "./components/ChartComponent";
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
  const { loading, setLoading } = useGlobalLoading();

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("nailed");
  const [chartPeriod, setChartPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("week");

  const fetchData = async () => {
    if (!userId || !user?.id || !token) return;

    const profileId = Number(userId);
    const viewerId = user.id;

    setLoading(true);
    try {
      const [viewUserData, goalsData, postsData, followersData] =
        await Promise.all([
          fetchViewUser(profileId).catch((err) => {
            console.error("fetchViewUser failed:", err);
            return null;
          }),
          fetchGoals(profileId).catch((err) => {
            console.error("fetchGoals failed:", err);
            return [];
          }),
          fetchNailedPosts(profileId).catch((err) => {
            console.error("fetchNailedPosts failed:", err);
            return [];
          }),
          fetchFollowers(profileId).catch((err) => {
            console.error("fetchFollowers failed:", err);
            return [];
          }),
        ]);

      if (followersData) {
        const isFollowingNow = followersData.some((f) => f.id === viewerId);
        setIsFollowing(isFollowingNow);
      }
    } catch (err) {
      console.error("Unexpected error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token && userId) {
      fetchData();
    }
  }, [userId]);

  const nailedGoals = useMemo(() => {
    return goals.filter((goal) => goal.status === "nailed it");
  }, [goals]);

  const failedPosts = useMemo(() => {
    return goals.filter((goal) => goal.status === "failed out");
  }, [goals]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }
  if (!user || !token || !viewUser) {
    return <div>Please log in to view the dashboard.</div>;
  }

  const displayedFollowers = followers.slice(0, 3);
  const extraFollowersCount = followers.length > 3 ? followers.length - 3 : 0;

  const isOwnProfile = user.id === viewUser.id;

  return (
    <div className="p-3">
      <div className="flex items-end justify-between mb-4">
        <div className="flex gap-4">
          <ProfileHeader
            userId={viewUser.id}
            storedId={user.id}
            username={viewUser.username}
            profileImage={
              viewUser.profile_image || "/images/DefaultProfile.png"
            }
          />
          <div
            className="flex items-end cursor-pointer gap-6"
            onClick={() => setIsFollowersModalOpen(true)}
          >
            {displayedFollowers.length > 0 ? (
              <div className="flex">
                {displayedFollowers.map((follower, index) => (
                  <img
                    key={follower.id}
                    src={follower.profile_image || "/images/DefaultProfile.png"}
                    alt={`${follower.username}'s profile`}
                    className="w-7 h-7 rounded-full object-cover border-2 border-white"
                    style={{
                      marginLeft: index > 0 ? "-15px" : "0",
                      zIndex: displayedFollowers.length - index,
                    }}
                  />
                ))}
                {extraFollowersCount > 0 && (
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-300 text-white font-medium text-sm border-2 border-white"
                    style={{ zIndex: 0 }}
                  >
                    +{extraFollowersCount}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-500 text-xs">
                Be the first to vibe
              </span>
            )}
          </div>
        </div>
        {user.id !== viewUser.id && (
          <div className="flex items-end">
            <FollowButton
              storedId={user.id}
              userId={viewUser.id}
              isFollowing={isFollowing}
              setIsFollowing={setIsFollowing}
            />
          </div>
        )}
      </div>

      <h1 className="text-2xl font-medium mb-4 text-gray-900">
        {viewUser.username}'s grab goals
      </h1>

      <Tabs defaultValue="nailed" onValueChange={setActiveTab} className="my-6">
        <TabsList className="mb-4">
          {isOwnProfile && <TabsTrigger value="all">All</TabsTrigger>}
          <TabsTrigger value="nailed">Nailed It</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="failed">Failed It</TabsTrigger>}
          <TabsTrigger value="chart">Chart</TabsTrigger>
        </TabsList>
        {isOwnProfile && (
          <TabsContent value="all">
            <GoalsTab goals={goals} />
          </TabsContent>
        )}
        <TabsContent value="nailed">
          <NailedPostsTab posts={nailedPosts} userId={user.id} />
        </TabsContent>
        {isOwnProfile && (
          <TabsContent value="failed">
            <FailedGoalsTab goals={goals} />
          </TabsContent>
        )}
        <TabsContent value="chart">
          <ChartComponent
            nailedPosts={nailedGoals}
            failedPosts={isOwnProfile ? failedPosts : undefined}
            chartPeriod={chartPeriod}
            setChartPeriod={setChartPeriod}
            isOwnProfile={isOwnProfile}
          />
        </TabsContent>
      </Tabs>

      {isFollowersModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsFollowersModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-[85%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Followers {followers.length}
              </h3>
            </div>
            <FollowersList
              followers={followers.map((follower) => ({
                ...follower,
                profile_image: follower.profile_image ?? null,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
