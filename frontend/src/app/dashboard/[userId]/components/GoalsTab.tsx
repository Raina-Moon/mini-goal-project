interface Goal {
    id: number;
    title: string;
    duration: number;
    status: string;
    created_at: string;
  }
  
  interface GoalsTabProps {
    goals: Goal[];
    loading: boolean;
  }
  
  const GoalsTab = ({ goals, loading }: GoalsTabProps) => (
    <>
      {loading ? (
        <p>Loading goals...</p>
      ) : goals.length === 0 ? (
        <p className="text-gray-500">No goals yet! Let&apos;s start one! 💡</p>
      ) : (
        <ul className="space-y-3">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className={`border rounded-lg p-4 ${
                goal.status === "nailed it"
                  ? "border-emerald-500 bg-emerald-50"
                  : goal.status === "failed out"
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{goal.title}</h2>
                  <p className="text-sm text-gray-600">Duration: {goal.duration} min</p>
                  <p className="text-sm text-gray-400">
                    Created: {new Date(goal.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    goal.status === "nailed it"
                      ? "bg-emerald-200 text-emerald-800"
                      : goal.status === "failed out"
                      ? "bg-red-200 text-red-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {goal.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
  
  export default GoalsTab;