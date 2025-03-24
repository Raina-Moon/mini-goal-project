import { fetchApi } from "./fetch";
import { Goal } from "./types";

export const createGoal = (title: string, duration: number, userId: number) =>
  fetchApi<{ id: number; title: string; duration: number; user_id: number }>("/goals", {
    method: "POST",
    body: JSON.stringify({ title, duration, user_id: userId }),
  });

export const getGoals = (userId: number) => fetchApi<Goal[]>(`/goals/${userId}`);

export const updateGoal = (goalId: number, status: string) =>
  fetchApi<{ id: number; status: string }>(`/goals/${goalId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteGoal = (goalId: number) =>
  fetchApi<{ message: string }>(`/goals/${goalId}`, {
    method: "DELETE",
  });