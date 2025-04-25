// "use client";

// import { createContext, useContext, useState, ReactNode } from "react";
// import { Like } from "@/utils/api";
// import { fetchApi } from "@/utils/api/fetch";

// interface LikeState {
//   likedPosts: Like[];
//   fetchLikedPosts: (userId: number) => Promise<Like[]>;
//   getLikeStatus: (postId: number, userId: number) => Promise<boolean>;
//   likePost: (userId: number, postId: number) => Promise<number>;
//   unlikePost: (userId: number, postId: number) => Promise<number>;
//   fetchLikeCount: (postId: number) => Promise<number>;
// }

// const Likecontext = createContext<LikeState | undefined>(undefined);

// export const LikesProvider = ({ children }: { children: ReactNode }) => {
//   const [likedPosts, setLikedPosts] = useState<Like[]>([]);

//   const fetchLikedPosts = async (userId: number) => {
//     try {
//       const posts = await fetchApi<Like[]>(`/likes/${userId}`);
//       setLikedPosts(posts);
//       return posts;
//     } catch (err) {
//       console.error("Failed to fetch liked posts:", err);
//       return [];
//     }
//   };

//   const getLikeStatus = async (postId: number, userId: number) => {
//     try {
//       const { liked } = await fetchApi<{ liked: boolean }>(
//         `/likes/status/${postId}/${userId}`
//       );
//       return liked;
//     } catch (err) {
//       console.error("Failed to get like status:", err);
//       return false;
//     }
//   };

//   const likePost = async (userId: number, postId: number) => {
//     try {
//       const like = await fetchApi<{ user_id: number; post_id: number }>(
//         "/likes",
//         {
//           method: "POST",
//           body: JSON.stringify({ user_id: userId, post_id: postId }),
//         }
//       );
//       setLikedPosts((prev) => [...prev, like]);
//       return await fetchLikeCount(postId);
//     } catch (err) {
//       if (err instanceof Error && err.message === "Already liked") {
//         console.log("Post already liked");
//       } else {
//         console.error("Failed to like post:", err);
//       }
//       return await fetchLikeCount(postId);
//     }
//   };

//   const unlikePost = async (userId: number, postId: number) => {
//     try {
//       await fetchApi<{ message: string }>("/likes", {
//         method: "DELETE",
//         body: JSON.stringify({ user_id: userId, post_id: postId }),
//       });
//       setLikedPosts((prev) => prev.filter((like) => like.post_id !== postId));
//       return await fetchLikeCount(postId);
//     } catch (err) {
//       console.error("Failed to unlike post:", err);
//       return await fetchLikeCount(postId);
//     }
//   };

//   const fetchLikeCount = async (postId: number) => {
//     try {
//       const result = await fetchApi<{ like_count: number }>(
//         `/likes/count/${postId}`
//       );
//       return result.like_count;
//     } catch (err) {
//       console.error("Failed to fetch like count:", err);
//       return 0; // Return a default value in case of error
//     }
//   };

//   const value: LikeState = {
//     likedPosts,
//     fetchLikedPosts,
//     getLikeStatus,
//     likePost,
//     unlikePost,
//     fetchLikeCount,
//   };

//   return <Likecontext.Provider value={value}>{children}</Likecontext.Provider>;
// };

// export const useLikes = () => {
//   const context = useContext(Likecontext);
//   if (context === undefined) {
//     throw new Error("useLikes must be used within a LikesProvider");
//   }
//   return context;
// };
