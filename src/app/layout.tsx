import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ThemeProvider } from "../context/ThemeContext";
import SeoHeadManager from "../components/seo/SeoHeadManager";

export const metadata: Metadata = {
  title: "Jobab Chat — AI-Powered Customer Communication & Sales Platform",
  description: "Next-generation AI Customer Communication, Live Support Inbox & Automated Commerce Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased font-sans text-slate-800">
        <SeoHeadManager />
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
