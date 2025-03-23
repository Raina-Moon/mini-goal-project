"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  addComment,
  followUser,
  getFollowers,
  getGoals,
  getNailedPosts,
  getProfile,
  getStoredToken,
  getStoredUserId,
  likePost,
  unfollowUser,
  unlikePost,
} from "@/utils/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

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

interface NailedPost {
  goal_id: number;
  title: string;
  duration: number;
  image_url: string;
  description: string;
  like_count: number;
  liked_by_me: boolean;
  comments: {
    id: number;
    user_id: number;
    username: string;
    content: string;
    created_at: string;
  }[];
}

const Dashboard = () => {
  const { userId } = useParams();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [nailedPosts, setNailedPosts] = useState<NailedPost[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [likeStatus, setLikeStatus] = useState<{ [key: number]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: number]: number }>({});
  const [comments, setComments] = useState<{ [key: number]: string[] }>({});
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({});

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

  const fetchFollowers = async () => {
    if (!userId) return;
    try {
      const data = await getFollowers(Number(userId));
      setFollowers(data);
      const followingIds = data.map((f: Follower) => f.id);
      setIsFollowing(followingIds.includes(storedId));
    } catch (err) {
      console.error("Failed to fetch followers:", err);
    }
  };

  const handleShowFollowers = async () => {
    await fetchFollowers();
    setShowFollowers(true);
  };

  const fetchNailedPosts = async () => {
    if (!userId || !storedId) return;
    try {
      const data = await getNailedPosts(Number(userId), storedId);
      setNailedPosts(data);
    } catch (err) {
      console.error("Failed to fetch nailed posts:", err);
    }
  };  

  const handleFollowToggle = async () => {
    if (!storedId || !userId) return;
    try {
      if (isFollowing) {
        await unfollowUser(storedId, Number(userId));
      } else {
        await followUser(storedId, Number(userId));
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      alert("Failed to update follow status");
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchProfile();
    fetchFollowers();
    fetchNailedPosts();
  }, [userId]);

  const filteredGoals = goals.filter((goal) => {
    if (activeTab === "nailed") return goal.status === "nailed it";
    if (activeTab === "failed") return goal.status === "failed out";
    return true;
  });

  const sortedNailedPosts = [...nailedPosts].sort((a, b) => {
    if (sortBy === "latest") return b.goal_id - a.goal_id;
    if (sortBy === "oldest") return a.goal_id - b.goal_id;
    if (sortBy === "most-time") return b.duration - a.duration;
    if (sortBy === "least-time") return a.duration - b.duration;
    return 0;
  });

  const handleLike = async (goalId: number) => {
    const userId = getStoredUserId();
    const alreadyLiked = likeStatus[goalId];

    try {
      if (alreadyLiked) {
        await unlikePost(goalId, userId);
        setLikeCounts((prev) => ({
          ...prev,
          [goalId]: (prev[goalId] || 1) - 1,
        }));
      } else {
        await likePost(goalId, userId);
        setLikeCounts((prev) => ({
          ...prev,
          [goalId]: (prev[goalId] || 0) + 1,
        }));
      }

      setLikeStatus((prev) => ({ ...prev, [goalId]: !alreadyLiked }));
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const submitComment = async (goalId: number) => {
    const userId = getStoredUserId();
    const content = newComments[goalId];

    if (!content) return;

    try {
      const comment = await addComment(goalId, userId, content);
      setNewComments((prev) => ({ ...prev, [goalId]: "" }));
      setNailedPosts((prev) =>
        prev.map((post) =>
          post.goal_id === goalId
            ? {
                ...post,
                comments: [...(post.comments || []), comment],
              }
            : post
        )
      );
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

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

      {/* ✅ Follow / Unfollow Button */}
      {Number(userId) !== storedId && (
        <button
          onClick={handleFollowToggle}
          className={`mb-2 px-3 py-2 rounded text-white ${
            isFollowing
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}

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

      <Tabs
        defaultValue="all"
        onValueChange={(val) => setActiveTab(val)}
        className="mt-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="nailed">Nailed It</TabsTrigger>
          <TabsTrigger value="failed">Failed It</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <p>Loading goals...</p>
          ) : filteredGoals.length === 0 ? (
            <p className="text-gray-500">No goals yet! Let's start one! 💡</p>
          ) : (
            <ul className="space-y-3">
              {filteredGoals.map((goal) => (
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
        </TabsContent>

        <TabsContent value="nailed">
          <div className="flex justify-end mb-2">
            <Select onValueChange={setSortBy} defaultValue="latest">
              <SelectTrigger className="w-40" />
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most-time">Most Time</SelectItem>
                <SelectItem value="least-time">Shortest Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ul className="space-y-3">
            {sortedNailedPosts.map((post) => (
              <li
                key={post.goal_id}
                className="border border-emerald-300 bg-emerald-50 rounded-lg p-4"
              >
                <h2 className="text-lg font-semibold text-emerald-700">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  Duration: {post.duration} min
                </p>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post Image"
                    className="w-full max-h-64 object-cover rounded mb-2"
                  />
                )}
                <p className="text-sm text-gray-800">{post.description}</p>
                {/* ✅ Like + Comment Section */}
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleLike(post.goal_id)}
                    className="text-pink-600 hover:underline"
                  >
                    {likeStatus[post.goal_id] ? "❤️ Liked" : "🤍 Like"} (
                    {likeCounts[post.goal_id] || post.like_count})
                  </button>
                </div>

                <div className="mt-4">
                  <input
                    value={newComments[post.goal_id] || ""}
                    onChange={(e) =>
                      setNewComments((prev) => ({
                        ...prev,
                        [post.goal_id]: e.target.value,
                      }))
                    }
                    placeholder="Leave a comment..."
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => submitComment(post.goal_id)}
                    className="text-blue-500 text-sm mt-1"
                  >
                    Submit
                  </button>

                  <ul className="mt-2 space-y-1 text-sm">
                    {(post.comments || []).map((c) => (
                      <li key={c.id}>
                        <strong>{c.username}:</strong> {c.content}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="failed">
          <ul className="space-y-3">
            {goals
              .filter((goal) => goal.status === "failed out")
              .map((goal) => (
                <li
                  key={goal.id}
                  className="border border-red-400 bg-red-50 rounded-lg p-4"
                >
                  <h2 className="text-lg font-semibold text-red-700">
                    {goal.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Duration: {goal.duration} min
                  </p>
                  <p className="text-sm text-gray-400">
                    Created: {new Date(goal.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
