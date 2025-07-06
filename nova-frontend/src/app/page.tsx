'use client';

import React from 'react';
import Link from 'next/link';
import { SVGProps, ReactNode } from 'react';

// --- Icon Components for a clean, professional look ---
const IconShieldCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z"
    />
  </svg>
);

const IconSparkles = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.455-2.455L12.75 18l1.197-.398a3.375 3.375 0 002.455-2.455l.398-1.197.398 1.197a3.375 3.375 0 002.455 2.455l1.197.398-1.197.398a3.375 3.375 0 00-2.455 2.455z"
    />
  </svg>
);

const IconAcademicCap = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41a60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-2.172 1.254a58.445 58.445 0 0012.728 0l-2.172-1.254z"
    />
  </svg>
);

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

// --- Feature Card Component ---
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// --- Main Homepage Component ---
export default function HomePage() {
  const features = [
    {
      icon: <IconAcademicCap className="h-8 w-8" />,
      title: "Smarter Learning",
      description: "AI-powered assignments that adapt to your child's pace, making education truly personal."
    },
    {
      icon: <IconShieldCheck className="h-8 w-8" />,
      title: "Parental Peace of Mind",
      description: "A secure dashboard for you to monitor progress, provide feedback, and guide their journey."
    },
    {
      icon: <IconSparkles className="h-8 w-8" />,
      title: "Engaging & Fun",
      description: "Interactive content and challenges that make learning feel like play, keeping kids motivated."
    }
  ];

  return (
    <main className="bg-white text-gray-800 font-sans">
      
      {/* --- Hero Section --- */}
      <section className="relative text-center py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-slate-50 -z-10"></div>
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
            Joyful Learning, <span className="text-blue-600">Complete Confidence.</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-gray-600">
            Welcome to NovaGuardian — the platform where children love to learn and parents have total peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-bold shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300">
              Parents Get Started
            </Link>
            <Link href="/child-login" className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg text-lg font-bold hover:bg-gray-300 hover:-translate-y-1 transition-all duration-300">
              Kids Login
            </Link>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </div>
      </section>
      
      {/* --- Final CTA Section --- */}
      <section className="text-center py-20 md:py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
            Ready to Transform Learning?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-600">
            Join today and give your child the gift of joyful, safe, and effective education.
          </p>
          <Link href="/signup" className="bg-blue-600 text-white px-10 py-4 rounded-lg text-xl font-bold shadow-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 transform inline-block">
            Start Your Free Adventure
          </Link>
        </div>
      </section>
    </main>
  );
}
