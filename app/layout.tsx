import { Suspense } from "react";
import { Nunito_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/contexts/SocketProvider";
import { PlatformProvider } from "@/contexts/PlatformProvider";
import { AdminAuthProvider, ManagerAuthProvider } from "@/contexts/AdminSessionProvider";
import { Toaster } from "sonner";
import { PaymentProvider } from "@/contexts/PaymentProvider";
import { TutorialProvider } from "@/contexts/TutorialProvider";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-nunito",
});

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
    <html lang="en" className={nunitoSans.variable}>
      <body className="font-sans">
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            duration: 3000,
            classNames: {
              toast: 'alert',
              success: 'success-alert',
              error: 'error-alert',
            }
          }}
        />
        <SocketProvider >
          <Suspense>
            <ManagerAuthProvider>
              <AdminAuthProvider>
                <PlatformProvider>
                  <PaymentProvider>
                    <TutorialProvider>
                      {children}
                    </TutorialProvider>
                  </PaymentProvider>
                </PlatformProvider>
              </AdminAuthProvider>
            </ManagerAuthProvider>
          </Suspense>
        </SocketProvider>
      </body>
    </html >
  );
}
