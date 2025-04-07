"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import { Notification, Post } from "@/utils/api";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import PencilIcon from "../../../../public/icons/PencilIcon";
import CameraIcon from "../../../../public/icons/CameraIcon";
import LogoutIcon from "../../../../public/icons/LogoutIcon";
import BellIcon from "../../../../public/icons/BellIcon";
import LockIcon from "../../../../public/icons/LockIcon";
import { Switch } from "@/components/ui/switch";
import SavedIcon from "../../../../public/icons/SavedIcon";
import ArrowRightIcon from "../../../../public/icons/ArrowRightIcon";
import GoBackArrow from "../../../../public/icons/GoBackArrow";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

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
  const { fetchNotifications, markAsRead, deleteNotification } =
    useNotifications();

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen bg-primary-500 flex flex-col items-center justify-between p-8 relative">
      {" "}
      {/* Profile Card */}
      <div className="w-full max-w-md bg-white rounded-2xl pt-7 px-3 pb-11 relative shadow-lg">
        {/* Profile Image */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <img
            className="w-full h-full rounded-full object-cover"
            src={
              imagePreview || user.profile_image || "images/DefaultProfile.png"
            }
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

        {/* User Info */}
        <div className="text-center mb-4 flex flex-col">
          <div className="text-gray-900 text-lg">
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
            {/* Edit Button */}
            {!isEditing && (
              <button className="ml-2" onClick={() => setIsEditing(true)}>
                <PencilIcon />
              </button>
            )}
          </div>
          <div className="text-zinc-500 text-xs mt-1">{user.email}</div>
          {isEditing && (
            <div className="flex justify-center mt-2">
              <button
                className="text-white bg-primary-500 text-xs px-3 py-2 rounded-full hover:bg-primary-600"
                onClick={handleUpdateProfile}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-500 text-xs text-center mb-4">
            {errorMessage}
          </div>
        )}

        {/* Profile Sections */}
        <div className="flex flex-col">
          <div className="flex flex-col items-center justify-center gap-1 mb-4 border border-primary-200 rounded-2xl px-4 py-2">
            <button
              className="w-full flex justify-between border-b border-primary-100 items-center text-zinc-600 text-xs py-2 hover:bg-gray-100 rounded"
              onClick={loadNotifications}
            >
              <div className="flex items-center gap-2">
                <BellIcon />
                <span>The Buzz Box</span>
              </div>
              <ArrowRightIcon />
            </button>
            <button
              className="w-full flex justify-between items-center border-b border-primary-100 text-zinc-600 text-xs py-2 hover:bg-gray-100 rounded"
              onClick={async () => {
                if (user) {
                  const posts = await fetchBookmarkedPosts(user.id);
                  setBookmarkedPosts(posts);
                  setShowBookmarkedPosts(true);
                }
              }}
            >
              <div className="flex items-center gap-2">
                <SavedIcon />
                <span>Saved</span>
              </div>
              <ArrowRightIcon />
            </button>

            <div className="w-full flex justify-between items-center text-zinc-600 text-xs py-2">
              <div className="flex items-center gap-2">
                <BellIcon />
                <span>Buzz Mode</span>
              </div>
              <Switch
                checked={notificationEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex flex-col items-center justify-center gap-1 mb-4 border border-primary-200 rounded-2xl px-4 py-2">
            <div className="w-full flex justify-between items-center border-b border-primary-100 text-zinc-600 text-xs py-2 hover:bg-gray-100 rounded">
              <div className="flex items-center gap-2">
                <LockIcon />
                <span>Key Tweaker</span>
              </div>
              <ArrowRightIcon />
            </div>
            <button
              className="w-full flex justify-start items-center text-red-700 text-xs py-2 hover:bg-gray-100 rounded"
              onClick={handleLogoutConfirm}
            >
              <div className="flex items-center gap-2">
                <LogoutIcon />
                <span>Peace Out</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="w-full text-center text-white text-[6px] mb-4">
        Made by @Raina
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-sm w-[90%] text-center">
            <p className="text-gray-900 text-lg mb-4">
              Logging out already? We'll miss you! 😢
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="text-white bg-red-500 px-4 py-2 rounded-full hover:bg-red-600"
                onClick={() => {
                  handleLogout();
                  setShowLogoutConfirm(false);
                }}
              >
                Bye for now 👋
              </button>
              <button
                className="text-white bg-primary-400 px-3 py-2 rounded-full hover:bg-primary-600"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Stay a bit longer 🫶
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bookmarked Posts View */}
      {showBookmarkedPosts && (
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex flex-col z-10">
          {" "}
          <div className="flex items-center justify-start p-4 border-b border-gray-200">
            <button
              className="text-zinc-600"
              onClick={() => setShowBookmarkedPosts(false)}
            >
              <GoBackArrow />
            </button>
            <h2 className="text-lg font-semibold ml-4">Saved Posts</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
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
        </div>
      )}
      {/* Notification Log Section */}
      {showNotifications && (
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex flex-col z-50">
          {" "}
          <div className="flex items-center justify-start p-4 border-b border-gray-200 bg-gray-50">
            <button
              className="text-zinc-600"
              onClick={() => setShowNotifications(false)}
            >
              <GoBackArrow />
            </button>
            <h2 className="text-lg font-semibold ml-4">Notifications</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`p-2 flex justify-between items-center ${
                    notif.is_read ? "bg-gray-100" : "bg-primary-100"
                  } cursor-pointer`}
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <span>{notif.message}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(notif.created_at || "")}
                    </span>
                    <button
                      className="text-red-500 hover:text-red-700 text-xs"
                      onClick={() => handleDeleteNotification(notif.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed top-16 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-semibold">{selectedPost.title}</h2>
            <img
              src={selectedPost.image_url}
              alt="Post"
              className="w-full h-auto object-cover"
            />
            <p>{selectedPost.description}</p>
            <button
              className="mt-2 text-zinc-600 text-xs"
              onClick={() => setSelectedPost(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
