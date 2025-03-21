"use client";

import React, { useEffect, useState } from "react";
import ProfileForm from "../ProfileForm";
import { getProfile, getStoredToken, logout, updateProfile, updateProfileImage } from "@/utils/api";
import { useParams, useRouter } from "next/navigation";

const ProfilePage = () => {
  const { userId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    profile_image: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const token = getStoredToken();
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

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
  }, [userId, token]);

  const handleUpdateUsername = async (newUsername: string) => {
    if (!token || !userId) return;
    try {
      const updatedUser = await updateProfile(
        token,
        Number(userId),
        newUsername
      );
      setUser({ ...updatedUser, email: user?.email || "" }); // Keep email intact
      setIsEditing(false); // Close form after updating
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="w-80 h-[568px] relative bg-emerald-500 overflow-hidden">
      {/* Profile Card */}
      <div className="w-56 h-96 left-[51px] top-[104px] absolute bg-neutral-100 rounded-2xl" />
      <div className="w-40 h-20 left-[84px] top-[257px] absolute bg-white rounded-2xl border border-emerald-100" />
      <img
        className="w-16 h-16 left-[126px] top-[131px] absolute rounded-full object-cover"
        src={user.profile_image}
        alt="Profile"
      />

{/* Change Profile Image Section */}
<input
  type="text"
  className="absolute top-[340px] left-[60px] w-48 p-1 text-xs rounded"
  placeholder="Paste image URL"
  value={newImageUrl}
  onChange={(e) => setNewImageUrl(e.target.value)}
/>
<button
  className="absolute top-[370px] left-[60px] bg-white border border-emerald-200 rounded-lg px-2 text-emerald-500 text-xs"
  onClick={async () => {
    if (!token || !userId || !newImageUrl) return;
    try {
      const updatedUser = await updateProfileImage(
        token,
        Number(userId),
        newImageUrl
      );
      setUser(updatedUser);
      setNewImageUrl("");
    } catch (err) {
      console.error(err);
    }
  }}
>
  Update Image
</button>

      {/* User Info */}
      <div className="left-[124px] top-[209px] absolute text-center text-black text-base font-normal">
        {user.username}
      </div>
      <div className="left-[123px] top-[225px] absolute text-center text-zinc-500 text-[8px]">
        {user.email}
      </div>

      {/* Edit Button */}
      <button
        className="w-32 h-8 left-[110px] top-[240px] absolute bg-white border border-emerald-200 rounded-lg text-emerald-500 text-sm"
        onClick={() => setIsEditing(true)}
      >
        Edit Profile
      </button>

      {/* Profile Sections */}
      <div className="left-[114px] top-[270px] absolute text-center text-zinc-600 text-[8px]">
        my goal records
      </div>
      <div className="left-[114px] top-[296px] absolute text-center text-zinc-600 text-[8px]">
        saved
      </div>
      <div className="left-[114px] top-[317px] absolute text-center text-zinc-600 text-[8px]">
        notifications
      </div>
      <div className="left-[115px] top-[398px] absolute text-center text-zinc-600 text-[8px]">
        change password
      </div>

      {/* Logout Section */}
      <div className="w-40 h-20 left-[84px] top-[359px] absolute bg-white rounded-2xl border border-emerald-100">
        <button
          className="left-[31px] top-[59px] absolute text-center text-red-700 text-[8px]"
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
        >
          logout
        </button>
      </div>

      {/* Form Modal */}
      {isEditing && (
        <div className="absolute left-[60px] top-[280px] bg-white p-4 rounded-lg shadow-lg">
          <ProfileForm
            username={user.username}
            onUpdate={handleUpdateUsername}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
