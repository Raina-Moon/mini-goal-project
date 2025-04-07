"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useBookmarks } from "@/app/contexts/BookmarksContext";
import { Notification, Post } from "@/utils/api";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import ProfileCard from "./components/ProfileCard";
import NotificationModal from "./components/NotificationModal";
import BookmarksModal from "./components/BookmarksModal";
import LogoutModal from "./components/LogoutModal";
import PostDetailModal from "./components/PostDetailModal";

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
  const [showBookmarkedPosts, setShowBookmarkedPosts] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!token || !userId) return;
    if (!isLoggedIn) {
      router.push("/login");
    } else if (!user) {
      getProfile(Number(userId));
    }
  }, [token, router, isLoggedIn, userId, getProfile]);

  const loadNotifications = async () => {
    if (user) {
      try {
        const notifs = await fetchNotifications(user.id);
        setNotifications(notifs);
        setShowNotifications(true);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
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

  const handleShowBookmarks = async () => {
    if (user) {
      const posts = await fetchBookmarkedPosts(user.id);
      console.log("Fetched bookmarked posts:", posts); // Debugging line
      setBookmarkedPosts(posts);
      setShowBookmarkedPosts(true);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleBookmarkChange = (postId: number, isBookmarked: boolean) => {
    console.log("Bookmark changed:", { postId, isBookmarked }); // Debugging line
    setBookmarkedPosts((prev) =>
      isBookmarked
        ? [...prev, { ...selectedPost!, post_id: postId }]
        : prev.filter((p) => p.post_id !== postId)
    );
  };

  const handleSelectPost = (post: Post) => {
    console.log("Selected post:", post); // Debugging line
    setSelectedPost(post);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen bg-primary-500 flex flex-col items-center justify-between p-8 relative">
      <ProfileCard
        user={user}
        updateProfile={updateProfile}
        updateProfileImage={updateProfileImage}
        userId={userId as string}
        onLoadNotifications={loadNotifications}
        onShowBookmarks={handleShowBookmarks}
        onLogoutConfirm={() => setShowLogoutConfirm(true)}
        notificationEnabled={notificationEnabled}
        toggleNotification={() => setNotificationEnabled(!notificationEnabled)}
      />
      <div className="w-full text-center text-white text-[6px] mb-4">
        Made by @Raina
      </div>

      {showNotifications && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDeleteNotification}
        />
      )}

      {showBookmarkedPosts && (
        <BookmarksModal
          bookmarkedPosts={bookmarkedPosts}
          onClose={() => setShowBookmarkedPosts(false)}
          onSelectPost={setSelectedPost}
        />
      )}

      {showLogoutConfirm && (
        <LogoutModal
          onConfirm={() => {
            handleLogout();
            setShowLogoutConfirm(false);
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          user={user}
          onBookmarkChange={handleBookmarkChange}
        />
      )}
    </div>
  );
};

export default ProfilePage;
