"use client";

import React, { useState } from "react";
import GlobalInput from "@/components/ui/GlobalInput";
import GlobalButton from "@/components/ui/GlobalButton";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import {
  changePassword,
  verifyCurrentPassword,
} from "@/stores/slices/authSlice";

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const userEmail = useAppSelector((state) => state.auth.user?.email);

  const [currentPassword, setCurrentPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validatePassword = (password: string) => {
    const errors = [];
    if (!/[A-Z]/.test(password)) errors.push("uppercase");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("special char");
    if (!/\d/.test(password)) errors.push("number");
    if (password.length < 7) errors.push("7+ chars");

    if (errors.length === 0) return [];
    if (errors.length === 4)
      return ["Password needs uppercase, special char, number, and 7+ chars!"];
    if (errors.length === 1) return [`Add a ${errors[0]} and you’re good!`];
    return [`Missing ${errors.length}: ${errors.join(", ")}.`];
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pw = e.target.value;
    setNewPassword(pw);
    setPasswordErrors(validatePassword(pw));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setConfirmPassword(newValue);
    setConfirmPasswordError(
      newValue && newValue !== newPassword ? "Oops, these don’t match yet." : ""
    );
  };

  const handleVerify = async () => {
    setError(null);
    if (!userEmail) {
      try {
        await dispatch(
          verifyCurrentPassword({ email: userEmail ?? "", currentPassword })
        ).unwrap();
        setVerified(true);
      } catch (err: any) {
        setError(err.message || "Failed to verify password");
      }
    }
  };

  const handleChangePassword = async () => {
    setError(null);

    if (!userEmail) {
      setError("No user logged in");
      return;
    }

    const pwErr = validatePassword(newPassword);
    if (pwErr.length > 0) {
      setPasswordErrors(pwErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Oops, these don’t match yet.");
      return;
    }

    try {
      await dispatch(
        changePassword({
          email: userEmail,
          currentPassword,
          newPassword,
        })
      ).unwrap();
      setSuccessMessage("Password changed successfully");
      setTimeout(onClose, 2000);
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
        className="bg-white p-6 rounded-lg max-w-sm w-[85%]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        {!verified ? (
          <>
            <div className="mb-4">
              <GlobalInput
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <GlobalButton onClick={handleVerify}>Verify</GlobalButton>
          </>
        ) : (
          <>
            <div className="mb-4">
              <GlobalInput
                label="New Password"
                type="password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                error={
                  passwordErrors.length > 0 ? passwordErrors.join(" ") : ""
                }
              />
            </div>
            <div className="mb-4">
              <GlobalInput
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={confirmPasswordError}
              />
            </div>
            <GlobalButton onClick={handleChangePassword}>
              Change Password
            </GlobalButton>
          </>
        )}
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        {successMessage && (
          <p className="text-primary-700 text-xs mt-2">{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
