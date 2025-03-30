export interface User {
  id: number;
  username: string;
  email?: string;
  profile_image?: string | null;
}

export interface Goal {
  id: number;
  title: string;
  duration: number;
  status: string;
  created_at: string;
  user_id: number;
}

export interface Post {
  post_id: number;
  goal_id: number;
  title: string;
  duration: number;
  image_url: string;
  description: string;
  like_count: number;
  liked_by_me: boolean;
  comments: Comment[];
}

export interface Like {
  user_id: number;
  post_id: number;
}

export interface Comment {
  id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface Follower {
  id: number;
  username: string;
  profile_image: string | null;
}

export interface Notification {
  id: number;
  user_id: number;
  sender_id: number;
  post_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_username: string;
}