"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorIcon from "../../../public/icons/ErrorIcon";
import { useAuth } from "../contexts/AuthContext";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";

const SignupForm = () => {
  const { signup } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    setPasswordErrors(errors);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) {
      setPasswordErrors(passwordValidationErrors);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await signup(username, email, password);
      alert("Signup successful! Please log in.");
      router.push("/login");
    } catch (error: any) {
      if (error.message === "Username is already taken") {
        setError("username is already taken!");
      } else {
        setError("Signup failed!");
      }
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-2">
          <div className="text-gray-900 text-base text-center">Logo</div>

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
            error={passwordErrors.length > 0 ? passwordErrors.join(" ") : ""}
          />

          <GlobalInput
            label="confirm password"
            type="password"
            placeholder="confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={confirmPasswordError}
          />

          <GlobalInput
            label="username"
            type="text"
            placeholder="Username"
            className={`${
              error?.includes("Username")
                ? "border-red-500"
                : "border-primary-400 focus:border-primary-600"
            }`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {error && (
            <div className="text-red-500 text-xs flex flex-row">
              <ErrorIcon /> {error}
            </div>
          )}

          <GlobalButton type="submit">sign </GlobalButton>
        </form>

        <Link href="/login">
          <p className="mt-3 text-center text-primary-500 text-xs cursor-pointer hover:text-primary-600">
            Have an account? Hit login!
          </p>
        </Link>
      </div>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-[6px]">
        Made by @Raina
      </div>
    </div>
  );
};

export default SignupForm;
