import { describe, it, expect } from "vitest";
import { parseBloggerFeed } from "@/services/blog/blogger";

describe("parseBloggerFeed", () => {
  it("should parse a valid blogger entry into a BlogPost", () => {
    const mockJson = {
      feed: {
        entry: [
          {
            id: { $t: "tag:blogger.com,1999:blog-123.post-456" },
            published: { $t: "2026-09-15T08:30:00.000+05:30" },
            title: { $t: "My Awesome Post" },
            content: { $t: "<p>Hello <b>World</b>!</p><img src='https://example.com/image.jpg'/>" },
            author: [{ name: { $t: "John Doe" } }],
            category: [{ term: "VFX" }],
            link: [
              { rel: "alternate", href: "https://example.com/2026/09/my-awesome-post.html" }
            ],
            media$thumbnail: { url: "https://blogger.googleusercontent.com/img/b/s72-c/image.jpg" }
          }
        ]
      }
    };

    const result = parseBloggerFeed(mockJson);
    expect(result).toHaveLength(1);

    const post = result[0];
    expect(post.id).toBe("456");
    expect(post.slug).toBe("my-awesome-post");
    expect(post.title).toBe("My Awesome Post");
    expect(post.excerpt).toBe("Hello World!");
    expect(post.content).toContain("<p>Hello <b>World</b>!</p>");
    expect(post.author).toBe("John Doe");
    expect(post.category).toBe("VFX");
    expect(post.publishedAt).toBe("2026-09-15");
    expect(post.isHtml).toBe(true);
    expect(post.thumbnail).toBe("https://blogger.googleusercontent.com/img/b/s1200/image.jpg"); // Image URL upgrades resolution properly
  });

  it("should handle missing data gracefully", () => {
    const mockJson = {
      feed: {
        entry: [
          {} // empty entry
        ]
      }
    };

    const result = parseBloggerFeed(mockJson);
    expect(result).toHaveLength(1);
    
    const post = result[0];
    expect(post.id).toMatch(/^post-[A-Za-z0-9]+$/);
    expect(post.title).toBe("Untitled Post");
    expect(post.slug).toBe("untitled-post");
    expect(post.category).toBe("General");
    expect(post.author).toBe("Anmolofficial Team");
    expect(post.readTime).toBe("1 min read");
    expect(post.publishedAt.length).toBe(10); // current date YYYY-MM-DD
    expect(post.thumbnail).toBeUndefined();
    expect(post.content).toBe("");
    expect(post.excerpt).toBe("");
  });
});
