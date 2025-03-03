import { Request, Response } from 'express';
import { Pool } from 'pg';
import { Post } from '../models/postModel';

export class PostController {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    public async createPost(req: Request, res: Response): Promise<void> {
        const { goalId, content, imageUrl }: Post = req.body;

        try {
            const result = await this.db.query(
                'INSERT INTO posts (goalId, content, imageUrl) VALUES ($1, $2, $3) RETURNING *',
                [goalId, content, imageUrl]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create post' });
        }
    }

    public async getPosts(req: Request, res: Response): Promise<void> {
        const { goalId } = req.params;

        try {
            const result = await this.db.query(
                'SELECT * FROM posts WHERE goalId = $1',
                [goalId]
            );
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve posts' });
        }
    }
}