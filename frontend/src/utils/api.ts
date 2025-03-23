const API_URL = "http://localhost:5000/api"; // Backend API base URL

// ✅ User Signup
export const signup = async (
  username: string,
  email: string,
  password: string
) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
};

// ✅ User Login
export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  const userData = await res.json();

  localStorage.setItem("token", userData.token);
  localStorage.setItem("userId", JSON.stringify(userData.user.id));
  return userData;
};

// ✅ User Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
};

export const getStoredUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null; // Return user info or null if not found
  }
  return null;
};

export const getStoredToken = () => {
  const token = localStorage.getItem("token");
  return token; // Return token or null if not found
};

// ✅ Get User Profile
export const getProfile = async (token: string, userId: number) => {
  const res = await fetch(`${API_URL}/auth/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

// ✅ Update User Profile
export const updateProfile = async (
  token: string,
  userId: number,
  username: string
) => {
  const res = await fetch(`${API_URL}/auth/profile/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });
  return res.json();
};

// ✅ Forgot Password
export const requestPasswordReset = async (email: string) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error);
  return data; // Contains resetToken and message
};

// Verify reset token
export const verifyResetCode = async (email: string, reset_token: number) => {
  const res = await fetch(`${API_URL}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, reset_token }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

// Reset Password
export const resetPassword = async (email: string, p0: number, newPassword: string) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  
  return data; // Contains message: "Password updated successfully."
};

export const updateProfileImage = async (
  token: string,
  userId: number,
  file: File
) => {
  const formData = new FormData();
  formData.append("profileImage", file);

  const res = await fetch(`${API_URL}/auth/profile/${userId}/image-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload profile image");
  return res.json();
};


// ✅ Create a new goal
export const createGoal = async (
  title: string,
  duration: number,
  userId: number
) => {
  const res = await fetch(`${API_URL}/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, duration, user_id: userId }),
  });

  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
};

// ✅ Get all goals for a user
export const getGoals = async (userId: number) => {
  const res = await fetch(`${API_URL}/goals/${userId}`);

  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json();
};

// ✅ Update a goal
export const updateGoal = async (goalId: number, status: string) => {
  const res = await fetch(`${API_URL}/goals/${goalId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update goal");
  return res.json();
};

// ✅ Delete a goal
export const deleteGoal = async (goalId: number) => {
  const res = await fetch(`${API_URL}/goals/${goalId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete goal");
  return res.json();
};

export const getStoredUserId = () => {
  if (typeof window !== "undefined") {
    const id = localStorage.getItem("userId");
    return id ? JSON.parse(id) : null;
  }
  return null;
};

// ✅ Follow a user
export const followUser = async (followerId: number, followingId: number) => {
  const res = await fetch(`${API_URL}/followers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
  });

  if (!res.ok) throw new Error("Failed to follow user");
  return res.json();
};

// ✅ Unfollow a user
export const unfollowUser = async (followerId: number, followingId: number) => {
  const res = await fetch(`${API_URL}/followers`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
  });

  if (!res.ok) throw new Error("Failed to unfollow user");
  return res.json();
};

// ✅ Get users I'm following
export const getFollowing = async (userId: number) => {
  const res = await fetch(`${API_URL}/followers/following/${userId}`);

  if (!res.ok) throw new Error("Failed to fetch following users");
  return res.json(); // returns an array of user objects
};

// ✅ Get my followers
export const getFollowers = async (userId: number) => {
  const res = await fetch(`${API_URL}/followers/followers/${userId}`);

  if (!res.ok) throw new Error("Failed to fetch followers");
  return res.json(); // returns an array of user objects
};

// ✅ Utility: Check if I am following someone
export const isFollowing = async (
  myFollowingList: { id: number }[],
  targetUserId: number
): Promise<boolean> => {
  return myFollowingList.some((user) => user.id === targetUserId);
};

export const createPost = async (
  userId: number,
  goalId: number,
  imageUrl: string,
  description: string
) => {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      goal_id: goalId,
      image_url: imageUrl,
      description,
    }),
  });

  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};

export const getUserPosts = async (userId: number) => {
  const res = await fetch(`${API_URL}/posts/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};
