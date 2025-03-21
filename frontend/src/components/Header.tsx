"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");
    const storedImage = localStorage.getItem("profileImage"); // optional caching

    if (token && storedId) {
      setIsLoggedIn(true);
      setUserId(JSON.parse(storedId));
      if (storedImage) setProfileImage(storedImage);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <header className="w-full h-16 flex items-center justify-between px-6 bg-white border-b shadow-sm fixed top-0 z-50">
      {/* Logo */}
      <button onClick={() => router.push("/")} className="text-xl font-bold text-emerald-500">
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
              src={profileImage || "https://placehold.co/40x40"}
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
