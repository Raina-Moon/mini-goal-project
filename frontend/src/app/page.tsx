"use client";

import { useEffect } from "react";
import GoalForm from "../components/GoalForm";
import { useAuth } from "./contexts/AuthContext";
import { useGoals } from "./contexts/GoalContext";

const page = () => {
  const { user } = useAuth();
  const { goals, fetchGoals } = useGoals();

  useEffect(() => {
    if (user?.id) {
      fetchGoals(user.id).catch((err) =>
        console.error("Failed to load goals", err)
      );
    }
  }, [user?.id, fetchGoals]);

  return (
    <>
      <GoalForm onGoalCreated={() => user?.id && fetchGoals(user.id)} />
    </>
  );
};

export default page;
