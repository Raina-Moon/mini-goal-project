"use client";

import { useEffect, useState } from "react";
import GoalForm from "../components/GoalForm";
import { getGoals, Goal } from "@/utils/api";
import { useAuth } from "./contexts/AuthContext";

const page = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { user } = useAuth()

  const fetchGoals = async () => {
    if (!user || !user.id) return;
    try {
      const data = await getGoals(user.id);
      setGoals(data);
    } catch (err) {
      console.error("Failed to load goals", err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user?.id]);

  return (
    <>
      <GoalForm onGoalCreated={fetchGoals} />
    </>
  );
};

export default page;
