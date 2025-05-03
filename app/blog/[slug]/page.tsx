"use client";

import React, { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/landingpage/Navbar";
import Footer from "../../components/footer";
import { ThemeContext } from "@/app/context/ThemeContext";

// Mock data for blog posts
const blogPostsData = {
  "understanding-epub-format": {
    title: "Understanding EPUB: The Digital Book Format Explained",
    author: "EPUB Reader Team",
    date: "Apr 20, 2025",
    readTime: "6 min",
    category: "Digital Publishing",
    imageUrl:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    introduction:
      "The EPUB (Electronic PUBlication) format has revolutionized digital reading by providing a standardized, accessible way to distribute and consume digital books. As an open standard maintained by the International Digital Publishing Forum (IDPF), EPUB has become the industry standard for digital publications.",
    content: [
      {
        heading: "What is EPUB?",
        text: "EPUB is a free and open e-book standard by the International Digital Publishing Forum (IDPF). It was designed to function as a single format that publishers and conversion houses could use in-house, as well as for distribution and sale. EPUB allows publishers to create and distribute a single digital publication that can be read on various devices and by various applications.\n\nThe format is designed for reflowable content, meaning the text display can be optimized for the particular display device. This is in contrast to PDF, which is generally optimized for a particular page size and layout.",
      },
      {
        heading: "The Evolution of EPUB",
        text: "The EPUB standard has evolved significantly since its inception:\n\n- EPUB 2.0 (2007): The first official version of the standard, which established the core features and capabilities.\n\n- EPUB 3.0 (2011): Introduced support for HTML5, CSS3, and JavaScript, enabling rich multimedia content, enhanced typography, and interactive elements.\n\n- EPUB 3.1 (2017): Streamlined the specification and improved compatibility with web standards.\n\n- EPUB 3.2 (2019): Further refined the standard with a focus on accessibility and alignment with web technologies.\n\nEach iteration has added features and capabilities that enhance the reading experience and provide authors and publishers with more tools to create engaging digital content.",
      },
      {
        heading: "Key Features of EPUB",
        text: "EPUB offers several advantages over other e-book formats:\n\n1. **Reflowable Text**: Content can adapt to different screen sizes and user preferences, providing an optimal reading experience across devices.\n\n2. **Rich Media Support**: EPUB 3 supports audio, video, and interactive elements, allowing for a multimedia reading experience.\n\n3. **Accessibility**: Built-in support for accessibility features makes content available to readers with disabilities.\n\n4. **Metadata**: Comprehensive metadata capabilities allow for better cataloging and discovery of e-books.\n\n5. **Navigation**: Standardized table of contents and navigation features make it easy to move through a book.\n\n6. **CSS Styling**: Support for CSS allows for rich typographic control and visual presentation.\n\n7. **Global Language Support**: Unicode text encoding ensures support for virtually all written languages.",
      },
      {
        heading: "EPUB vs. Other E-book Formats",
        text: "While there are several e-book formats in use today, EPUB has emerged as the industry standard due to its flexibility, openness, and feature set. Here's how it compares to some other popular formats:\n\n**EPUB vs. PDF**:\n- PDFs maintain fixed layouts regardless of screen size, which can make reading difficult on smaller devices.\n- EPUB content reflows to fit the screen, providing a better reading experience across devices.\n- PDFs are better for documents where precise layout is critical, while EPUBs are better for narrative content.\n\n**EPUB vs. MOBI/AZW**:\n- MOBI and AZW are proprietary formats used primarily by Amazon Kindle devices.\n- EPUB offers better support for rich media and interactive content.\n- EPUB is an open standard, while MOBI/AZW are controlled by Amazon.\n\n**EPUB vs. FB2**:\n- FB2 (FictionBook) is popular in Russia and Eastern Europe.\n- EPUB has broader industry support and more advanced features.\n- FB2 uses XML throughout, while EPUB is based on XHTML and CSS.",
      },
      {
        heading: "How EPUB Works",
        text: "An EPUB file is essentially a ZIP archive containing a collection of files that together form a digital publication. These files include:\n\n1. **MIME Type**: A file that identifies the content as an EPUB publication.\n\n2. **Container.xml**: This file points to the publication's metadata and content files.\n\n3. **Package Document (OPF)**: Contains metadata about the publication, a manifest listing all the files, and the reading order.\n\n4. **Navigation Document (NCX or XHTML)**: Provides the table of contents and navigation structure.\n\n5. **Content Documents**: XHTML files containing the actual content of the publication.\n\n6. **Stylesheets**: CSS files that control the presentation of the content.\n\n7. **Media Files**: Images, audio, video, and other media included in the publication.\n\nWhen an EPUB reader opens a file, it unpacks these components and uses them to render the content according to the reader's settings and the device's capabilities.",
      },
      {
        heading: "Creating EPUB Files",
        text: "There are numerous tools available for creating EPUB files, ranging from simple converters to sophisticated publishing platforms:\n\n1. **Calibre**: A free, open-source tool that can convert various formats to EPUB.\n\n2. **Sigil**: An open-source EPUB editor for direct manipulation of EPUB files.\n\n3. **Adobe InDesign**: Professional publishing software with robust EPUB export capabilities.\n\n4. **Pandoc**: A command-line tool that can convert from various formats to EPUB.\n\n5. **Online Converters**: Various web services that convert documents to EPUB format.\n\nThe choice of tool depends on the complexity of the content, the desired level of control, and the user's technical expertise.",
      },
      {
        heading: "The Future of EPUB",
        text: "The EPUB format continues to evolve, with ongoing work to improve its capabilities and address the changing needs of digital publishing. Some trends and developments to watch include:\n\n1. **Enhanced Accessibility**: Continued focus on making digital content accessible to all readers.\n\n2. **Web Publications**: Integration with web technologies to create seamless online/offline reading experiences.\n\n3. **Advanced Interactivity**: More sophisticated interactive elements for educational and reference content.\n\n4. **Global Adoption**: Increasing use of EPUB in markets worldwide, including regions with complex typography and right-to-left languages.\n\n5. **Digital Textbooks**: Growth in the use of EPUB for educational materials with rich multimedia and assessment components.\n\nAs digital reading continues to grow in popularity, EPUB is likely to remain the format of choice for publishers and readers looking for a flexible, feature-rich, and accessible digital reading experience.",
      },
      {
        heading: "Conclusion",
        text: "EPUB has established itself as the premier format for digital books, offering a combination of features that benefit both publishers and readers. Its open nature, flexibility, and rich feature set make it ideal for a wide range of content, from novels to textbooks to interactive publications.\n\nBy understanding the capabilities and advantages of EPUB, readers can make informed choices about their digital reading experience, and publishers can create content that takes full advantage of the digital medium.\n\nAs you explore the world of digital reading with our EPUB Reader, you'll experience firsthand the benefits of this powerful format, designed to make digital reading accessible, enjoyable, and enriching for everyone.",
      },
    ],
    relatedPosts: [
      {
        title: "How to Create Your Own EPUB Files: A Complete Guide",
        slug: "create-your-own-epub-files",
      },
      {
        title: "The Future of Digital Reading: Trends and Innovations",
        slug: "future-of-digital-reading",
      },
      {
        title:
          "Accessibility in Digital Reading: Making eBooks Available to Everyone",
        slug: "accessibility-in-digital-reading",
      },
    ],
  },
  "create-your-own-epub-files": {
    title: "How to Create Your Own EPUB Files: A Complete Guide",
    author: "EPUB Reader Team",
    date: "Apr 12, 2025",
    readTime: "8 min",
    category: "Tutorials",
    imageUrl:
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    introduction:
      "Creating your own EPUB files gives you complete control over your digital publications. Whether you're an author self-publishing your work, a small publisher looking to go digital, or simply want to convert your documents to a more readable format, this guide will walk you through the process of creating professional-quality EPUB files.",
    content: [
      {
        heading: "Understanding the EPUB Structure",
        text: "Before diving into the creation process, it's important to understand what makes up an EPUB file:\n\n- It's essentially a ZIP archive with a specific structure\n- Contains XHTML files for content\n- Uses CSS for styling\n- Includes metadata in XML format\n- Has a defined navigation structure\n\nThis knowledge will help you troubleshoot issues and create better quality files.",
      },
      {
        heading: "Tools for Creating EPUB Files",
        text: "There are numerous tools available for creating EPUBs, ranging from simple converters to professional publishing software:\n\n**For beginners:**\n- Calibre: Free, open-source software that converts various formats to EPUB\n- Reedsy Book Editor: Online tool designed specifically for book formatting\n- Google Docs with Docs to EPUB extension\n\n**For intermediate users:**\n- Sigil: Open-source EPUB editor with a visual interface\n- Vellum (Mac only): Produces beautifully formatted ebooks\n- Scrivener: Writing software with EPUB export capabilities\n\n**For advanced users:**\n- Adobe InDesign: Professional publishing software\n- PrinceXML: Converts HTML to PDF and EPUB\n- Command-line tools like Pandoc and EPUB-Tools\n\nChoose a tool based on your technical comfort level, budget, and specific needs.",
      },
      {
        heading: "Step 1: Prepare Your Content",
        text: "Before converting to EPUB, ensure your content is well-structured:\n\n1. **Organize your text**: Use consistent heading levels (H1, H2, etc.) to create a logical structure.\n\n2. **Format appropriately**: Use styles rather than direct formatting when possible.\n\n3. **Optimize images**: Resize images to appropriate dimensions (typically 1000-1500px on the longest side) and compress them for web use.\n\n4. **Check links**: Ensure all internal links are relative, not absolute.\n\n5. **Clean up**: Remove unnecessary spaces, formatting, and other artifacts that might cause issues in conversion.",
      },
      {
        heading: "Step 2: Create Your EPUB",
        text: "The specific process will depend on the tool you're using, but generally involves:\n\n**Using Calibre:**\n1. Add your document to Calibre library\n2. Click 'Convert books'\n3. Choose EPUB as the output format\n4. Adjust metadata and layout settings\n5. Click 'OK' to convert\n\n**Using Sigil:**\n1. Create a new EPUB or import an existing HTML/text file\n2. Add chapters and content\n3. Add a cover image\n4. Create a table of contents\n5. Add metadata\n6. Validate the EPUB\n\n**Using Adobe InDesign:**\n1. Set up your document with appropriate styles\n2. Use the Articles panel to determine reading order\n3. Go to File > Export > EPUB (Reflowable)\n4. Configure options for images, CSS, and metadata\n5. Export your file",
      },
      {
        heading: "Step 3: Add Metadata",
        text: "Metadata helps readers find your book and provides important information:\n\n- **Title**: The complete title of your publication\n- **Author**: Your name or pen name\n- **Publisher**: Your publishing company or 'Self-published'\n- **Language**: The primary language of the text\n- **ISBN**: If you have one (not required for personal use)\n- **Description**: A short summary of your book\n- **Keywords**: Terms that describe your content\n- **Publication date**: When the work was published\n\nMost EPUB creation tools provide fields for entering this information.",
      },
      {
        heading: "Step 4: Design Considerations",
        text: "While EPUBs are designed to be reflowable, you can still influence how they look:\n\n**Typography:**\n- Choose readable fonts (or font families for fallback)\n- Set appropriate line spacing (1.5 is often recommended)\n- Use relative font sizes (em or %) rather than absolute (px)\n\n**Layout:**\n- Keep paragraphs left-aligned for best readability\n- Use CSS for consistent styling across the book\n- Consider how page breaks will affect the reading experience\n\n**Images:**\n- Center images for consistent display\n- Add alt text for accessibility\n- Consider how images will appear on different screen sizes",
      },
      {
        heading: "Step 5: Create a Table of Contents",
        text: "A good table of contents is essential for navigation:\n\n1. Most tools will generate a TOC automatically based on heading styles\n2. Ensure your headings are properly structured (H1 for chapter titles, H2 for sections, etc.)\n3. Review the generated TOC for completeness and accuracy\n4. Some tools allow for manual editing of the TOC\n\nA well-structured TOC makes your EPUB more usable and professional.",
      },
      {
        heading: "Step 6: Test Your EPUB",
        text: "Before distributing your EPUB, test it thoroughly:\n\n1. **Validation**: Use the EPUB Validator (http://validator.idpf.org/) to check for technical errors\n\n2. **Visual inspection**: Open your EPUB in different reading apps (like our EPUB Reader, Apple Books, Google Play Books) to check formatting\n\n3. **Navigation testing**: Test all links, table of contents entries, and cross-references\n\n4. **Device testing**: If possible, test on different devices (phone, tablet, e-reader) to ensure good display\n\n5. **Accessibility**: Consider checking basic accessibility features like alternative text for images",
      },
      {
        heading: "Common Issues and Solutions",
        text: "Some problems you might encounter and how to fix them:\n\n**Formatting issues:**\n- Inconsistent spacing: Check for extra paragraph breaks or inconsistent styles\n- Strange characters: Ensure proper UTF-8 encoding\n- Missing fonts: Use common fonts or embed fonts when necessary\n\n**Image problems:**\n- Images too large: Resize and optimize images\n- Images missing: Check file paths and references\n- Images overflowing screen: Set max-width: 100% in CSS\n\n**Navigation problems:**\n- Missing chapters in TOC: Check heading structure\n- Broken internal links: Ensure links use relative paths\n- Multiple TOCs: Some tools create both HTML and NCX TOCs; this is normal",
      },
      {
        heading: "Conclusion",
        text: "Creating your own EPUB files gives you complete control over how your content is presented and distributed. While there's a learning curve involved, the tools available today make it accessible to nearly anyone, regardless of technical background.\n\nBy following the guidelines in this article, you can create professional-quality EPUB files that will provide an excellent reading experience across devices. Remember that practice makes perfect—your first EPUB might take some time, but each subsequent one will be easier.\n\nOnce you've created your EPUB files, you can easily open and read them using our EPUB Reader, which is designed to showcase all the features of the format while providing a comfortable reading experience.",
      },
    ],
    relatedPosts: [
      {
        title: "Understanding EPUB: The Digital Book Format Explained",
        slug: "understanding-epub-format",
      },
      {
        title: "Digital Libraries: How to Organize Your eBook Collection",
        slug: "organize-ebook-collection",
      },
      {
        title:
          "Optimizing Your Reading Experience: EPUB Reader Settings Explained",
        slug: "epub-reader-settings-explained",
      },
    ],
  },
  "future-of-digital-reading": {
    title: "The Future of Digital Reading: Trends and Innovations",
    author: "EPUB Reader Team",
    date: "Mar 28, 2025",
    readTime: "5 min",
    category: "Industry Trends",
    imageUrl:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    introduction:
      "Digital reading continues to evolve at a rapid pace, transforming how we consume and interact with written content. From enhanced e-books to AI-powered reading assistants, the future of digital reading promises to be more immersive, interactive, and personalized than ever before.",
    content: [
      {
        heading: "The Evolution of Digital Reading",
        text: "Digital reading has come a long way since the first e-readers appeared on the market. The early days of digital reading were characterized by simple text displays that attempted to replicate the physical book experience. Today, we've moved far beyond these limitations, with technologies that enhance the reading experience in ways print never could.\n\nThe EPUB format itself has evolved from a basic container for text and simple images to a sophisticated platform that can include interactive elements, multimedia content, and accessibility features. As we look to the future, the boundary between 'book' and 'app' continues to blur, creating new possibilities for authors, publishers, and readers.",
      },
      {
        heading: "Emerging Technologies Shaping Digital Reading",
        text: "Several key technologies are driving the evolution of digital reading:\n\n**Artificial Intelligence**\n- Personalized reading recommendations based on past behavior\n- Adaptive learning systems that adjust content difficulty\n- Automated summarization and highlighting of key concepts\n- Real-time translation of foreign language texts\n\n**Augmented and Virtual Reality**\n- Immersive storytelling environments that bring narratives to life\n- Educational texts with 3D models that readers can manipulate\n- Historical works enhanced with virtual reconstructions of settings\n\n**Voice Technology**\n- Advanced text-to-speech with natural-sounding voices\n- Voice navigation and control of reading applications\n- Conversational interfaces that allow readers to ask questions about the text\n\n**Blockchain and Web3**\n- New ownership models for digital content\n- Direct author-to-reader relationships and micropayments\n- Verifiable provenance and authenticity for digital texts",
      },
      {
        heading: "Enhanced E-books and Beyond",
        text: "The concept of what constitutes a 'book' is expanding rapidly. Enhanced e-books incorporate elements that go beyond static text and images:\n\n**Interactive Elements**\n- Embedded quizzes and assessments in educational materials\n- Interactive diagrams that readers can manipulate\n- Choose-your-own-adventure style narratives with multiple paths\n\n**Multimedia Integration**\n- Synchronized audio narration that highlights text as it's read\n- Embedded video clips that complement the written content\n- Background soundscapes that enhance the reading atmosphere\n\n**Social Reading Features**\n- Shared annotations and discussions linked to specific passages\n- Reading groups that can synchronize progress and discuss in real-time\n- Author engagement platforms built directly into the reading experience\n\nThese enhancements are particularly valuable in educational contexts, where interactive elements can significantly improve comprehension and retention.",
      },
      {
        heading: "Personalization and Adaptive Content",
        text: "Perhaps the most significant trend in digital reading is increased personalization:\n\n**Adaptive Learning Content**\n- Educational materials that adjust difficulty based on reader performance\n- Alternative explanations presented when a reader struggles with concepts\n- Customized practice exercises that target areas needing improvement\n\n**Reader Preference Customization**\n- Far beyond font size and background color, future systems will remember preferred reading speeds, annotation styles, and environmental settings\n- Content recommendations that understand nuanced preferences\n- Interfaces that adapt to individual usage patterns\n\n**Accessibility Innovations**\n- Real-time content adaptation for readers with different abilities\n- Multi-modal presentation of content (text, audio, visual) simultaneously\n- Cognitive assistance tools that help with focus and comprehension",
      },
      {
        heading: "The Role of Data and Analytics",
        text: "Digital reading generates valuable data that can be used to improve both individual reading experiences and content development:\n\n**Reading Analytics**\n- Insights into reading patterns, completion rates, and engagement levels\n- Identification of passages that cause confusion or high engagement\n- Time spent on different sections and concepts\n\n**Publishing Insights**\n- Data-informed publishing decisions about content, format, and style\n- Early feedback mechanisms that influence revisions and updates\n- Precise understanding of market interests and trends\n\n**Educational Assessment**\n- Detailed progress tracking for students and learners\n- Comprehension measurement through interaction and behavior\n- Adaptive testing that pinpoints knowledge gaps\n\nPrivacy considerations will be paramount as these capabilities expand, with readers maintaining control over their data and how it's used.",
      },
      {
        heading: "Cross-Platform and Device-Agnostic Reading",
        text: "The future of digital reading will be increasingly device-agnostic:\n\n**Seamless Sync**\n- Perfect synchronization of position, annotations, and preferences across all devices\n- Smart transitions between reading and listening modes\n- Context-aware display adaptations based on device and environment\n\n**New Reading Interfaces**\n- E-ink technologies with color capabilities and faster refresh rates\n- Flexible and foldable displays that better mimic physical books\n- Projection and holographic displays for shared reading experiences\n\n**Ambient Reading**\n- Integration with smart home systems for environmental adjustments while reading\n- Seamless transitions between devices based on location and activity\n- Reading experiences that adapt to time of day and surroundings",
      },
      {
        heading: "Challenges and Considerations",
        text: "Despite the exciting possibilities, several challenges must be addressed:\n\n**Digital Divide**\n- Ensuring advanced reading technologies are accessible to all demographics\n- Addressing infrastructure limitations in developing regions\n- Balancing innovation with backward compatibility\n\n**Privacy and Data Ethics**\n- Protecting reader privacy while enabling personalization\n- Transparent data collection and usage policies\n- Reader control over what information is tracked and stored\n\n**Cognitive Impact**\n- Understanding how digital reading affects comprehension and retention\n- Balancing enhancement features with potential distraction\n- Designing interfaces that support deep reading and concentration\n\n**Content Preservation**\n- Ensuring long-term access to content as formats and platforms evolve\n- Archival strategies for enhanced e-books with interactive elements\n- Standards development for future compatibility",
      },
      {
        heading: "Conclusion",
        text: "The future of digital reading promises to be more engaging, accessible, and personalized than ever before. As technology continues to evolve, the definition of 'reading' itself will expand to encompass new modes of interaction with text and multimedia content.\n\nFor readers, these advancements will offer more immersive and effective ways to engage with information and stories. For authors and publishers, new tools will enable creative expression beyond the limitations of static text.\n\nAt EPUB Reader, we're committed to embracing these innovations while maintaining the core values that make reading special: accessibility, engagement, and the joy of discovering new ideas and stories. As digital reading evolves, we'll continue to develop our platform to provide the best possible reading experience that takes advantage of these exciting new possibilities.",
      },
    ],
    relatedPosts: [
      {
        title: "Understanding EPUB: The Digital Book Format Explained",
        slug: "understanding-epub-format",
      },
      {
        title:
          "Accessibility in Digital Reading: Making eBooks Available to Everyone",
        slug: "accessibility-in-digital-reading",
      },
      {
        title:
          "Optimizing Your Reading Experience: EPUB Reader Settings Explained",
        slug: "epub-reader-settings-explained",
      },
    ],
  },
};

// Add placeholders for other posts - these will show a simplified page with "Coming Soon" message
const placeholderPostSlugs = [
  "epub-reader-settings-explained",
  "organize-ebook-collection",
  "accessibility-in-digital-reading",
];

const BlogPost: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  // @ts-ignore
  const { isDarkTheme } = useContext(ThemeContext);
  const [postData, setPostData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if slug exists and is a string
    if (params.slug && typeof params.slug === "string") {
      const slug = params.slug;

      // Check if we have data for this post
      //@ts-ignore
      if (blogPostsData[slug]) {
        //@ts-ignore
        setPostData(blogPostsData[slug]);
        setLoading(false);
      }
      // Check if it's a placeholder post
      else if (placeholderPostSlugs.includes(slug)) {
        // Create a placeholder post
        setPostData({
          title: slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          author: "EPUB Reader Team",
          date: "Coming Soon",
          readTime: "",
          category: "Coming Soon",
          imageUrl:
            "https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
          introduction:
            "We're currently working on this article. Check back soon for the complete content!",
          content: [
            {
              heading: "Coming Soon",
              text: "Thank you for your interest in this topic. Our team is working to create a comprehensive article that will provide valuable insights and information. In the meantime, you might be interested in our other articles.",
            },
          ],
          relatedPosts: [
            {
              title: "Understanding EPUB: The Digital Book Format Explained",
              slug: "understanding-epub-format",
            },
            {
              title: "How to Create Your Own EPUB Files: A Complete Guide",
              slug: "create-your-own-epub-files",
            },
            {
              title: "The Future of Digital Reading: Trends and Innovations",
              slug: "future-of-digital-reading",
            },
          ],
        });
        setLoading(false);
      }
      // If not found at all, redirect to blog index
      else {
        router.push("/blog");
      }
    }
  }, [params.slug, router]);

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <Navbar />
        <div className="pt-24 text-center">
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar />

      <main className="pt-16">
        {/* Hero section with image */}
        <div className="relative">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover"
              src={postData.imageUrl}
              alt={postData.title}
            />
            <div
              className={`absolute inset-0 ${
                isDarkTheme ? "bg-gray-900" : "bg-gray-100"
              } mix-blend-multiply opacity-80`}
            ></div>
          </div>
          <div className="relative mx-auto max-w-7xl py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {postData.title}
            </h1>
            <div className="mt-6 max-w-3xl">
              <p className="text-xl text-gray-300">{postData.introduction}</p>
            </div>
            <div className="mt-8 flex items-center text-gray-300">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src="/epub-reader-logo.png"
                  alt="EPUB Reader"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/40";
                  }}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {postData.author}
                </p>
                <div className="flex space-x-1 text-sm">
                  <time dateTime={postData.date}>{postData.date}</time>
                  {postData.readTime && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>{postData.readTime} read</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="relative mx-auto max-w-prose px-4 py-16 sm:px-6 lg:px-8">
          <div
            className={`prose prose-lg mx-auto ${
              isDarkTheme ? "prose-invert" : ""
            }`}
          >
            {/* @ts-ignore */}
            {postData.content.map((section, index) => (
              <div key={index} className="mb-10">
                <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
                {/* @ts-ignore */}
                {section.text.split("\n\n").map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-4">
                    {paragraph.includes("**") ? (
                      <>
                        {paragraph
                          .split(/\*\*([^*]+)\*\*/)
                          //@ts-ignore
                          .map((part, partIndex) => {
                            return partIndex % 2 === 0 ? (
                              part
                            ) : (
                              <strong key={partIndex}>{part}</strong>
                            );
                          })}
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Related posts */}
        <div className={`${isDarkTheme ? "bg-gray-800" : "bg-gray-100"} py-16`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* @ts-ignore */}
              {postData.relatedPosts.map((post) => (
                <div
                  key={post.slug}
                  className={`overflow-hidden rounded-lg shadow-lg ${
                    isDarkTheme ? "bg-gray-700" : "bg-white"
                  }`}
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="p-6">
                      <h3
                        className={`text-xl font-semibold ${
                          isDarkTheme ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {post.title}
                      </h3>
                      <p
                        className={`mt-3 ${
                          isDarkTheme ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Read more about this topic in our comprehensive guide.
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-indigo-700 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Start Reading with EPUB Reader Today
              </h2>
              <p className="mt-4 text-xl text-indigo-100">
                The best way to experience EPUB books with advanced features and
                a beautiful interface.
              </p>
              <div className="mt-8">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-700 shadow hover:bg-indigo-50"
                >
                  Get Started for Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
