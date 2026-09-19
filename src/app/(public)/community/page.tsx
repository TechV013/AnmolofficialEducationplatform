import { COMMUNITY_CATEGORIES, DEMO_POSTS } from "@/data/community";

import DiscussionCard from "@/components/community/DiscussionCard";
import { MessageCircle } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12 text-center sm:text-left lg:text-center">
          <p className="text-primary font-bold tracking-widest uppercase text-xs mb-2">Community</p>
          <h1 className="text-2xl sm:text-4xl font-bold text-text mb-4">
            Learn together. Share ideas. Keep growing.
          </h1>
          <button className="inline-flex w-full items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-bold sm:w-auto">
            <MessageCircle className="h-4 w-4" />
            Start a Discussion
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 overflow-x-auto pb-4 mb-5">
              {COMMUNITY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className="shrink-0 px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-soft-blue transition-colors whitespace-nowrap"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {DEMO_POSTS.map((post) => (
                <DiscussionCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="bg-surface p-6 rounded-2xl border border-border">
              <h3 className="font-bold mb-4">Community Guidelines</h3>
              <ul className="text-sm text-muted space-y-2 list-disc list-inside">
                <li>Be respectful</li>
                <li>Keep discussions learning-focused</li>
                <li>Do not share harmful content</li>
                <li>Respect intellectual property</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}