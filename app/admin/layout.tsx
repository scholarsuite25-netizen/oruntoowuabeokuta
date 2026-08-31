import Link from "next/link";
import { createClient } from "@/lib/supabase";
import LogoutButton from "./logout-button";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Articles", href: "/admin/articles" },
  { label: "Pages", href: "/admin/pages" },
  { label: "Media", href: "/admin/media" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Tags", href: "/admin/tags" },
  { label: "Comments", href: "/admin/comments" },
  { label: "Subscribers", href: "/admin/subscribers" },
  { label: "Users", href: "/admin/users" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <span className="user-name">Orunto Admin</span>
            <span className="user-role">superadmin</span>
          </div>
          <LogoutButton />
          <Link href="/" className="sidebar-link">View Site</Link>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}