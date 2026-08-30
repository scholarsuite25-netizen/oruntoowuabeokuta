import Link from "next/link";
import { createClient } from "@/lib/supabase";
import LogoutButton from "./logout-button";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Articles", href: "/admin/articles" },
  { label: "Media", href: "/admin/media" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Comments", href: "/admin/comments" },
  { label: "Subscribers", href: "/admin/subscribers" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-brand">
            Orunto Admin
          </Link>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="user-name">{profile?.full_name || user?.email}</span>
            <span className="user-role">{profile?.role}</span>
          </div>
          <LogoutButton />
          <Link href="/" className="sidebar-link">
            View Site
          </Link>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
