const API_URL = "http://localhost:5000/api"; // Backend API base URL

// ✅ User Signup
export const signup = async (username: string, email: string, password: string) => {
  const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
};

// ✅ User Login
export const login = async (email: string, password: string) => {
  const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
};

// ✅ Get User Profile
export const getProfile = async (token: string) => {
  const res = await fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

// ✅ Create a new goal
export const createGoal = async (title: string, duration: number, userId: number) => {
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
