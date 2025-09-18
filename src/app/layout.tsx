// app/layout.tsx
import { JotaiProvider } from "@/providers/JotaiProvider"; // Your Jotai provider component
import { AuthProvider } from "@/providers/AuthProvider"; // Your Auth provider
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JotaiProvider>
          <AuthProvider>
            <AuthGuard>
              <AppLayout>{children}</AppLayout>
            </AuthGuard>
          </AuthProvider>
        </JotaiProvider>
      </body>
    </html>
  );
}
