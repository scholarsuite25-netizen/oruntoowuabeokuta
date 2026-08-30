import { MetadataRoute } from "next";
import { getPosts, getCategories } from "@/lib/wp";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oruntoowuabeokuta.org.ng";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    getPosts({ perPage: 500 }),
    getCategories(),
  ]);

  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${SITE_URL}/archive`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/events`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${SITE_URL}/glossary`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/timeline`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/services`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${SITE_URL}/join`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  const postPages = posts.map((post) => ({
    url: `${SITE_URL}/post/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryPages = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postPages, ...categoryPages];
}
