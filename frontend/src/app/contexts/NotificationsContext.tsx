"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { fetchApi } from "@/utils/api/fetch";
import { Notification } from "@/utils/api";
import { useAuth } from "./AuthContext";

interface NotificationsState {
  fetchNotifications: (userId: number) => Promise<Notification[]>;
  markAsRead: (notificationId: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsState | undefined>(
  undefined
);

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();

  const fetchNotifications = async (userId: number) => {
    return await fetchApi<Notification[]>(`/notifications/${userId}`);
  };

  const markAsRead = async (notificationId: number) => {
    await fetchApi(`/notifications/${notificationId}/read`, { method: "PUT" });
  };

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window && user) {
      const registerServiceWorker = async () => {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const userId = user.id;
        await fetchApi("/notifications/subscribe", {
          method: "POST",
          body: JSON.stringify({ subscription, userId }),
          headers: { "Content-Type": "application/json" },
        });
      };

      registerServiceWorker().catch((error) =>
        console.error("Service Worker registration failed:", error)
      );
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "PLAY_SOUND") {
          const audio = new Audio(event.data.url);
          audio.play();
        }
      });
    }
  }, [user]);

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

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
