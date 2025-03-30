import express from "express";
import pool from "../db";

const router = express.Router();

// ✅ Get all notifications for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT n.*, u.username as sender_username 
       FROM notifications n 
       JOIN users u ON n.sender_id = u.id 
       WHERE n.user_id = $1 
       ORDER BY n.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const createNotification = async (
  userId: number,
  senderId: number,
  postId: number,
  type: string
) => {
  const senderResult = await pool.query(
    "SELECT username FROM users WHERE id = $1",
    [senderId]
  );
  const senderUsername = senderResult.rows[0].username;
  let message;

  switch (type) {
    case "like":
      message = `${senderUsername} likes your post`;
      break;
    case "comment":
      message = `${senderUsername} left a comment on your post`;
      break;
    case "follow":
      message = `${senderUsername} started following you`;
      break;
    default:
      message = "Something happened!";
  }

  await pool.query(
    "INSERT INTO notifications (user_id, sender_id, post_id, type, message) VALUES ($1, $2, $3, $4, $5)",
    [userId, senderId, postId, type, message]
  );
};

export const createLikeNotification = async (
  userId: number,
  senderId: number,
  postId: number
) => {
  await createNotification(userId, senderId, postId, "like");
};

export const createCommentNotification = async (
  userId: number,
  senderId: number,
  postId: number
) => {
  await createNotification(userId, senderId, postId, "comment");
};

export const createFollowNotification = async (userId: number, senderId: number) => {
  await createNotification(userId, senderId, 0, "follow");
};

// ✅ Mark a notification as read
router.put("/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ message: "Notification not found." });
    } else {
      res.status(200).json({ message: "Notification marked as read." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notification as read." });
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
    res.status(201).json({ message: "Notification added successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to add notification." });
  }
});

export default router;
