import { fetchApi } from "./fetch";
import { Post } from "./types";

export const createPost = (userId: number, goalId: number, imageUrl: string, description: string) =>
  fetchApi<{ id: number; user_id: number; goal_id: number; image_url: string; description: string }>(
    "/posts",
    {
      method: "POST",
      body: JSON.stringify({ user_id: userId, goal_id: goalId, image_url: imageUrl, description }),
    }
  );

export const uploadPostImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  return fetchApi<{ imageUrl: string }>("/posts/upload-image", {
    method: "POST",
    body: formData,
  }).then((data) => data.imageUrl);
};

export const getNailedPosts = (profileUserId: number, viewerUserId: number) =>
  fetchApi<Post[]>(`/posts/nailed/${profileUserId}?viewerId=${viewerUserId}`);