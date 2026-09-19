import { CommunityPost } from "@/types/community";

export default function DiscussionCard({ post }: { post: CommunityPost }) {
  return (
    <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <span className="text-xs font-bold text-primary bg-soft-blue px-3 py-1 rounded-full">{post.category}</span>
      <h3 className="font-bold text-base sm:text-lg text-text mt-3">{post.title}</h3>
      <p className="text-muted text-sm mt-2">{post.excerpt}</p>
      <div className="flex flex-wrap justify-between items-center gap-2 mt-4 text-xs text-muted">
        <span>By {post.author}</span>
        <span>{post.replies} replies • {post.createdAt}</span>
      </div>
    </div>
  );
}