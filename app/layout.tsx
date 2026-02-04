import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallPrompt from "@/components/InstallPrompt";
import NotificationPrompt from "@/components/NotificationPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VYNDER - Web3 Dating",
  description: "A modern Web3 dating app to find your perfect match",
  manifest: "/manifest.json",
  themeColor: "#FF5C16",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VYNDER",
  },
  other: {
    "mobile-web-app-capable": "yes",
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
      <body className={`${inter.className} min-h-screen bg-[#F7F9FC] selection:bg-vaiiya-orange/30`}>
        {/* Background Glows (VAIIYA style) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-vaiiya-orange/5 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-vaiiya-purple/5 rounded-full blur-[150px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-vaiiya-orange/5 rounded-full blur-[120px]" />
        </div>

        <Providers>
          {/* Boxed Model Container for Desktop */}
          <div className="min-h-screen lg:flex lg:items-center lg:justify-center p-0 lg:p-8">
            <div className="w-full lg:max-w-[1280px] lg:h-[90vh] lg:min-h-[800px] bg-white lg:rounded-[32px] lg:shadow-[0_0_50px_rgba(0,0,0,0.05)] lg:border lg:border-[#E9EDF6] relative lg:overflow-hidden flex flex-col">
              <main className="flex-1 relative overflow-y-auto hide-scrollbar">
                {children}
              </main>
            </div>
          </div>
          <Toaster position="top-center" />
          <ServiceWorkerRegistration />
          <NotificationPrompt />
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
