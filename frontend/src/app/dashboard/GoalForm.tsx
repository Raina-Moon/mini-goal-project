"use client"; // ✅ Since we're using Next.js App Router

import { useEffect, useState } from "react";
import { createGoal, updateGoal } from "@/utils/api";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";
import { useRouter } from "next/navigation";

const GoalForm = ({ onGoalCreated }: { onGoalCreated: () => void }) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [goalId, setGoalId] = useState<number | null>(null);

  const startTimer = (goalId: number, duration: number) => {
    setGoalId(goalId);
    setSecondsLeft(duration * 60);
  };

  const handleFailOut = async () => {
    if (goalId) {
      await updateGoal(goalId, "failed out");
      alert("😢 Failed out");
      setSecondsLeft(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = Number(localStorage.getItem("userId"));
    try {
      const newGoal = await createGoal(title, duration, userId);
      startTimer(newGoal.id, duration);
      onGoalCreated();
    } catch (err) {
      alert("Error creating goal");
    }
  };

  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft <= 0 && goalId) {
      updateGoal(goalId, "nailed it").then(() => {
        alert("💪 Nailed it!");
        setSecondsLeft(null);
      });
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, goalId]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  // ✅ Fail on tab close or refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (secondsLeft !== null) {
        e.preventDefault();
        e.returnValue = "";
        updateGoal(goalId!, "failed out");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [secondsLeft, goalId]);

  // ✅ Fail if user switches tab or minimizes window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && secondsLeft !== null && goalId !== null) {
        updateGoal(goalId, "failed out");
        alert("😢 You left the page. Failed out.");
        setSecondsLeft(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [secondsLeft, goalId]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mx-7 mt-20 p-4 border border-primary-500 rounded-[20px]"
    >
      <div className="flex flex-row items-center justify-center gap-4">
        <h1 className="font-medium text-xl text-center text-gray-900">
          lowkey timer drip!
        </h1>
        <img src="/images/TimerLogo.png" className="w-7 h-7"/>
      </div>
      {secondsLeft === null ? (
        <>
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
        </>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-emerald-600">
            ⏳ {formatTime(secondsLeft)}
          </p>
          <GlobalButton onClick={handleFailOut}>Fail Out</GlobalButton>
        </div>
      )}
    </form>
  );
};

export default GoalForm;
