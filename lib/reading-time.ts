export function calculateReadingTime(html: string): number {
  // Strip HTML tags
  const text = html.replace(/<[^>]*>/g, " ");
  // Count words
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Average reading speed: 200 words per minute
  const minutes = Math.ceil(words / 200);
  return minutes || 1;
}
