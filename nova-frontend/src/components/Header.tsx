'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false); // State to manage mobile menu open/close
  const [isScrolled, setIsScrolled] = useState(false); // State to track scroll for header styling
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate login state, replace with actual auth logic

  const router = useRouter();

  // Simulate Auth State on Component Mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Set to true if token exists, false otherwise

    // Add scroll listener for header styling
    const handleScroll = () => {
      if (window.scrollY > 50) { // Adjust scroll threshold as needed
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsOpen(false); // Close mobile menu on logout
    router.push('/');
  };

  // Common Tailwind classes for desktop navigation links
  const navLinkClasses = "relative px-3 py-2 text-white font-medium transition-all duration-300 ease-in-out " +
                         "hover:text-amber-200 hover:scale-105 transform origin-center " +
                         "before:absolute before:inset-0 before:bg-white/10 before:rounded-lg before:scale-x-0 before:transition-transform before:duration-300 before:ease-out hover:before:scale-x-100 before:z-[-1]";

  // Common Tailwind classes for mobile navigation links
  const mobileNavLinkClasses = "block w-full text-center py-4 px-6 text-xl font-semibold text-white " +
                               "hover:bg-blue-700/80 active:bg-blue-800 transition-colors duration-300 rounded-lg";

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out
                        ${isScrolled ? 'bg-blue-800/80 backdrop-blur-md shadow-xl' : 'bg-blue-600/90 backdrop-blur-sm shadow-lg'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
        {/* Logo/Brand Name */}
        <Link href="/" className="flex items-center space-x-2 text-3xl md:text-4xl font-extrabold tracking-tight text-white
                                  drop-shadow-md transform hover:scale-105 transition-transform duration-300 ease-out">
          <span className="text-amber-300 text-5xl md:text-6xl leading-none">★</span>
          <span>NovaGuardian</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 text-lg">
          <Link href="/AboutUs" className={navLinkClasses}>
            About Us
          </Link>
          <Link href="/ContactUs" className={navLinkClasses}>
            Contact Us
          </Link>

          {!isLoggedIn ? (
            // Links to show when NOT logged in (Desktop)
            <>
              <Link href="/login" className={navLinkClasses}>
                Parent Login
              </Link>
              <Link href="/child-login" className={navLinkClasses}>
                Child Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 rounded-full bg-amber-400 text-blue-900 font-bold text-lg
                           shadow-md hover:bg-amber-300 hover:scale-105
                           transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </>
          ) : (
            // Button to show when logged in (Desktop)
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-full bg-red-500 text-white font-bold text-lg
                         shadow-md hover:bg-red-600 hover:scale-105
                         transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
              aria-label="Logout"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile Menu Button (Hamburger) */}
        <button
          className="md:hidden text-white text-4xl focus:outline-none focus:ring-2 focus:ring-amber-300 rounded-md p-1"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle mobile menu"
        >
          {isOpen ? '✕' : '☰'} {/* Close icon when open, hamburger when closed */}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-blue-900/95 backdrop-blur-md shadow-xl
                        pb-6 pt-4 transition-all duration-300 ease-in-out transform origin-top animate-fade-in-down">
          <nav className="flex flex-col items-center space-y-3 px-4">
            <Link href="/AboutUs" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
              About Us
            </Link>
            <Link href="/ContactUs" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
              Contact Us
            </Link>
            {!isLoggedIn ? (
              // Links to show when NOT logged in (Mobile)
              <>
                <Link href="/login" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
                  Parent Login
                </Link>
                <Link href="/child-login" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>
                  Child Login
                </Link>
                <Link
                  href="/signup"
                  className={mobileNavLinkClasses + " bg-amber-400 text-blue-900 font-bold hover:bg-amber-300"}
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              // Button to show when logged in (Mobile)
              <button
                onClick={handleLogout}
                className={mobileNavLinkClasses + " bg-red-500 text-white font-bold hover:bg-red-600"}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}