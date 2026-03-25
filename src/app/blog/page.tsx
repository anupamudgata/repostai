import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog - RepostAI",
  description:
    "Content repurposing tips, AI social media strategies, and Hinglish content creation guides for Indian creators.",
  openGraph: {
    title: "Blog - RepostAI",
    description:
      "Content repurposing tips, AI social media strategies, and guides for creators.",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-2">Blog</h1>
          <p className="text-muted-foreground text-lg">
            Tips on content repurposing, AI tools, and growing your social media
            presence.
          </p>
        </div>

        <div className="grid gap-8">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="border rounded-xl p-6 sm:p-8 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span>&middot;</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Read more
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
