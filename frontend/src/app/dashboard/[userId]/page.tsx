"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProfileHeader from "./components/ProfileHeader";
import FollowButton from "./components/FollowButton";
import FollowersList from "./components/FollowersList";
import GoalsTab from "./components/GoalsTab";
import NailedPostsTab from "./components/NailedPostsTab";
import FailedGoalsTab from "./components/FailedGoalsTab";
import ChartComponent from "./components/ChartComponent";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { fetchViewUser } from "@/stores/slices/authSlice";
import { fetchGoals } from "@/stores/slices/goalSlice";
import { fetchNailedPosts } from "@/stores/slices/postSlice";
import {
  fetchFollowers,
  followUser,
  unfollowUser,
} from "@/stores/slices/followSlice";

const Dashboard = () => {
  const { userId } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // 1) Pull everything out of Redux
  const currentUser = useAppSelector((s) => s.auth.user);
  const viewUser = useAppSelector((s) => s.auth.viewUser);
  const goals = useAppSelector((s) => s.goal.goals);
  const nailedPosts = useAppSelector((s) => s.posts.nailedPosts);
  const followers = useAppSelector((s) => s.follow.followers);

  // 2) Local UI state
  const [isLoading, setIsLoading] = useState(true);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "nailed" | "failed" | "chart"
  >("nailed");
  const [chartPeriod, setChartPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("week");

  // 3) Derived data
  const isOwnProfile = currentUser?.id === viewUser?.id;
  const isFollowing = useMemo(
    () => !!followers.find((f) => f.id === currentUser?.id),
    [followers, currentUser?.id]
  );
  const displayedFollowers = followers.slice(0, 3);
  const extraFollowersCount = Math.max(0, followers.length - 3);
  const nailedGoals = useMemo(
    () => goals.filter((g) => g.status === "nailed it"),
    [goals]
  );
  const failedGoals = useMemo(
    () => goals.filter((g) => g.status === "failed out"),
    [goals]
  );

  // 4) Fetch everything once
  useEffect(() => {
    const profileId = Number(userId);
    if (!currentUser?.id || !profileId) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    Promise.all([
      dispatch(fetchViewUser(profileId))
        .unwrap()
        .catch(() => {}),
      dispatch(fetchGoals(profileId))
        .unwrap()
        .catch(() => {}),
      dispatch(fetchNailedPosts(profileId))
        .unwrap()
        .catch(() => {}),
      dispatch(fetchFollowers(profileId))
        .unwrap()
        .catch(() => {}),
    ]).finally(() => setIsLoading(false));
  }, [userId, currentUser?.id, dispatch, router]);

  // 5) Follow/unfollow handler
  const handleToggleFollow = async (isFollowing: boolean) => {
    if (!currentUser?.id || !viewUser?.id) return;
    if (isFollowing) {
      await dispatch(
        followUser({ followerId: currentUser.id, followingId: viewUser.id })
      ).unwrap();
    } else {
      await dispatch(
        unfollowUser({ followerId: currentUser.id, followingId: viewUser.id })
      ).unwrap();
    }
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }
  if (!currentUser || !viewUser) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="p-3">
      <div className="flex items-end justify-between mb-4">
        <div className="flex gap-4">
          <ProfileHeader
            userId={viewUser.id}
            storedId={currentUser.id}
            username={viewUser.username}
            profileImage={
              viewUser.profile_image || "/images/DefaultProfile.png"
            }
          />
          <div
            className="flex items-end cursor-pointer gap-6"
            onClick={() => setFollowersModalOpen(true)}
          >
            {displayedFollowers.length > 0 ? (
              <div className="flex">
                {displayedFollowers.map((f, i) => (
                  <img
                    key={f.id}
                    src={f.profile_image || "/images/DefaultProfile.png"}
                    alt={f.username}
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    style={{
                      marginLeft: i ? -15 : 0,
                      zIndex: displayedFollowers.length - i,
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

        {!isOwnProfile && (
          <FollowButton
            storedId={currentUser.id}
            userId={viewUser.id}
            isFollowing={isFollowing}
          />
        )}
      </div>

      <h1 className="text-2xl font-medium mb-4 text-gray-900">
        {viewUser.username}&apos;s grab goals
      </h1>

      <Tabs
        defaultValue={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="my-6"
      >
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
          <NailedPostsTab posts={nailedPosts} userId={currentUser.id} />
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="failed">
            <FailedGoalsTab goals={failedGoals} />
          </TabsContent>
        )}

        <TabsContent value="chart">
          <ChartComponent
            nailedPosts={nailedGoals}
            failedPosts={isOwnProfile ? failedGoals : undefined}
            chartPeriod={chartPeriod}
            setChartPeriod={setChartPeriod}
            isOwnProfile={isOwnProfile}
          />
        </TabsContent>
      </Tabs>

      {followersModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setFollowersModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-[85%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Followers ({followers.length})
              </h3>
            </div>
            <FollowersList
              followers={followers.map((f) => ({
                ...f,
                profile_image: f.profile_image ?? null,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
