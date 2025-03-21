"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, getStoredToken } from "@/utils/api";

const Header = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const storedId = localStorage.getItem("userId");

    if (token && storedId) {
      const id = Number(storedId);
      setIsLoggedIn(true);
      setUserId(id);

      // 🔥 Fetch actual profile image
      const fetchImage = async () => {
        try {
          const user = await getProfile(token, id);
          setProfileImage(user.profile_image);
        } catch (err) {
          console.error("Failed to fetch profile image:", err);
        }
      };

      fetchImage();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <header className="w-full h-16 flex items-center justify-between px-6 bg-white border-b shadow-sm fixed top-0 z-50">
      {/* Logo */}
      <button
        onClick={() => router.push("/")}
        className="text-xl font-bold text-emerald-500"
      >
        Sign
      </button>

      {/* Right side (conditional) */}
      <div>
        {isLoggedIn ? (
          <button
            onClick={() => router.push(`/profile/${userId}`)}
            className="w-10 h-10 rounded-full border border-gray-300 overflow-hidden"
          >
            <img
              src={
                profileImage
                  ? `${profileImage}?t=${Date.now()}` // 💡 bust cache
                  : "/images/DefaultProfile.png" // ✅ corrected
                }
              alt="Profile"
              className="object-cover w-full h-full"
            />
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
