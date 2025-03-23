"use client";

import { useEffect, useState } from "react";
import GoalForm from "../components/GoalForm";
import { getGoals, getStoredUserId } from "@/utils/api";

const page = () => {
  const [goals, setGoals] = useState([]);

  const userId = getStoredUserId();

  const fetchGoals = async () => {
    if (!userId) return;
    try {
      const data = await getGoals(userId);
      setGoals(data);
    } catch (err) {
      console.error("Failed to load goals", err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  return (
    <>
      <GoalForm onGoalCreated={fetchGoals} />
    </>
  );
};

export default page;
