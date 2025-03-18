"use client";

import React, { useState, useEffect } from "react";
import { verifyResetCode, resetPassword } from "@/utils/api";
import { useRouter } from "next/navigation";

const ResetPasswordForm = () => {
  const router = useRouter();

  const [code, setCode] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const userEmail = prompt("Please confirm your email again:");
    if (userEmail) setEmail(userEmail);
    else router.push("/forgot-password");
  }, [router]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newCodeInputs = [...codeInputs];
    newCodeInputs[index] = value;
    setCodeInputs(newCodeInputs);

    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleCodeVerify = async () => {
    const code = codeInputs.join("");
    if (code.length !== 4) {
      alert("Enter the 4-digit code.");
      return;
    }

    try {
      await verifyResetCode(email, parseInt(code));
      setIsCodeValid(true);
      alert("Code verified! Please set your new password.");
    } catch (error) {
      alert("Invalid code!");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await resetPassword(email, parseInt(codeInputs.join("")), password);
      alert("Password updated! You can now log in.");
      router.push("/login");
    } catch (error) {
      alert("Password reset failed!");
    }
  };

  return (
    <div className="bg-emerald-500 w-80 h-[568px] relative overflow-hidden font-inter mx-auto flex flex-col items-center justify-center">
      <h2 className="text-neutral-100 text-center mb-4 text-sm">
        Enter the code<br /> Reset your password!
      </h2>

      <form onSubmit={handlePasswordReset} className="w-56 h-80 bg-neutral-100 rounded-2xl shadow-sm p-4 flex flex-col items-center gap-y-2 relative">
        <div className="flex gap-2 mb-4">
          {codeInputs.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              value={digit}
              maxLength={1}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              className="w-8 h-14 bg-emerald-100 rounded-lg border border-emerald-400 text-center text-xl"
              required
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleCodeVerify}
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

        {password !== confirmPassword && confirmPassword && (
          <p className="text-red-500 text-[8px] text-center">No match, try again!</p>
        )}

        <button
          onClick={handlePasswordReset}
          disabled={!isCodeValid || !password || password !== confirmPassword}
          className="w-20 h-6 bg-emerald-300 text-white rounded-full text-xs mt-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Reset Password
        </button>
      </form>

      <div className="absolute bottom-2 text-white text-[6px]">
        Made by @Raina
      </div>
    </div>
  );
};

export default ResetPasswordForm;
