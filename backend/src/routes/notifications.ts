import express, { Request, Response, RequestHandler } from "express";
import pool from "../db";
import webPush from "web-push";
import { PoolClient } from "pg";

const router = express.Router();

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || "PUBLIC_VAPID_KEY",
  privateKey: process.env.VAPID_PRIVATE_KEY || "PRIVATE_VAPID_KEY",
};
webPush.setVapidDetails(
  "mailto:mds6425@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const subscriptions: { [userId: number]: any } = {};

// ✅ Subscribe to notifications
router.post("/subscribe", (async (req: Request, res: Response) => {
  const { subscription, userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }
  subscriptions[userId] = subscription;
  res.status(201).json({ message: "Subscribed" });
}) as RequestHandler);

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

router.delete("/:id", (async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM notifications WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

const createNotification = async (
  userId: number,
  senderId: number,
  postId: number | null,
  type: string,
  client?: PoolClient
) => {
  const db = client || pool;
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

  const subscription = subscriptions[userId];
  if (subscription) {
    const payload = JSON.stringify({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      body: message,
    });
    webPush.sendNotification(subscription, payload).catch((error) => {
      console.error("Failed to send push notification:", error);
    });
  }
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

export const createFollowNotification = async (
  userId: number,
  senderId: number,
  client?: PoolClient
) => {
  await createNotification(userId, senderId, null, "follow", client);
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
    console.error("Error in mark as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read." });
  }
});

// // ✅ Get a notification
// router.post("/", async (req, res) => {
//   const { userId, message } = req.body;
//   try {
//     await pool.query(
//       "INSERT INTO notifications (user_id, message) VALUES ($1, $2)",
//       [userId, message]
//     );
//     res.status(201).json({ message: "Notification added successfully." });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to add notification." });
//   }
// });

export default router;
