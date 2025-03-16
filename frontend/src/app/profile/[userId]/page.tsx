"use client";

import React, { useEffect, useState } from "react";
import ProfileForm from "../ProfileForm"; // Assume this is your form component
import { getProfile, getStoredToken, updateProfile } from "@/utils/api";
import { useParams } from "next/navigation";

const ProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<{ id: number; username: string } | null>(
    null
  );
  const token = getStoredToken();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token || !userId) return;

      try {
        const userProfile = await getProfile(token, Number(userId));
        setUser(userProfile);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [userId,token]);

  const handleUpdateUsername = async (newUsername: string) => {
    if (!token || !userId) return;
    try {
      const updatedUser = await updateProfile(token, Number(userId), newUsername);
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div>Loading...</div>;

  return <ProfileForm username={user.username} onUpdate={handleUpdateUsername}/>;
};

export default ProfilePage;
