import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AppLayout } from "@/components/layout/app-layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0c0c0e",
};

export const metadata: Metadata = {
  title: "NEXTOS | MyNext Command Center",
  description: "Sistema operativo interno y control centralizado para MyNext",
  icons: {
    icon: [
      { url: "/logo2.jpg", type: "image/jpeg" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo2.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEXTOS",
    startupImage: "/logo2.jpg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} antialiased bg-[#0c0c0e] text-white`}>
        <QueryProvider>
          <AppLayout>{children}</AppLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
