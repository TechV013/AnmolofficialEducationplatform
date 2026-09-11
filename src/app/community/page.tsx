import { COMMUNITY_CATEGORIES, DEMO_POSTS } from "@/data/community";

import DiscussionCard from "@/components/community/DiscussionCard";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
            <header className="mb-12 text-center">
                <p className="text-primary font-bold tracking-widest uppercase text-sm mb-4">COMMUNITY</p>
                <h1 className="text-4xl font-bold text-text mb-6">Learn together. Share ideas. Keep growing.</h1>
                <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-bold">Start a Discussion</button>
            </header>
            
            <div className="flex gap-8">
                {/* Main Feed */}
                <div className="flex-1">
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                        {COMMUNITY_CATEGORIES.map(cat => (
                            <button key={cat} className="px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-soft-blue transition-colors">
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {DEMO_POSTS.map(post => <DiscussionCard key={post.id} post={post} />)}
                    </div>
                </div>
                
                {/* Sidebar */}
                <aside className="w-80 hidden lg:block">
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
    </main>
  );
}
