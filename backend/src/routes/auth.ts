import express, { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db";
import { sendVerificationCode } from "../utils/email";

const router = express.Router();

// ✅ User Signup
router.post("/signup", (async (
  req: Request<any, any, { username: string; email: string; password: string }>,
  res: Response
) => {
  const { username, email, password } = req.body;

  try {
    const usernameCheck = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ User Login
router.post("/login", (async (
  req: Request<any, any, { email: string; password: string }>,
  res: Response
) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Send Password Reset Token (Email simulation)
router.post("/forgot-password", (async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = Math.floor(1000 + Math.random() * 9000); // 4-digit code for simplicity

    await pool.query("UPDATE users SET reset_token = $1 WHERE email = $2", [
      resetToken,
      email,
    ]);

    await sendVerificationCode(email, resetToken);

    // simulate sending email by returning the token
    res.json({ resetToken, message: "Password reset token generated." });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Verify reset code
router.post("/verify-code", (async (req: Request, res: Response) => {
  const { email, reset_token } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT reset_token FROM users WHERE email = $1",
      [email]
    );

    if (
      userResult.rows.length === 0 ||
      userResult.rows[0].reset_token !== reset_token
    ) {
      return res.status(400).json({ error: "Invalid token." });
    }

    res.json({ message: "Code verified successfully." });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Verify Reset Token & Update Password
router.patch("/reset-password", (async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Verify Current Password
router.post("/verify-current-password", (async (
  req: Request,
  res: Response
) => {
  const { email, currentPassword } = req.body;
  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    res.json({ message: "Password verified" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Change Password
router.patch("/change-password", (async (req: Request, res: Response) => {
  const { email, currentPassword, newPassword } = req.body;
  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Update Profile Image
router.patch("/profile/:userId/image", (async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { profileImage } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING id, username, email, profile_image",
      [profileImage, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Delete User and All Related Data
router.delete("/delete-user/:userId", (async (req: Request, res: Response) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    ) as { userId: number };
    if (decoded.userId !== Number(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await pool.query("BEGIN");

    await pool.query("DELETE FROM posts WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM goals WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM comments WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM likes WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM bookmarks WHERE user_id = $1", [userId]);
    await pool.query(
      "DELETE FROM notifications WHERE user_id = $1 OR sender_id = $1",
      [userId]
    );
    await pool.query(
      "DELETE FROM follows WHERE follower_id = $1 OR following_id = $1",
      [userId]
    );
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    await pool.query("COMMIT");

    res.json({ message: "User and all related data deleted successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Delete user error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

export default router;
