"use client";

import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "What file formats are supported?",
      answer:
        "Our reader currently supports EPUB format, which is the most widely used format for digital books. We're continuously working to add support for more formats.",
    },
    {
      question: "Is my library data secure?",
      answer:
        "Yes, your library data is securely stored in the cloud and protected by Google's authentication system. We never share your reading data with third parties.",
    },
    {
      question: "Can I access my books offline?",
      answer:
        "Currently, you need an internet connection to access your books. We're working on an offline reading feature that will be available in a future update.",
    },
    {
      question: "Is there a limit to how many books I can store?",
      answer:
        "There's no strict limit on the number of books you can store. However, individual book files should be under 50MB for optimal performance.",
    },
    {
      question: "How do I add books to my library?",
      answer:
        "Simply click the 'Add Book' button in your library, select an EPUB file from your device, and it will be uploaded to your personal cloud library.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-24 bg-[#1a1c1d]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about the EPUB Reader
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden transition-all duration-300 ease-out"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-white">
                  {faq.question}
                </span>
                <FaChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        {/* <div className="mt-16 text-center">
          <p className="text-gray-400">
            Still have questions?{" "}
            <a
              href="mailto:subidhkhanal38@gmail.com"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              Contact us
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default FAQSection;
