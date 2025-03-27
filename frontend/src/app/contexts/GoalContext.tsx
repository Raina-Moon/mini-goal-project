"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Goal } from "@/utils/api";
import { fetchApi } from "@/utils/api/fetch";
import { useAuth } from "./AuthContext";

interface GoalState {
  goals: Goal[];
  fetchGoals: (userId: number) => Promise<void>;
  createGoal: (title: string, duration: number, userId: number) => Promise<void>;
  updateGoal: (goalId: number, status: string) => Promise<void>;
  deleteGoal: (goalId: number) => Promise<void>;
}

const GoalContext = createContext<GoalState | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);

  const fetchGoals = async (userId: number) => {
    if (!token) return;
    const goalsData = await fetchApi<Goal[]>(`/goals/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGoals(goalsData);
  };

  const createGoal = async (title: string, duration: number, userId: number) => {
    if (!token) return;
    const newGoal = await fetchApi<{ id: number; title: string; duration: number; user_id: number }>(
      "/goals",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, duration, user_id: userId }),
      }
    );
    setGoals((prev) => [
      ...prev,
      { ...newGoal, status: "pending", created_at: new Date().toISOString() },
    ]);
  };

  const updateGoal = async (goalId: number, status: string) => {
    if (!token) return;
    const updatedGoal = await fetchApi<{ id: number; status: string }>(`/goals/${goalId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setGoals((prev) =>
      prev.map((goal) => (goal.id === goalId ? { ...goal, status: updatedGoal.status } : goal))
    );
  };

  const deleteGoal = async (goalId: number) => {
    if (!token) return;
    await fetchApi<{ message: string }>(`/goals/${goalId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const value = {
    goals,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) throw new Error("useGoals must be used within a GoalProvider");
  return context;
};