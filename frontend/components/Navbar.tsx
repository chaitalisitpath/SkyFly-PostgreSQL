// app/components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { isAuthenticated, isAdmin, getCurrentUser } from "@/lib/auth";
import Logout from "./Logout";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const authenticated = isAuthenticated();
  const dashboardHref = authenticated ? (isAdmin() ? '/admin/dashboard' : '/user/dashboard') : '';
  const user = getCurrentUser();

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
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link href="/about" className="hover:text-gray-300">
              About Us
            </Link>
            {authenticated ? (
              <>
                <Link href={dashboardHref} className="hover:text-gray-300">
                  Dashboard
                </Link>
                <span className="text-gray-300">Welcome back, {user?.name}</span>
                <Logout />
              </>
            ) : (
              <Link
                href="/login"
                className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium"
              >
                Login
              </Link>
            )}
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
            href="/flights"
            className="block px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Flights
          </Link>
          <Link
            href="/booking"
            className="block px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Book Flight
          </Link>
          <Link
            href="/about"
            className="block px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link>
          <Link
            href="#reviews"
            className="block px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Reviews
          </Link>
          {authenticated ? (
            <>
              <Link
                href={dashboardHref}
                className="block px-3 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <span className="block px-3 py-2 text-gray-300">Welcome back, {user?.name}</span>
              <div className="mt-2 px-3 py-2">
                <Logout />
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="block mt-2 px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-center text-white"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
