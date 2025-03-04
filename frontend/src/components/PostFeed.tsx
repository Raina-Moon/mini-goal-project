import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PostFeed: React.FC = () => {
    interface Post {
        id: number;
        content: string;
        imageUrl?: string;
    }

    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('/api/posts');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="post-feed">
            <h2 className="text-2xl font-bold mb-4">Post Feed</h2>
            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="p-4 border rounded shadow">
                        <h3 className="font-semibold">{post.content}</h3>
                        {post.imageUrl && <img src={post.imageUrl} alt="Post proof" className="mt-2" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostFeed;