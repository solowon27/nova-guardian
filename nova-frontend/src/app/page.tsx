'use client';

import React from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 text-gray-800 font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="relative text-center py-24 md:py-32 bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden shadow-2xl">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-bounce-in drop-shadow-lg">
            Smart Learning. <span className="text-blue-200">Safe Fun.</span> For Every Kid!
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 animate-fade-in-up delay-200">
            Welcome to NovaGuardian — where kids embark on exciting learning adventures, and parents feel great about it!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up delay-400">
            <a href="/login" className="bg-white text-purple-700 px-10 py-4 rounded-full text-xl font-bold shadow-xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300 ease-out transform flex items-center justify-center">
              Parents Start Here! <span className="ml-3 text-2xl">👨‍👩‍👧‍👦</span>
            </a>
            <a href="/child-login" className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-yellow-300 hover:text-blue-700 hover:scale-105 transition-all duration-300 ease-out transform flex items-center justify-center">
              Kids Login <span className="ml-3 text-2xl">🎉</span>
            </a>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-extrabold mb-6 text-indigo-700">Welcome to NovaGuardian</h2>
        <p className="text-lg max-w-3xl mx-auto text-gray-700">
          A safe and playful learning space for children aged 3–13. Kids enjoy fun challenges and interactive content, while parents stay in the loop with progress updates and feedback tools.
        </p>
      </section>

      {/* Call to Action */}
      <section className="text-center py-24 bg-gradient-to-br from-purple-700 to-indigo-800 text-white mt-10 shadow-2xl">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Ready to Begin Your Child's Amazing Learning Journey?
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            Join families who are learning and growing with NovaGuardian!
          </p>
          <a href="/login" className="bg-white text-purple-700 px-12 py-5 rounded-full text-2xl font-bold shadow-xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300 ease-out transform flex items-center justify-center mx-auto max-w-xs">
            Start Your Free Adventure! <span className="ml-3 text-3xl">✨</span>
          </a>
        </div>
      </section>
    </main>
  );
}