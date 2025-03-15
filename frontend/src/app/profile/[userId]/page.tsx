"use client";

import React, { useEffect, useState } from "react";
import ProfileForm from "../ProfileForm"; // Assume this is your form component
import { getStoredToken } from "@/utils/api";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getStoredToken();
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      router.push("/signup"); // Redirect to signup if token or userId is missing
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const parsedUserId = JSON.parse(userId);
        const res = await fetch(`http://localhost:5000/api/auth/profile/${parsedUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const profileData = await res.json();
        setUser(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        router.push("/signup"); // 에러 시 리다이렉트
      }
    };

    fetchUserProfile();
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return <ProfileForm username={user.username} />;
};

export default ProfilePage;