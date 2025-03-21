import GlobalModal from "@/components/ui/GlobalModal";
import "./globals.css";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Header />
        <main className="pt-16">{children}</main>
        <GlobalModal />
      </body>
    </html>
  );
}
