"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoBackArrow from "../../../public/icons/GoBackArrow";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { requestPasswordReset } from "@/stores/slices/authSlice";

const ForgotPasswordForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useSearchParams();
  const prefilledEmail = params?.get("email") ?? "";

  const { status, error: reduxError } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState(prefilledEmail);

  useEffect(() => {
    if (reduxError) {
      toast.error(reduxError);
    }
  }, [reduxError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(requestPasswordReset(email)).unwrap();
      toast.success("Check your email for the reset code!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      if (status !== "loading") {
        toast.error("Email sending failed!");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center font-inter">
      <h2 className="text-neutral-100 text-center mb-3 pt-[105px] text-lg font-medium">
        Drop your email
        <br />
        we'll send you the code!
      </h2>

      <div className="bg-white rounded-2xl shadow-sm px-2 py-4 flex flex-col mt-10">
        <button onClick={() => router.back()}>
          <GoBackArrow />
        </button>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 mt-7 px-4"
        >
          <GlobalInput
            label="email"
            type="email"
            id="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <GlobalButton type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "send"}
          </GlobalButton>
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
