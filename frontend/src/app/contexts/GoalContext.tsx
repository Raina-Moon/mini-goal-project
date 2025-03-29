"use client";

import { Goal } from "@/utils/api";
import { createContext, useContext, useState, ReactNode } from "react";

interface GoalState {
  goals: Goal[];
  fetchGoals: (userId: number) => Goal[];
  createGoal: (userId: number, title: string, duration: number) => Goal;
  updateGoal: (goalId: number, status: string) => void;
  deleteGoal: (goalId: number) => void;
}

const GoalContext = createContext<GoalState | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const fetchGoals = (userId: number) => {
    return goals.filter((goal) => goal.user_id === userId);
  };

  const createGoal = (userId: number, title: string, duration: number) => {
    const newGoal: Goal = {
      id: Date.now(),
      user_id: userId,
      title,
      duration,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = (goalId: number, status: string) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === goalId ? { ...goal, status } : goal))
    );
  };

  const deleteGoal = (goalId: number) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const value: GoalState = {
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