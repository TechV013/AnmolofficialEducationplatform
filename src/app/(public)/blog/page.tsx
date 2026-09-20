import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Anmolofficial",
  description: "Insights on 3D modeling, animation, VFX, and creative careers from the Anmolofficial team.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Blog — Anmolofficial",
    description: "Insights on 3D modeling, animation, VFX, and creative careers from the Anmolofficial team.",
    type: "website",
    url: "https://www.anmolofficial.com/blogs",
  },
};

import { BLOG_POSTS } from "@/data/blog";
import BlogCard from "@/components/blog/BlogCard";

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12 text-center">
          <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">BLOG</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-text">Stories from the studio</h1>
          <p className="mt-4 text-muted max-w-2xl mx-auto">
            Deep dives into 3D modeling, animation, VFX, and creative careers — written by the Anmolofficial team.
          </p>
        </div>

        {BLOG_POSTS.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">No posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}