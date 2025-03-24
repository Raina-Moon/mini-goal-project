import { fetchApi } from "./fetch";
import { User } from "./types";

export const followUser = (followerId: number, followingId: number) =>
  fetchApi<{ follower_id: number; following_id: number }>("/followers", {
    method: "POST",
    body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
  });

export const unfollowUser = (followerId: number, followingId: number) =>
  fetchApi<{ message: string }>("/followers", {
    method: "DELETE",
    body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
  });

export const getFollowing = (userId: number) => fetchApi<User[]>(`/followers/following/${userId}`);

export const getFollowers = (userId: number) => fetchApi<User[]>(`/followers/followers/${userId}`);

export const isFollowing = (myFollowingList: { id: number }[], targetUserId: number): Promise<boolean> =>
  Promise.resolve(myFollowingList.some((user) => user.id === targetUserId));