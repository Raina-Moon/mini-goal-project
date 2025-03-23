"use client"; // ✅ Since we're using Next.js App Router

import { useState } from "react";
import { createGoal, updateGoal } from "@/utils/api";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";

const GoalForm = ({ onGoalCreated }: { onGoalCreated: () => void }) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [goalId, setGoalId] = useState<number | null>(null);

  const startTimer = (goalId: number, duration: number) => {
    setGoalId(goalId);
    setSecondsLeft(duration * 60);

    // Automatically nail it if time completes
    setTimeout(() => {
      updateGoal(goalId, "nail it");
      alert("💪 Nailed it!");
    }, duration * 60 * 1000);
  };

  const handleFailOut = async () => {
    if (goalId) {
      await updateGoal(goalId, "fail out");
      alert("😢 Failed out");
      setSecondsLeft(null);
    }
  };
  
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mx-7 mt-20 p-4 border border-primary-500 rounded-[20px]"
    >
      <div className="flex flex-row items-center justify-center">
        <h1 className="font-medium text-xl text-center text-gray-900">
          lowkey timer drip!
        </h1>
        <img />
      </div>
      <GlobalInput
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="title"
        className="border p-2 w-full focus:outline-none"
      />
      <GlobalInput
        type="number"
        value={String(duration)}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="border p-2 w-full"
      />
      <div className="flex justify-center">
        <GlobalButton type="submit">hit the drip</GlobalButton>
      </div>
    </form>
  );
};

export default GoalForm;
