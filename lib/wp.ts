import { readFileSync } from "fs";
import { join } from "path";
import type {
  WPCategory,
  WPPost,
  WPPage,
  PostWithImage,
} from "./types";

// ── HTML entity decoder ──
function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#8230;/g, "\u2026")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019");
}

function decodePost(post: WPPost): WPPost {
  return {
    ...post,
    title: { ...post.title, rendered: decodeHtmlEntities(post.title.rendered) },
    excerpt: { ...post.excerpt, rendered: decodeHtmlEntities(post.excerpt.rendered) },
    content: { ...post.content, rendered: decodeHtmlEntities(post.content.rendered) },
  };
}

function decodePage(page: WPPage): WPPage {
  return {
    ...page,
    title: { ...page.title, rendered: decodeHtmlEntities(page.title.rendered) },
    content: { ...page.content, rendered: decodeHtmlEntities(page.content.rendered) },
  };
}

function decodeCategory(cat: WPCategory): WPCategory {
  return {
    ...cat,
    name: decodeHtmlEntities(cat.name),
  };
}

// ── Load local data ──
let localCategories: WPCategory[] = [];
let localPosts: WPPost[] = [];
let localPages: WPPage[] = [];

try {
  const dataDir = join(process.cwd(), "data");
  localCategories = JSON.parse(readFileSync(join(dataDir, "categories.json"), "utf-8")).map(decodeCategory);
  localPosts = JSON.parse(readFileSync(join(dataDir, "posts.json"), "utf-8")).map(decodePost);
  localPages = JSON.parse(readFileSync(join(dataDir, "pages.json"), "utf-8")).map(decodePage);
} catch {
  // Data not yet exported — functions will return empty results.
}

// ── Load image mapping ──
let localImageMap: Record<string, string> = {};
let urlIndex: Record<string, string> = {};
try {
  const mappingPath = join(process.cwd(), "public", "images", "mapping.json");
  const raw = JSON.parse(readFileSync(mappingPath, "utf-8"));
  urlIndex = raw.url_index || {};
  delete raw.url_index;
  localImageMap = raw;
} catch {
  // No image mapping — images will use original URLs.
}

// ── Categories ──
export async function getCategories(): Promise<WPCategory[]> {
  return localCategories;
}

export async function getCategoryBySlug(
  slug: string
): Promise<WPCategory | undefined> {
  return localCategories.find((c) => c.slug === slug);
}

// ── Posts ──
export async function getPosts(opts: {
  perPage?: number;
  page?: number;
  category?: number;
  search?: string;
} = {}): Promise<WPPost[]> {
  let filtered = [...localPosts];

  if (opts.category != null) {
    filtered = filtered.filter((p) => p.categories.includes(opts.category!));
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.rendered.toLowerCase().includes(q) ||
        p.excerpt.rendered.toLowerCase().includes(q)
    );
  }

  // Sort by date descending (newest first)
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const perPage = opts.perPage ?? 10;
  const page = opts.page ?? 1;
  const start = (page - 1) * perPage;
  return filtered.slice(start, start + perPage);
}

export async function getPostBySlug(slug: string): Promise<WPPost | undefined> {
  return localPosts.find((p) => p.slug === slug);
}

// ── Pages ──
export async function getPageBySlug(slug: string): Promise<WPPage | undefined> {
  return localPages.find((p) => p.slug === slug);
}

// ── Images ──
const FALLBACK_IMAGE = "/images/logo.png";

export async function attachImages(posts: WPPost[]): Promise<PostWithImage[]> {
  return posts.map((p) => {
    const mid = p.featured_media;
    const localPath = localImageMap[String(mid)];
    return {
      ...p,
      image: localPath || FALLBACK_IMAGE,
      imageAlt: "",
    };
  });
}

export async function getPostsWithImages(opts: {
  perPage?: number;
  page?: number;
  category?: number;
  search?: string;
} = {}): Promise<PostWithImage[]> {
  const posts = await getPosts(opts);
  return attachImages(posts);
}

