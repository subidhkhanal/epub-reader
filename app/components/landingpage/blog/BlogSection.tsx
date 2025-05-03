import React from "react";
import Link from "next/link";

interface BlogPostProps {
  title: string;
  summary: string;
  imageSrc: string;
  date: string;
  readTime: string;
  slug: string;
}

const BlogPost: React.FC<BlogPostProps> = ({
  title,
  summary,
  imageSrc,
  date,
  readTime,
  slug,
}) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
      <div className="flex-shrink-0">
        <img className="h-48 w-full object-cover" src={imageSrc} alt={title} />
      </div>
      <div className="flex flex-1 flex-col justify-between bg-white p-6 dark:bg-gray-800">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Article
          </p>
          <Link href={`/blog/${slug}`} className="mt-2 block">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </p>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-300">
              {summary}
            </p>
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <span className="sr-only">EPUB Reader</span>
            {/* <img
              className="h-10 w-10 rounded-full"
              src="/epub-reader-logo.png"
              alt="EPUB Reader Logo"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/40";
              }}
            /> */}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              EPUB Reader Team
            </p>
            <div className="flex space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime={date}>{date}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{readTime} read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogSection: React.FC = () => {
  const blogPosts = [
    {
      title: "Understanding EPUB: The Digital Book Format Explained",
      summary:
        "Learn about the EPUB format, its advantages over other ebook formats, and why it has become the industry standard for digital publishing.",
      imageSrc:
        "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Apr 20, 2025",
      readTime: "6 min",
      slug: "understanding-epub-format",
    },
    {
      title: "How to Create Your Own EPUB Files: A Complete Guide",
      summary:
        "Discover the tools and techniques to create professional-quality EPUB files from scratch, whether you're a publisher or an independent author.",
      imageSrc:
        "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Apr 12, 2025",
      readTime: "8 min",
      slug: "create-your-own-epub-files",
    },
    {
      title: "The Future of Digital Reading: Trends and Innovations",
      summary:
        "Explore emerging technologies and trends that are shaping the future of digital reading, from enhanced ebooks to AI-powered reading assistants.",
      imageSrc:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Mar 28, 2025",
      readTime: "5 min",
      slug: "future-of-digital-reading",
    },
  ];

  return (
    <div className="bg-gray-50 py-16 dark:bg-gray-900" id="blog">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Latest Articles on Digital Reading
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Discover insights, tips, and the latest trends in digital reading
            and ebook management.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogPost key={post.slug} {...post} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            View all articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
