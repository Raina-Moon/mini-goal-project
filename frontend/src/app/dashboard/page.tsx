"use client";

import { useEffect, useState } from "react";
import { getGoals } from "@/utils/api";
import GoalForm from "@/app/dashboard/GoalForm";

const Dashboard = () => {
    const [goals, setGoals] = useState<{ id: number; title: string; duration: number }[]>([]);

    useEffect(() => {
        async function fetchGoals() {
            try {
                const data = await getGoals(1); // Example user_id = 1
                setGoals(data);
            } catch (error) {
                console.error("Error fetching goals:", error);
            }
        }

        fetchGoals();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Your Goals</h1>
            <GoalForm />
            <ul className="mt-6 space-y-2">
                {goals.map((goal) => (
                    <li key={goal.id} className="border p-4 rounded">
                        <strong>{goal.title}</strong> - {goal.duration} mins
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
