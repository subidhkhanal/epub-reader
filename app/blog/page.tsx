"use client";

import React, { useContext } from "react";
import Link from "next/link";
import Navbar from "../components/landingpage/Navbar";
import Footer from "../components/footer";
import { ThemeContext } from "@/app/context/ThemeContext";

interface BlogPostPreviewProps {
  title: string;
  summary: string;
  imageSrc: string;
  date: string;
  readTime: string;
  slug: string;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({
  title,
  summary,
  imageSrc,
  date,
  readTime,
  slug,
}) => {
  return (
    <div className="flex flex-col md:flex-row overflow-hidden rounded-lg shadow-lg mb-8">
      <div className="md:flex-shrink-0">
        <img
          className="h-48 w-full md:w-48 object-cover"
          src={imageSrc}
          alt={title}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between bg-white p-6 dark:bg-gray-800">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Digital Reading
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

const BlogIndexPage: React.FC = () => {
  // @ts-ignore
  const { isDarkTheme } = useContext(ThemeContext);

  const blogPosts = [
    {
      title: "Understanding EPUB: The Digital Book Format Explained",
      summary:
        "Learn about the EPUB format, its advantages over other ebook formats, and why it has become the industry standard for digital publishing. In this comprehensive guide, we explore the technical aspects of EPUB, its history, and what makes it superior for digital reading.",
      imageSrc:
        "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Apr 20, 2025",
      readTime: "6 min",
      slug: "understanding-epub-format",
    },
    {
      title: "How to Create Your Own EPUB Files: A Complete Guide",
      summary:
        "Discover the tools and techniques to create professional-quality EPUB files from scratch, whether you're a publisher or an independent author. This guide covers everything from formatting considerations to software recommendations for EPUB creation.",
      imageSrc:
        "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Apr 12, 2025",
      readTime: "8 min",
      slug: "create-your-own-epub-files",
    },
    {
      title: "The Future of Digital Reading: Trends and Innovations",
      summary:
        "Explore emerging technologies and trends that are shaping the future of digital reading, from enhanced ebooks to AI-powered reading assistants. Learn how reading experiences are evolving and what to expect in the coming years.",
      imageSrc:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Mar 28, 2025",
      readTime: "5 min",
      slug: "future-of-digital-reading",
    },
    {
      title:
        "Optimizing Your Reading Experience: EPUB Reader Settings Explained",
      summary:
        "Get the most out of your digital reading experience by learning how to customize your EPUB reader settings. From font selections to background colors, this guide covers all the settings that can enhance your reading comfort.",
      imageSrc:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Mar 15, 2025",
      readTime: "4 min",
      slug: "epub-reader-settings-explained",
    },
    {
      title: "Digital Libraries: How to Organize Your eBook Collection",
      summary:
        "Managing a growing collection of ebooks can be challenging. Learn best practices for organizing your digital library, including tagging, categorization, and backup strategies to ensure your collection stays accessible and well-managed.",
      imageSrc:
        "https://images.unsplash.com/photo-1507842955463-eacb14fbdedf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Mar 5, 2025",
      readTime: "7 min",
      slug: "organize-ebook-collection",
    },
    {
      title:
        "Accessibility in Digital Reading: Making eBooks Available to Everyone",
      summary:
        "Discover how modern EPUB readers are improving accessibility features to make digital reading available to people with various disabilities. Learn about screen readers, text-to-speech, and other technologies that are making reading more inclusive.",
      imageSrc:
        "https://images.unsplash.com/photo-1499689496495-5bdf4421b725?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Feb 22, 2025",
      readTime: "6 min",
      slug: "accessibility-in-digital-reading",
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDarkTheme ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      <Navbar />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              EPUB Reader Blog
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Insights, guides, and news about digital reading, ebook
              management, and making the most of your EPUB Reader experience.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {blogPosts.map((post) => (
              <BlogPostPreview key={post.slug} {...post} />
            ))}
          </div>

          <div className="max-w-2xl mx-auto mt-16 border-t border-gray-200 dark:border-gray-700 pt-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Stay updated with the latest articles, tips, and features about
              digital reading and our EPUB Reader.
            </p>
            <form className="mt-6 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="w-full min-w-0 appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Enter your email"
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogIndexPage;
