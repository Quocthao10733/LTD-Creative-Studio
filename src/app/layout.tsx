import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { DevOverlaySuppressor } from "@/components/layout/dev-overlay-suppressor";

export const metadata: Metadata = {
  title: "LTD Creative Studio — Long Thành Digital Photo Club",
  description:
    "Nền tảng AI đồng hành cùng CLB Nhiếp Ảnh LTD. Sáng tạo nội dung, ý tưởng truyền thông và hậu kỳ video.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="h-full">
      <body className="min-h-full antialiased font-sans select-none">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <DevOverlaySuppressor />
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
