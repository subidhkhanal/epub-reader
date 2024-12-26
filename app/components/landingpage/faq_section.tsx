"use client";

import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

const faqs = [
  {
    question: "Is the epub file stored in cloud storage?",
    answer: "Yes, We store the epub file in cloud.",
  },
  {
    question: "Does it saves my highlights and reading progress?",
    answer:
      "Yes, we automatically save the highlights and reading progress on the cloud",
  },
  {
    question: "What new features can I expect in coming days?",
    answer:
      "In coming days, you will be able to select fonts between Georgia, Merriweather, Literata, and Vollkorn",
  },
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index); // Open or close the clicked FAQ
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8 lg:py-40">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              Frequently asked questions
            </h2>
            {/* <p className="mt-4 text-base leading-7 text-gray-600">
              Can’t find the answer you’re looking for? Reach out to our{" "}
              <a
                href="/contactus"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                team.
              </a>{" "}
            </p> */}
          </div>
          <div className="mt-10 lg:col-span-7 lg:mt-0">
            <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
              {faqs.map((faq, index) => (
                <div key={faq.question} className="py-6">
                  <dt>
                    <button
                      className="flex w-full items-start justify-between text-left text-gray-900"
                      onClick={() => toggleFaq(index)}
                    >
                      <span className="text-base font-semibold leading-7">
                        {faq.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        {openFaq === index ? (
                          <FaMinus className="h-6 w-6" aria-hidden="true" />
                        ) : (
                          <FaPlus className="h-6 w-6" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                  </dt>
                  {openFaq === index && (
                    <dd className="mt-2 pr-12">
                      <p className="text-base leading-7 text-gray-600">
                        {faq.answer}
                      </p>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
