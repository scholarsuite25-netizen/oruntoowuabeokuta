"use client";

interface Props {
  title: string;
  slug: string;
}

const SITE_URL = "https://oruntoowuabeokuta.org.ng";

export default function ShareButtons({ title, slug }: Props) {
  const url = `${SITE_URL}/post/${slug}`;
  const text = `Check out: ${title}`;

  const links = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    },
  ];

  return (
    <div className="share-buttons">
      <span className="share-label">Share:</span>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
}
