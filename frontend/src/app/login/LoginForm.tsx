"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";
import GoBackArrow from "../../../public/icons/GoBackArrow";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login, user } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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
      await login(email, password);
    } catch (error: any) {
      if (error.message === "Invalid password") {
        setPasswordError("Oops! That password doesn’t seem right.");
      } else if (error.message === "Invalid email") {
        setEmailError("We couldn’t find an account with that email.");
      } else {
        setPasswordError("Login didn’t work... mind trying again?");
      }
    }
  };

  useEffect(() => {
    if (user) {
      alert(`Welcome back, ${user.username}!`);
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-[35px] w-[80%]">
      <div className="text-center text-neutral-100 text-xl font-medium">
        Stay On, Badge Up
        <br />
        Share the Win!
      </div>

      <div className=" bg-white w-full rounded-2xl p-4">
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

          <GlobalButton type="submit" className="mt-4">
            log in
          </GlobalButton>
        </form>

        <Link href="/forgot-password">
          <p className="mt-4 text-center text-primary-500 text-xs cursor-pointer hover:text-primary-600">
            Forgot your password? Fix it here!
          </p>
        </Link>

        <Link href="/signup">
          <p className="mt-2 text-center text-primary-500 text-xs cursor-pointer hover:text-primary-600">
            Need an account? Sign up here
          </p>
        </Link>
      </div>

      <div className="absolute bottom-1 w-full text-center text-white text-[6px]">
        Made by @Raina
      </div>
    </div>
  );
};

export default LoginForm;
