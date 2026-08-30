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

// ── Supabase database types ──

export type UserRole = "superadmin" | "editor" | "author" | "subscriber";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  sort_order: number;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  author_id: string;
  category_id: number;
  status: "draft" | "published" | "archived";
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface ArticleTag {
  article_id: number;
  tag_id: number;
}

export interface Subscriber {
  id: number;
  email: string;
  name?: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
  token?: string;
}

export interface Comment {
  id: number;
  article_id: number;
  user_id: string;
  content: string;
  created_at: string;
  is_flagged: boolean;
}

export interface Media {
  id: number;
  filename: string;
  original_url?: string;
  local_path?: string;
  mime_type: string;
  size_bytes: number;
  alt_text?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface EmailLog {
  id: number;
  article_id: number;
  sent_at: string;
  recipient_count: number;
  status: string;
}

export interface SocialPost {
  id: number;
  article_id: number;
  platform: string;
  post_id?: string;
  posted_at: string;
  status: string;
}
