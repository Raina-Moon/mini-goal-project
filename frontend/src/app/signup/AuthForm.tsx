"use client";

import { useState } from "react";
import { signup, login } from "@/utils/api";
import { useRouter } from "next/navigation";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const user = await login(email, password);
        alert(`Welcome back, ${user.username}!`);
        router.push("/");
      } else {
        await signup(username, email, password);
        alert("Signup successful! Please log in.");
        setIsLogin(true);
      }
    } catch (error) {
      alert("Authentication failed!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      {!isLogin && (
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="border p-2 w-full"
          required
        />
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2 w-full"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2 w-full"
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        {isLogin ? "Login" : "Signup"}
      </button>
      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="text-blue-500"
      >
        {isLogin ? "Need an account? Signup" : "Already have an account? Login"}
      </button>
    </form>
  );
};

export default AuthForm;
