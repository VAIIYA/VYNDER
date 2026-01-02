import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VYNDER - Find Your Match",
  description: "A modern dating app to find your perfect match",
  manifest: "/manifest.json",
  themeColor: "#ef4444",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VYNDER",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-center" />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}

