import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} - RepostAI`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to blog
        </Link>

        <header className="mt-6 mb-10">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground">{post.description}</p>
        </header>

        <div
          className="blog-prose text-foreground leading-relaxed
            [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4
            [&_p]:mb-4 [&_p]:text-muted-foreground [&_p]:leading-7
            [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2
            [&_li]:text-muted-foreground [&_li]:leading-7
            [&_strong]:text-foreground [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t">
          <Link
            href="/blog"
            className="text-sm font-medium text-primary hover:underline"
          >
            &larr; Back to all posts
          </Link>
        </div>
      </article>
    </div>
  );
}
