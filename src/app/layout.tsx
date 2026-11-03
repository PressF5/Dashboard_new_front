import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/providers/query-provider";
import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ТОР «Моя школа» — статистика",
  description:
    "Показатели цифровой образовательной среды по МСУ и образовательным организациям",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body>
        <AdminAuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
