"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import GlobalButton from "@/components/ui/GlobalButton";
import GlobalInput from "@/components/ui/GlobalInput";
import GoBackArrow from "../../../public/icons/GoBackArrow";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // ✅ Get email from URL
  const { verifyResetCode, resetPassword } = useAuth();

  const [code, setCode] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [passwordError, setPasswordError] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

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

  const validatePassword = (password: string) => {
    const errors = [];
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("special char");
    if (!/\d/.test(password)) errors.push("number");
    if (password.length < 7) errors.push("7+ chars");

    if (errors.length === 0) return [];

    if (errors.length === 4)
      return ["Password needs uppercase, special char, number, and 7+ chars!"];
    if (errors.length === 1) return [`Add a ${errors[0]} and you’re good!`];
    return [`Missing ${errors.length}: ${errors.join(", ")}.`];
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const errors = validatePassword(newPassword);
    setPasswordError(errors);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setConfirmPasswordError(
      newConfirmPassword && newConfirmPassword !== password
        ? "Oops, these don’t match yet."
        : ""
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setPasswordError(errors);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Hmm… looks like the passwords aren’t the same.");
      return;
    }

    const enteredCode = parseInt(code.join(""));
    try {
      if (email) {
        await resetPassword(email, enteredCode, password);
        alert("Password successfully reset!");
        router.push("/login");
      } else {
        alert("Email is missing. Please try again.");
      }
    } catch (error) {
      alert("Failed to reset password.");
    }
  };

  return (
    <div className=" relative flex flex-col items-center justify-center mx-10">
      <h2 className="text-neutral-100 text-center mb-4 text-lg font-medium pt-[105px]">
        Enter your code <br /> Reset your password
      </h2>

      <div className="bg-white rounded-2xl p-4 flex flex-col">
        <button onClick={() => router.back()} className="mb-4">
          <GoBackArrow />
        </button>
        <form
          onSubmit={handleResetPassword}
          className="flex flex-col justify-center items-center gap-3"
        >
          <div className="flex gap-2 my-4 justify-center items-center">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                className="w-[10%] h-16 bg-primary-100 rounded-lg border border-primary-400 text-center text-xl focus:outline-none focus:border-primary-600"
                required
              />
            ))}
          </div>

          <GlobalButton type="button" onClick={handleVerifyCode}>
            {" "}
            verify code
          </GlobalButton>

          <p className="text-sm text-gray-600 mt-2">
            {isCodeValid
              ? "now, set your new password!"
              : "enter the code and hit confirm to change your password!"}
          </p>

          <GlobalInput
            label="New Password"
            type="password"
            value={password}
            disabled={!isCodeValid}
            onChange={handlePasswordChange}
            placeholder={
              isCodeValid
                ? "create a new password"
                : "Please verify the code first"
            }
            error={passwordError.join(", ")}
            className={`w-48 h-8 rounded border px-2 py-1 text-sm focus:outline-none ${
              isCodeValid ? "border-emerald-500" : "border-gray-300"
            }`}
          />

          <GlobalInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            disabled={!isCodeValid}
            onChange={handleConfirmPasswordChange}
            placeholder={
              isCodeValid
                ? "type that password again"
                : "Please verify the code first"
            }
            error={confirmPasswordError}
            className={`w-48 h-8 rounded border px-2 py-1 text-sm focus:outline-none ${
              isCodeValid ? "border-emerald-500" : "border-gray-300"
            }`}
          />

          <GlobalButton type="submit" className="mt-2" disabled={!isCodeValid}>
            reset password
          </GlobalButton>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
