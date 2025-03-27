"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorIcon from "../../../public/icons/ErrorIcon";
import { useAuth } from "../contexts/AuthContext";

const SignupForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const { signup } = useAuth();
  
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
    <div className="bg-primary-500 w-80 h-[568px] relative overflow-hidden font-inter mx-auto">
      <div className="absolute left-1/2 top-[50px] transform -translate-x-1/2 text-center text-neutral-100 text-base">
        Step Up, Badge Up
        <br />
        Create Your Account!
      </div>

      <div className="w-56 bg-neutral-100 rounded-2xl shadow-sm px-4 py-5 absolute left-1/2 top-[140px] transform -translate-x-1/2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-2">
          <div className="text-gray-900 text-base text-center">Logo</div>

          <label className="text-gray-900 text-sm">email</label>
          <input
            type="email"
            placeholder="Email"
            className="border text-gray-900 border-primary-400 px-2 py-1 rounded text-sm focus:outline-none focus:border-primary-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="text-gray-900 text-sm">password</label>
          <input
            type="password"
            placeholder="Password"
            className="border text-gray-900 border-primary-400 px-2 py-1 rounded text-sm focus:outline-none focus:border-primary-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="text-gray-900 text-sm">confirm password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            className={`border px-2 py-1 focus:outline-none rounded text-sm ${
              confirmPassword && password !== confirmPassword
                ? "border-red-500"
                : "border-primary-400 focus:border-primary-600"
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {password !== confirmPassword && confirmPassword && (
            <div className="text-red-500 text-xs flex flex-row">
              <ErrorIcon /> No match, try again!
            </div>
          )}

          <label className="text-gray-900 text-sm">username</label>
          <input
            type="text"
            placeholder="Username"
            className="border text-gray-900 border-primary-400 px-2 py-1 rounded text-sm focus:outline-none focus:border-primary-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-primary-300 rounded-full text-white text-sm mt-2 py-1 self-center w-20 hover:bg-primary-600"
          >
            sign up
          </button>
        </form>

        <Link href="/login">
          <p className="mt-3 text-center text-primary-500 text-xs cursor-pointer hover:text-primary-600">
            Have an account? Hit login!
          </p>
        </Link>
      </div>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-[6px]">
        Made by @Raina
      </div>
    </div>
  );
};

export default SignupForm;
