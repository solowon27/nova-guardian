'use client';

import React from 'react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 font-sans text-gray-800 antialiased">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-24 md:py-36 overflow-hidden">
        {/* Subtle background abstract shapes/gradients for visual interest */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-float-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-float-medium animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-float-fast animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 animate-fade-in-up drop-shadow-lg leading-tight">
            Discover NovaGuardian
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-4xl mx-auto opacity-95 animate-fade-in-up animation-delay-300 leading-relaxed">
            Empowering parents to effortlessly guide their children's learning journey with personalized assignments and insightful progress tracking.
          </p>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-white shadow-2xl rounded-3xl mx-4 sm:mx-6 md:mx-10 lg:mx-auto max-w-7xl -mt-20 relative z-20 p-8 md:p-12 lg:p-16">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16">
          <div className="md:order-1">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-700 mb-6 flex items-center leading-tight">
              <span className="mr-4 text-blue-500 text-5xl md:text-6xl drop-shadow-sm">🎯</span> Hi from CEO
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              At NovaGuardian, we're dedicated to transforming how families approach education. Our mission is to provide intuitive, powerful tools that enable parents to **seamlessly create and manage tailored learning experiences** for their children.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We aim to **foster curiosity, build confidence, and strengthen family bonds** through a collaborative and engaging educational journey, making personalized learning accessible and enjoyable for every child.
            </p>
          </div>
          <div className="md:order-2 flex justify-center items-center">
            <img
              src="/CEO.jpg"
              alt="Parents guiding child's learning"
              className="rounded-2xl shadow-xl w-full max-w-lg transform hover:scale-[1.02] transition-transform duration-300 ease-out border-4 border-blue-200"
            />
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16">
            <div className="md:order-2"> {/* Reversed order for visual variety */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-700 mb-6 flex items-center leading-tight">
                <span className="mr-4 text-purple-500 text-5xl md:text-6xl drop-shadow-sm">🌟</span> Our Vision
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We envision a world where every child thrives through **education tailored precisely to their needs and interests**. NovaGuardian strives to be the leading global platform empowering parents as primary educators.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our future includes advanced AI-driven recommendations, richer interactive content, and a seamless ecosystem that connects learning at home with academic success, building **lifelong learners and confident innovators**.
              </p>
            </div>
            <div className="md:order-1 flex justify-center items-center">
              <img
                src="https://placehold.co/600x450/dbeafe/312e81?text=Future+of+Learning"
                alt="Future of personalized learning"
                className="rounded-2xl shadow-xl w-full max-w-lg transform hover:scale-[1.02] transition-transform duration-300 ease-out border-4 border-purple-200"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x450/dbeafe/312e81?text=Future+of+Learning+Fallback'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white shadow-2xl rounded-3xl mx-4 sm:mx-6 md:mx-10 lg:mx-auto max-w-7xl my-16 p-8 md:p-12 lg:p-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-700 mb-12 text-center flex items-center justify-center leading-tight">
          <span className="mr-4 text-green-500 text-5xl md:text-6xl drop-shadow-sm">💖</span> Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {/* Value Card 1: Innovation */}
          <div className="bg-blue-50 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center
                          border-b-4 border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-6xl mb-4 text-blue-600">💡</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Innovation</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              We continually embrace new technologies and creative approaches to enhance personalized learning and parent engagement.
            </p>
          </div>

          {/* Value Card 2: Empowerment */}
          <div className="bg-purple-50 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center
                          border-b-4 border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-6xl mb-4 text-purple-600">💪</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Empowerment</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Equipping parents with the tools and insights to become effective guides, and children to take ownership of their learning.
            </p>
          </div>

          {/* Value Card 5: Integrity (New Card Example) */}
          <div className="bg-red-50 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center
                          border-b-4 border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-6xl mb-4 text-red-600">✨</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Integrity</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Operating with transparency, honesty, and a commitment to the highest ethical standards in all our interactions.
            </p>
          </div>

          {/* Value Card 6: Adaptability (New Card Example) */}
          <div className="bg-teal-50 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center
                          border-b-4 border-teal-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-6xl mb-4 text-teal-600">🧠</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Adaptability</h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Designing a flexible platform that evolves with educational needs and individual child development.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center shadow-inner">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in-up">Ready to Transform Learning?</h2>
          <p className="text-lg sm:text-xl opacity-95 mb-10 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
            Join thousands of parents who are empowering their children with personalized, engaging, and effective learning experiences.
          </p>
          {/* Replaced Link with a tag */}
          <a
            href="/signup" // Direct to signup for new users
            className="inline-flex items-center justify-center px-10 py-5 bg-amber-400 text-blue-900 rounded-full text-xl font-bold shadow-xl hover:bg-amber-300 hover:scale-105 transition-all duration-300 ease-out transform hover:-translate-y-1"
            aria-label="Get Started Now"
          >
            Get Started Now! <span className="ml-3 text-3xl">🚀</span>
          </a>
        </div>
      </section>
    </div>
  );
}