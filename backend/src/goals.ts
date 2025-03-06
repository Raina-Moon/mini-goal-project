import express from "express";
import pool from "./db";

const router = express.Router();

// ✅ Create a new goal
router.post("/", async (req, res) => {
    const { user_id, title, duration } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO goals (user_id, title, duration) VALUES ($1, $2, $3) RETURNING *",
            [user_id, title, duration]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// ✅ Get all goals for a user
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM goals WHERE user_id = $1", [user_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// ✅ Update a goal status
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            "UPDATE goals SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// ✅ Delete a goal
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM goals WHERE id = $1", [id]);
        res.json({ message: "Goal deleted" });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;
