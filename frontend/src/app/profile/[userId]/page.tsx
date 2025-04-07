"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import { Notification, Post } from "@/utils/api";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import PencilIcon from "../../../../public/icons/PencilIcon";
import CameraIcon from "../../../../public/icons/CameraIcon";

const ProfilePage = () => {
  const {
    token,
    user,
    isLoggedIn,
    logout,
    getProfile,
    updateProfile,
    updateProfileImage,
  } = useAuth();
  const { fetchBookmarkedPosts } = useBookmarks();
  const { fetchNotifications, markAsRead } = useNotifications();

  const { userId } = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [showBookmarkedPosts, setShowBookmarkedPosts] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !userId) return;
    if (!isLoggedIn) {
      router.push("/login");
    } else if (!user) {
      getProfile(Number(userId));
    }
  }, [token, router, isLoggedIn, userId, getProfile]);

  useEffect(() => {
    if (user) setNewUsername(user.username);
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [user, imagePreview]);

  const handleUpdateProfile = async () => {
    try {
      if (newUsername !== user?.username) {
        await updateProfile(Number(userId), newUsername);
      }
      if (selectedFile) {
        await updateProfileImage(Number(userId), selectedFile);
      }
      setIsEditing(false);
      setSelectedFile(null);
      setImagePreview(null);
      setErrorMessage(null);
    } catch (err: any) {
      if (err.message === "Username is already taken") {
        setErrorMessage("Username is already taken!");
      } else {
        setErrorMessage("Failed to update profile!");
      }
    }
  };

  const loadNotifications = async () => {
    if (user) {
      const notifs = await fetchNotifications(user.id);
      setNotifications(notifs);
      setShowNotifications(true);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
  };

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="w-80 h-[568px] relative bg-emerald-500 overflow-hidden">
      {/* Profile Card */}
      <div className="w-56 h-96 left-[51px] top-[104px] absolute bg-neutral-100 rounded-2xl" />
      <div className="w-40 h-20 left-[84px] top-[257px] absolute bg-white rounded-2xl border border-emerald-100" />

      <div className="w-16 h-16 left-[126px] top-[131px] absolute rounded-full">
        <img
          className="w-16 h-16 left-[126px] top-[131px] absolute rounded-full object-cover"
          src={user.profile_image || "images/DefaultProfile.png"}
          alt="Profile"
        />
        {isEditing && (
          <div
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => document.getElementById("imageUpload")?.click()}
          >
            <CameraIcon />
          </div>
        )}

        {/* Upload & Preview Profile Image */}
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 2 * 1024 * 1024) {
                setErrorMessage("Image must be less than 2MB.");
                setSelectedFile(null);
                setImagePreview(null);
                return;
              }
              setSelectedFile(file);
              setImagePreview(URL.createObjectURL(file));
              setErrorMessage(null);
            }
          }}
        />
      </div>

      <div className="left-[124px] top-[209px] absolute text-center text-black text-base font-normal">
        {isEditing ? (
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="border-b border-gray-400 outline-none text-center bg-transparent"
          />
        ) : (
          user.username
        )}
      </div>
      <div className="left-[123px] top-[225px] absolute text-center text-zinc-500 text-[8px]">
        {user.email}
      </div>

      {/* Save Button (appears when editing) */}
      {isEditing && (
        <button
          className="absolute left-[140px] top-[235px] text-emerald-500 text-xs underline"
          onClick={handleUpdateProfile}
        >
          Save
        </button>
      )}

      {/* Edit Button (hidden when editing) */}
      {!isEditing && (
        <button
          className="w-32 h-8 left-[110px] top-[240px] absolute"
          onClick={() => setIsEditing(true)}
        >
          <PencilIcon />
        </button>
      )}

      {errorMessage && (
        <div className="absolute top-[410px] left-[60px] text-red-500 text-[10px] w-48">
          {errorMessage}
        </div>
      )}

      {/* Profile Sections */}
      <div className="left-[114px] top-[270px] absolute text-center text-zinc-600 text-[8px]">
        my goal records
      </div>
      <button
        className="left-[114px] top-[296px] absolute text-center text-zinc-600 text-[8px]"
        onClick={async () => {
          if (user) {
            const posts = await fetchBookmarkedPosts(user.id);
            setBookmarkedPosts(posts);
            setShowBookmarkedPosts(true);
          }
        }}
      >
        saved
      </button>
      <button
        className="left-[114px] top-[317px] absolute text-center text-zinc-600 text-[8px]"
        onClick={loadNotifications}
      >
        notifications
      </button>
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

      {/* Notification Toggle Button */}
      <div className="left-[114px] top-[338px] absolute text-center text-zinc-600 text-[8px]">
        <label>
          <input
            type="checkbox"
            checked={notificationEnabled}
            onChange={handleNotificationToggle}
          />
          Notification
        </label>
      </div>

      {/* Bookmarked Posts View */}
      {showBookmarkedPosts && (
        <div className="absolute left-[0px] top-[0px] w-full h-full bg-white p-4">
          <button onClick={() => setShowBookmarkedPosts(false)}>Close</button>
          <div className="grid grid-cols-3 gap-2">
            {bookmarkedPosts.map((post) => (
              <img
                key={post.post_id}
                src={post.image_url}
                alt="Bookmarked Post"
                className="w-full h-auto aspect-square object-cover"
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notification Log Section */}
      {showNotifications && (
        <div className="absolute left-[0px] top-[0px] w-full h-full bg-white p-4">
          <button onClick={() => setShowNotifications(false)}>close</button>
          <ul className="space-y-2">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`p-2 ${
                  notif.is_read ? "bg-gray-100" : "bg-blue-100"
                } cursor-pointer`}
                onClick={() => handleMarkAsRead(notif.id)}
              >
                <span>{notif.message}</span>
                <span className="text-xs text-gray-500"> ({notif.type})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-semibold">{selectedPost.title}</h2>
            <img
              src={selectedPost.image_url}
              alt="Post"
              className="w-full h-auto object-cover"
            />
            <p>{selectedPost.description}</p>
            <button onClick={() => setSelectedPost(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
