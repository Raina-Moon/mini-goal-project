"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

const Header = () => {
  const router = useRouter();
  const { user, getProfile, isLoggedIn } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn || !user?.id || user.profile_image) {
      return;
    }
    await getProfile(user.id);
  }, [isLoggedIn, user?.id, user?.profile_image, getProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="w-full h-16 flex items-center justify-between px-6 bg-white border-b shadow-sm fixed top-0 z-50">
      {/* Logo */}
      <button
        onClick={() => router.push("/")}
        className="text-xl font-bold text-emerald-500"
      >
        Sign
      </button>
      {/* Right side */}
      <button
        onClick={() =>
          router.push(isLoggedIn && user ? `/dashboard/${user.id}` : "/login")
        }
        className={
          isLoggedIn && user
            ? "w-10 h-10 rounded-full border border-gray-300 overflow-hidden"
            : "text-sm px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
        }
      >
        {isLoggedIn && user ? (
          <img
            src={
              user.profile_image
                ? `${user.profile_image}?t=${Date.now()}`
                : "/images/DefaultProfile.png"
            }
            alt="Profile"
            className="object-cover w-full h-full"
          />
        ) : (
          "Login"
        )}
      </button>
    </div>
  );
};

export default Header;
