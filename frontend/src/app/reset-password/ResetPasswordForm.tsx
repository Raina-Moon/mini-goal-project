"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyResetCode, resetPassword } from "@/utils/api";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // ✅ Get email from URL

  const [code, setCode] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);

  if (!email) {
    router.push("/forgot-password"); // Redirect if email is missing
  }

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const enteredCode = parseInt(code.join(""));
    try {
      await verifyResetCode(email!, enteredCode);
      setIsCodeValid(true);
      alert("Code verified successfully!");
    } catch (error) {
      alert("Invalid code.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const enteredCode = parseInt(code.join(""));

    try {
      await resetPassword(email!, enteredCode, password);
      alert("Password successfully reset!");
      router.push("/login");
    } catch (error) {
      alert("Failed to reset password.");
    }
  };

  return (
    <div className="bg-emerald-500 w-80 h-[568px] relative overflow-hidden font-inter mx-auto flex flex-col items-center justify-center">
      <h2 className="text-neutral-100 text-center mb-4 text-sm">
        Enter your code <br /> Reset your password
      </h2>

      <form onSubmit={handleResetPassword} className="w-56 h-80 bg-neutral-100 rounded-2xl shadow-sm p-4 flex flex-col items-center gap-y-2 relative">
        <div className="flex gap-2 mb-4">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              className="w-8 h-14 bg-emerald-100 rounded-lg border border-emerald-400 text-center text-xl"
              required
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleVerifyCode}
          className="bg-emerald-300 rounded-full text-white text-xs py-1 w-20 mb-2"
        >
          Verify Code
        </button>

        <label className="text-xs text-black">New Password</label>
        <input
          type="password"
          value={password}
          disabled={!isCodeValid}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-48 h-8 rounded border px-2 py-1 text-sm ${
            isCodeValid ? "border-emerald-500" : "border-gray-300"
          }`}
          placeholder="Password"
        />

        <label className="text-xs text-black">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          disabled={!isCodeValid}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-48 h-8 rounded px-2 text-sm ${
            confirmPassword && password !== confirmPassword
              ? "border border-red-500"
              : "border border-emerald-500"
          }`}
        />

        <button
          type="submit"
          className="mt-3 w-20 h-6 bg-emerald-300 rounded-full text-white text-xs"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
