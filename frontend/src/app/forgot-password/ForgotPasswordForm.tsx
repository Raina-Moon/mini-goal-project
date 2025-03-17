"use client";

import React, { useState } from "react";
import { requestPasswordReset } from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPasswordReset(email);
      alert("Check your email for the reset code!");
      router.push("/reset-password");
    } catch (error) {
      alert("Email sending failed!");
    }
  };

  return (
    <div className="bg-emerald-500 w-80 h-[568px] flex flex-col items-center justify-center mx-auto font-inter">
      <h2 className="text-neutral-100 text-center mb-3 text-sm">
        Drop your email
        <br />
        we'll send you the code!
      </h2>

      <form
        onSubmit={handleSubmit}
        className="w-56 h-36 bg-neutral-100 rounded-2xl shadow-sm px-4 py-5 flex flex-col gap-3 items-center"
      >
        <label htmlFor="email" className="text-xs text-emerald-800">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-48 bg-white border border-emerald-500 rounded px-2 py-1 text-sm"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="mt-3 w-16 bg-emerald-300 rounded-full text-white text-xs py-1"
        >
          Send
        </button>
      </form>

      <Link
        href="/signup"
        className="mt-4 text-xs text-emerald-500 hover:text-emerald-600"
      >
        Need an account? Sign up here
      </Link>

      <div className="absolute bottom-2 text-white text-[6px]">
        Made by @Raina
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
