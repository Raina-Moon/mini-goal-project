"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";
import { PostModal } from "./PostModal";
import { celebrate } from "@/utils/confetti";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Lottie from "lottie-react";
import timerAnimation from "@/assets/timerAnimation.json";

import { createGoal, updateGoal } from "@/stores/slices/goalSlice";
import { createPost } from "@/stores/slices/postSlice";
import type { RootState } from "@/stores";

const GoalForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.auth.user);

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

  const startTimer = (newGoalId: number, dur: number) => {
    setGoalId(newGoalId);
    setSecondsLeft(dur * 60);
  };

  const handleFailOut = async () => {
    if (!goalId) return;
    try {
      await dispatch(updateGoal({ goalId, status: "failed out" })).unwrap();
      toast.error("😢 Failed out");
      setSecondsLeft(null);
    } catch (err) {
      console.error(err);
      toast.error("Error updating goal");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast("Oops! looks like you're not logged in.", {
        action: { label: "Login", onClick: () => router.push("/login") },
      });
      return;
    }

    try {
      const newGoal = await dispatch(
        createGoal({ userId: user.id, title, duration })
      ).unwrap();
      startTimer(newGoal.id, duration);
    } catch (err) {
      console.error(err);
      toast.error("Error creating goal");
    }
  };

  const handlePostSubmit = async ({
    imageUrl,
    description,
  }: {
    imageUrl: string;
    description: string;
  }) => {
    if (!user?.id || !goalId) return;
    try {
      await dispatch(
        createPost({ userId: user.id, goalId, imageUrl, description })
      ).unwrap();
      setShowPostModal(false);
      router.push(`/dashboard/${user.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Error creating post");
    }
  };

  // Timer & status effects
  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft <= 0 && goalId) {
      dispatch(updateGoal({ goalId, status: "nailed it" }))
        .unwrap()
        .then(() => {
          celebrate();
          toast.success("💪 Nailed it!");
          setCompletedGoal({ id: goalId, title, duration });
          setShowPostModal(true);
          setSecondsLeft(null);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error updating goal status. Please try again.");
        });
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, goalId, dispatch, title, duration]);

  // Fail on unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (secondsLeft !== null && goalId) {
        e.preventDefault();
        e.returnValue = "";
        dispatch(updateGoal({ goalId, status: "failed out" }))
          .unwrap()
          .catch((err) => {
            console.error(err);
            toast.error("Error updating goal status. Please try again.");
          });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [secondsLeft, goalId, dispatch]);

  // Fail on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && secondsLeft !== null && goalId !== null) {
        dispatch(updateGoal({ goalId, status: "failed out" }))
          .unwrap()
          .then(() => {
            toast.error("😢 You left the page. Failed out.");
            setSecondsLeft(null);
          })
          .catch((err) => {
            console.error(err);
            toast.error("Error updating goal status. Please try again.");
          });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [secondsLeft, goalId, dispatch]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

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
          <div className="flex flex-col items-center justify-between mt-2 gap-2">
            <div className="flex flex-row gap-4 items-center justify-center mb-4">
              <Lottie
                animationData={timerAnimation}
                loop={true}
                style={{ width: 40, height: 40 }}
              />
              <p className="text-4xl font-semibold text-primary-600">
                {formatTime(secondsLeft)}
              </p>
            </div>
            <GlobalButton onClick={handleFailOut}>Fail Out</GlobalButton>
          </div>
        )}
      </form>
      {showPostModal && completedGoal && (
        <PostModal
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          title={completedGoal?.title}
          duration={completedGoal?.duration}
          onSubmit={handlePostSubmit}
        />
      )}
    </>
  );
};

export default GoalForm;
