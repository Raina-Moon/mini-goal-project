import React, { useEffect, useState } from 'react';
import { Goal } from '../types';

const GoalList: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const response = await fetch('/api/goals');
                const data = await response.json();
                setGoals(data);
            } catch (error) {
                console.error('Error fetching goals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="goal-list">
            <h2 className="text-xl font-bold mb-4">Your Goals</h2>
            <ul>
                {goals.map(goal => (
                    <li key={goal.id} className="mb-2 p-4 border rounded shadow">
                        <h3 className="text-lg">{goal.title}</h3>
                        <p>Duration: {goal.duration} minutes</p>
                        <p>Status: {goal.completed ? 'Completed' : 'In Progress'}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GoalList;