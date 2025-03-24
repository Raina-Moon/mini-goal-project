import { fetchApi } from "./fetch";
import { Comment } from "./types";

export const getComments = (postId: number) => fetchApi<Comment[]>(`/comments/${postId}`);

export const addComment = (userId: number, postId: number, content: string) =>
  fetchApi<{
    username: string; id: number; user_id: number; post_id: number; content: string; created_at: string 
}>("/comments", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, post_id: postId, content }),
  });