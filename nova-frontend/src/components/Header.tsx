// components/Header.js

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

// Custom NavLink component to handle active states
function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative py-2 text-sm font-medium transition-colors duration-300 ${
        isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
      )}
    </Link>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // ✅ 1. Get the full 'user' object from the context, not just 'isLoggedIn'
  const { user, logout } = useAuth();

  // Handle scroll effect (unchanged)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open (unchanged)
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };
  
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md border-b border-gray-200/80' : 'bg-white/50'
      }`}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo (unchanged) */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 transition-transform hover:scale-105">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"></path>
            <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor" opacity="0.6"></path>
          </svg>
          <span className="text-2xl font-extrabold tracking-tight">NovaGuardian</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink href="/AboutUs">About Us</NavLink>
          <NavLink href="/ContactUs">Contact Us</NavLink>

          {/* ✅ 2. Conditionally render dashboard link based on user.role */}
          {user?.role === 'PARENT' && <NavLink href="/parent">Dashboard</NavLink>}
          {user?.role === 'CHILD' && <NavLink href="/child">Dashboard</NavLink>}
          
          {/* ✅ 3. Check for the 'user' object to show Login/Logout */}
          {!user ? (
            <Link
              href="/login" // Changed from /signup for consistency
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:scale-105 active:scale-95"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile Menu Button (unchanged) */}
        <button
          className="relative z-50 h-8 w-8 md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block absolute h-0.5 w-full bg-gray-800 transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-3.5' : 'top-2'}`} />
          <span className={`block absolute h-0.5 w-full bg-gray-800 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'top-3.5'}`} />
          <span className={`block absolute h-0.5 w-full bg-gray-800 transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-3.5' : 'top-5'}`} />
        </button>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-white/80 backdrop-blur-lg transition-opacity duration-300 md:hidden ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <nav className="flex h-full flex-col items-center justify-center gap-8 text-2xl font-semibold">
            <Link href="/AboutUs" onClick={closeMobileMenu} className="text-gray-700 hover:text-blue-600">About Us</Link>
            <Link href="/ContactUs" onClick={closeMobileMenu} className="text-gray-700 hover:text-blue-600">Contact Us</Link>
            
            {/* ✅ 4. Conditionally render dashboard link for mobile */}
            {user?.role === 'PARENT' && <Link href="/parent" onClick={closeMobileMenu} className="text-gray-700 hover:text-blue-600">Dashboard</Link>}
            {user?.role === 'CHILD' && <Link href="/child" onClick={closeMobileMenu} className="text-gray-700 hover:text-blue-600">Dashboard</Link>}
            
            <div className="mt-8">
              {/* ✅ 5. Check for 'user' object for mobile login/logout */}
              {!user ? (
                <Link href="/login" onClick={closeMobileMenu} className="rounded-full bg-blue-600 px-8 py-4 text-white hover:bg-blue-700">Get Started</Link>
              ) : (
                <button onClick={handleLogout} className="rounded-full bg-red-500 px-8 py-4 text-white hover:bg-red-600">Logout</button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
