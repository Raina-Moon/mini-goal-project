import express, { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db";

const router = express.Router();

// ✅ User Signup
router.post(
  "/signup",
  async (
    req: Request<
      any,
      any,
      { username: string; email: string; password: string }
    >,
    res: Response
  ) => {
    const { username, email, password } = req.body;

    try {
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
  }
);

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
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
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

// ✅ Get User Profile
router.get("/profile/:userId", (async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Update User Profile
router.patch("/profile/:userId", (async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { username } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email",
      [username, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
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

    // simulate sending email by returning the token
    res.json({ resetToken, message: "Password reset token generated." });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}) as RequestHandler);

// ✅ Verify Reset Token & Update Password
router.patch("/reset-password", (async (req: Request, res: Response) => {
  const { email, reset_token, newPassword } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT reset_token FROM users WHERE email = $1",
      [email]
    );

    if (
      userResult.rows.length === 0 ||
      userResult.rows[0].reset_token !== reset_token
    ) {
      return res.status(400).json({ error: "Invalid token or email." });
    }

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

export default router;
