"use client";

import GlobalModal from "@/components/ui/GlobalModal";
import "./globals.css";
import dynamic from "next/dynamic";
import { LikesProvider } from "./contexts/LikesContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { LoadingProvider } from "./contexts/LoadingContext";
import GlobalLoadingOverlay from "@/components/ui/GlobalLoadingBar";
import { Provider } from "react-redux";
import { store } from "@/stores";

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
        <Provider store={store}>
                <NotificationsProvider>
                      <LikesProvider>
                          <LoadingProvider>
                            <GlobalLoadingOverlay />
                            <Toaster position="top-center" />
                            {showHeader && <Header />}
                            <main className={showHeader ? "pt-16" : "pt-0"}>
                              {children}
                            </main>
                            <GlobalModal />
                          </LoadingProvider>
                      </LikesProvider>
                </NotificationsProvider>
        </Provider>
      </body>
    </html>
  );
}
