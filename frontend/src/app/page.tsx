"use client";

import { useRouter } from "next/navigation";
import GoalForm from "../components/GoalForm";
import { useAuth } from "./contexts/AuthContext";

const page = () => {
  const { user } = useAuth();
  const router = useRouter();
  const handleGoalCreated = () => {
    if (user) {
      router.push(`/dashboard/${user.id}`);
    }
  };

  return (
    <>
      <GoalForm onGoalCreated={handleGoalCreated} />
    </>
  );
};

export default page;
