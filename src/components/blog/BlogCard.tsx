import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { Calendar, Clock, User } from "lucide-react";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.id}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="p-6">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-soft-blue px-2.5 py-1 rounded-full">
            {post.category}
          </span>
          <h3 className="mt-4 text-lg font-bold text-text group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-muted line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted">
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
        </div>
      </article>
    </Link>
  );
}
