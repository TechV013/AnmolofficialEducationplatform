import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";

import { BLOG_POSTS } from "@/data/blog";

interface Props {
  params: Promise<{ blogId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogId } = await params;
  const post = BLOG_POSTS.find((p) => p.id === blogId);
  if (!post) return { title: "Post Not Found", robots: { index: false, follow: false } };
  return {
    title: `${post.title} — Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.id}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://www.anmolofficial.com/blog/${post.id}`,
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: [post.category],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { blogId } = await params;
  const post = BLOG_POSTS.find((p) => p.id === blogId);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        <article className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-soft-blue px-2.5 py-1 rounded-full">
            {post.category}
          </span>
          <h1 className="mt-4 text-2xl sm:text-4xl font-bold text-text leading-tight">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {post.publishedAt}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readTime}
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {post.author}
            </span>
          </div>

          <div className="mt-8 prose prose-slate max-w-none text-text leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {post.content}
          </div>
        </article>

        {related.length > 0 && (
          <aside className="mt-12">
            <h2 className="text-lg font-bold text-text mb-4">Related posts</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.id}`}
                  className="block bg-surface p-4 rounded-xl border border-border hover:border-primary transition-colors"
                >
                  <p className="text-xs font-bold text-primary uppercase">{r.category}</p>
                  <p className="mt-1 font-semibold text-text text-sm">{r.title}</p>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}