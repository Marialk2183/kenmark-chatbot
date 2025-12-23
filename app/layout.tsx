import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kenmark ITan Solutions - AI Chatbot",
  description: "AI-powered virtual assistant for Kenmark ITan Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

