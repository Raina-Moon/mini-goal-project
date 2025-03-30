"use client";

import { createContext, useContext, ReactNode } from "react";
import { fetchApi } from "@/utils/api/fetch";
import { Notification } from "@/utils/api";

interface NotificationsState {
  fetchNotifications: (userId: number) => Promise<Notification[]>;
  markAsRead: (notificationId: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsState | undefined>(
  undefined
);

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const fetchNotifications = async (userId: number) => {
    return await fetchApi<Notification[]>(`/notifications/${userId}`);
  };

  const markAsRead = async (notificationId: number) => {
    await fetchApi(`/notifications/${notificationId}/read`, { method: "PUT" });
  };

  const value: NotificationsState = {
    fetchNotifications,
    markAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context)
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  return context;
};
