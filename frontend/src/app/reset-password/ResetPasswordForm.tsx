"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GoBackArrow from "../../../public/icons/GoBackArrow";
import GlobalButton from "@/components/ui/GlobalButton";
import GlobalInput from "@/components/ui/GlobalInput";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  verifyResetCode,
  resetPassword,
} from "@/stores/slices/authSlice";

const ResetPasswordForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const email = params?.get("email") ?? "";

  const dispatch = useAppDispatch();
  const { status, error: reduxError } = useAppSelector((s) => s.auth);

  const [code, setCode] = useState(["", "", "", ""]);
  const [isCodeValid, setIsCodeValid] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    if (reduxError) {
      toast.error(reduxError);
    }
  }, [reduxError]);

  const handleCodeChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 3) {
      document.getElementById(`code-${idx + 1}`)?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const entered = parseInt(code.join(""), 10);
    try {
      await dispatch(verifyResetCode({ email, reset_token: entered })).unwrap();
      setIsCodeValid(true);
      toast.success("Code verified successfully!");
    } catch {
      toast.error("Invalid code.");
    }
  };

  const validatePassword = (pw: string) => {
    const errs: string[] = [];
    if (!/[A-Z]/.test(pw)) errs.push("uppercase");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pw)) errs.push("special char");
    if (!/\d/.test(pw)) errs.push("number");
    if (pw.length < 7) errs.push("7+ chars");
    if (errs.length === 0) return [];
    if (errs.length === 4)
      return ["Password needs uppercase, special char, number, and 7+ chars!"];
    if (errs.length === 1) return [`Add a ${errs[0]} and you’re good!`];
    return [`Missing ${errs.length}: ${errs.join(", ")}.`];
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pw = e.target.value;
    setPassword(pw);
    setPasswordErrors(validatePassword(pw));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cpw = e.target.value;
    setConfirmPassword(cpw);
    setConfirmPasswordError(
      cpw && cpw !== password ? "Oops… passwords don’t match." : ""
    );
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwErrs = validatePassword(password);
    if (pwErrs.length) {
      setPasswordErrors(pwErrs);
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords must match!");
      return;
    }

    const entered = parseInt(code.join(""), 10);
    try {
      await dispatch(
        resetPassword({ email, newPassword: password, reset_token: entered })
      ).unwrap();
      toast.success("Password successfully reset!");
      router.push("/login");
    } catch {
      toast.error("Failed to reset password.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center mx-10">
      <h2 className="text-neutral-100 text-center mb-4 text-lg font-medium pt-[105px]">
        Enter your code <br />
        Reset your password
      </h2>

      <div className="bg-white rounded-2xl p-4 flex flex-col">
        <button onClick={() => router.back()} className="mb-4">
          <GoBackArrow />
        </button>

        <form
          onSubmit={handleResetSubmit}
          className="flex flex-col justify-center items-center gap-3"
        >
          <div className="flex gap-2 my-4 justify-center">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`code-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(idx, e.target.value)}
                className="w-[15%] h-16 bg-primary-100 rounded-lg border border-primary-400 text-center text-xl focus:outline-none focus:border-primary-600"
                required
              />
            ))}
          </div>

          <GlobalButton
            type="button"
            onClick={handleVerifyCode}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Verifying…" : "verify code"}
          </GlobalButton>

          <p className="text-sm text-gray-600 mt-2">
            {isCodeValid
              ? "Now set your new password!"
              : "Enter code and hit verify to continue."}
          </p>

          <GlobalInput
            label="New Password"
            type="password"
            value={password}
            disabled={!isCodeValid}
            onChange={handlePasswordChange}
            placeholder={isCodeValid ? "create new password" : "verify code first"}
            error={passwordErrors.join(", ")}
            className={isCodeValid ? "border-emerald-500" : "border-gray-300"}
          />

          <GlobalInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            disabled={!isCodeValid}
            onChange={handleConfirmPasswordChange}
            placeholder={isCodeValid ? "confirm password" : "verify code first"}
            error={confirmPasswordError}
            className={isCodeValid ? "border-emerald-500" : "border-gray-300"}
          />

          <GlobalButton
            type="submit"
            className="mt-2"
            disabled={!isCodeValid || status === "loading"}
          >
            {status === "loading" ? "Resetting…" : "reset password"}
          </GlobalButton>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
