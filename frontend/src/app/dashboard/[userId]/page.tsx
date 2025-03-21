"use client";

import { useEffect, useState } from "react";
import { getGoals, getStoredUserId } from "@/utils/api";
import GoalForm from "@/app/dashboard/GoalForm";

const Dashboard = () => {
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
        <div className="p-6">
            <GoalForm onGoalCreated={fetchGoals} />
        </div>
    );
};

export default Dashboard;
