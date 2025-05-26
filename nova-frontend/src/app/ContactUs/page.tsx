'use client';

import React, { useState } from 'react';
import Link from 'next/link'; // Assuming Next.js Link component
import { useRouter } from 'next/navigation';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log('Form submitted:', formData);
  alert('Thank you for your message! We will get back to you shortly.');
  setFormData({ name: '', email: '', subject: '', message: '' });
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans text-gray-800 flex items-center justify-center py-16">
      <div className="container mx-auto px-6 max-w-4xl bg-white rounded-xl shadow-2xl p-8 md:p-12 border border-blue-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-8 text-center drop-shadow-md">
          Get in Touch
        </h1>
        <p className="text-lg text-gray-700 mb-10 text-center max-w-2xl mx-auto">
          Have questions, feedback, or need assistance? We're here to help! Fill out the form below or reach out to us directly.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="lg:order-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3 text-blue-500">📝</span> Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-md font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-md font-medium text-gray-700 mb-2">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-md font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Inquiry about assignments"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-md font-medium text-gray-700 mb-2">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Type your message here..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold text-lg shadow-md hover:bg-purple-700 transition-colors duration-300 transform hover:-translate-y-1"
              >
                Send Message <span className="ml-2">🚀</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="lg:order-1 flex flex-col justify-between p-6 bg-blue-50 rounded-xl shadow-inner border border-blue-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3 text-purple-500">📞</span> Contact Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-center text-lg">
                  <span className="mr-3 text-blue-600">📧</span>
                  <a href="mailto:support@novaguardian.com" className="hover:underline">support@novaguardian.com</a>
                </p>
                <p className="flex items-center text-lg">
                  <span className="mr-3 text-blue-600">📱</span>
                  <a href="tel:+1234567890" className="hover:underline">+1 (234) 567-890</a>
                </p>
                <p className="flex items-center text-lg">
                  <span className="mr-3 text-blue-600">📍</span>
                  123 Learning Lane, Knowledge City, KC 98765
                </p>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Follow Us</h3>
              <div className="flex space-x-5 justify-center lg:justify-start">
                <a href="#" className="text-blue-600 hover:text-purple-600 transition-colors duration-300 text-3xl" aria-label="Facebook">
                  {/* Placeholder for Facebook icon */}
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 8h-2v2h2v2h-2v6h-3v-6h-2V10h2V8.5c0-1.657 1.343-3 3-3h3v3z"/></svg>
                </a>
                <a href="#" className="text-blue-600 hover:text-purple-600 transition-colors duration-300 text-3xl" aria-label="Twitter">
                  {/* Placeholder for Twitter icon */}
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.707a1 1 0 00-1.414-1.414L12 10.586l-3.293-3.293a1 1 0 00-1.414 1.414L10.586 12l-3.293 3.293a1 1 0 001.414 1.414L12 13.414l3.293 3.293a1 1 0 001.414-1.414L13.414 12l3.293-3.293z"/></svg>
                </a>
                <a href="#" className="text-blue-600 hover:text-purple-600 transition-colors duration-300 text-3xl" aria-label="LinkedIn">
                  {/* Placeholder for LinkedIn icon */}
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-4 15h-2V9h2v8zm-1-8c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm7 8h-2v-4c0-1.103-.897-2-2-2s-2 .897-2 2v4h-2V9h2v1.5c.66-.99 1.95-1.5 3-1.5 2.206 0 4 1.794 4 4v4z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: Map Embed (placeholder) */}
        <div className="mt-12 p-4 bg-gray-100 rounded-xl shadow-inner border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Find Us on the Map</h3>
          <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden shadow-md">
            {/* Replace with actual Google Maps embed iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.208154546513!2d-122.0842496846813!3d37.4219999798254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb5e01b7a6e1d%3A0x7d3e0c0b8b0e8c8!2sGoogleplex!5e0!3m2!1sen!2sus!4v1678901234567!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our Location"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
