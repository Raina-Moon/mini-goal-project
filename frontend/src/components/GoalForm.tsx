import React, { useState } from 'react';

const GoalForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(5); // default duration in minutes

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const goalData = { title, duration };

        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(goalData),
            });

            if (response.ok) {
                // Handle successful goal creation (e.g., reset form, show success message)
                setTitle('');
                setDuration(5);
            } else {
                // Handle error (e.g., show error message)
                console.error('Failed to create goal');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Goal Title"
                className="p-2 border border-gray-300 rounded"
                required
            />
            <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="Duration (minutes)"
                className="p-2 border border-gray-300 rounded"
                min="1"
                required
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                Create Goal
            </button>
        </form>
    );
};

export default GoalForm;