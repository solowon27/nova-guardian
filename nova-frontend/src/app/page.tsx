'use client';

import React, { useState, useEffect } from 'react';

// Simulated Data for Features - Replace with actual data fetching if needed
const learningFeatures = [
  { icon: '📚', title: 'Interactive Lessons', description: 'Engaging content tailored for different age groups.', href: '/features/lessons' },
  { icon: '🎮', title: 'Gamified Challenges', description: 'Make learning fun with points, badges, and leaderboards.', href: '/features/challenges' },
  { icon: '🎨', title: 'Creative Projects', description: 'Unleash creativity with art, writing, and design activities.', href: '/features/projects' },
  { icon: '📈', title: 'Progress Tracking', description: 'Monitor your child\'s learning journey with detailed insights.', href: '/features/tracking' }
];

const testimonials = [
  { name: 'Jane Doe', quote: 'NovaGuardian has transformed how my kids learn. It\'s safe, engaging, and I love the progress tracking!', image: 'https://placehold.co/100x100/A78BFA/FFFFFF?text=JD' },
  { name: 'Robert Smith', quote: 'My children adore the gamified challenges. They\'re learning without even realizing it!', image: 'https://placehold.co/100x100/818CF8/FFFFFF?text=RS' },
  { name: 'Emily Chen', quote: 'As a busy parent, NovaGuardian makes it easy to oversee my child\'s education. Highly recommended!', image: 'https://placehold.co/100x100/6366F1/FFFFFF?text=EC' }
];

const ageGroups = [
  { minAge: 3, maxAge: 6, description: 'Early Explorers', features: ['Basic Literacy', 'Numbers', 'Creativity', 'Motor Skills'] },
  { minAge: 7, maxAge: 10, description: 'Young Learners', features: ['Math Fundamentals', 'Science Exploration', 'Reading Comprehension', 'Creative Writing'] },
  { minAge: 11, maxAge: 13, description: 'Growing Minds', features: ['Advanced Math Concepts', 'Physics Basics', 'History & Geography', 'Introduction to Languages'] }
];

