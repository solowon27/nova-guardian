// components/Footer.tsx
'use client';

import Link from 'next/link';

// You might want to import icons here if you use them, e.g.:
// import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'; // Example if using react-icons

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-700 to-purple-800 text-white py-10 shadow-inner">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

        {/* Section 1: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="text-2xl font-extrabold mb-2 hover:opacity-90 transition-opacity duration-300">
            NovaGuardian
          </Link>
          <p className="text-sm text-blue-200 leading-relaxed">
            Empowering parents to nurture young minds through engaging assignments.
          </p>
          <p className="text-sm mt-4 text-blue-300">
            &copy; {new Date().getFullYear()} NovaGuardian. All rights reserved.
          </p>
        </div>

        {/* Section 2: Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-100">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/AboutUs" className="hover:text-blue-200 transition-colors duration-300 block">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/ContactUs" className="hover:text-blue-200 transition-colors duration-300 block">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-blue-200 transition-colors duration-300 block">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-blue-200 transition-colors duration-300 block">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Section 3: Connect & Credits */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold mb-4 text-blue-100">Connect With Us</h3>
          <div className="flex space-x-4 mb-6">
            {/* Replace with actual social media icons if you have react-icons installed */}
            <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300">
              {/* <FaTwitter size={24} /> */} Twitter
            </a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300">
              {/* <FaFacebook size={24} /> */} Facebook
            </a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300">
              {/* <FaInstagram size={24} /> */} Instagram
            </a>
          </div>
          <p className="text-xs text-blue-300 mt-auto">
            Designed with ❤️ by <a href ="https://github.com/solowon27" className="text-blue-200 hover:underline" target="_blank" rel="noopener noreferrer">Quadsite</a>
          </p>
          <p className="text-xs text-blue-300">
            Powered by openAI
          </p>
        </div>

      </div>
    </footer>
  );
}