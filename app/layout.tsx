import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/contexts/SocketProvider";
import { PlatformProvider } from "@/contexts/PlatformProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Nova",
  description: "Best WiFi Network Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            duration: 5000,
            classNames: {
              toast: 'alert',
            }
          }} />
        <SocketProvider >
          <PlatformProvider>
            {children}
          </PlatformProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
