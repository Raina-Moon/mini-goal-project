"use client";

import { useEffect, useState } from "react";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";
import PostModal from "./PostModal";
import { celebrate } from "@/utils/confetti";
import { useGoals } from "@/app/contexts/GoalContext";
import { usePosts } from "@/app/contexts/PostContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { toast } from "sonner";
import Lottie from "lottie-react";
import timerAnimation from "@/assets/timerAnimation.json";

const GoalForm = ({ onGoalCreated }: { onGoalCreated: () => void }) => {
  const { createGoal, updateGoal } = useGoals();
  const { createPost } = usePosts();
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [goalId, setGoalId] = useState<number | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [completedGoal, setCompletedGoal] = useState<{
    id: number;
    title: string;
    duration: number;
  } | null>(null);

  const startTimer = (goalId: number, duration: number) => {
    setGoalId(goalId);
    setSecondsLeft(duration * 60);
  };

  const handleFailOut = async () => {
    if (goalId) {
      await updateGoal(goalId, "failed out");
      toast.error("😢 Failed out");
      setSecondsLeft(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) {
      toast("Oops! looks like you're not logged in.", {
        action: {
          label: "Login",
          onClick: () => {
            router.push("/login");
          },
        },
      });
      return;
    }
    try {
      const newGoal = await createGoal(user.id, title, duration);
      startTimer(newGoal.id, duration);
      onGoalCreated();
    } catch (err) {
      toast.error("error creating goal");
    }
  };

  const handlePostSubmit = async ({
    imageUrl,
    description,
  }: {
    imageUrl: string;
    description: string;
  }) => {
    if (!user || !user.id || !goalId) return;

    await createPost(user.id, goalId, imageUrl, description);
    setShowPostModal(false);
  };

  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft <= 0 && goalId) {
      updateGoal(goalId, "nailed it")
        .then(() => {
          celebrate();
          toast.success("💪 Nailed it!");
          setCompletedGoal({ id: goalId, title, duration });
          setShowPostModal(true);
          setSecondsLeft(null);
        })
        .catch((err) => {
          console.error("Error updating goal:", err);
          toast.error("Error updating goal status. Please try again.");
        });
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, goalId, updateGoal]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  // ✅ Fail on tab close or refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (secondsLeft !== null && goalId) {
        e.preventDefault();
        e.returnValue = "";
        updateGoal(goalId, "failed out").catch((err) => {
          console.error("Error updating goal:", err);
          toast.error("Error updating goal status. Please try again.");
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [secondsLeft, goalId, updateGoal]);

  // ✅ Fail if user switches tab or minimizes window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && secondsLeft !== null && goalId !== null) {
        updateGoal(goalId, "failed out")
          .then(() => {
            toast.error("😢 You left the page. Failed out.");
            setSecondsLeft(null);
          })
          .catch((err) => {
            console.error("Error updating goal:", err);
            toast.error("Error updating goal status. Please try again.");
          });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [secondsLeft, goalId, updateGoal]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-10 mt-10 mb-[30px] p-4 border border-primary-500 rounded-[20px]"
      >
        <div className="flex flex-row items-center justify-center pb-4">
          <h1 className="text-xl text-center text-gray-900">
            lowkey timer drip!
          </h1>
          <img src="/images/TimerLogo.png" className="w-7 h-7" />
        </div>
        {secondsLeft === null ? (
          <>
            <GlobalInput
              label="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title"
              className="mb-[9px]"
            />
            <GlobalInput
              label="duration"
              type="number"
              value={String(duration)}
              onChange={(e) => setDuration(Number(e.target.value))}
              className=""
            />
            <div className="flex justify-center mt-[23px]">
              <GlobalButton type="submit">hit the drip</GlobalButton>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <Lottie
              animationData={timerAnimation}
              loop={true}
              style={{ width: 20, height: 20 }}
            />
            <p className="text-2xl font-semibold text-primary-600">
              {formatTime(secondsLeft)}
            </p>
            <GlobalButton onClick={handleFailOut}>Fail Out</GlobalButton>
          </div>
        )}
      </form>
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title={completedGoal?.title}
        duration={completedGoal?.duration}
        onSubmit={handlePostSubmit}
      />
    </>
  );
};

export default GoalForm;
