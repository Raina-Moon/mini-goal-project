"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import GoBackArrow from "../../../public/icons/GoBackArrow";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";

const ForgotPasswordForm = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPasswordReset(email);
      alert("Check your email for the reset code!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      alert("Email sending failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center font-inter">
      <h2 className="text-neutral-100 text-center mb-3 pt-[105px] text-lg font-medium">
        Drop your email
        <br />
        we'll send you the code!
      </h2>

      <div className=" bg-white rounded-2xl shadow-sm px-2 py-4 flex flex-col mt-10">
        <button onClick={() => router.back()}>
          <GoBackArrow />
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-7 px-4">
          <GlobalInput
            label="email"
            type="email"
            id="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <GlobalButton type="submit" onClick={() => router.back()}>send</GlobalButton>
        </form>
      </div>

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
