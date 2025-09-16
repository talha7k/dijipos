import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { JotaiProvider } from "@/components/JotaiProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";

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
          <QueryProvider>
            <AuthProvider>
              <RouteGuard>
                <AppLayout>{children}</AppLayout>
              </RouteGuard>
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
