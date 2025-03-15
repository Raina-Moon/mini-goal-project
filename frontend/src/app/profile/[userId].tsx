'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router'; // for dynamic routes
import ProfileForm from "./ProfileForm"; // Assume this is your form component

const ProfilePage = () => {
  const router = useRouter();
  const { userId } = router.query; // Get userId from URL parameter

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!userId) return; // Wait for userId to be available (from router)

    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
        const data = await res.json();

        if (res.ok) {
          setUser(data); // Set user data (including username)
        } else {
          console.error("Failed to fetch profile:", data.error);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchUserProfile();
  }, [userId]); // Re-run this effect when userId changes

  // Loading state or error handling
  if (!user) return <div>Loading...</div>;

  return <ProfileForm username={user.username} />;
};

export default ProfilePage;
