const API_URL = "http://localhost:5000/api";

export const createGoal = async (title: string, duration: number, userId: number) => {
  const res = await fetch(`${API_URL}/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, duration, user_id: userId }),
  });
  return res.json();
};
