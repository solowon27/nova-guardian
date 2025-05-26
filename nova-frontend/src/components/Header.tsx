'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false); // State to manage mobile menu open/close

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-4 shadow-xl relative z-50">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo/Brand Name */}
        <Link href="/" className="text-3xl font-extrabold tracking-tight hover:opacity-90 transition-opacity duration-300">
          NovaGuardian
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center text-lg">
          <Link href="/AboutUs" className="hover:text-blue-200 transition-colors duration-300 font-medium">
            About Us
          </Link>
          <Link href="/ContactUs" className="hover:text-blue-200 transition-colors duration-300 font-medium">
            Contact Us
          </Link>
        </nav>

        {/* Mobile Menu Button (Hamburger) */}
        <button
          className="md:hidden text-white text-3xl focus:outline-none focus:ring-2 focus:ring-white rounded"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle mobile menu"
        >
          {isOpen ? '✕' : '☰'} {/* Close icon when open, hamburger when closed */}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-gradient-to-b from-blue-700 to-purple-800 shadow-lg pb-4 transition-all duration-300 ease-in-out transform origin-top animate-fade-in-down">
          <nav className="flex flex-col items-center space-y-4 pt-4 text-xl">
            <Link href="/AboutUs" className="block w-full text-center py-2 hover:bg-blue-600 transition-colors duration-300 rounded" onClick={() => setIsOpen(false)}>
              About Us
            </Link>
            <Link href="/ContactUs" className="block w-full text-center py-2 hover:bg-blue-600 transition-colors duration-300 rounded" onClick={() => setIsOpen(false)}>
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}