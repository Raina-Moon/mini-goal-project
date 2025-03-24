interface Goal {
    id: number;
    title: string;
    duration: number;
    status: string;
    created_at: string;
  }
  
  interface FailedGoalsTabProps {
    goals: Goal[];
  }
  
  const FailedGoalsTab = ({ goals }: FailedGoalsTabProps) => (
    <ul className="space-y-3">
      {goals
        .filter((goal) => goal.status === "failed out")
        .map((goal) => (
          <li key={goal.id} className="border border-red-400 bg-red-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-700">{goal.title}</h2>
            <p className="text-sm text-gray-600">Duration: {goal.duration} min</p>
            <p className="text-sm text-gray-400">
              Created: {new Date(goal.created_at).toLocaleString()}
            </p>
          </li>
        ))}
    </ul>
  );
  
  export default FailedGoalsTab;