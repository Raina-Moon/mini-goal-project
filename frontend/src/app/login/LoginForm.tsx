"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      alert("Failed to login");
    }
  };

  useEffect(() => {
    if (user) {
      alert(`Welcome back, ${user.username}!`);
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-[45px]">
      <div className="text-center text-neutral-100 text-xl pt-[105px] font-bold">
        Stay On, Badge Up
        <br />
        Share the Win!
      </div>

      <div className=" bg-white rounded-2xl p-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-y-2"
        >
          <div className="text-gray-900 text-base my-4">Logo</div>

          <label
            htmlFor="email"
            className="text-gray-900 text-sm self-start ml-1"
          >
            email
          </label>
          <input
            type="email"
            id="email"
            className="w-full h-8 bg-white rounded border border-primary-400 px-2 text-sm text-gray-900 focus:outline-none focus:border-primary-600"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label
            htmlFor="password"
            className="text-gray-900 text-sm self-start ml-1"
          >
            password
          </label>
          <input
            type="password"
            id="password"
            className="w-full h-8 bg-white rounded border border-primary-400 px-2 text-sm text-gray-900 focus:outline-none focus:border-primary-600"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="mt-3 w-16 h-6 bg-primary-300 rounded-full text-white text-sm hover:bg-primary-600"
          >
            log in
          </button>
        </form>

        <Link href="/forgot-password">
          <p className="mt-4 text-center text-primary-500 text-xs cursor-pointer hover:text-primary-600">
            Forgot your password? Fix it here!
          </p>
        </Link>

        <Link href="/signup">
          <p className="mt-2 text-center text-primary-500 text-xs cursor-pointer hover:text-primary-600">
            Need an account? Sign up here
          </p>
        </Link>
      </div>

      <div className="absolute bottom-1 w-full text-center text-white text-[6px]">
        Made by @Raina
      </div>
    </div>
  );
};

export default LoginForm;
