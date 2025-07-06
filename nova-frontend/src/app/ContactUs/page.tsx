'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SVGProps, ReactNode } from 'react';

// --- Icon Components for a professional and consistent look ---
const IconEnvelope = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

const IconPhone = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z"
    />
  </svg>
);

interface FAQItemProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const IconChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

// --- Sub-Components for the page ---

const ScrollFadeIn = ({ children }: { children: ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
    >
        {children}
    </motion.div>
);

const FAQItem = ({ title, children, isOpen, onToggle }: FAQItemProps) => (
  <div className="border-b border-slate-200">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-6 text-left text-lg font-bold text-gray-800"
    >
      <span>{title}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <IconChevronDown className="h-5 w-5 text-gray-500" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pb-8 text-gray-600 leading-relaxed text-base">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);


// --- Main Contact Us Page Component ---
export default function ContactUsPage() {
  const [openAccordion, setOpenAccordion] = useState(0);

  return (
    <main className="bg-white text-gray-800 font-sans">
      
      {/* --- Hero Section --- */}
      <section className="bg-slate-50 text-center py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-4xl">
            <ScrollFadeIn>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 leading-tight">
                    Get in Touch
                </h1>
                <p className="text-lg md:text-xl text-gray-600">
                    We're here to help. Reach out with any questions, feedback, or inquiries you may have.
                </p>
            </ScrollFadeIn>
        </div>
      </section>

      {/* --- Contact Information Section --- */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6 max-w-4xl">
            <ScrollFadeIn>
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 text-center">
                    <div className="bg-slate-50 p-8 rounded-xl">
                        <IconEnvelope className="h-10 w-10 mx-auto text-blue-600 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Email Us</h3>
                        <p className="text-gray-600 mb-3">For support, questions, and partnerships.</p>
                        <a href="mailto:novaguardian@gmail.com" className="text-lg font-semibold text-blue-600 hover:underline">
                            novaguardian@gmail.com
                        </a>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-xl">
                        <IconPhone className="h-10 w-10 mx-auto text-blue-600 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Call Us</h3>
                        <p className="text-gray-600 mb-3">I am available Mon-Fri, 9am-5pm.</p>
                        <a href="tel:+13852070297" className="text-lg font-semibold text-blue-600 hover:underline">
                            +1 (385) 207-0297
                        </a>
                    </div>
                </div>
            </ScrollFadeIn>
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-3xl">
            <ScrollFadeIn>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                </div>
                <div className="border-t border-slate-200">
                    <FAQItem title="How do I add my child to my account?" isOpen={openAccordion === 0} onToggle={() => setOpenAccordion(0)}>
                        After signing up, you will be prompted to create a profile for your child. Simply enter their name and age, and our system will automatically generate a unique username and password for them. You can manage all child profiles from your parent dashboard.
                    </FAQItem>
                    <FAQItem title="Is NovaGuardian safe for my child?" isOpen={openAccordion === 1} onToggle={() => setOpenAccordion(1)}>
                        Absolutely. Safety is our top priority. Our platform is a closed ecosystem, meaning children can only interact with the content assigned by you. There are no external links, advertisements, or chat features with strangers.
                    </FAQItem>
                    <FAQItem title="What kind of assignments can I create?" isOpen={openAccordion === 2} onToggle={() => setOpenAccordion(2)}>
                        You can create a wide variety of assignments, including multiple-choice questions, true/false, short answers, and open-ended explanatory questions. This flexibility allows you to tailor the learning experience to any subject or skill level.
                    </FAQItem>
                </div>
            </ScrollFadeIn>
        </div>
      </section>

    </main>
  );
}
