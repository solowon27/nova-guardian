'use client';

import React from 'react';

export default function AboutUsSimple() {
  return (
    <div className="bg-white font-sans text-gray-800">
      <div className="container mx-auto max-w-5xl px-6 py-16 sm:py-24">

        {/* --- Header --- */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700">
            Our Story
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We're dedicated to making personalized education accessible and joyful for every family.
          </p>
        </div>

        {/* --- Main Content --- */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          
          {/* Image */}
          <div>
            <img
              src="/CEO.jpg"
              alt="NovaGuardian CEO"
              className="rounded-2xl shadow-lg w-full h-auto object-cover"
            />
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              A Message from Our CEO
            </h2>
            <p className="text-gray-700 leading-relaxed">
              As a father of two daughters, I created NovaGuardian with a deep understanding of what parents truly need — simple, powerful tools to support their childrens growth. At NovaGuardian, our mission is to empower parents to create personalized learning experiences that spark curiosity and strengthen the parent-child bond.
            </p>
            <p className="text-gray-700 leading-relaxed">
              I believe every child deserves an education that fits them — not the other way around. Through NovaGuardian, we are building a world where kids thrive with learning that is engaging, meaningful, and tailored to their unique path.
            </p>
            <div className="pt-2">
                <h3 className="text-xl font-bold text-gray-900">Our Core Values:</h3>
                <p className="text-gray-700">
                    Innovation, Empowerment, Integrity, and Adaptability.
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}