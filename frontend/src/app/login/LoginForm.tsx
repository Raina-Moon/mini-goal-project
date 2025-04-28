"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";
import GoBackArrow from "../../../public/icons/GoBackArrow";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { login } from "@/stores/slices/authSlice";

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { isLoggedIn, status } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Hmm… that doesn’t look like a real email!");
      return;
    }
    if (!password) {
      setPasswordError("Don’t forget to type in your password!");
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      toast.success(`Welcome back, ${email}!`);
    } catch (err: any) {
      if (err === "Invalid password") {
        setPasswordError("Oops! That password doesn’t seem right.");
      } else if (err === "Invalid email") {
        setEmailError("We couldn’t find an account with that email.");
      } else {
        toast.error(err || "Login didn’t work… mind trying again?");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-[35px] w-[80%]">
      <div className="text-center text-neutral-100 text-xl font-medium">
        Stay On, Badge Up
        <br />
        Share the Win!
      </div>

      <div className="bg-white w-full rounded-2xl p-4">
        <button onClick={() => router.push("/")}>
          <GoBackArrow />
        </button>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-y-2"
        >
          <div className="text-gray-900 text-base my-4">Logo</div>

          <GlobalInput
            label="email"
            type="email"
            id="email"
            name="email"
            value={email}
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />

          <GlobalInput
            label="password"
            type="password"
            id="password"
            name="password"
            value={password}
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />

          <GlobalButton
            type="submit"
            className="mt-4"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Logging in…" : "log in"}
          </GlobalButton>
        </form>

        <Link href="/forgot-password" className="block mt-4 text-center text-primary-500 text-xs hover:text-primary-600">
          Forgot your password? Fix it here!
        </Link>

        <Link href="/signup" className="block mt-2 text-center text-primary-500 text-xs hover:text-primary-600">
          Need an account? Sign up here
        </Link>
      </div>

      <div className="absolute bottom-1 w-full text-center text-white text-[6px]">
        Made by @Raina
      </div>
    </div>
  );
};

export default LoginForm;
