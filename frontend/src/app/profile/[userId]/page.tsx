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
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import FarewellModal from "./components/FarewellModal";

const ProfilePage = () => {
  const {
    token,
    user,
    isLoggedIn,
    logout,
    getProfile,
    updateProfile,
    updateProfileImage,
    deleteUser,
  } = useAuth();
  const { fetchBookmarkedPostDetail } = useBookmarks();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState<string | null>(null);
  const [showFarewellModal, setShowFarewellModal] = useState(false);

  useEffect(() => {
    if (!token || !userId) return;
    if (!isLoggedIn) {
      router.push("/login");
    } else if (!user) {
      getProfile(Number(userId));
    }
  }, [token, router, isLoggedIn, userId, getProfile]);

  useEffect(() => {
    if (isDeleting) {
      const messages = [
        "We're crying because you're leaving...",
        "Wiping away our tears...",
        "Deleting your data...",
        "Almost done...",
      ];
      let index = 0;
      setDeletionMessage(messages[index]);
      const interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setDeletionMessage(messages[index]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isDeleting]);

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

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      setIsDeleting(false);
      setShowFarewellModal(true);
      setTimeout(() => {
        setShowFarewellModal(false);
        router.push("/");
      }, 3000); // Show farewell for 3 seconds
    } catch (err) {
      console.error("Failed to delete account:", err);
      setIsDeleting(false);
    }
  };

  const handleShowBookmarks = async () => {
    if (user) {
      const posts = await fetchBookmarkedPostDetail(user.id);
      setBookmarkedPosts(posts);
      setShowBookmarkedPosts(true);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleBookmarkChange = (postId: number, isBookmarked: boolean) => {
    setBookmarkedPosts((prev) =>
      isBookmarked
        ? [...prev, { ...selectedPost!, post_id: postId }]
        : prev.filter((p) => p.post_id !== postId)
    );
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="w-full h-screen bg-primary-500 flex flex-col items-center justify-between p-8 relative overflow-hidden">
      <ProfileCard
        user={user}
        updateProfile={updateProfile}
        updateProfileImage={updateProfileImage}
        userId={userId as string}
        onLoadNotifications={loadNotifications}
        onShowBookmarks={handleShowBookmarks}
        onLogoutConfirm={() => setShowLogoutConfirm(true)}
        onDeleteConfirm={() => setShowDeleteConfirm(true)}
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

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => {
            handleDeleteAccount();
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {isDeleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg">{deletionMessage}</div>
        </div>
      )}

      {showFarewellModal && <FarewellModal />}

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
