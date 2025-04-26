"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProfileCard from "./components/ProfileCard";
import NotificationModal from "./components/NotificationModal";
import BookmarksModal from "./components/BookmarksModal";
import LogoutModal from "./components/LogoutModal";
import PostDetailModal from "./components/PostDetailModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import FarewellModal from "./components/FarewellModal";

import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  fetchViewUser,
  logout,
  updateProfile,
  updateProfileImage,
  deleteUser,
} from "@/stores/slices/authSlice";
import { fetchBookmarkedPostDetail } from "@/stores/slices/bookmarksSlice";
import {
  fetchNotifications,
  markAsRead,
  deleteNotification,
} from "@/stores/slices/notificationSlice";

import type { Post, Notification } from "@/utils/api";

const ProfilePage = () => {
  const { userId } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state
  const loggedIn = useAppSelector((s) => s.auth.isLoggedIn);
  const profile = useAppSelector((s) => s.auth.viewUser);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = useAppSelector((s) => s.notification.notifications);

  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState<string>("");

  const [showFarewell, setShowFarewell] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    dispatch(fetchViewUser(Number(userId)));
  }, [loggedIn, userId, dispatch, router]);

  useEffect(() => {
    if (!isDeleting) return;
    const msgs = [
      "We're crying because you're leaving...",
      "Wiping away our tears...",
      "Deleting your data...",
      "Almost done...",
    ];
    let idx = 0;
    setDeletionMessage(msgs[idx]);
    const iv = setInterval(() => {
      idx = (idx + 1) % msgs.length;
      setDeletionMessage(msgs[idx]);
    }, 2000);
    return () => clearInterval(iv);
  }, [isDeleting]);

  const loadNotifications = () => {
    if (!profile?.id) return;
    dispatch(fetchNotifications(profile.id));
    setShowNotifications(true);
  };

  const handleMarkRead = (notifId: number) => {
    dispatch(markAsRead(notifId));
  };

  const handleDeleteNotif = (notifId: number) => {
    dispatch(deleteNotification(notifId));
  };

  const handleShowBookmarks = async () => {
    if (!profile?.id) return;
    const action = await dispatch(
      fetchBookmarkedPostDetail(profile.id)
    ).unwrap();
    setBookmarkedPosts(action);
    setShowBookmarks(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!profile?.id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteUser(profile.id)).unwrap();
      setIsDeleting(false);
      setShowFarewell(true);
      setTimeout(() => {
        setShowFarewell(false);
        router.push("/");
      }, 5000);
    } catch {
      setIsDeleting(false);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen bg-primary-500 flex flex-col items-center justify-between p-8 relative overflow-hidden">
      <ProfileCard
        user={profile}
        updateProfile={async (userIdArg: number, usernameArg: string) => {
          await dispatch(
            updateProfile({ userId: userIdArg, username: usernameArg })
          ).unwrap();
        }}
        updateProfileImage={async (userIdArg: number, fileArg: File) => {
          await dispatch(
            updateProfileImage({ userId: userIdArg, file: fileArg })
          ).unwrap();
        }}
        userId={String(userId)}
        onLoadNotifications={loadNotifications}
        onShowBookmarks={handleShowBookmarks}
        onLogoutConfirm={() => setShowLogoutConfirm(true)}
        onDeleteConfirm={() => setShowDeleteConfirm(true)}
        notificationEnabled={notificationEnabled}
        toggleNotification={() => setNotificationEnabled((f) => !f)}
      />

      <div className="w-full text-center text-white text-[6px] mb-4">
        Made by @Raina
      </div>

      {showNotifications && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={handleMarkRead}
          onDelete={handleDeleteNotif}
        />
      )}

      {showBookmarks && (
        <BookmarksModal
          bookmarkedPosts={bookmarkedPosts}
          onClose={() => setShowBookmarks(false)}
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

      {showFarewell && <FarewellModal />}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          user={profile}
          onBookmarkChange={(postId, isBookmarked) => {
            setBookmarkedPosts((prev) =>
              isBookmarked
                ? [...prev, { post_id: postId } as Post]
                : prev.filter((p) => p.post_id !== postId)
            );
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
