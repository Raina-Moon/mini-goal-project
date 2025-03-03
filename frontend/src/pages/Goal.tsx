import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Goal, Post } from '../types';
import PostFeed from '../components/PostFeed';

const GoalPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchGoal = async () => {
            const response = await fetch(`/api/goals/${id}`);
            const data = await response.json();
            setGoal(data);
        };

        const fetchPosts = async () => {
            const response = await fetch(`/api/posts?goalId=${id}`);
            const data = await response.json();
            setPosts(data);
        };

        fetchGoal();
        fetchPosts();
    }, [id]);

    if (!goal) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{goal.title}</h1>
            <p>Duration: {goal.duration} minutes</p>
            <p>Status: {goal.completed ? 'Completed' : 'In Progress'}</p>
            <PostFeed posts={posts} />
        </div>
    );
};

export default GoalPage;