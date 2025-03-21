"use client"; // ✅ Since we're using Next.js App Router

import { useState } from "react";
import { createGoal } from "@/utils/api";

const GoalForm = ({ onGoalCreated }: { onGoalCreated: () => void }) => {
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(5);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createGoal(title, duration, 1); // Example user_id = 1
            onGoalCreated();
        } catch (error) {
            alert("Error creating goal!");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Goal Title"
                className="border p-2 w-full"
                required
            />
            <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="border p-2 w-full"
                required
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Start Goal
            </button>
        </form>
    );
};

export default GoalForm;
