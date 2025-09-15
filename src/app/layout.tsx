import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { JotaiProvider } from "@/components/JotaiProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JotaiProvider>
          <ThemeProvider>
            <AuthProvider>
              <RouteGuard>
                <AppLayout>{children}</AppLayout>
              </RouteGuard>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
