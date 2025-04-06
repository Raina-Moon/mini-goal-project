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
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
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

  const displayedFollowers = followers.slice(0, 3);
  const extraFollowersCount = followers.length > 3 ? followers.length - 3 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <ProfileHeader
            userId={viewUser.id}
            storedId={user.id}
            username={viewUser.username}
            profileImage={viewUser.profile_image || "images/DefaultProfile.png"}
          />

          <div
            className="flex items-center cursor-pointer"
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
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-white font-medium text-sm border-2 border-white"
                    style={{ marginLeft: "-15px", zIndex: 0 }}
                  >
                    +{extraFollowersCount}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-500">No followers yet</span>
            )}
          </div>
        </div>

        {user.id !== viewUser.id && (
          <FollowButton
            storedId={user.id}
            userId={viewUser.id}
            isFollowing={isFollowing}
            setIsFollowing={setIsFollowing}
          />
        )}
      </div>

      <h1 className="text-2xl font-medium mb-4 text-gray-900">
        {viewUser.username}'s grab goals
      </h1>

      {/* Followers list modal */}
      {isFollowersModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Followers</h3>
              <button
                onClick={() => setIsFollowersModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
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

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="nailed">Nailed It</TabsTrigger>
          <TabsTrigger value="failed">Failed It</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <GoalsTab goals={goals} />
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
