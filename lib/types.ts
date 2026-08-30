// ── WordPress-shaped types (for backward compat with local data) ──

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
}

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  featured_media: number;
}

export interface WPPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
}

export interface PostWithImage extends WPPost {
  image?: string;
  imageAlt?: string;
  categoryNames?: string[];
}

export interface CategoryWithPosts extends WPCategory {
  posts: PostWithImage[];
}

// ── Supabase database types (UUID-based) ──

export type UserRole = "superadmin" | "editor" | "author" | "contributor" | "subscriber";

export type ArticleStatus = "draft" | "pending" | "published" | "scheduled" | "private" | "archived" | "trash";

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  featured_image_alt?: string;
  featured_image_caption?: string;
  author_id: string;
  category_id?: string;
  status: ArticleStatus;
  published_at?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  // SEO fields
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  // Reading
  reading_time?: number;
  // Social
  social_title?: string;
  social_description?: string;
  // Visibility
  allow_indexing?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
}

export interface Media {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
  uploaded_by?: string;
  created_at: string;
}

export interface EmailLog {
  id: string;
  subject: string;
  content: string;
  sent_count: number;
  failed_count: number;
  sent_by?: string;
  created_at: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  article_url: string;
  content: string;
  status: string;
  error_message?: string;
  posted_by?: string;
  created_at: string;
}

export interface Revision {
  id: string;
  article_id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_id: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  group: string;
}
