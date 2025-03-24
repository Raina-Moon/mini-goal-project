import { fetchApi } from "./fetch";

export const getLikeStatus = (postId: number, userId: number) =>
  fetchApi<{ liked: boolean }>(`/likes/status/${postId}/${userId}`);

export const likePost = (userId: number, postId: number) =>
  fetchApi<{ user_id: number; post_id: number }>("/likes", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, post_id: postId }),
  });

export const unlikePost = (userId: number, postId: number) =>
  fetchApi<{ message: string }>("/likes", {
    method: "DELETE",
    body: JSON.stringify({ user_id: userId, post_id: postId }),
  });