"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorIcon from "../../../public/icons/ErrorIcon";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { signup } from "@/stores/slices/authSlice";

const SignupForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { status, error: reduxError } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

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

  // Live password validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pw = e.target.value;
    setPassword(pw);
    setPasswordErrors(validatePassword(pw));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const cpw = e.target.value;
    setConfirmPassword(cpw);
    setConfirmPasswordError(
      cpw && cpw !== password ? "Oops, these don’t match yet." : ""
    );
  };

  // When reduxError changes (e.g. username taken), show it locally
  useEffect(() => {
    if (reduxError) {
      if (reduxError.includes("Username is already taken")) {
        setLocalError("username is already taken!");
      } else {
        setLocalError("Signup failed! Please try again.");
      }
    }
  }, [reduxError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const pwErrs = validatePassword(password);
    if (pwErrs.length) {
      setPasswordErrors(pwErrs);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      // dispatch signup thunk
      await dispatch(signup({ username, email, password })).unwrap();
      toast.success("Signup successful! Please log in.");
      router.push("/login");
    } catch {
      toast.error("Signup failed! Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-b from-primary-300 to-primary-600">
      <div className="text-neutral-100 text-center mb-3 mt-[5px] text-lg font-medium">
        Step Up, Badge Up
        <br />
        Create Your Account!
      </div>

      <div className="bg-white rounded-2xl px-4 py-4 flex flex-col mt-4 w-[80%]">
        {localError && (
          <div className="flex items-center text-red-600 mb-2">
            <ErrorIcon /> {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-y-2">
          <GlobalInput
            label="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <GlobalInput
            label="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={handlePasswordChange}
            error={passwordErrors.join(" ")}
          />

          <GlobalInput
            label="confirm password"
            type="password"
            placeholder="confirm password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={confirmPasswordError}
          />

          <GlobalInput
            label="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <GlobalButton
            type="submit"
            className="mt-2"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing up…" : "sign up"}
          </GlobalButton>
        </form>

        <Link
          href="/login"
          className="mt-3 text-center text-primary-500 text-xs hover:text-primary-600"
        >
          Have an account? Hit login!
        </Link>
      </div>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-[6px]">
        Made by @Raina
      </div>
    </div>
  );
};

export default SignupForm;
