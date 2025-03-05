import { useState } from "react";
import { createGoal } from "../utils/api";

const GoalForm = () => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal(title, duration, 1);
    alert("Goal created!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal Title" />
      <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
      <button type="submit">Start Goal</button>
    </form>
  );
};

export default GoalForm;
