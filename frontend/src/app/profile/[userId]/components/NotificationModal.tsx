"use client";

import React from "react";
import GoBackArrow from "../../../../../public/icons/GoBackArrow";
import { Notification } from "@/utils/api";
import { formatTimeAgo } from "@/utils/formatTimeAgo";

interface NotificationModalProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (notificationId: number) => void;
  onDelete: (notificationId: number) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onDelete,
}) => {
  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex flex-col z-50">
      <div className="flex items-center justify-start p-4 border-b border-gray-200 bg-gray-50">
        <button className="text-zinc-600" onClick={onClose}>
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
              }`}
            >
              <span className="flex-1 cursor-pointer" onClick={() => onMarkAsRead(notif.id)}>
                {notif.message}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notif.created_at || "")}
                </span>
                <button
                  className="text-red-500 hover:text-red-700 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notif.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationModal;