'use client';

import React from 'react';
// import Link from 'next/link'; // Assuming Next.js Link component - Removed as it causes compilation issues outside Next.js environment

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-purple-800 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Subtle background pattern or SVG for vibrancy */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 L 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-blue-500" />
          </svg>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 animate-fade-in-up drop-shadow-lg">
            About NovaGuardian
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90 animate-fade-in-up delay-200">
            Empowering parents to nurture young minds through engaging and personalized learning experiences.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 bg-white shadow-lg rounded-xl mx-auto max-w-6xl -mt-16 relative z-20 p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4 flex items-center">
              <span className="mr-3 text-blue-500">🎯</span> Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At NovaGuardian, our mission is to bridge the gap between parents and their children's educational journey. We provide intuitive tools for parents to create, assign, and track personalized learning assignments, fostering a supportive and engaging environment for academic growth. We believe in making learning a joyful and collaborative experience for every family.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Placeholder image for visual appeal */}
            <img
              src="https://placehold.co/400x300/e0f2fe/2563eb?text=Our+Mission"
              alt="Our Mission"
              className="rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col-reverse md:flex-row items-center gap-8">
            <div className="md:w-1/2 flex justify-center">
              {/* Placeholder image for visual appeal */}
              <img
                src="https://placehold.co/400x300/dbeafe/1d4ed8?text=Our+Vision"
                alt="Our Vision"
                className="rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4 flex items-center">
                <span className="mr-3 text-purple-500">🌟</span> Our Vision
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We envision a future where every child has access to tailored educational content, guided by their parents' insights and support. NovaGuardian aims to be the leading platform for family-centric learning, inspiring curiosity, building confidence, and preparing children for a world of endless possibilities. We strive to make personalized education accessible and enjoyable for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-white shadow-lg rounded-xl mx-auto max-w-6xl p-8 md:p-12 my-16">
        <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-10 text-center flex items-center justify-center">
          <span className="mr-3 text-green-500">🌱</span> Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-5xl mb-4 text-blue-600">💡</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Innovation</h3>
            <p className="text-gray-600">
              Continuously evolving our platform to offer the best tools and features for modern learning.
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-5xl mb-4 text-purple-600">🤝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Collaboration</h3>
            <p className="text-gray-600">
              Fostering a strong partnership between parents, children, and the learning process.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-5xl mb-4 text-green-600">💖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Empowerment</h3>
            <p className="text-gray-600">
              Empowering both parents and children to achieve their full educational potential.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg opacity-90 mb-8">
            Join NovaGuardian today and transform your child's learning experience.
          </p>
          {/* Replaced Link with a tag */}
          <a href="/parent/add-child" className="px-8 py-4 bg-white text-purple-700 rounded-full text-xl font-bold shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 ease-out">
            Get Started Now!
          </a>
        </div>
      </section>
    </div>
  );
}
