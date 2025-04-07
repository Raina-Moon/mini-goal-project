"use client";

import React from "react";

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-sm w-[90%] text-center">
        <p className="text-gray-900 text-lg mb-4">
          Logging out already? We'll miss you! 😢
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="text-white bg-red-500 px-4 py-2 rounded-full hover:bg-red-600"
            onClick={onConfirm}
          >
            Bye for now 👋
          </button>
          <button
            className="text-white bg-primary-400 px-3 py-2 rounded-full hover:bg-primary-600"
            onClick={onCancel}
          >
            Stay a bit longer 🫶
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;