const faqs = [
  { question: 'Is NovaGuardian safe for my child?', answer: 'Yes, NovaGuardian prioritizes child safety. All accounts are managed by parents, and content is carefully curated to ensure a secure and age-appropriate learning environment. We do not share personal data with third parties.' },
  { question: 'What age groups are supported?', answer: 'We currently support children aged 3 to 13. Our content is meticulously designed and categorized to provide tailored and engaging experiences for each specific age range, ensuring optimal learning outcomes.' },
  { question: 'Can I track my child\'s progress?', answer: 'Absolutely! Our intuitive parent dashboard provides comprehensive progress tracking. You can monitor assignment completion, review responses, and even provide personalized feedback to guide your child\'s learning journey effectively.' },
  { question: 'Is there a free trial?', answer: 'Yes, we offer a generous 7-day free trial for all new users. This allows you to explore all premium features and content, create assignments, and experience the full benefits of NovaGuardian before committing to a subscription.' },
  { question: 'How do I create assignments?', answer: 'Creating assignments is simple! Just select your child from the dashboard, choose a title, description, difficulty level, and add questions from various types (explain, short answer, multiple choice, true/false). You can customize each assignment to fit your child\'s needs.' }
];

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null); // State for FAQ accordion

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000); // Change testimonial every 6 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 text-gray-800 font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="relative text-center py-24 md:py-32 bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden shadow-2xl">
        {/* Abstract Background Shapes/Patterns */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="15" fill="url(#grad1)" className="animate-float-1" />
            <circle cx="80" cy="70" r="20" fill="url(#grad1)" className="animate-float-2" />
            <rect x="10" y="60" width="10" height="10" fill="url(#grad1)" className="animate-float-3" />
            <rect x="70" y="15" width="12" height="12" fill="url(#grad1)" className="animate-float-4" />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up drop-shadow-lg">
            Smart Learning. <span className="text-blue-200">Safe Platform.</span> Parent Powered.
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 animate-fade-in-up delay-200">
            Welcome to NovaGuardian — where kids learn, grow, and parents lead their educational journey with confidence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up delay-400">
            <a href="/login" className="bg-white text-purple-700 px-10 py-4 rounded-full text-xl font-bold shadow-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 ease-out transform flex items-center justify-center">
              Parent Login / Sign Up <span className="ml-3 text-2xl">🚀</span>
            </a>
            <a href="/child-login" className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-white hover:text-blue-700 hover:scale-105 transition-all duration-300 ease-out transform flex items-center justify-center">
              Child Login <span className="ml-3 text-2xl">🧒</span>
            </a>
          </div>
        </div>
      </section>

      {/* Learning Features Section */}
      <section className="max-w-7xl mx-auto py-20 px-6">
        <h2 className="text-4xl font-extrabold text-center mb-14 text-indigo-700 leading-tight">
          Unlock Powerful Learning Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {learningFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-xl text-center border-b-4 border-blue-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="text-6xl mb-6 text-purple-600 group-hover:text-blue-600 transition-colors duration-300">{feature.icon}</div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">{feature.title}</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{feature.description}</p>
              <a href={feature.href} className="text-blue-600 hover:text-purple-600 hover:underline font-semibold transition-colors duration-300 inline-flex items-center">
                Learn More <span className="ml-1 text-lg">→</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 py-20 mt-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          {/* Another subtle background pattern */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="diagonal-lines" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-lines)" className="text-white" />
          </svg>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-extrabold text-center mb-14 drop-shadow-lg">
            What Our Parents Are Saying
          </h2>
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-white text-gray-800 shadow-2xl relative border border-gray-100 animate-fade-in-up">
            <img
              src={testimonials[currentTestimonial].image}
              alt={testimonials[currentTestimonial].name}
              className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-28 h-28 rounded-full border-6 border-white shadow-lg object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/A78BFA/FFFFFF?text=User"; }} // Fallback image
            />
            <blockquote className="text-xl md:text-2xl italic text-gray-700 mt-10 mb-6 leading-relaxed">
              {`"${testimonials[currentTestimonial].quote}"`}
            </blockquote>
            <p className="text-lg font-semibold text-blue-700 text-right">
              - {testimonials[currentTestimonial].name}
            </p>
          </div>
          {/* Testimonial Dots Navigation */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentTestimonial === index ? 'bg-white w-5' : 'bg-blue-300 opacity-60'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Age Group Features */}
      <section className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-4xl font-extrabold text-center mb-14 text-indigo-700 leading-tight">
          Personalized Learning for Every Stage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ageGroups.map((group, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-purple-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <h3 className="font-bold text-2xl mb-4 text-gray-900 flex items-center justify-center md:justify-start">
                <span className="mr-3 text-blue-600 text-3xl">
                  {index === 0 ? '👶' : index === 1 ? '👧' : '🧑‍🎓'}
                </span>
                {group.description} <span className="ml-2 text-base font-normal text-gray-600">({group.minAge}-{group.maxAge})</span>
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {group.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-green-500 mr-2">✔</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section (Accordion) */}
      <section className="bg-blue-50 py-20 mt-20 rounded-3xl shadow-2xl border border-blue-100">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-extrabold text-center mb-14 text-indigo-700 leading-tight">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <button
                  className="w-full text-left p-6 flex justify-between items-center text-lg font-semibold text-blue-700 hover:bg-blue-50 transition-colors duration-300 focus:outline-none"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaqIndex === index}
                >
                  {faq.question}
                  <span className="text-2xl transition-transform duration-300 transform">
                    {openFaqIndex === index ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`px-6 pb-6 text-gray-700 transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-96 opacity-100 pt-2' : 'max-h-0 opacity-0'
                  }`}
                  style={{ overflow: 'hidden' }} // Ensure content is hidden when collapsed
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="text-center py-24 bg-gradient-to-br from-purple-700 to-indigo-800 text-white mt-20 shadow-2xl">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Ready to Empower Your Child's Learning Journey?
          </h2>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            Join thousands of parents who trust NovaGuardian for engaging and effective education.
          </p>
          <a href="/login" className="bg-white text-purple-700 px-12 py-5 rounded-full text-2xl font-bold shadow-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 ease-out transform flex items-center justify-center mx-auto max-w-xs">
            Start Your Free Trial! <span className="ml-3 text-3xl">✨</span>
          </a>
        </div>
      </section>
    </main>
  );
}
