import { AdminAuthProvider } from "@/components/admin/admin-auth-provider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
