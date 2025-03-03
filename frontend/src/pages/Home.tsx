import React from 'react';
import GoalForm from '../components/GoalForm';
import GoalList from '../components/GoalList';

const Home: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Mini Goal Tracker</h1>
            <GoalForm />
            <GoalList />
        </div>
    );
};

export default Home;