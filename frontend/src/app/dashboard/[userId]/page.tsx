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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const Dashboard = () => {
  const { userId } = useParams();
  const { user, token, fetchViewUser, viewUser } = useAuth();
  const { goals, fetchGoals } = useGoals();
  const { nailedPosts, fetchNailedPosts } = usePosts();
  const { followers, fetchFollowers } = useFollowers();

  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("nailed");
  const [chartPeriod, setChartPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("week");
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

  const isOwnProfile = user.id === viewUser.id;

  // calculate the number of nailed posts
  const getChartData = () => {
    const durationByDate = nailedPosts.reduce((acc, post) => {
      const date = new Date(post.created_at).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      acc[date] = (acc[date] || 0) + post.duration;
      return acc;
    }, {} as { [key: string]: number });

    let filteredData = Object.entries(durationByDate).map(
      ([date, duration]) => ({
        date,
        duration,
      })
    );

    if (chartPeriod === "day") filteredData = filteredData.slice(-1);
    else if (chartPeriod === "week") filteredData = filteredData.slice(-7);
    else if (chartPeriod === "month") filteredData = filteredData.slice(-30);

    return filteredData;
  };

  const chartData = getChartData();

  const chartConfig = {
    duration: {
      label: "Duration (min)",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <div className="p-3">

      <div className="flex items-end justify-between mb-4">
        <div className="flex gap-4">
          <ProfileHeader
            userId={viewUser.id}
            storedId={user.id}
            username={viewUser.username}
            profileImage={viewUser.profile_image || "images/DefaultProfile.png"}
          />
          <div
            className="flex items-end cursor-pointer"
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
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-300 text-white font-medium text-sm border-2 border-white"
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

      <Tabs defaultValue="nailed" onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          {isOwnProfile && <TabsTrigger value="all">All</TabsTrigger>}
          <TabsTrigger value="nailed">Nailed It</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="failed">Failed It</TabsTrigger>}
          {isOwnProfile && <TabsTrigger value="chart">Chart</TabsTrigger>}
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
        {isOwnProfile && (
          <TabsContent value="chart">
            <div className="flex justify-end mb-4">
              <div className="space-x-2">
                <Button
                  variant={chartPeriod === "day" ? "default" : "outline"}
                  onClick={() => setChartPeriod("day")}
                >
                  Day
                </Button>
                <Button
                  variant={chartPeriod === "week" ? "default" : "outline"}
                  onClick={() => setChartPeriod("week")}
                >
                  Week
                </Button>
                <Button
                  variant={chartPeriod === "month" ? "default" : "outline"}
                  onClick={() => setChartPeriod("month")}
                >
                  Month
                </Button>
                <Button
                  variant={chartPeriod === "year" ? "default" : "outline"}
                  onClick={() => setChartPeriod("year")}
                >
                  Year
                </Button>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Success Duration</CardTitle>
                <CardDescription>
                  {chartPeriod === "day" && "Last Day"}
                  {chartPeriod === "week" && "Last 7 Days"}
                  {chartPeriod === "month" && "Last 30 Days"}
                  {chartPeriod === "year" && "This Year"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 6)}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      label={{
                        value: "Duration (min)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#6b7280",
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar
                      dataKey="duration"
                      fill="var(--color-duration)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

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
    </div>
  );
};

export default Dashboard;
