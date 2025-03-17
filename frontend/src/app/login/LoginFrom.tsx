"use client";

import { useState } from "react";
import { login } from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      alert(`Welcome back, ${user.username}!`);
      router.push("/");
    } catch (error) {
      alert("Login failed!");
    }
  };

  return (
<div className="bg-blue-500 w-80 h-[568px] relative overflow-hidden font-inter mx-auto">
        <div className="w-52 h-24 absolute left-[55px] top-[56px] text-center text-neutral-100 text-base leading-none">
      Stay On, Badge Up<br/>Share the Win!
    </div>

    <div className="w-56 h-80 absolute left-[49px] top-[165px] bg-neutral-100 rounded-2xl shadow-sm p-4">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-y-2">
        <div className="text-black text-base my-4">Logo</div>

        <label htmlFor="email" className="text-black text-sm self-start ml-1">Email</label>
        <input
          type="email"
          id="email"
          className="w-full h-8 bg-white rounded border border-emerald-700 px-2 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" className="text-black text-sm self-start ml-1">Password</label>
        <input
          type="password"
          id="password"
          className="w-full h-8 bg-white rounded border border-emerald-500 px-2 text-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="mt-3 w-16 h-6 bg-emerald-300 rounded-full text-white text-sm">
          Log in
        </button>
      </form>

      <Link href="/forgot-password">
        <p className="mt-4 text-center text-emerald-500 text-xs cursor-pointer">
          Forgot your password? Fix it here!
        </p>
      </Link>

      <Link href="/signup">
        <p className="mt-2 text-center text-emerald-500 text-xs cursor-pointer">
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
