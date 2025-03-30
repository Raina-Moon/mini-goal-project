import express from "express";
import pool from "../db";

const router = express.Router();

// ✅ Get all notifications for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ✅ Mark a notification as read
router.put("/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ message: "알림을 찾을 수 없습니다." });
    } else {
      res.status(200).json({ message: "알림이 읽음으로 표시되었습니다." });
    }
  } catch (error) {
    res.status(500).json({ message: "알림 업데이트에 실패했습니다." });
  }
});

// ✅ Get a notification
router.post("/", async (req, res) => {
  const { userId, message } = req.body;
  try {
    await pool.query(
      "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
      [userId, message]
    );
    res.status(201).json({ message: "알림이 추가되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "알림 추가에 실패했습니다." });
  }
});

export default router;
