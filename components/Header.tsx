"use client";

import { useState } from "react";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  dropdown?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Orunto", href: "/category/orunto" },
  { label: "Owu", href: "/category/owu" },
  { label: "Owu People", href: "/category/owu-people" },
  { label: "Abeokuta", href: "/category/abeokuta" },
  { label: "Culture", href: "/category/culturee" },
  { label: "SixthSense", href: "/category/sixthsense" },
  { label: "Personalities", href: "/category/personalities" },
  {
    label: "Others",
    href: "#",
    dropdown: [
      { label: "Glossary", href: "/glossary" },
      { label: "Timeline", href: "/timeline" },
      { label: "Events", href: "/events" },
      { label: "Publications", href: "/category/publication" },
      { label: "News", href: "/category/news" },
      { label: "Entertainment", href: "/category/entertainment" },
      { label: "About", href: "/page/about" },
      { label: "Services", href: "/services" },
      { label: "Corporate Spotlight", href: "/category/corporate-spotlight" },
      { label: "Featured", href: "/category/featured" },
      { label: "Trending News", href: "/category/trending-news" },
    ],
  },
];

const JOIN = { label: "Join Us", href: "/join" };
const LOGO = "/images/logo.png";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="topbar">
        <div className="container inner">
          <span>Orunto Owu Abeokuta — Tradition · Culture · News</span>
          <div className="tb-right">
            <Link href="/search">Search</Link>
            <span className="tb-social">
              <a href="https://wa.me/2348027191291" aria-label="WhatsApp">WA</a>
            </span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container bar">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Orunto Owu Abeokuta" />
          </Link>

          <nav className="nav">
            {NAV.map((item) => (
              <div className="nav-item" key={item.label}>
                <Link href={item.href}>
                  {item.label}
                  {item.dropdown && <span className="caret"> ▾</span>}
                </Link>
                {item.dropdown && (
                  <div className="dropdown">
                    {item.dropdown.map((d) => (
                      <Link key={d.label} href={d.href}>
                        {d.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link className="nav-cta" href={JOIN.href}>
              {JOIN.label}
            </Link>
          </nav>

          <button
            className="menu-toggle"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        <div className={`mobile-menu ${open ? "open" : ""}`}>
          {NAV.map((item) => (
            <div key={item.label}>
              <Link href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
              {item.dropdown && (
                <div className="sub">
                  {item.dropdown.map((d) => (
                    <Link key={d.label} href={d.href} onClick={() => setOpen(false)}>
                      {d.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link className="m-cta" href={JOIN.href} onClick={() => setOpen(false)}>
            {JOIN.label}
          </Link>
        </div>
      </header>
    </>
  );
}
