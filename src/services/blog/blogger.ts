import { BlogPost } from "@/types/blog";
import { BLOG_POSTS } from "@/data/blog";

const DEFAULT_BLOGGER_URL = "https://anmolofficial.blogspot.com";

interface BloggerEntry {
  id?: { $t?: string };
  published?: { $t?: string };
  title?: { $t?: string };
  content?: { $t?: string };
  summary?: { $t?: string };
  author?: Array<{ name?: { $t?: string } }>;
  category?: Array<{ term?: string }>;
  link?: Array<{ rel?: string; href?: string }>;
  media$thumbnail?: { url?: string };
}

interface BloggerFeedResponse {
  feed?: {
    entry?: BloggerEntry[];
  };
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractThumbnailUrl(entry: BloggerEntry): string | undefined {
  // 1. Try media$thumbnail URL if present, upgrade quality from s72-c to s1200
  if (entry.media$thumbnail?.url) {
    return entry.media$thumbnail.url.replace(/\/s\d+(-c)?\//, "/s1200/").replace(/\/w\d+-h\d+-[^/]+\//, "/s1200/");
  }

  // 2. Try parsing first img tag in content
  const content = entry.content?.$t || "";
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }

  return undefined;
}

function extractPostId(entry: BloggerEntry): string {
  const fullId = entry.id?.$t || "";
  if (fullId.includes("post-")) {
    const parts = fullId.split("post-");
    return parts[parts.length - 1];
  }
  
  // Alternate link check
  const altLink = entry.link?.find((l) => l.rel === "alternate")?.href || "";
  if (altLink) {
    const filename = altLink.split("/").pop()?.replace(".html", "");
    if (filename) return filename;
  }

  return `post-${Math.random().toString(36).substring(2, 9)}`;
}

function calculateReadTime(text: string): string {
  const plainText = stripHtml(text);
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function parseBloggerFeed(json: BloggerFeedResponse): BlogPost[] {
  const entries = json.feed?.entry || [];
  return entries.map((entry) => {
    const id = extractPostId(entry);
    const title = entry.title?.$t || "Untitled Post";
    const rawContent = entry.content?.$t || entry.summary?.$t || "";
    const plainText = stripHtml(rawContent);
    const excerpt = plainText.length > 180 ? `${plainText.substring(0, 180)}...` : plainText;
    const category = entry.category?.[0]?.term || "General";
    const author = entry.author?.[0]?.name?.$t || "Anmolofficial Team";
    const publishedRaw = entry.published?.$t || "";
    const publishedAt = publishedRaw ? publishedRaw.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const thumbnail = extractThumbnailUrl(entry);
    const readTime = calculateReadTime(rawContent);

    // Slug from alternate link or title
    const altLink = entry.link?.find((l) => l.rel === "alternate")?.href || "";
    const slug = altLink
      ? altLink.split("/").pop()?.replace(".html", "") || id
      : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    return {
      id,
      slug,
      title,
      category,
      excerpt,
      content: rawContent,
      author,
      publishedAt,
      readTime,
      thumbnail,
      isHtml: true,
    };
  });
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const baseUrl = (process.env.BLOGGER_BLOG_URL || DEFAULT_BLOGGER_URL).replace(/\/+$/, "");
  const feedUrl = `${baseUrl}/feeds/posts/default?alt=json&max-results=50`;

  try {
    const res = await fetch(feedUrl, {
      next: { revalidate: 600 }, // Revalidate feed every 10 minutes (ISR)
    });

    if (!res.ok) {
      console.warn(`[Blogger Feed] Fetch returned status ${res.status}. Falling back to static posts.`);
      return BLOG_POSTS;
    }

    const data: BloggerFeedResponse = await res.json();
    const parsed = parseBloggerFeed(data);
    if (parsed.length === 0) {
      return BLOG_POSTS;
    }
    return parsed;
  } catch (error) {
    console.warn("[Blogger Feed] Error fetching live feed, falling back to static posts:", error);
    return BLOG_POSTS;
  }
}

export async function getBlogPostById(idOrSlug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug || p.id.endsWith(idOrSlug));
}
