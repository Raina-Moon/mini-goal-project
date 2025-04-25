// "use client";

// import { createContext, useContext, useState, ReactNode } from "react";
// import { fetchApi } from "@/utils/api/fetch";
// import { Goal } from "@/utils/api";

// interface GoalState {
//   goals: Goal[];
//   fetchGoals: (userId: number) => Promise<Goal[]>;
//   createGoal: (userId: number, title: string, duration: number) => Promise<Goal>;
//   updateGoal: (goalId: number, status: string) => Promise<void>;
//   deleteGoal: (goalId: number) => Promise<void>;
// }

// const GoalContext = createContext<GoalState | undefined>(undefined);

// export const GoalProvider = ({ children }: { children: ReactNode }) => {
//   const [goals, setGoals] = useState<Goal[]>([]);

//   const fetchGoals = async (userId: number) => {
//     const fetchedGoals = await fetchApi<Goal[]>(`/goals/${userId}`);
//     setGoals(fetchedGoals);
//     return fetchedGoals;
//   };

//   const createGoal = async (userId: number, title: string, duration: number) => {
//     const newGoal = await fetchApi<Goal>("/goals", {
//       method: "POST",
//       body: JSON.stringify({ user_id: userId, title, duration }),
//     });
//     setGoals((prev) => [...prev, newGoal]);
//     return newGoal;
//   };

//   const updateGoal = async (goalId: number, status: string) => {
//     const updatedGoal = await fetchApi<Goal>(`/goals/${goalId}`, {
//       method: "PATCH",
//       body: JSON.stringify({ status }),
//     });
//     setGoals((prev) =>
//       prev.map((goal) => (goal.id === goalId ? updatedGoal : goal))
//     );
//   };

//   const deleteGoal = async (goalId: number) => {
//     await fetchApi(`/goals/${goalId}`, { method: "DELETE" });
//     setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
//   };

//   const value: GoalState = {
//     goals,
//     fetchGoals,
//     createGoal,
//     updateGoal,
//     deleteGoal,
//   };

//   return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
// };

// export const useGoals = () => {
//   const context = useContext(GoalContext);
//   if (!context) throw new Error("useGoals must be used within a GoalProvider");
//   return context;
// };