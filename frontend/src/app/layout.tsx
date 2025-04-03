"use client";

import GlobalModal from "@/components/ui/GlobalModal";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { GoalProvider } from "./contexts/GoalContext";
import { PostProvider } from "./contexts/PostContext";
import { FollowerProvider } from "./contexts/FollowerContext";
import dynamic from "next/dynamic";
import { LikesProvider } from "./contexts/LikesContext";
import { CommentsProvider } from "./contexts/CommentsContext";
import { Book } from "lucide-react";
import { BookmarksProvider } from "./contexts/BookmarksContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { usePathname } from "next/navigation";

const Header = dynamic(() => import("@/components/Header"), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeaderPaths = [
    "/login",
    "/signup",
    "/reset-password",
    "/forgot-password",
  ];
  const showHeader = !hideHeaderPaths.includes(pathname);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <AuthProvider>
          <GoalProvider>
            <PostProvider>
              <BookmarksProvider>
                <NotificationsProvider>
                  <FollowerProvider>
                    <CommentsProvider>
                      <LikesProvider>
                        <FollowerProvider>
                          {showHeader && <Header />}
                          <main className={showHeader ? "pt-16" : "pt-0"}>
                            {children}
                          </main>
                          <GlobalModal />
                        </FollowerProvider>
                      </LikesProvider>
                    </CommentsProvider>
                  </FollowerProvider>
                </NotificationsProvider>
              </BookmarksProvider>
            </PostProvider>
          </GoalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
