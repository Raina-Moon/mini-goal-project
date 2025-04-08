"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  onClose,
}) => {
  const { user, verifyCurrentPassword, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    setError(null);
    try {
      await verifyCurrentPassword(user?.email as string, currentPassword);
      setVerified(true);
    } catch (err: any) {
      setError(err.message || "Current password is incorrect");
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    try {
      await changePassword(user?.email as string, currentPassword, newPassword);
      setSuccessMessage("Password updated successfully");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        {!verified ? (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>
            <button
              onClick={handleVerify}
              className="bg-primary-500 text-white text-xs px-3 py-1 rounded"
            >
              Verify
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="bg-primary-500 text-white text-xs px-3 py-1 rounded"
            >
              Change Password
            </button>
          </>
        )}
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        {successMessage && (
          <p className="text-green-500 text-xs mt-2">{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
