"use client";

import { useState } from "react";
import { signup } from "@/utils/api";
import { useRouter } from "next/navigation";

const SignupForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await signup(username, email, password);
      alert("Signup successful! Please log in.");
      router.push("/login");
    } catch (error) {
      alert("Signup failed!");
    }
  };

  return (
    <div className="w-80 h-[568px] bg-emerald-500 flex flex-col justify-center items-center">
        <h2 className="text-white text-sm text-center mb-4">
          Step Up, Stay Focused<br />Signup for the Brag!
        </h2>
      <div className="w-56 h-96 bg-neutral-100 rounded-2xl shadow-sm px-4 py-5 flex flex-col">

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 flex-grow">
          <label className="text-sm font-medium text-black">Username</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-emerald-500 p-1 rounded"
            required
          />

          <label className="text-sm text-black">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-emerald-700 p-1 rounded"
            required
          />

          <label className="text-sm">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-emerald-500 p-1 rounded"
            required
          />

          <label className="text-sm">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`border p-1 rounded ${
              confirmPassword && password !== confirmPassword ? "border-red-500" : "border-emerald-700"
            }`}
            required
          />

          {password !== confirmPassword && confirmPassword && (
            <div className="text-red-500 text-xs text-center">
              No match, try again!
            </div>
          )}

          <button
            type="submit"
            className="bg-emerald-300 rounded-full text-white text-xs mt-2 py-1 w-16 mx-auto"
          >
            Sign Up
          </button>
        </form>

        <div className="text-white text-xs text-center mt-3">
          Need help?{" "}
          <span className="text-white cursor-pointer">
            Forgot password?
          </span>
        </div>
        <div className="text-center mt-2 text-white text-xs cursor-pointer" onClick={() => router.push('/login')}>
          Have an account? Login
        </div>

        <div className="absolute bottom-1 w-full text-center text-white text-[8px]">
          Made by @Raina
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
