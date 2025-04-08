"use client";

import React, { useState } from "react";
import CameraIcon from "../../../../../public/icons/CameraIcon";
import BellIcon from "../../../../../public/icons/BellIcon";
import LockIcon from "../../../../../public/icons/LockIcon";
import SavedIcon from "../../../../../public/icons/SavedIcon";
import LogoutIcon from "../../../../../public/icons/LogoutIcon";
import ArrowRightIcon from "../../../../../public/icons/ArrowRightIcon";
import PencilIcon from "../../../../../public/icons/PencilIcon";
import { Switch } from "@/components/ui/switch";
import ChangePasswordModal from "./ChangePasswordModal";
import DeleteIcon from "../../../../../public/icons/DeleteIcon";

interface ProfileCardProps {
  user: { username: string; email: string | undefined; profile_image?: any };
  updateProfile: (userId: number, username: string) => Promise<void>;
  updateProfileImage: (userId: number, file: File) => Promise<void>;
  userId: string;
  onLoadNotifications: () => void;
  onShowBookmarks: () => void;
  onLogoutConfirm: () => void;
  onDeleteConfirm: () => void;
  notificationEnabled: boolean;
  toggleNotification: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  updateProfile,
  updateProfileImage,
  userId,
  onLoadNotifications,
  onShowBookmarks,
  onLogoutConfirm,
  onDeleteConfirm,
  notificationEnabled,
  toggleNotification,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState(user.username);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      if (newUsername !== user.username) {
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
      setErrorMessage(
        err.message === "Username is already taken"
          ? "Username is already taken!"
          : "Failed to update profile!"
      );
    }
  };

  const handleOpenChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl pt-7 px-3 pb-11 relative shadow-lg">
      {/* Profile Image */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <img
          className="w-full h-full rounded-full object-cover"
          src={
            imagePreview || user.profile_image || "/images/DefaultProfile.png"
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
            onClick={onLoadNotifications}
          >
            <div className="flex items-center gap-2">
              <BellIcon />
              <span>The Buzz Box</span>
            </div>
            <ArrowRightIcon />
          </button>
          <button
            className="w-full flex justify-between items-center border-b border-primary-100 text-zinc-600 text-xs py-2 hover:bg-gray-100 rounded"
            onClick={onShowBookmarks}
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
              onCheckedChange={toggleNotification}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 mb-4 border border-primary-200 rounded-2xl px-4 py-2">
          <button
            className="w-full flex justify-between items-center border-b border-primary-100 text-zinc-600 text-xs py-2 hover:bg-gray-100 rounded"
            onClick={handleOpenChangePasswordModal}
          >
            <div className="flex items-center gap-2">
              <LockIcon />
              <span>Key Tweaker</span>
            </div>
            <ArrowRightIcon />
          </button>
          <button
            className="w-full flex justify-start items-center text-red-700 text-xs py-2 hover:bg-gray-100 rounded"
            onClick={onLogoutConfirm}
          >
            <div className="flex items-center gap-2">
              <LogoutIcon />
              <span>Peace Out</span>
            </div>
          </button>

          <button
            className="w-full flex justify-start items-center text-red-700 text-xs py-2 hover:bg-gray-100 rounded"
            onClick={onDeleteConfirm}
          >
            <div className="flex items-center gap-2">
              <DeleteIcon />
              <span>Delete Account</span>
            </div>
          </button>
        </div>
      </div>

      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}
    </div>
  );
};

export default ProfileCard;