// Rewrite WP image URLs in rendered HTML content to local paths.
// Also fixes image classes, dimensions, and unwrapping for proper text flow.
export function rewriteContentImages(html: string): string {
  if (!html) return "";
  const WP_PREFIXES = [
    "https://oruntoowuabeokuta.org.ng/wp-content/uploads/",
    "http://oruntoowuabeokuta.org.ng/wp-content/uploads/",
    "oruntoowuabeokuta.org.ng/wp-content/uploads/",
  ];
  let result = html;

  // Step 1: Unwrap images from <div dir="auto"> wrappers that block floating
  result = result.replace(
    /<div[^>]*dir="auto"[^>]*>\s*(<img\s[^>]*class="[^"]*(?:alignleft|alignright|aligncenter|alignnone)[^"]*"[^>]*\/?>)\s*<\/div>/gi,
    "$1"
  );

  // Step 2: Process each image tag
  result = result.replace(
    /<img\s([^>]*)\/?>/gi,
    (fullMatch: string, attrs: string): string => {
      let newAttrs = attrs;

      // Remove explicit width/height attributes (let CSS control sizing)
      newAttrs = newAttrs.replace(/\s+width="[^"]*"/gi, "");
      newAttrs = newAttrs.replace(/\s+height="[^"]*"/gi, "");

      // Fix alignment classes
      // alignnone → no alignment, treat as center block
      newAttrs = newAttrs.replace(
        /\balignnone\b/gi,
        "aligncenter"
      );

      // If image has no alignment class at all, add aligncenter
      if (!/align(left|right|center)/i.test(newAttrs)) {
        newAttrs = "aligncenter " + newAttrs;
      }

      // Clean up double spaces
      newAttrs = newAttrs.replace(/\s+/g, " ").trim();

      return `<img ${newAttrs} />`;
    }
  );

  // Step 3: Process <figure> tags with alignment
  result = result.replace(
    /<figure\s([^>]*)>/gi,
    (fullMatch: string, attrs: string): string => {
      let newAttrs = attrs;
      // Remove inline width styles from figures
      newAttrs = newAttrs.replace(/\s*style="[^"]*width:\s*\d+px[^"]*"/gi, "");
      // Fix alignnone in figures
      newAttrs = newAttrs.replace(/\balignnone\b/gi, "aligncenter");
      newAttrs = newAttrs.replace(/\s+/g, " ").trim();
      return `<figure ${newAttrs}>`;
    }
  );

  // Step 4: Rewrite image URLs
  for (const prefix of WP_PREFIXES) {
    let idx = 0;
    while (true) {
      const pos = result.indexOf(prefix, idx);
      if (pos === -1) break;
      let end = pos + prefix.length;
      while (end < result.length && !"\"' \\>".includes(result[end])) end++;
      const fullUrl = result.substring(pos, end);
      const clean = fullUrl.split("?")[0];
      // Normalize to https for lookup
      const normalized = clean.replace(/^(https?:)?\/\//, "https://");
      let replacement = urlIndex[normalized];
      if (!replacement) {
        const fname = clean.split("/").pop() || "";
        for (const [key, localPath] of Object.entries(localImageMap)) {
          if (key === "logo" || key === "founder_portrait") continue;
          const localFname = localPath.split("/").pop() || "";
          if (localFname === fname) { replacement = localPath; break; }
        }
      }
      if (!replacement) {
        const fname = (clean.split("/").pop() || "").replace(/-\d+x\d+/, "");
        for (const [key, localPath] of Object.entries(localImageMap)) {
          if (key === "logo" || key === "founder_portrait") continue;
          const localFname = (localPath.split("/").pop() || "").replace(/-\d+x\d+/, "");
          if (localFname === fname) { replacement = localPath; break; }
        }
      }
      if (replacement) {
        result = result.substring(0, pos) + replacement + result.substring(end);
        idx = pos + replacement.length;
      } else {
        idx = end;
      }
    }
  }

  return result;
}
