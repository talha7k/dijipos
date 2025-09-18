// app/layout.tsx
import { JotaiProvider } from "@/providers/JotaiProvider"; // Your Jotai provider component
import { AuthProvider } from "@/providers/AuthProvider"; // Your Auth provider
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import FirestoreProvider from "@/components/FirestoreProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FirestoreProvider>
          <JotaiProvider>
            <ThemeProvider>
              <AuthProvider>
                <AuthGuard>
                  <AppLayout>{children}</AppLayout>
                </AuthGuard>
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
          </JotaiProvider>
        </FirestoreProvider>
      </body>
    </html>
  );
}
