import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLMS - Personal Learning Management System",
  description: "Quản lý học tập cá nhân",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
