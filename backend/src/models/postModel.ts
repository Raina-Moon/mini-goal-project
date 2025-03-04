import pool from '../database';

export interface Post {
  id?: number;
  goal_id: number;
  photo_url?: string;
  badge?: string;
  text?: string;
  uploaded_at?: Date;
}

export const createPost = async (post: Post) => {
  const { goal_id, photo_url, badge, text } = post;
  const result = await pool.query(
    'INSERT INTO posts (goal_id, photo_url, badge, text, uploaded_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
    [goal_id, photo_url, badge, text]
  );
  return result.rows[0];
};

export const getAllPosts = async () => {
  const result = await pool.query('SELECT * FROM posts');
  return result.rows;
};