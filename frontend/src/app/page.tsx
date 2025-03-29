"use client";

import GoalForm from "../components/GoalForm";
import { useAuth } from "./contexts/AuthContext";

const page = () => {
  const { user } = useAuth();

  return (
    <>
      <GoalForm
        onGoalCreated={() => {
          console.log("Goal created");
        }}
      />
    </>
  );
};

export default page;
