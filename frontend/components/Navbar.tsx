// app/components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            SkyFly Airlines
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 text-lg">
            <Link href="/flights" className="hover:text-gray-300">
              Flights
            </Link>
            <Link href="#destinations" className="hover:text-gray-300">
              Destinations
            </Link>
            <Link href="#reviews" className="hover:text-gray-300">
              Reviews
            </Link>
            <Link href="#contact" className="hover:text-gray-300">
              Contact
            </Link>
             <Link
              href="/login"
              className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium"
            >
              Login
            </Link>
          </div>
          

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none focus:ring-2 focus:ring-white"
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="#services"
            className="block px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Services
          </Link>
          <Link
            href="#destinations"
            className="block px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Destinations
          </Link>
          <Link
            href="#reviews"
            className="block px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Reviews
          </Link>
          <Link
            href="#contact"
            className="block px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
            <Link
            href="/login"
            className="block mt-2 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-center text-white"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
